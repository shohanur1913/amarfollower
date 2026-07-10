<?php
require_once '../includes/config.php';
require_once '../includes/auth.php';

checkLogin();
$user = getLoggedUser($conn);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $order_id = (int)($_POST['order_id'] ?? 0);
    $uid = (int)$user['id'];

    // 1. Verify order exists and belongs to user
    $order_check = mysqli_query($conn, "SELECT id, status FROM orders WHERE id = $order_id AND user_id = $uid");
    $order = mysqli_fetch_assoc($order_check);

    if (!$order || $order['status'] !== 'completed') {
        echo json_encode(['success' => false, 'message' => 'Order must be completed to refill.']);
        exit;
    }

    // 2. Check if a refill request is already pending
    $existing = mysqli_query($conn, "SELECT id FROM refills WHERE order_id = $order_id AND status IN ('pending', 'processing')");
    if (mysqli_num_rows($existing) > 0) {
        echo json_encode(['success' => false, 'message' => 'Refill request already in progress.']);
        exit;
    }

    // 3. Create Refill Record
    $sql = "INSERT INTO refills (user_id, order_id, status) VALUES ($uid, $order_id, 'pending')";
    
    if (mysqli_query($conn, $sql)) {
        echo json_encode(['success' => true, 'message' => 'Refill request sent to admin!']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Database error.']);
    }
    exit;
}