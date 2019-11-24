<?php

class AuthUser {
    private static $authInstance;

    private $_db;
    private $user;
    
    public static function getInstance() {
        if (empty(self::$authInstance)) {
            self::$authInstance = new AuthUser();   
        }
        return self::$authInstance;
    }
    
    private function __construct() {
        if (session_status() == PHP_SESSION_NONE) {
            session_start();
        }
        $this->_db = \DbConnection::getInstance();

        $this->initUser();
    }

    public function initUser() {
        $user = $_SESSION['user'] ?? null;
        if (!$user) { 
            $user = $_SESSION['user'];
        }
        if ($user) {
            $this->setUser($user);
        }
    }

    public function getUser() {
        return $this->user;
    }
    public function setUser($user) {
        $_SESSION['user'] = $user;
        $this->user = $user;
    }

    public function getUserFromSession() {
        if (!empty($token = $_SESSION['usertoken'])) {
            $user = $this->_db->get(
                "SELECT u.`id`, u.`username` FROM `user_sessions` us 
                JOIN `users` u ON u.id = us.user_id 
                WHERE `token` = ? AND CURRENT_TIMESTAMP < us.`expiry_date`;", 
            array($token));

            return !empty($user) ? $user[0] : null;
        }
    
        return null;
    }

    public function login($username, $password, $remember = false) {
        // check session first
        if (!($user = $this->getUserFromSession())) {
            $user = $this->_db->get("SELECT * FROM `users` WHERE `username` = ?;", array($username));

            if (!empty($user)) {
                $user = $user[0];
                $password_hash = $user['password_hash'];
                if (!password_verify($password, $password_hash)) {
                    return false;
                }
                unset($user['password_hash']);

                // generate token and store in session if opted
                if ($remember) {
                    $_SESSION['usertoken'] = $token = bin2hex(openssl_random_pseudo_bytes(20)) . sprintf('_%s', $username);

                    $lastId = $this->_db->insert("INSERT INTO `user_sessions` (`user_id`, `token`, `expiry_date`) 
                        VALUES (?, ?, CURRENT_TIMESTAMP + INTERVAL 3 MONTH);",
                        array($user['id'], $token)
                    );
                }
                
                $this->setUser($user);
                return $user;
            } else {
                return false;
            }
        }

        $this->setUser($user);
        return $this->getUser();
    }

    public function logout() {
        if ($this->user) {
            // remove all tokens from db
            $this->_db->run("DELETE FROM `user_sessions` WHERE `user_id` = ?;", array($this->user['id']));
            $this->user = null;
        }
        session_destroy();
    }
}