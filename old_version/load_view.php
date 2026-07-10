<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
checkLogin();
$user = getLoggedUser($conn);

$p = $_GET['p'] ?? 'dashboard';
$p = str_replace(['..', '/', '\\'], '', $p); // Security

$file = ROOT_PATH . 'views' . DIRECTORY_SEPARATOR . $p . '.php';

if (file_exists($file)) {
    include $file;
} else {
    http_response_code(404);
    echo "404: View Not Found";
}