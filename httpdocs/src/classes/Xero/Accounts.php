<?php

/**
 * Implementation of Xero for fetching "Accounts" data
 */
class Xero_Accounts extends Xero {
    function __construct() {
        parent::__construct();

        $this->dataType = 'Accounting\\Account';
    }
}