<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $p_id    = (int)$_POST['provider_id'];
    $plat_id = (int)$_POST['platform_id'];
    $api_id  = (int)$_POST['api_service_id'];
    $name    = mysqli_real_escape_string($conn, (string)$_POST['name']);
    $ext_cat = mysqli_real_escape_string($conn, (string)$_POST['external_category']);
    $price   = mysqli_real_escape_string($conn, (string)$_POST['price']);
    $min     = (int)$_POST['min'];
    $max     = (int)$_POST['max'];

    // Auto-Category logic
    $cat_check = mysqli_query($conn, "SELECT id FROM categories WHERE name = '$ext_cat' AND platform_id = $plat_id LIMIT 1");
    if ($row = mysqli_fetch_assoc($cat_check)) {
        $local_cat_id = $row['id'];
    } else {
        mysqli_query($conn, "INSERT INTO categories (platform_id, name, status) VALUES ($plat_id, '$ext_cat', 1)");
        $local_cat_id = mysqli_insert_id($conn);
    }

    $sql = "INSERT INTO services (name, category_id, provider_id, api_service_id, price_per_k, min, max, status) 
            VALUES ('$name', $local_cat_id, $p_id, $api_id, '$price', $min, $max, 1)";

    if (mysqli_query($conn, $sql)) {
        echo json_encode(['success' => true, 'message' => 'Imported successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => mysqli_error($conn)]);
    }
}
