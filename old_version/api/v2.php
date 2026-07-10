<?php
/**
 * Amar Follower - Public API v2
 * Standardized for SMM Panel Integrations (SMMGEN/WHMCS Compatible)
 */

header('Content-Type: application/json');

// 1. Setup Environment & Configuration
// We use '../' because the file is now directly inside the 'api' folder
require_once '../includes/config.php';

// Silence errors to ensure valid JSON output
error_reporting(0);
ini_set('display_errors', 0);

// 2. Validate HTTP Method
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Invalid request method. Use POST.']);
    exit;
}

// 3. Inputs & Security Sanitization
$api_key = mysqli_real_escape_string($conn, (string)($_POST['key'] ?? ''));
$action  = (string)($_POST['action'] ?? '');

if (empty($api_key)) {
    echo json_encode(['error' => 'Invalid API Key']);
    exit;
}

// 4. Authenticate User
$user_query = mysqli_query($conn, "SELECT * FROM users WHERE api_key = '$api_key' AND status = 'active' LIMIT 1");
$user = mysqli_fetch_assoc($user_query);

if (!$user) {
    echo json_encode(['error' => 'Authentication failed or account suspended']);
    exit;
}

$uid = (int)$user['id'];
$currencyCode = $settings['currency_code'] ?? 'BDT';

// 5. API ROUTER
switch ($action) {

    // --- GET SERVICES LIST ---
    case 'services':
        $sql = "SELECT s.id as service, s.name, 'Default' as type, c.name as category, 
                s.price_per_k as rate, s.min, s.max, 
                IF(s.guarantee != '', 'true', 'false') as refill, 'true' as cancel
                FROM services s 
                JOIN categories c ON s.category_id = c.id 
                WHERE s.status = 1 AND s.is_deleted = 0";
        $res = mysqli_query($conn, $sql);
        $services = mysqli_fetch_all($res, MYSQLI_ASSOC);
        echo json_encode($services);
        break;

    // --- ADD NEW ORDER ---
    case 'add':
        $sid  = (int)($_POST['service'] ?? 0);
        $link = mysqli_real_escape_string($conn, (string)($_POST['link'] ?? ''));
        $qty  = (int)($_POST['quantity'] ?? 0);

        // Fetch Service Details
        $s_res = mysqli_query($conn, "SELECT * FROM services WHERE id = $sid AND status = 1 AND is_deleted = 0 LIMIT 1");
        $service = mysqli_fetch_assoc($s_res);

        if (!$service) { 
            echo json_encode(['error' => 'Invalid Service ID']); 
            exit; 
        }

        // Validate Quantity
        if ($qty < (int)$service['min'] || $qty > (int)$service['max']) { 
            echo json_encode(['error' => 'Quantity out of range (Min: '.$service['min'].' Max: '.$service['max'].')']); 
            exit; 
        }

        // Check if user is restricted
        if ($user['can_order'] == 0) {
            echo json_encode(['error' => 'Your account is restricted from ordering via API']);
            exit;
        }

        // Calculate Cost
        $price_per_unit = (float)$service['price_per_k'];
        $per_amount     = (int)($service['per_amount'] ?? 1000);
        $total_charge   = ($price_per_unit * $qty) / $per_amount;

        // Balance Check
        if ((float)$user['balance'] < $total_charge) {
            echo json_encode(['error' => 'Insufficient balance']);
            exit;
        }

        // Process Transaction
        mysqli_begin_transaction($conn);
        $order_sql = "INSERT INTO orders (user_id, service_id, link, quantity, charge, status) 
                      VALUES ($uid, $sid, '$link', $qty, $total_charge, 'pending')";
        
        if (mysqli_query($conn, $order_sql)) {
            $order_id = mysqli_insert_id($conn);
            mysqli_query($conn, "UPDATE users SET balance = balance - $total_charge WHERE id = $uid");
            mysqli_commit($conn);
            echo json_encode(['order' => $order_id]);
        } else {
            mysqli_rollback($conn);
            echo json_encode(['error' => 'Server failed to record order']);
        }
        break;

    // --- CHECK ORDER STATUS ---
    case 'status':
        if (isset($_POST['order'])) {
            // Single Order Lookup
            $oid = (int)$_POST['order'];
            $o_res = mysqli_query($conn, "SELECT charge, status, start_count, remains FROM orders WHERE id = $oid AND user_id = $uid");
            $order = mysqli_fetch_assoc($o_res);
            if ($order) {
                echo json_encode([
                    'charge'      => $order['charge'],
                    'start_count' => $order['start_count'] ?? "0",
                    'status'      => ucfirst($order['status']),
                    'remains'     => $order['remains'] ?? "0",
                    'currency'    => $currencyCode
                ]);
            } else {
                echo json_encode(['error' => 'Order not found']);
            }
        } elseif (isset($_POST['orders'])) {
            // Bulk Status Lookup
            $ids = explode(',', $_POST['orders']);
            $results = [];
            foreach ($ids as $id) {
                $id = (int)trim($id);
                $o_res = mysqli_query($conn, "SELECT charge, status, start_count, remains FROM orders WHERE id = $id AND user_id = $uid");
                $order = mysqli_fetch_assoc($o_res);
                if ($order) {
                    $results[$id] = [
                        'charge'      => $order['charge'],
                        'status'      => ucfirst($order['status']),
                        'remains'     => $order['remains'] ?? "0",
                        'start_count' => $order['start_count'] ?? "0"
                    ];
                } else {
                    $results[$id] = ['error' => 'Order not found'];
                }
            }
            echo json_encode($results);
        }
        break;

    // --- REQUEST REFILL ---
    case 'refill':
        $oid = (int)$_POST['order'];
        $check = mysqli_query($conn, "SELECT id FROM orders WHERE id = $oid AND user_id = $uid AND status = 'completed'");
        if (mysqli_num_rows($check) > 0) {
            // Record refill request
            mysqli_query($conn, "INSERT INTO refills (user_id, order_id, status) VALUES ($uid, $oid, 'pending')");
            echo json_encode(['refill' => mysqli_insert_id($conn)]);
        } else {
            echo json_encode(['error' => 'Order not eligible for refill (Must be completed)']);
        }
        break;

    // --- CHECK USER BALANCE ---
    case 'balance':
        echo json_encode([
            'balance'  => number_format((float)$user['balance'], 4, '.', ''),
            'currency' => $currencyCode
        ]);
        break;

    default:
        echo json_encode(['error' => 'Invalid Action']);
        break;
}

mysqli_close($conn);