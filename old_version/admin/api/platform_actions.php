<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Get values safely (Strict PHP 8+ compatible)
    $action = (string)($_POST['action'] ?? 'create');
    $id     = (int)($_POST['id'] ?? 0);
    $name   = mysqli_real_escape_string($conn, (string)($_POST['name'] ?? ''));
    $icon   = mysqli_real_escape_string($conn, (string)($_POST['icon_class'] ?? 'ph-globe'));
    $order  = (int)($_POST['sort_order'] ?? 0);
    $status = (int)($_POST['status'] ?? 1);

    if ($action === 'create') {
        // Safe Insert using icon_class
        $sql = "INSERT INTO platforms (name, icon_class, sort_order, status) 
                VALUES ('$name', '$icon', $order, $status)";
    } else {
        // Safe Update using icon_class
        $sql = "UPDATE platforms SET 
                name='$name', icon_class='$icon', sort_order=$order, status=$status 
                WHERE id=$id";
    }

    if (mysqli_query($conn, $sql)) {
        header("Location: ../index.php?p=platforms&success=1");
    } else {
        die("MySQL Error: " . mysqli_error($conn));
    }
}
