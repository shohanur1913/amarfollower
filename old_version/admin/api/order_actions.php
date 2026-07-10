<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
require_once '../../includes/smm_api.php';
checkAdmin();

header('Content-Type: application/json');

$action = $_REQUEST['action'] ?? '';

// 1. UPDATE SINGLE STATUS
if ($action === 'update_status') {
    $id = (int)$_POST['order_id'];
    $status = mysqli_real_escape_string($conn, $_POST['status']);
    
    // Add Refund Logic here (same as previous code)
    $order = mysqli_fetch_assoc(mysqli_query($conn, "SELECT user_id, charge, status FROM orders WHERE id = $id"));
    if($status === 'cancelled' && $order['status'] !== 'cancelled') {
        mysqli_query($conn, "UPDATE users SET balance = balance + {$order['charge']} WHERE id = {$order['user_id']}");
    }

    mysqli_query($conn, "UPDATE orders SET status = '$status' WHERE id = $id");
    echo json_encode(['success' => true]);
    exit;
}

// 2. BULK ACTIONS
if (strpos($action, 'bulk_') === 0) {
    $ids = json_decode($_POST['ids'], true);
    $target_status = str_replace('bulk_', '', $action);

    foreach ($ids as $id) {
        $id = (int)$id;
        if($target_status === 'delete') {
            mysqli_query($conn, "DELETE FROM orders WHERE id = $id");
        } else {
            mysqli_query($conn, "UPDATE orders SET status = '$target_status' WHERE id = $id");
        }
    }
    echo json_encode(['success' => true]);
    exit;
}

// 3. LIVE API SYNC (The "Boring Job" Fixer)
if ($action === 'sync_api') {
    $id = (int)$_GET['id'];
    $sql = "SELECT o.*, p.api_url, p.api_key FROM orders o 
            JOIN providers p ON o.provider_id = p.id 
            WHERE o.id = $id AND o.api_order_id > 0";
    $res = mysqli_query($conn, $sql);
    $o = mysqli_fetch_assoc($res);

    if ($o) {
        $api = new SmmGenAPI();
        $data = $api->request($o['api_url'], ['key' => $o['api_key'], 'action' => 'status', 'order' => $o['api_order_id']]);
        
        if (isset($data['status'])) {
            $new_status = strtolower($data['status']);
            // Standardize
            if($new_status == 'completed') $final = 'completed';
            elseif($new_status == 'canceled' || $new_status == 'cancelled') $final = 'cancelled';
            else $final = 'processing';

            mysqli_query($conn, "UPDATE orders SET status = '$final' WHERE id = $id");
            echo json_encode(['success' => true, 'new_status' => $final]);
        } else {
            echo json_encode(['success' => false, 'message' => 'API Error or Order ID invalid']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Manual order - no API link']);
    }
    exit;
}