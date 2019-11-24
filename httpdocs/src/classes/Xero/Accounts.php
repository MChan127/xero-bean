<?php

class Xero_Accounts extends Xero {
    function __construct() {
        super();

        $this->dataType = 'Accounting\\Account';
    }
}