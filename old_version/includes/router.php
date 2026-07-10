<?php
function get_current_page() {
    // Read the 'p' parameter from .htaccess or default to dashboard
    $p = $_GET['p'] ?? 'dashboard';
    
    // List of allowed pages
    $allowed_pages = [
        'dashboard'    => 'dashboard.php',
        'services'     => 'services.php',
        'orders'       => 'orders.php',
        'transactions' => 'transactions.php',
        'tickets'      => 'tickets.php',
        'view_ticket'  => 'view_ticket.php',
        'profile'      => 'profile.php'
    ];

    // Return the filename or 404 if not found
    return $allowed_pages[$p] ?? '404.php';
}

function get_page_slug() {
    return $_GET['p'] ?? 'dashboard';
}
?>