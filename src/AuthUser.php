<?php

class AuthUser {
    private static $authInstance;

    private $user;
    
    public static function getInstance() {
        if (!empty(self::$authInstance)) {
            self::$authInstance = new Auth();   
        }
        return self::$authInstance();
    }
    
    private function __construct() {
    }

    public function checkSession() {
        
    }

    public function getUser() {
        return $this->user;
    }

    public function login() {
        
    }
}