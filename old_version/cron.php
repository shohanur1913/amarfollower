<?php
/**
 * Amar Follower - Master Automation Engine (Production)
 * Handles: Order Status Sync, Service Catalog Sync, Auto-Refunds
 * Safe for PHP 8.1+, Server-Aware (CLI/Browser), and includes Error Logging.
 */

// Set a safe execution time to prevent timeouts on large syncs
@set_time_limit(300);

// --- 1. CONFIGURATION & SETUP ---
// Use __DIR__ to ensure paths are always correct, regardless of run environment
require_once __DIR__ . '/includes/config.php';
require_once __DIR__ . '/includes/smm_api.php';

// --- 2. CLI BRIDGE ---
// This allows cPanel cron jobs to pass arguments like 'action=orders'
if (php_sapi_name() === "cli" && isset($argv[1])) {
    parse_str($argv[1], $_GET);
}

// --- 3. INITIALIZATION ---
$api = new SmmGenAPI();
$action = (string)($_GET['action'] ?? 'none');
$result_msg = "Invalid action. Please use 'orders' or 'services'.";

try {
    // =========================================================
    // TASK 1: SYNC ORDER STATUSES & PROCESS REFUNDS
    // =========================================================
    if ($action === 'orders') {
        $count = 0;
        $refunds = 0;
        
        // Fetch all non-completed orders that are linked to an external provider
        $sql = "SELECT o.id, o.user_id, o.charge, o.status as local_status, o.api_order_id, p.api_url, p.api_key 
                FROM orders o 
                JOIN providers p ON o.provider_id = p.id 
                WHERE o.status IN ('pending', 'processing') AND o.api_order_id > 0 
                LIMIT 50"; // Limit to 50 per run for performance
        
        $res = mysqli_query($conn, $sql);
        if (!$res) throw new Exception("Database Error: " . mysqli_error($conn));
        
        if (mysqli_num_rows($res) === 0) {
            $result_msg = "No pending orders in the sync queue.";
        } else {
            while($o = mysqli_fetch_assoc($res)) {
                $statusData = $api->request($o['api_url'], [
                    'key' => $o['api_key'],
                    'action' => 'status',
                    'order' => $o['api_order_id']
                ]);

                if (isset($statusData['status'])) {
                    $externalStatus = strtolower($statusData['status']);
                    $finalStatus = '';

                    // Map external status to our panel's status
                    if ($externalStatus == 'completed') $finalStatus = 'completed';
                    elseif (in_array($externalStatus, ['processing', 'inprogress', 'pending'])) $finalStatus = 'processing';
                    elseif (in_array($externalStatus, ['canceled', 'cancelled', 'error', 'fail'])) $finalStatus = 'cancelled';
                    elseif ($externalStatus == 'partial') $finalStatus = 'completed'; // Treat partials as done

                    // Auto-Refund Logic
                    if ($finalStatus == 'cancelled' && $o['local_status'] != 'cancelled') {
                        $refund_amount = (float)$o['charge'];
                        $uid = (int)$o['user_id'];
                        mysqli_query($conn, "UPDATE users SET balance = balance + $refund_amount WHERE id = $uid");
                        $refunds++;
                    }

                    // Update local order status
                    if (!empty($finalStatus)) {
                        mysqli_query($conn, "UPDATE orders SET status = '$finalStatus' WHERE id = {$o['id']}");
                        $count++;
                    }
                }
            }
            $result_msg = "Checked $count orders. Processed $refunds auto-refunds.";
        }
        
        // Record the successful run time
        mysqli_query($conn, "INSERT INTO settings (s_key, s_value) VALUES ('cron_last_run_orders', NOW()) ON DUPLICATE KEY UPDATE s_value = NOW()");
    }

    // =========================================================
    // TASK 2: SYNC SERVICE CATALOG & PRICES
    // =========================================================
    if ($action === 'services') {
        $updated = 0;
        $disabled = 0;
        $usd_rate = (float)($settings['usd_rate'] ?? 120.00);
        $markup = 1.20; // 20% Profit

        $providers = mysqli_query($conn, "SELECT * FROM providers WHERE status=1");
        
        while($p = mysqli_fetch_assoc($providers)) {
            $externalServices = $api->request($p['api_url'], ['key' => $p['api_key'], 'action' => 'services']);
            if(!is_array($externalServices)) continue;

            $localQuery = mysqli_query($conn, "SELECT id, api_service_id FROM services WHERE provider_id = {$p['id']} AND is_deleted = 0");
            $localMap = [];
            while($ls = mysqli_fetch_assoc($localQuery)) { $localMap[$ls['api_service_id']] = $ls['id']; }

            foreach($externalServices as $es) {
                if(isset($localMap[$es['service']])) {
                    $localId = $localMap[$es['service']];
                    
                    // Auto-convert price: (Provider USD Rate * BDT Rate) * Your Margin
                    $newPrice = ($es['rate'] * $usd_rate) * $markup;
                    
                    mysqli_query($conn, "UPDATE services SET price_per_k = '" . number_format($newPrice, 2, '.', '') . "', status = 1 WHERE id = $localId");
                    
                    unset($localMap[$es['service']]); // Remove from checklist
                    $updated++;
                }
            }
            
            // Disable any service that the provider removed
            foreach($localMap as $apiId => $localId) {
                mysqli_query($conn, "UPDATE services SET status = 0 WHERE id = $localId");
                $disabled++;
            }
        }
        $result_msg = "Price-checked $updated services. Disabled $disabled removed services.";
        
        // Record the successful run time
        mysqli_query($conn, "INSERT INTO settings (s_key, s_value) VALUES ('cron_last_run_services', NOW()) ON DUPLICATE KEY UPDATE s_value = NOW()");
    }

} catch (Exception $e) {
    // --- 4. CATCH & LOG ERRORS ---
    $result_msg = "CRON FAILED: " . $e->getMessage();
}

// --- 5. LOG TO DATABASE & OUTPUT ---
$safe_action = mysqli_real_escape_string($conn, $action);
$safe_msg = mysqli_real_escape_string($conn, $result_msg);
mysqli_query($conn, "INSERT INTO cron_logs (action, result) VALUES ('$safe_action', '$safe_msg')");

echo $result_msg;
?>
