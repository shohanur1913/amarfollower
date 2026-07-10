<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action  = (string)($_POST['action'] ?? 'create');
    $id      = (int)($_POST['id'] ?? 0);
    $plat_id = (int)($_POST['platform_id'] ?? 0);
    $name    = mysqli_real_escape_string($conn, (string)($_POST['name'] ?? ''));
    $order   = (int)($_POST['sort_order'] ?? 0);
    $status  = (int)($_POST['status'] ?? 1);

    if ($action === 'create') {
        $sql = "INSERT INTO categories (platform_id, name, sort_order, status) VALUES ($plat_id, '$name', $order, $status)";
    } else {
        $sql = "UPDATE categories SET platform_id=$plat_id, name='$name', sort_order=$order, status=$status WHERE id=$id";
    }

    if (mysqli_query($conn, $sql)) {
        header("Location: ../index.php?p=categories&success=1");
    } else {
        die("Error: " . mysqli_error($conn));
    }
}

// Add this logic to the bottom of your admin/api/category_actions.php file
if ($action === 'delete') {
    $ids = json_decode($_POST['ids'], true);
    if(is_array($ids)) {
        foreach ($ids as $id) {
            $id = (int)$id;
            // Soft delete by setting status to 2
            mysqli_query($conn, "UPDATE categories SET status = 2 WHERE id = $id");
        }
        echo json_encode(['success' => true]);
        exit;
    }
}