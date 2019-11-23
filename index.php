<?php
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

<body>

<script type="text/javascript">
const API_URL = "<?= $API_URL ?>";
const authUser = <?= $authUser ?>;
</script>

<div id="app"></div>

<script src="dist/js/main.js"></script>
</body>
</html>