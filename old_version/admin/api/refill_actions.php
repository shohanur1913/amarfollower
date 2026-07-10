<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)($_POST['id'] ?? 0);
    $status = mysqli_real_escape_string($conn, (string)($_POST['status'] ?? 'pending'));

    if ($id > 0) {
        $sql = "UPDATE refills SET status = '$status' WHERE id = $id";
        if (mysqli_query($conn, $sql)) {
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid ID']);
    }
    exit;
}
