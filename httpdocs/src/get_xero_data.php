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
$page = intval($_GET['page']) ? $_GET['page'] : null;

switch($dataType) {
    case 'accounts':
        $xero = new Xero_Accounts();
        // paging is not supported for accounts
        $page = null;
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

$results = $xero->getData($page);
if ($results['status'] == 'error') {
    http_response_code(500);
}
echoJsonData($results);

// account
// "0":{"Code":"090","Name":"Business Bank Account","Type":"BANK","BankAccountNumber":"0908007006543","Status":"ACTIVE","BankAccountType":"BANK","CurrencyCode":"USD","TaxType":"NONE","EnablePaymentsToAccount":"false","ShowInExpenseClaims":"false","AccountID":"562555f2-8cde-4ce9-8203-0363922537a4","Class":"ASSET","ReportingCode":"ASS","ReportingCodeName":"Asset","HasAttachments":"false","UpdatedDateUTC":"2019-11-23T18:05:56+00:00"}

// vendor
// "0":{"ContactID":"9a777d01-2bfb-4623-807d-129d3f077e21","ContactStatus":"ACTIVE","Name":"Coco Cafe","Addresses":[{"AddressType":"POBOX"},{"AddressType":"STREET"}],"Phones":[{"PhoneType":"DDI"},{"PhoneType":"DEFAULT"},{"PhoneType":"FAX"},{"PhoneType":"MOBILE"}],"IsSupplier":"false","IsCustomer":"false","UpdatedDateUTC":"2019-11-23T18:03:41+00:00","HasAttachments":"false"}