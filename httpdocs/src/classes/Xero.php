<?php
use XeroPHP\Application\PrivateApplication;

class Xero {
    private $config;

    protected $xero;

    protected $dataType;

    function __construct() {
        $pemFile = ROOT_DIR . 'private/xero/privatekey.pem';
        $privateKey = file_get_contents($pemFile);

        $config = [
            'oauth' => [
                'callback' => $_ENV['SERVER_HOST'] . 'xerocallback.php',
                'consumer_key' => $_ENV['CONSUMER_KEY'],
                'consumer_secret' => $_ENV['CONSUMER_SECRET'],
                'rsa_private_key' => $privateKey,
            ],
        ];

        $this->_xero = new PrivateApplication($config);
    }
    
    public function getData($page = null) {
        try {
            if (!empty($page)) {
                $data = $this->_xero->load($this->dataType)->page($page)->execute();
            } else {
                $data = $this->_xero->load($this->dataType)->execute();
            }
        } catch (NotFoundException $exception) {
            return array(
                'status' => 'error',
                'msg' => 'Could not fetch data'  
            );
        } catch (RateLimitExceededException $exception) {
            return array(
                'status' => 'error',
                'msg' => 'Rate limit exceeded'  
            );
        }

        return array(
            'status' => 'success',
            'msg' => !is_null($page) ?
                sprintf('Data was successfully fetched for page %s of %s data type', $page, $this->dataType) :
                sprintf('Data was successfully fetched for %s data type', $this->dataType),
            'data' => $data
        );
    }
}