<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
require_once '../../includes/smm_api.php';
checkAdmin();

$id = (int)$_GET['id'];
$provider = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM providers WHERE id = $id"));

if ($provider) {
    $api = new SmmGenAPI();
    $data = $api->request($provider['api_url'], [
        'key' => $provider['api_key'],
        'action' => 'services'
    ]);
    echo json_encode($data);
}