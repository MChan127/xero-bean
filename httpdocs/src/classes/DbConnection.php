<?php

/**
 * Utility class for connecting to a MySQL database
 * 
 * SQL parameterization is handled and methods can be called to interact
 * with the database in a straightforward way
 */
class DbConnection {
    private static $DbConnection;

    private $_db;

    public static function getInstance() {
        if (empty(self::$DbConnection)) {
            self::$DbConnection = new DbConnection();
        }
        return self::$DbConnection;
    }

    private function __construct() {
        $this->openConnection();
    }

    public function __destruct() {
        $this->closeConnection();
    }
    
    public function openConnection() {
        $dbuser = $_ENV['DB_USER'];
        $dbpass = $_ENV['DB_PASS'];
        $dbname = $_ENV['DB_NAME'];
        $dbhost = $_ENV['DB_HOST'];

        $this->_db = new \PDO(
            'mysql:host=' . $dbhost . ';dbname=' . $dbname . ';charset=utf8mb4',
            $dbuser,
            $dbpass,
            array(
                \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
                \PDO::ATTR_PERSISTENT => FALSE
            )
        );
    }

    /**
     * the bread and butter prepare() method that uses parameterized queries to talk to the table
     * 
     * sometimes MySQL is finicky about types of data being bound, so $intValues lets us leverage the
     * PDO::PARAM_INT flag to force an integer type as a parameter, if needed
     */
    public function prepare($query, $params = array(), $intValues = array(), $fetch = true) {
        try {
            $handle = $this->_db->prepare($query);
            for ($i = 1; $i <= count($params); $i++) {
                if (in_array($i , $intValues)) {
                    $handle->bindValue($i, (int)$params[$i-1], \PDO::PARAM_INT);
                } else {
                    $handle->bindValue($i, $params[$i-1]);
                }
            }
            $result = $handle->execute();
            if ($fetch) {
                return $handle;
            }
            return $result;
        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
        return false;
    }

    public function get($query, $params = array(), $intValues = array()) {
        $select = $this->prepare($query, $params, $intValues);
        if (!$select) {
            return false;
        }
        $results = $select->fetchAll();

        $return_results = array();
        if (!preg_match("/^SELECT 1/", $query) && $results !== false) {
            foreach ($results as $_result) {
                foreach ($_result as $key => $value) {
                    if (preg_match("/^\d+$/", $key)) {
                        unset($_result[$key]);
                    }
                }
                $return_results[] = $_result;
            }
        }
        return $return_results;
    }

    /**
     * general purpose method to run anything against MySQL
     */
    public function run($query, $params = array()) {
        return $this->prepare($query, $params, array(), false);
    }

    public function insert($query, $params = array()) {
        $result = $this->prepare($query, $params, array(), false);
        if (!$result) return false;

        try {
            $get_id = $this->_db->prepare("SELECT LAST_INSERT_ID();");
            $get_id->execute();
            $get_id = $get_id->fetch();
        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }

        if (!$get_id) {
            return false;
        }
        return $get_id[0];
    }

    public function closeConnection() {
        $this->_db = null;
    }
}