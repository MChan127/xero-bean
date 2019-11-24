<?php

class Xero_Contacts extends Xero {
    function __construct() {
        super();

        $this->dataType = 'Accounting\\Contact';
    }
}