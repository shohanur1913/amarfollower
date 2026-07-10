<?php
// 1. Ensure session is started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * Enhanced Login Check with "Remember Me" Support
 */
function checkLogin() {
    global $conn;
    
    // If session is already active, user is logged in
    if (isset($_SESSION['user_id'])) {
        return;
    }

    // If session is empty, check for "Remember Me" cookie
    if (isset($_COOKIE['remember_me'])) {
        $token = mysqli_real_escape_string($conn, $_COOKIE['remember_me']);
        $query = mysqli_query($conn, "SELECT * FROM users WHERE remember_token = '$token' LIMIT 1");
        
        if ($user = mysqli_fetch_assoc($query)) {
            // Re-generate the session from the token
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];
            $_SESSION['username'] = $user['username'];
            return;
        }
    }

    // Redirect to login if not on an allowed guest page
    $current_page = basename($_SERVER['PHP_SELF']);
    $allowed_pages = ['index.php', 'login.php', 'register.php'];
    
    if (!in_array($current_page, $allowed_pages)) {
        header("Location: login.php");
        exit();
    }
}

/**
 * Admin Access Guard
 */
function checkAdmin() {
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        // Redirecting to root login for admin security
        $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        header("Location: $basePath/login.php");
        exit();
    }
}

/**
 * Fetch Logged-in User Data
 */
function getLoggedUser($conn) {
    if (!isset($_SESSION['user_id'])) return null;
    
    // Sanitize the ID to ensure it's a number
    $id = (int)$_SESSION['user_id'];
    $result = mysqli_query($conn, "SELECT * FROM users WHERE id = $id");
    
    return ($result) ? mysqli_fetch_assoc($result) : null;
}
?>
