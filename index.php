<?php
require_once 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::create(dirname(__FILE__) . '/config', 'database.env');
$dotenv->load();

// check user auth
// if user not logged in, redirect to login page
// TODO

$API_URL = "bean/src/";
$authUser = json_encode(array());
?>
<!doctype html>
<html lang="EN">
<head>
    <title>Xero-Bean Integration</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" 
        integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" 
        crossorigin="anonymous">
<body>

<script type="text/javascript">
const API_URL = "<?= $API_URL ?>";
const authUser = <?= $authUser ?>;
</script>

<div id="app"></div>

<!-- custom -->
<script src="dist/js/main.js"></script>

<!-- jQuery & Bootstrap -->
<script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" 
    integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" 
    crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" 
    integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" 
    crossorigin="anonymous"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" 
    integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" 
    crossorigin="anonymous"></script>
</body>
</html>