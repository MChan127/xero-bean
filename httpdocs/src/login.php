<?php
require_once 'common.php';

$post = getPostData();

// verify POST request, and that user not logged in already
if (!empty($user = $authUser->getUser())) {
    // already logged in
    echoJsonData(array(
        'user' => $user
    ));
}
if (!isset($post)) {
    http_response_code(401);
    die;
}

// verify params
$username = trim($post['username']);
$password = trim($post['password']);
$remember = is_bool($post['remember']) ? $post['remember'] : $post['remember'] == 'true';

$errors = [];
if (empty($username) || 
    gettype($username) !== 'string' || 
    preg_match("/^[\w\s-'\d]+$/", $username) !== 1) {
    
    $errors[] = 'Your username may only contain letters, numbers, hyphens, and apostrophes';
}
if (empty($password) || 
    gettype($password) !== 'string') {
    
    $errors[] = 'Your password cannot be empty';
}

if (!empty($errors)) {
    http_response_code(500);
    echoJsonData(array(
        'errors' => $errors
    ));
    die;
}

// verify username and password combination and store in session
$user = $authUser->login($username, $password, $remember);

if (!$user) {
    http_response_code(403);
    echoJsonData(array(
        'errors' => array('The username and/or password are invalid')
    ));
} else {
    echoJsonData(array(
        'user' => $user
    ));
}
die;