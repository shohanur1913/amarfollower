<?php
session_start();
session_destroy();
$basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
header("Location: $basePath/login.php");
exit;