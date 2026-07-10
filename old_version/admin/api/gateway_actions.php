<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id      = (int)($_POST['id'] ?? 0);
    $display = mysqli_real_escape_string($conn, (string)($_POST['display_name'] ?? ''));
    $key     = mysqli_real_escape_string($conn, (string)($_POST['api_key'] ?? ''));
    $url     = mysqli_real_escape_string($conn, (string)($_POST['base_url'] ?? ''));
    $curr    = mysqli_real_escape_string($conn, (string)($_POST['currency'] ?? 'USD'));
    $status  = (int)($_POST['status'] ?? 1);

    if ($id > 0) {
        $sql = "UPDATE gateways SET 
                display_name='$display', api_key='$key', base_url='$url', currency='$curr', status=$status 
                WHERE id=$id";
        
        if (mysqli_query($conn, $sql)) {
            header("Location: ../index.php?p=gateways&success=1");
        } else {
            die("Error: " . mysqli_error($conn));
        }
    }
}