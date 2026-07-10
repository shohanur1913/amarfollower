<?php
/**
 * MySQL -> PostgreSQL Migration Script
 * Run: php migrate.php
 */

$mysql_host = "localhost";
$mysql_user = "root";
$mysql_pass = "";
$mysql_db   = "amarfollower";

$pg_host = "localhost";
$pg_port = "5432";
$pg_user = "postgres";
$pg_pass = "postgres";
$pg_db   = "amarfollower";

echo "=== AmarFollower MySQL -> PostgreSQL Migration ===\n\n";

// Connect MySQL
$mysql = new mysqli($mysql_host, $mysql_user, $mysql_pass, $mysql_db);
if ($mysql->connect_error) {
    die("MySQL error: " . $mysql->connect_error . "\n");
}
$mysql->set_charset("utf8mb4");
echo "[OK] MySQL connected\n";

// Connect PostgreSQL
$pg = pg_connect("host=$pg_host port=$pg_port dbname=$pg_db user=$pg_user password=$pg_pass");
if (!$pg) {
    die("PostgreSQL connection failed\n");
}
echo "[OK] PostgreSQL connected\n\n";

function pg_escape($pg, $val) {
    return pg_escape_string($pg, $val);
}

function migrate_table($mysql, $pg, $table, $columns, $query = null) {
    if (!$query) {
        $query = "SELECT * FROM $table";
    }
    $result = $mysql->query($query);
    if (!$result) {
        echo "[SKIP] $table: " . $mysql->error . "\n";
        return 0;
    }
    
    $count = 0;
    $batch = [];
    
    while ($row = $result->fetch_assoc()) {
        $values = [];
        foreach ($columns as $col => $type) {
            $val = $row[$col] ?? null;
            if ($val === null) {
                $values[] = "NULL";
            } elseif ($type === 'int') {
                $values[] = intval($val);
            } elseif ($type === 'decimal') {
                $values[] = floatval($val);
            } elseif ($type === 'bool') {
                $values[] = $val ? 'true' : 'false';
            } elseif ($type === 'text') {
                $values[] = "'" . pg_escape($pg, $val) . "'";
            } else {
                $values[] = "'" . pg_escape($pg, $val) . "'";
            }
        }
        
        $cols = implode(', ', array_keys($columns));
        $vals = implode(', ', $values);
        $sql = "INSERT INTO $table ($cols) VALUES ($vals) ON CONFLICT DO NOTHING";
        
        $res = pg_query($pg, $sql);
        if (!$res) {
            echo "[ERR] $table: " . pg_last_error($pg) . "\nSQL: $sql\n";
        } else {
            $count++;
        }
    }
    
    return $count;
}

echo "--- Migrating tables ---\n\n";

// 1. Settings
$n = migrate_table($mysql, $pg, 'settings', [
    'key' => 'text',
    'value' => 'text',
], "SELECT s_key as `key`, s_value as `value` FROM settings");
echo "[OK] settings: $n rows\n";

// 2. Platforms
$n = migrate_table($mysql, $pg, 'platforms', [
    'id' => 'int',
    'name' => 'text',
    'icon_class' => 'text',
    'sort_order' => 'int',
    'status' => 'int',
]);
echo "[OK] platforms: $n rows\n";

// 3. Categories
$n = migrate_table($mysql, $pg, 'categories', [
    'id' => 'int',
    'platform_id' => 'int',
    'name' => 'text',
    'sort_order' => 'int',
    'status' => 'int',
]);
echo "[OK] categories: $n rows\n";

// 4. Providers
$n = migrate_table($mysql, $pg, 'providers', [
    'id' => 'int',
    'name' => 'text',
    'api_url' => 'text',
    'api_key' => 'text',
    'status' => 'int',
]);
echo "[OK] providers: $n rows\n";

// 5. Services
$n = migrate_table($mysql, $pg, 'services', [
    'id' => 'int',
    'name' => 'text',
    'category_id' => 'int',
    'provider_id' => 'int',
    'api_service_id' => 'int',
    'price_per_k' => 'decimal',
    'per_amount' => 'int',
    'min' => 'int',
    'max' => 'int',
    'start_time' => 'text',
    'speed' => 'text',
    'guarantee' => 'text',
    'quality' => 'text',
    'description' => 'text',
    'status' => 'int',
    'is_deleted' => 'bool',
]);
echo "[OK] services: $n rows\n";

// 6. Users
$n = migrate_table($mysql, $pg, 'users', [
    'id' => 'int',
    'username' => 'text',
    'email' => 'text',
    'password' => 'text',
    'balance' => 'decimal',
    'role' => 'text',
    'status' => 'text',
    'canOrder' => 'bool',
    'remember_token' => 'text',
    'api_key' => 'text',
    'google_id' => 'text',
    'two_factor_secret' => 'text',
    'two_factor_enabled' => 'bool',
    'referred_by' => 'int',
    'referral_code' => 'text',
    'created_at' => 'text',
]);
echo "[OK] users: $n rows\n";

// 7. Gateways
$n = migrate_table($mysql, $pg, 'gateways', [
    'id' => 'int',
    'name' => 'text',
    'display_name' => 'text',
    'api_key' => 'text',
    'base_url' => 'text',
    'currency' => 'text',
    'status' => 'int',
]);
echo "[OK] gateways: $n rows\n";

// 8. Orders
$n = migrate_table($mysql, $pg, 'orders', [
    'id' => 'int',
    'user_id' => 'int',
    'service_id' => 'int',
    'provider_id' => 'int',
    'link' => 'text',
    'quantity' => 'int',
    'charge' => 'decimal',
    'status' => 'text',
    'api_order_id' => 'int',
    'start_count' => 'text',
    'remains' => 'text',
    'created_at' => 'text',
]);
echo "[OK] orders: $n rows\n";

// 9. Payments
$n = migrate_table($mysql, $pg, 'payments', [
    'id' => 'int',
    'user_id' => 'int',
    'transaction_id' => 'text',
    'amount' => 'decimal',
    'fee_amount' => 'decimal',
    'gateway' => 'text',
    'status' => 'text',
    'created_at' => 'text',
]);
echo "[OK] payments: $n rows\n";

// 10. Tickets
$n = migrate_table($mysql, $pg, 'tickets', [
    'id' => 'int',
    'user_id' => 'int',
    'subject' => 'text',
    'status' => 'text',
    'ai_muted' => 'bool',
    'created_at' => 'text',
]);
echo "[OK] tickets: $n rows\n";

// 11. Ticket Messages
$n = migrate_table($mysql, $pg, 'ticket_messages', [
    'id' => 'int',
    'ticket_id' => 'int',
    'sender_role' => 'text',
    'message' => 'text',
    'created_at' => 'text',
]);
echo "[OK] ticket_messages: $n rows\n";

// 12. Todo List
$n = migrate_table($mysql, $pg, 'todo_list', [
    'id' => 'int',
    'ticket_id' => 'int',
    'task_description' => 'text',
    'is_completed' => 'bool',
]);
echo "[OK] todo_list: $n rows\n";

// 13. Refills
$n = migrate_table($mysql, $pg, 'refills', [
    'id' => 'int',
    'user_id' => 'int',
    'order_id' => 'int',
    'status' => 'text',
    'created_at' => 'text',
]);
echo "[OK] refills: $n rows\n";

// 14. Cron Logs (limit to last 5000 to avoid massive insert)
$n = migrate_table($mysql, $pg, 'cron_logs', [
    'id' => 'int',
    'action' => 'text',
    'result' => 'text',
    'created_at' => 'text',
], "SELECT * FROM cron_logs ORDER BY id DESC LIMIT 5000");
echo "[OK] cron_logs: $n rows (last 5000)\n";

// Reset sequences
echo "\n--- Resetting sequences ---\n";
$sequences = [
    'platforms', 'categories', 'providers', 'services', 'users',
    'gateways', 'orders', 'payments', 'tickets', 'ticket_messages',
    'todo_list', 'refills', 'cron_logs'
];
foreach ($sequences as $table) {
    $res = pg_query($pg, "SELECT setval(pg_get_serial_sequence('$table', 'id'), COALESCE((SELECT MAX(id) FROM $table), 1))");
    if ($res) echo "[OK] $table sequence reset\n";
    else echo "[ERR] $table: " . pg_last_error($pg) . "\n";
}

// Verify counts
echo "\n--- Verification ---\n";
$tables = ['users', 'platforms', 'categories', 'services', 'providers', 'orders', 'payments', 'gateways', 'tickets', 'ticket_messages', 'todo_list', 'refills', 'cron_logs', 'settings'];
foreach ($tables as $table) {
    $res = pg_query($pg, "SELECT COUNT(*) as cnt FROM $table");
    $row = pg_fetch_assoc($res);
    echo "$table: {$row['cnt']} rows\n";
}

$mysql->close();
pg_close($pg);

echo "\n=== Migration Complete! ===\n";
