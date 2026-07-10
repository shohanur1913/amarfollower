<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? 'create';

    // ==========================================
    // 1. Handle Soft Delete (AJAX JSON Request)
    // ==========================================
    if ($action === 'delete') {
        $ids = json_decode($_POST['ids'] ?? '[]', true);
        if (is_array($ids)) {
            foreach ($ids as $id) {
                // Soft delete: update the flag instead of removing the row
                mysqli_query($conn, "UPDATE services SET is_deleted = 1 WHERE id = " . (int)$id);
            }
        }
        header('Content-Type: application/json');
        echo json_encode(['success' => true]);
        exit;
    }

    // ==========================================
    // 2. Handle Create / Update Form Submissions
    // ==========================================
    
    // Get values and ensure they are never NULL (using ?? '')
    $id        = (int)($_POST['id'] ?? 0);
    $name      = mysqli_real_escape_string($conn, (string)($_POST['name'] ?? ''));
    $cat_id    = (int)($_POST['category_id'] ?? 0);
    $price     = mysqli_real_escape_string($conn, (string)($_POST['price_per_k'] ?? '0.00'));
    $per       = (int)($_POST['per_amount'] ?? 1000);
    $min       = (int)($_POST['min'] ?? 100);
    $max       = (int)($_POST['max'] ?? 10000);
    $start     = mysqli_real_escape_string($conn, (string)($_POST['start_time'] ?? ''));
    $speed     = mysqli_real_escape_string($conn, (string)($_POST['speed'] ?? ''));
    $guarantee = mysqli_real_escape_string($conn, (string)($_POST['guarantee'] ?? ''));
    $quality   = mysqli_real_escape_string($conn, (string)($_POST['quality'] ?? ''));
    $status    = (int)($_POST['status'] ?? 1);

    if ($action === 'create') {
        // Safe Insert
        $sql = "INSERT INTO services 
                (name, category_id, price_per_k, per_amount, min, max, start_time, speed, guarantee, quality, status) 
                VALUES 
                ('$name', $cat_id, '$price', $per, $min, $max, '$start', '$speed', '$guarantee', '$quality', $status)";
    } else {
        // Safe Update
        $sql = "UPDATE services SET 
                name='$name', category_id=$cat_id, price_per_k='$price', per_amount=$per, 
                min=$min, max=$max, start_time='$start', speed='$speed', guarantee='$guarantee', 
                quality='$quality', status=$status 
                WHERE id=$id";
    }

    if (mysqli_query($conn, $sql)) {
        // Redirect back to the services list
        header("Location: ../index.php?p=services&success=1");
        exit;
    } else {
        die("MySQL Error: " . mysqli_error($conn));
    }
}
?>

