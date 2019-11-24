<?php
//  ini_set('display_errors', 1);
//  error_reporting(E_ALL);


define("SRC_DIR", dirname(__FILE__) . '/');
define("HTTP_DIR", realpath(dirname(__FILE__) . '/../') . '/');
define("ROOT_DIR", realpath(dirname(__FILE__) . '/../../') . '/');


// require composer packages
require_once ROOT_DIR . 'vendor/autoload.php';

$htmlSanitizer = HtmlSanitizer\Sanitizer::create(['extensions' => ['basic']]);


require_once SRC_DIR . 'classes/AuthUser.php';
require_once SRC_DIR . 'classes/DbConnection.php';

require_once SRC_DIR . 'classes/Xero.php';
require_once SRC_DIR . 'classes/Xero/Accounts.php';
require_once SRC_DIR . 'classes/Xero/Contacts.php';

$db_dotenv = Dotenv\Dotenv::create(ROOT_DIR . 'config', 'database.env');
$db_dotenv->load();
$general_dotenv = Dotenv\Dotenv::create(ROOT_DIR . 'config', 'general.env');
$general_dotenv->load();
$xero_dotenv = Dotenv\Dotenv::create(ROOT_DIR . 'private/xero', 'oauth.env');
$xero_dotenv->load();

// instantiate auth user module
$authUser = \AuthUser::getInstance();

function getPostData() {
    // $post = file_get_contents('php://input') ?? $_POST;
    $post = $_POST;
    return $post;
}
function echoJsonData($data) {
    header('Content-Type: application/json');
    echo json_encode($data);
    die;
}