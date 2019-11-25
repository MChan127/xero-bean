<?php

/**
 * Implementation of Xero for fetching "Contacts" data
 * 
 * In our context this is the "Vendor" object
 */
class Xero_Contacts extends Xero {
    function __construct() {
        parent::__construct();

        $this->dataType = 'Accounting\\Contact';
    }
}