<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = (int)$_POST['id'];
    $new_status = mysqli_real_escape_string($conn, (string)$_POST['status']);

    // 1. Fetch current payment and user info
    $res = mysqli_query($conn, "SELECT * FROM payments WHERE id = $id");
    $payment = mysqli_fetch_assoc($res);

    if (!$payment) {
        echo json_encode(['success' => false, 'message' => 'Payment record not found']);
        exit;
    }

    $old_status = $payment['status'];
    $user_id = $payment['user_id'];
    $amount = (float)$payment['amount'];

    // 2. FINANCIAL LOGIC: Handle User Balance
    // Condition: Moving to Completed from anything else
    if ($new_status === 'completed' && $old_status !== 'completed') {
        mysqli_query($conn, "UPDATE users SET balance = balance + $amount WHERE id = $user_id");
    }
    // Condition: Reverting from Completed back to something else (Rejecting an already approved one)
    elseif ($old_status === 'completed' && $new_status !== 'completed') {
        mysqli_query($conn, "UPDATE users SET balance = balance - $amount WHERE id = $user_id");
    }

    // 3. Update Payment Table
    $update = mysqli_query($conn, "UPDATE payments SET status = '$new_status' WHERE id = $id");

    if ($update) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
    }
    exit;
}
