<?php

class Xero_Accounts extends Xero {
    function __construct() {
        parent::__construct();

        $this->dataType = 'Accounting\\Account';
    }
}