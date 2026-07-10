<?php
require_once '../includes/config.php';

// 1. Get the JSON payload from the frontend
$data = json_decode(file_get_contents('php://input'), true);
$id_token = $data['id_token'] ?? '';

if (empty($id_token)) {
    echo json_encode(['success' => false, 'message' => 'No token provided']);
    exit;
}

// 2. Verify token with Google API using cURL (Robust Method)
$verify_url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $id_token;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $verify_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Bypass SSL issues
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$payload = json_decode($response, true);

// 3. Check if Google verified the user
if ($httpCode === 200 && isset($payload['email'])) {
    $email = mysqli_real_escape_string($conn, (string)$payload['email']);
    $google_id = mysqli_real_escape_string($conn, (string)$payload['sub']);
    $full_name = mysqli_real_escape_string($conn, (string)($payload['name'] ?? 'Google User'));
    
    // Create a clean username from the name
    $username = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $full_name)) . rand(100, 999);

    // 4. Check if user exists in our DB
    $check = mysqli_query($conn, "SELECT * FROM users WHERE email = '$email' LIMIT 1");
    
    if (mysqli_num_rows($check) > 0) {
        // User exists, log them in
        $user = mysqli_fetch_assoc($check);
        // Update Google ID if it's their first time linking
        mysqli_query($conn, "UPDATE users SET google_id = '$google_id' WHERE id = " . $user['id']);
    } else {
        // User doesn't exist, create new account
        $sql = "INSERT INTO users (username, email, google_id, balance, role, status, can_order) 
                VALUES ('$username', '$email', '$google_id', 0.00, 'user', 'active', 1)";
        
        if (mysqli_query($conn, $sql)) {
            $new_id = mysqli_insert_id($conn);
            $res = mysqli_query($conn, "SELECT * FROM users WHERE id = $new_id");
            $user = mysqli_fetch_assoc($res);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to create account: ' . mysqli_error($conn)]);
            exit;
        }
    }

    // 5. Start Session and set variables
    if (session_status() === PHP_SESSION_NONE) { session_start(); }
    
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['username'] = $user['username'];

    echo json_encode(['success' => true]);
} else {
    // Return the actual error from Google for debugging
    $msg = $payload['error_description'] ?? 'Google verification failed';
    echo json_encode(['success' => false, 'message' => $msg]);
}