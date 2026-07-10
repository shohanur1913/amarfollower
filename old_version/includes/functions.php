function api_request($url, $post_data) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// Usage:
// $order = api_request('https://provider.com/api/v2', [
//    'key' => 'YOUR_API_KEY',
//    'action' => 'add',
//    'service' => 123,
//    'link' => 'https://instagram.com/p/xxx',
//    'quantity' => 100
// ]);