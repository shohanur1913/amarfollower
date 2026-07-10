<?php
require_once '../includes/config.php';
require_once '../includes/auth.php';
checkLogin();
$user = getLoggedUser($conn);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amount = (float)($_POST['amount'] ?? 0);
    $gateway_name = mysqli_real_escape_string($conn, (string)($_POST['gateway'] ?? ''));
    
    $fee_percent = (float)($settings['processing_fee_percent'] ?? 5.00);
    $fee_amount  = $amount * ($fee_percent / 100);
    $final_total = $amount + $fee_amount;

    $res = mysqli_query($conn, "SELECT * FROM gateways WHERE name = '$gateway_name' AND status = 1");
    $gw = mysqli_fetch_assoc($res);
    
    if (!$gw || $amount <= 0) { die("Invalid request."); }

    $apiKey = trim($gw['api_key']);
    $baseUrl = rtrim($gw['base_url'], '/');
    $orderId = "DEP-" . time() . "-" . $user['id']; 

    // 1. CREATE INITIAL PENDING RECORD
    mysqli_query($conn, "INSERT INTO payments (user_id, transaction_id, amount, fee_amount, gateway, status) 
                         VALUES ({$user['id']}, '$orderId', $amount, $fee_amount, '$gateway_name', 'pending')");
    $local_db_id = mysqli_insert_id($conn);

    $postData = [
        'full_name'    => $user['username'],
        'email_mobile' => $user['email'],
        'amount'       => number_format($final_total, 2, '.', ''),
        'metadata'     => ['order_id' => $orderId, 'user_id' => $user['id']],
        'redirect_url' => rtrim($settings['site_url'], '/') . "/index.php?p=transactions&status=success&tid=$orderId",
        'cancel_url' => rtrim($settings['site_url'], '/') . "/index.php?status=cancel&tid=$orderId",
        'webhook_url'  => rtrim($settings['site_url'], '/') . "/api/callback_paymently.php",
        'return_type'  => 'GET', 
        'currency'     => $gw['currency'],
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $baseUrl . '/api/create-charge');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        'mh-piprapay-api-key: ' . $apiKey
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $result = json_decode($response, true);

    if ($httpCode === 200 && isset($result['pp_url'])) {
        // SUCCESS: Redirect user to checkout
        header("Location: " . $result['pp_url']);
        exit;
    } else {
        // FAILURE: Update the record to 'failed' instead of leaving it 'pending'
        mysqli_query($conn, "UPDATE payments SET status = 'failed' WHERE id = $local_db_id");
        
        header("Location: ../index.php?p=transactions&error=Gateway rejected the request.");
        exit;
    }
}
