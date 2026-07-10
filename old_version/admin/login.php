if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = mysqli_real_escape_string($conn, $_POST['email']);
    $password = $_POST['password'];

    $user = mysqli_query($conn, "SELECT * FROM users WHERE email='$email'");
    if ($row = mysqli_fetch_assoc($user)) {
        if (password_verify($password, $row['password'])) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['role'] = $row['role'];
            header("Location: index.php");
        }
    }
}