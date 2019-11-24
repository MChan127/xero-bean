<?php
use XeroPHP\Application\PrivateApplication;

class Xero {
    private $config;

    private $xero;

    private $dataType;

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
    
    public function getData() {
        $data = $this->_xero->load($this->dataType)->execute();

        return $data;
    }
}