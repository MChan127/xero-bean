<?php
require_once 'common.php';

// user must be logged in
if (!$authUser || !$authUser->getUser()) {
    http_response_code(403);
    echoJsonData(array(
        'error' => 'You must be authorized to call this API'
    ));
}

$dataType = $_GET['type'];
if (empty($dataType)) {
    http_response_code(401);
    echoJsonData(array(
        'error' => 'No data type specified'
    ));
}

switch($dataType) {
    case 'accounts':
        $xero = new Xero_Accounts();
        break;
    case 'vendors':
        $xero = new Xero_Contacts();
        break;
}
if (empty($xero)) {
    http_response_code(401);
    echoJsonData(array(
        'error' => 'Invalid data type specified'
    ));
}

$results = $xero->getData($_GET['refresh'] === 'true' ?? null, $_GET['download'] === 'true' ?? null);
if ($results['status'] == 'error') {
    http_response_code(500);
}
echoJsonData($results);