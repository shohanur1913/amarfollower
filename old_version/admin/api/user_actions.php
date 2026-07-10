<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

$id = (int)($_REQUEST['id'] ?? 0);
$action = (string)($_REQUEST['action'] ?? '');

if ($id <= 0) die("Invalid User ID");

// 1. BALANCE ADJUSTMENT
if ($action === 'adjust_balance') {
    $amount = (float)$_POST['amount'];
    $type = $_POST['type']; // add or subtract
    
    if ($type === 'add') {
        mysqli_query($conn, "UPDATE users SET balance = balance + $amount WHERE id = $id");
    } else {
        mysqli_query($conn, "UPDATE users SET balance = balance - $amount WHERE id = $id");
    }
    header("Location: ../index.php?p=edit_user&id=$id&success=Balance updated");
}

// 2. TOGGLE STATUS (BAN/UNBAN)
if ($action === 'toggle_status') {
    mysqli_query($conn, "UPDATE users SET status = IF(status='active', 'banned', 'active') WHERE id = $id");
    header("Location: ../index.php?p=edit_user&id=$id");
}

// 3. TOGGLE ORDERING
if ($action === 'toggle_order') {
    mysqli_query($conn, "UPDATE users SET can_order = NOT can_order WHERE id = $id");
    header("Location: ../index.php?p=edit_user&id=$id");
}

// 4. UPDATE PROFILE
if ($action === 'update_profile') {
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    mysqli_query($conn, "UPDATE users SET username='$username', email='$email' WHERE id = $id");
    header("Location: ../index.php?p=edit_user&id=$id&success=Profile updated");
}

// 5. DELETE USER
if ($action === 'delete') {
    mysqli_query($conn, "DELETE FROM users WHERE id = $id");
    header("Location: ../index.php?p=users&success=User Deleted");
}