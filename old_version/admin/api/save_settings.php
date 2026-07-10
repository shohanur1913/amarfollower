<?php
// CRITICAL: Double dots to go up from admin/api/ to root
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // 1. Handle Text Settings
    foreach ($_POST as $key => $value) {
        if ($key === 'action') continue; // Skip action key if present
        
        $k = mysqli_real_escape_string($conn, $key);
        $v = mysqli_real_escape_string($conn, $value);
        
        $sql = "INSERT INTO settings (s_key, s_value) VALUES ('$k', '$v') 
                ON DUPLICATE KEY UPDATE s_value = '$v'";
        mysqli_query($conn, $sql);
    }

    // 2. Handle Logo & Favicon Uploads
    $upload_dir = '../../assets/';
    
    // Ensure the assets directory exists
    if (!is_dir($upload_dir)) {
        mkdir($upload_dir, 0777, true);
    }

    $files = [
        'logo_url' => 'logo.png', 
        'favicon_url' => 'favicon.png'
    ];

    foreach ($files as $input_name => $filename) {
        if (!empty($_FILES[$input_name]['name']) && $_FILES[$input_name]['error'] === UPLOAD_ERR_OK) {
            $tmp_name = $_FILES[$input_name]['tmp_name'];
            $destination = $upload_dir . $filename;
            
            if (move_uploaded_file($tmp_name, $destination)) {
                $path = 'assets/' . $filename;
                $sql = "INSERT INTO settings (s_key, s_value) VALUES ('$input_name', '$path') 
                        ON DUPLICATE KEY UPDATE s_value = '$path'";
                mysqli_query($conn, $sql);
            }
        }
    }

    // 3. Return Success Response
    header('Content-Type: application/json');
    echo json_encode([
        'success' => true, 
        'message' => 'Configuration & Branding Saved Successfully!'
    ]);
    exit;
}
?>
