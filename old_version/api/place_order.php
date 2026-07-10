<?php
require_once '../includes/config.php';
require_once '../includes/auth.php';
require_once '../includes/smm_api.php';

// 1. Initial Setup
header('Content-Type: application/json');
checkLogin();
$user = getLoggedUser($conn);

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // 2. User Restriction Check (Banned or Blocked from ordering)
    if ($user['status'] === 'banned') {
        echo json_encode(['success' => false, 'message' => 'Your account has been suspended.']);
        exit;
    }

    if ((int)$user['can_order'] === 0) {
        echo json_encode(['success' => false, 'message' => 'Ordering is currently restricted for your account.']);
        exit;
    }

    // 3. Input Sanitization (Handle Link/UID and Quantity)
    $service_id = (int)($_POST['service_id'] ?? 0);
    $link       = mysqli_real_escape_string($conn, (string)($_POST['link'] ?? ''));
    $quantity   = (int)($_POST['quantity'] ?? 0);

    if (empty($link)) {
        echo json_encode(['success' => false, 'message' => 'Please provide a Link or Account UID.']);
        exit;
    }

    // 4. Fetch and Validate Service
    $service_query = mysqli_query($conn, "SELECT * FROM services WHERE id = $service_id AND status = 1 AND is_deleted = 0 LIMIT 1");
    $service = mysqli_fetch_assoc($service_query);

    if (!$service) {
        echo json_encode(['success' => false, 'message' => 'Service is currently unavailable.']);
        exit;
    }

    // 5. Validate Quantity Limits
    if ($quantity < (int)$service['min'] || $quantity > (int)$service['max']) {
        echo json_encode(['success' => false, 'message' => 'Quantity must be between ' . $service['min'] . ' and ' . $service['max']]);
        exit;
    }

    // 6. Professional Price Calculation (Server Side)
    $price_per_unit = (float)$service['price_per_k'];
    $per_base       = (int)($service['per_amount'] ?? 1000);
    $total_charge   = ($price_per_unit * $quantity) / $per_base;

    // 7. Balance Check
    if ((float)$user['balance'] < $total_charge) {
        echo json_encode(['success' => false, 'message' => 'Insufficient balance. Please add funds.']);
        exit;
    }

    // 8. Start Database Transaction
    mysqli_begin_transaction($conn);

    try {
        // A. Deduct user balance
        mysqli_query($conn, "UPDATE users SET balance = balance - $total_charge WHERE id = {$user['id']}");

        // B. Insert order into local database
        $insert_sql = "INSERT INTO orders (user_id, service_id, link, quantity, charge, status) 
                       VALUES ({$user['id']}, $service_id, '$link', $quantity, $total_charge, 'pending')";
        mysqli_query($conn, $insert_sql);
        $local_order_id = mysqli_insert_id($conn);

        // C. Automation: Check if service is linked to an External Provider
        $api_order_id = 0;
        $api_error_occurred = false;

        if ((int)$service['provider_id'] > 0) {
            $p_id = (int)$service['provider_id'];
            $provider = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM providers WHERE id = $p_id AND status = 1"));

            if ($provider) {
                $api = new SmmGenAPI();
                $postData = [
                    'key'      => $provider['api_key'],
                    'action'   => 'add',
                    'service'  => $service['api_service_id'],
                    'link'     => $link,
                    'quantity' => $quantity
                ];

                $response = $api->request($provider['api_url'], $postData);

                if (isset($response['order'])) {
                    $api_order_id = (int)$response['order'];
                    // Update the local order with the Provider's Order ID and set to processing
                    mysqli_query($conn, "UPDATE orders SET api_order_id = $api_order_id, status = 'processing' WHERE id = $local_order_id");
                } else {
                    $api_error_occurred = true;
                }
            }
        }

        mysqli_commit($conn);

        // 9. Fetch updated balance for the receipt
        $updated_balance_query = mysqli_query($conn, "SELECT balance FROM users WHERE id = {$user['id']}");
        $updated_balance = mysqli_fetch_assoc($updated_balance_query)['balance'];

        // 10. SUCCESS RESPONSE (Returns data for the dashboard receipt)
        echo json_encode([
            'success'      => true,
            'message'      => 'Order Received Successfully!',
            'order_id'     => $local_order_id,
            'service_name' => $service['name'],
            'link'         => $link,
            'qty'          => number_format($quantity),
            'charge'       => number_format($total_charge, 4),
            'new_balance'  => number_format($updated_balance, 4)
        ]);
        exit;

    } catch (Exception $e) {
        mysqli_rollback($conn);
        echo json_encode(['success' => false, 'message' => 'System error. Order could not be placed.']);
        exit;
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid Request Method.']);
    exit;
}