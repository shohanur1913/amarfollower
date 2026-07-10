<?php
require_once 'includes/config.php';
$msg = "";

$siteName = htmlspecialchars($settings['site_name'] ?? 'SMM Panel');
$primaryColor = htmlspecialchars($settings['primary_color'] ?? '#2B59FF');
$logoUrl = htmlspecialchars($settings['logo_url'] ?? '');
$basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');

// Handle Manual Registration POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = mysqli_real_escape_string($conn, (string)($_POST['username'] ?? ''));
    $email    = mysqli_real_escape_string($conn, (string)($_POST['email'] ?? ''));
    $password = (string)($_POST['password'] ?? '');
    $captcha_response = $_POST['cf-turnstile-response'] ?? $_POST['g-recaptcha-response'] ?? '';

    // 1. CAPTCHA Verification (If enabled in Admin)
    $captcha_type = $settings['captcha_type'] ?? 'off';
    if ($captcha_type !== 'off') {
        $secret = $settings['captcha_secret_key'] ?? '';
        $verify_url = ($captcha_type === 'cloudflare') 
            ? "https://challenges.cloudflare.com/turnstile/v0/siteverify" 
            : "https://www.google.com/recaptcha/api/siteverify";

        $verify = file_get_contents($verify_url . "?secret=" . $secret . "&response=" . $captcha_response);
        $res = json_decode($verify);
        if (!$res->success) {
            $msg = "Captcha verification failed. Please try again.";
        }
    }

    if (empty($msg)) {
        // 2. Check if username or email exists
        $check = mysqli_query($conn, "SELECT id FROM users WHERE email = '$email' OR username = '$username'");
        if (mysqli_num_rows($check) > 0) {
            $msg = "Username or Email is already in use.";
        } else {
            // 3. Create Account
            $hashed_password = password_hash($password, PASSWORD_DEFAULT);
            $sql = "INSERT INTO users (username, email, password, balance, role) VALUES ('$username', '$email', '$hashed_password', 0.00, 'user')";
            
            if (mysqli_query($conn, $sql)) {
                $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
                header("Location: $basePath/login.php?registered=1");
                exit;
            } else {
                $msg = "System Error: Registration failed.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en" x-data="{ darkMode: localStorage.getItem('darkMode') === 'true' }" :class="{ 'dark': darkMode }" class="overflow-x-hidden w-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Create Account | <?php echo $siteName; ?></title>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    
    <?php if(!empty($settings['google_client_id'])): ?>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
    <?php endif; ?>
    
    <?php if(($settings['captcha_type'] ?? 'off') === 'cloudflare'): ?>
        <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
    <?php elseif(($settings['captcha_type'] ?? 'off') === 'google'): ?>
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
    <?php endif; ?>

    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>

    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '<?php echo $primaryColor; ?>',
                        bglight: '#FAFBFF',
                    },
                    fontFamily: {
                        sans: ['Inter', 'sans-serif'],
                    },
                    boxShadow: {
                        'soft': '0 10px 25px -5px rgba(0,0,0,0.05)',
                    }
                }
            }
        }
    </script>
    <style>
        body { transition: background-color 0.3s ease; }
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="bg-[#FDFDFF] dark:bg-[#09090b] flex flex-col items-center justify-center min-h-screen px-4 py-12 relative overflow-x-hidden w-full">

    <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div class="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[80px] hidden md:block"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/5 rounded-full blur-[80px] hidden md:block"></div>
    </div>

    <div class="max-w-md w-full space-y-6 relative z-10 mx-auto">
        
        <div class="text-center flex flex-col items-center">
            <a href="/" class="block mb-4 hover:opacity-90 transition">
                <?php if(!empty($logoUrl)): ?>
                    <img src="<?php echo $logoUrl; ?>?v=<?php echo time(); ?>" 
                         alt="<?php echo $siteName; ?> Logo" 
                         class="h-10 max-w-[200px] object-contain dark:brightness-200"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         
                    <div class="hidden h-12 w-12 bg-primary/10 text-primary rounded-[6px] items-center justify-center font-bold text-xl">
                        <?php echo substr($siteName, 0, 1); ?>
                    </div>
                <?php else: ?>
                    <div class="h-12 w-12 bg-primary/10 text-primary rounded-[6px] flex items-center justify-center font-bold text-xl">
                        <?php echo substr($siteName, 0, 1); ?>
                    </div>
                <?php endif; ?>
            </a>
            <h1 class="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                Create an account
            </h1>
            <p class="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                Join <?php echo $siteName; ?> and get started
            </p>
        </div>

        <div class="bg-white dark:bg-[#18181b] p-6 sm:p-8 rounded-[6px] border border-slate-200 dark:border-slate-800 shadow-soft dark:shadow-none w-full box-border">
            
            <?php if($msg): ?>
                <div class="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-[6px] flex items-center gap-3">
                    <i class="fa-solid fa-circle-exclamation text-red-500"></i>
                    <p class="text-sm font-semibold text-red-600 dark:text-red-400 leading-none"><?php echo $msg; ?></p>
                </div>
            <?php endif; ?>

            <form method="POST" class="space-y-4">
                <div>
                    <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Username</label>
                    <div class="relative group">
                        <i class="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition text-sm"></i>
                        <input type="text" name="username" required placeholder="Choose a username" 
                            class="w-full bg-slate-50 dark:bg-[#111113] border border-slate-200 dark:border-slate-800/60 rounded-[6px] px-10 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition dark:text-white shadow-sm box-border">
                    </div>
                </div>

                <div>
                    <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Email Address</label>
                    <div class="relative group">
                        <i class="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition text-sm"></i>
                        <input type="email" name="email" required placeholder="name@example.com" 
                            class="w-full bg-slate-50 dark:bg-[#111113] border border-slate-200 dark:border-slate-800/60 rounded-[6px] px-10 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition dark:text-white shadow-sm box-border">
                    </div>
                </div>

                <div>
                    <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Password</label>
                    <div class="relative group">
                        <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition text-sm"></i>
                        <input type="password" name="password" required placeholder="••••••••" 
                            class="w-full bg-slate-50 dark:bg-[#111113] border border-slate-200 dark:border-slate-800/60 rounded-[6px] px-10 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition dark:text-white shadow-sm box-border">
                    </div>
                </div>

                <?php if(($settings['captcha_type'] ?? 'off') !== 'off'): ?>
                    <div class="flex justify-center pt-2 overflow-hidden">
                        <?php if($settings['captcha_type'] === 'cloudflare'): ?>
                            <div class="cf-turnstile" data-sitekey="<?php echo $settings['captcha_site_key']; ?>"></div>
                        <?php else: ?>
                            <div class="g-recaptcha w-full flex justify-center" data-sitekey="<?php echo $settings['captcha_site_key']; ?>"></div>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <div class="pt-4">
                    <button type="submit" class="w-full bg-primary text-white font-bold py-3.5 rounded-[6px] shadow-sm hover:bg-opacity-90 transition outline-none text-sm tracking-wide">
                        Create Account
                    </button>
                </div>
            </form>

            <?php if(!empty($settings['google_client_id'])): ?>
                <div class="relative flex py-6 items-center w-full">
                    <div class="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                    <span class="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Or</span>
                    <div class="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
                </div>

                <div class="flex justify-center w-full overflow-hidden rounded-[6px]">
                    <div id="g_id_onload"
                         data-client_id="<?php echo $settings['google_client_id']; ?>"
                         data-context="signup"
                         data-ux_mode="popup"
                         data-callback="handleCredentialResponse"
                         data-auto_prompt="false">
                    </div>

                    <div class="g_id_signin w-full flex justify-center"
                         data-type="standard"
                         data-shape="rectangular"
                         data-theme="outline"
                         data-text="signup_with"
                         data-size="large"
                         data-logo_alignment="left">
                    </div>
                </div>
            <?php endif; ?>

            <div class="mt-8 text-center bg-slate-50 dark:bg-slate-900/50 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-4 border-t border-slate-100 dark:border-slate-800 rounded-b-[6px]">
                <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Already have an account? <a href="/login" class="text-primary font-bold hover:underline transition ml-1">Sign in</a>
                </p>
            </div>
        </div>

        <div class="flex flex-col items-center gap-4 pt-4">
            <div class="flex items-center gap-4">
                <button @click="localStorage.setItem('darkMode', !darkMode); darkMode = !darkMode" class="w-9 h-9 rounded-[6px] bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary transition flex items-center justify-center shadow-sm">
                    <i class="fa-solid text-sm" :class="darkMode ? 'fa-sun' : 'fa-moon'"></i>
                </button>
                <a href="/" class="text-sm font-semibold text-slate-500 hover:text-primary transition px-3 py-1.5 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-sm">
                    Back to Home
                </a>
            </div>
            <p class="text-xs font-medium text-slate-400 mt-2">&copy; <?php echo date('Y'); ?> <?php echo $siteName; ?>. All rights reserved.</p>
        </div>
    </div>

    <?php if(!empty($settings['google_client_id'])): ?>
    <script>
    function handleCredentialResponse(response) {
        fetch('api/google_login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_token: response.credential })
        })
        .then(r => r.json())
        .then(data => {
            if(data.success) {
                window.location.href = '<?php echo $basePath; ?>/'
            } else {
                alert(data.message || 'Signup Failed');
            }
        })
        .catch(err => console.error('Google Auth Error:', err));
    }
    </script>
    <?php endif; ?>
</body>
</html>
