<?php
require_once '../includes/config.php';
require_once '../includes/auth.php';

checkLogin();
$user = getLoggedUser($conn);
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');
    $uid = $user['id'];

    // --- 1. UPDATE PROFILE EMAIL ---
    if ($action === 'update_profile') {
        $email = mysqli_real_escape_string($conn, (string)$_POST['email']);
        
        // Check if email belongs to someone else
        $check = mysqli_query($conn, "SELECT id FROM users WHERE email = '$email' AND id != $uid");
        if (mysqli_num_rows($check) > 0) {
            echo json_encode(['success' => false, 'message' => 'Email is already in use by another account.']);
            exit;
        }

        mysqli_query($conn, "UPDATE users SET email = '$email' WHERE id = $uid");
        echo json_encode(['success' => true, 'message' => 'Profile Updated Successfully']);
        exit;
    }

    // --- 2. UPDATE PASSWORD ---
    if ($action === 'update_password') {
        $current = (string)$_POST['current_password'];
        $new = (string)$_POST['new_password'];
        $confirm = (string)$_POST['confirm_password'];

        // Verify Current Password
        if (!password_verify($current, $user['password'])) {
            echo json_encode(['success' => false, 'message' => 'Current password is incorrect.']);
            exit;
        }

        // Verify Match
        if ($new !== $confirm) {
            echo json_encode(['success' => false, 'message' => 'New passwords do not match.']);
            exit;
        }

        // Verify Length
        if (strlen($new) < 6) {
            echo json_encode(['success' => false, 'message' => 'Password must be at least 6 characters.']);
            exit;
        }

        $hash = password_hash($new, PASSWORD_DEFAULT);
        mysqli_query($conn, "UPDATE users SET password = '$hash' WHERE id = $uid");
        echo json_encode(['success' => true, 'message' => 'Password changed successfully.']);
        exit;
    }

    // --- 3. GENERATE API KEY ---
    if ($action === 'generate_api') {
        // Create a random 32 character hex string
        $new_key = bin2hex(random_bytes(16));
        
        mysqli_query($conn, "UPDATE users SET api_key = '$new_key' WHERE id = $uid");
        echo json_encode(['success' => true, 'message' => 'New API Key Generated!', 'api_key' => $new_key]);
        exit;
    }
}

echo json_encode(['success' => false, 'message' => 'Invalid Request']);