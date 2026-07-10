<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Get and Sanitize Inputs (Strict Type Casting)
    $action   = (string)($_POST['action'] ?? '');
    $id       = (int)($_POST['id'] ?? 0);
    $name     = mysqli_real_escape_string($conn, (string)($_POST['name'] ?? ''));
    $api_url  = mysqli_real_escape_string($conn, (string)($_POST['api_url'] ?? ''));
    $api_key  = mysqli_real_escape_string($conn, (string)($_POST['api_key'] ?? ''));
    $status   = (int)($_POST['status'] ?? 1);

    // Basic Validation
    if (empty($name) || empty($api_url) || empty($api_key)) {
        header("Location: ../index.php?p=providers&error=Please fill all required fields.");
        exit;
    }

    if ($action === 'create') {
        // 2. Insert New Provider
        $sql = "INSERT INTO providers (name, api_url, api_key, status) 
                VALUES ('$name', '$api_url', '$api_key', $status)";
        
        if (mysqli_query($conn, $sql)) {
            // Redirect back to providers list using standardized 'p' parameter
            header("Location: ../index.php?p=providers&success=Provider added successfully!");
        } else {
            die("Database Error: " . mysqli_error($conn));
        }

    } elseif ($action === 'update' && $id > 0) {
        // 3. Update Existing Provider
        $sql = "UPDATE providers SET 
                name='$name', 
                api_url='$api_url', 
                api_key='$api_key', 
                status=$status 
                WHERE id=$id";
        
        if (mysqli_query($conn, $sql)) {
            header("Location: ../index.php?p=providers&success=Provider updated successfully!");
        } else {
            die("Database Error: " . mysqli_error($conn));
        }

    } elseif ($action === 'delete' && $id > 0) {
        // 4. Optional: Delete Provider (Only if no services are linked to it)
        // Check if services are linked
        $check = mysqli_query($conn, "SELECT id FROM services WHERE provider_id = $id LIMIT 1");
        if (mysqli_num_rows($check) > 0) {
            header("Location: ../index.php?p=providers&error=Cannot delete provider with linked services.");
            exit;
        }

        $sql = "DELETE FROM providers WHERE id = $id";
        if (mysqli_query($conn, $sql)) {
            header("Location: ../index.php?p=providers&success=Provider deleted.");
        } else {
            die("Database Error: " . mysqli_error($conn));
        }
    } else {
        header("Location: ../index.php?p=providers&error=Invalid action requested.");
    }
} else {
    // If someone tries to access this file directly via URL
    header("Location: ../index.php?p=providers");
}