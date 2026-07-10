<?php
/**
 * 1. ENHANCED SESSION & SECURITY CONFIG
 * Must be defined before session_start()
 */
$session_lifetime = 30 * 24 * 60 * 60; // 30 Days
ini_set('session.gc_maxlifetime', $session_lifetime);
ini_set('session.cookie_lifetime', $session_lifetime);

session_set_cookie_params([
    'lifetime' => $session_lifetime,
    'path' => '/',
    'domain' => $_SERVER['HTTP_HOST'] ?? null,
    'secure' => isset($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Lax'
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * 2. ABSOLUTE PATH LOGIC
 */
define('ROOT_PATH', dirname(__DIR__) . DIRECTORY_SEPARATOR);

/**
 * 3. DATABASE CONNECTION
 */
$db_host = "localhost";
$db_user = "root";
$db_pass = "";
$db_name = "amarfollower";

$conn = mysqli_connect($db_host, $db_user, $db_pass, $db_name);

if (!$conn) { 
    die("Database Connection Error: " . mysqli_connect_error()); 
}

// Ensure emojis and fancy fonts are supported
mysqli_set_charset($conn, "utf8mb4");

/**
 * 4. GLOBAL SETTINGS ENGINE
 */
$settings = [];
$settings_res = mysqli_query($conn, "SELECT * FROM settings");
if ($settings_res) {
    while($row = mysqli_fetch_assoc($settings_res)) {
        $settings[$row['s_key']] = $row['s_value'];
    }
}

/**
 * 5. FINANCIAL CONSTANTS
 */
$currency_symbol = $settings['currency_symbol'] ?? '৳';
$usd_to_bdt_rate = (float)($settings['usd_rate'] ?? 120.00);

/**
 * HELPER FUNCTIONS
 */

// Format Price: 100 -> ৳100.00
function formatPrice($amount) {
    global $currency_symbol;
    return $currency_symbol . number_format((float)$amount, 2);
}

// Convert USD to Local: 1.00 -> 120.00
function convertToLocal($usd_amount) {
    global $usd_to_bdt_rate;
    return (float)$usd_amount * $usd_to_bdt_rate;
}

/**
 * 6. FILAMENT UI BRANDING ENGINE
 */
function getTailwindConfig($settings) {
    $primary = $settings['primary_color'] ?? '#6366f1';
    return "
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '$primary',
                        darkPanel: '#18181b',
                        darkBg: '#09090b',
                    },
                    fontFamily: {
                        sans: ['Nunito', 'sans-serif'],
                    },
                }
            }
        }
    </script>";
}
?>
