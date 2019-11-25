<?php
require_once 'common.php';

$post = getPostData();

// verify POST request, and that user is logged in
if (!isset($post) || empty($authUser->getUser())) {
    http_response_code(401);
    die;
}

$authUser->logout();

echoJsonData(array(
    'status' => 'LOGGED_OUT'
));