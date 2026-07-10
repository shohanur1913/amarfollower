<?php
require_once '../includes/config.php';

// 1. Get raw input
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

// 2. Security: Verify API Key from headers
$headers = getallheaders();
$receivedKey = $headers['mh-piprapay-api-key'] ?? $headers['Mh-Piprapay-Api-Key'] ?? '';

$res = mysqli_query($conn, "SELECT api_key, base_url FROM gateways WHERE name = 'paymently'");
$gw = mysqli_fetch_assoc($res);

if (!$gw || $receivedKey !== $gw['api_key']) {
    header("HTTP/1.1 401 Unauthorized");
    exit("Invalid Auth");
}

// 3. Extract Data
$ppId      = $data['pp_id'] ?? null;
$orderId   = $data['metadata']['order_id'] ?? null;
$userId    = (int)($data['metadata']['user_id'] ?? 0);
$amount    = (float)($data['amount'] ?? 0);

// 4. Double Check with API (Verify Payment)
$ch = curl_init(rtrim($gw['base_url'], '/') . '/api/verify-payments');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'mh-piprapay-api-key: ' . $gw['api_key'],
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['pp_id' => $ppId]));
$verifyResponse = curl_exec($ch);
$verifyResult   = json_decode($verifyResponse, true);

// 5. Update Balance if successful
if (isset($verifyResult['status']) && strtolower($verifyResult['status']) === 'completed') {
    
    // Check if this payment was already processed
    $check = mysqli_query($conn, "SELECT status FROM payments WHERE transaction_id = '$orderId'");
    $payment = mysqli_fetch_assoc($check);
    
    if ($payment && $payment['status'] === 'pending') {
        // Start Transaction
        mysqli_begin_transaction($conn);
        
        // Mark payment as completed
        mysqli_query($conn, "UPDATE payments SET status = 'completed' WHERE transaction_id = '$orderId'");
        
        // Add balance to user
        mysqli_query($conn, "UPDATE users SET balance = balance + $amount WHERE id = $userId");
        
        mysqli_commit($conn);
        echo "Balance Updated Successfully";
    } else {
        echo "Already processed or not found";
    }
} else {
    echo "Payment not completed";
}