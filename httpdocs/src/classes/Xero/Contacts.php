<?php

class Xero_Contacts extends Xero {
    function __construct() {
        parent::__construct();

        $this->dataType = 'Accounting\\Contact';
    }
}