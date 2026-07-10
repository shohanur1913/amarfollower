<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$id = (int)$_GET['id'] ?? (int)$_POST['id'] ?? 0;

// 1. Close Ticket Logic
if ($action === 'close_ticket') {
    mysqli_query($conn, "UPDATE tickets SET status = 'closed', ai_muted = 1 WHERE id = $id");
    // Auto-clear pending tasks for this ticket
    mysqli_query($conn, "UPDATE todo_list SET is_completed = 1 WHERE ticket_id = $id");
    echo json_encode(['success' => true]);
    exit;
}

// 2. Complete Task Logic
if ($action === 'complete_task') {
    mysqli_query($conn, "UPDATE todo_list SET is_completed = 1 WHERE id = $id");
    echo json_encode(['success' => true]);
    exit;
}

// 3. Admin Manual Reply (From previous step)
if ($action === 'admin_reply') {
    $ticket_id = (int)$_POST['ticket_id'];
    $msg = mysqli_real_escape_string($conn, $_POST['message']);
    $mute = (int)$_POST['mute_ai'];

    mysqli_query($conn, "INSERT INTO ticket_messages (ticket_id, sender_role, message) VALUES ($ticket_id, 'admin', '$msg')");
    mysqli_query($conn, "UPDATE tickets SET status = 'answered', ai_muted = $mute WHERE id = $ticket_id");
    
    echo json_encode(['success' => true]);
    exit;
}
