<?php
require_once 'includes/config.php';
$msg = "";
$msgType = ""; // 'success' or 'error'

$siteName = htmlspecialchars($settings['site_name'] ?? 'SMM Panel');
$primaryColor = htmlspecialchars($settings['primary_color'] ?? '#2B59FF');
$logoUrl = htmlspecialchars($settings['logo_url'] ?? '');

// Handle Password Reset POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = mysqli_real_escape_string($conn, (string)($_POST['email'] ?? ''));
    $captcha_response = $_POST['cf-turnstile-response'] ?? $_POST['g-recaptcha-response'] ?? '';

    // 1. CAPTCHA Verification (If enabled in Admin)
    $captcha_type = $settings['captcha_type'] ?? 'off';
    $captcha_valid = true;
    
    if ($captcha_type !== 'off') {
        $secret = $settings['captcha_secret_key'] ?? '';
        $verify_url = ($captcha_type === 'cloudflare') 
            ? "https://challenges.cloudflare.com/turnstile/v0/siteverify" 
            : "https://www.google.com/recaptcha/api/siteverify";

        $verify = @file_get_contents($verify_url . "?secret=" . $secret . "&response=" . $captcha_response);
        $res = json_decode($verify);
        if (!$res || !$res->success) {
            $captcha_valid = false;
            $msg = "Captcha verification failed. Please try again.";
            $msgType = "error";
        }
    }

    if ($captcha_valid && !empty($email)) {
        // 2. Check Database & Send Email
        // Note: For security (preventing user enumeration), we always display a success message 
        // regardless of whether the email actually exists in the database.
        $check = mysqli_query($conn, "SELECT id, username FROM users WHERE email = '$email'");
        
        if (mysqli_num_rows($check) > 0) {
            $user = mysqli_fetch_assoc($check);
            $userId = $user['id'];
            
            // ==========================================
            // TODO: Add your email sending logic here!
            // 1. Generate a unique reset token
            // 2. Save token to database (e.g., password_resets table)
            // 3. Send email to $email with the reset link
            // ==========================================
        }
        
        $msg = "If this email is registered in our system, you will receive password reset instructions shortly.";
        $msgType = "success";
    }
}
?>
<!DOCTYPE html>
<html lang="en" x-data="{ darkMode: localStorage.getItem('darkMode') === 'true' }" :class="{ 'dark': darkMode }" class="overflow-x-hidden w-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Forgot Password | <?php echo $siteName; ?></title>
    
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    
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
                Reset Password
            </h1>
            <p class="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                Enter your email to receive recovery instructions
            </p>
        </div>

        <div class="bg-white dark:bg-[#18181b] p-6 sm:p-8 rounded-[6px] border border-slate-200 dark:border-slate-800 shadow-soft dark:shadow-none w-full box-border">
            
            <?php if($msg): ?>
                <?php if($msgType === 'error'): ?>
                    <div class="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-[6px] flex items-start gap-3">
                        <i class="fa-solid fa-circle-exclamation text-red-500 mt-0.5"></i>
                        <p class="text-sm font-semibold text-red-600 dark:text-red-400 leading-snug"><?php echo $msg; ?></p>
                    </div>
                <?php else: ?>
                    <div class="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-[6px] flex items-start gap-3">
                        <i class="fa-solid fa-circle-check text-emerald-500 mt-0.5"></i>
                        <p class="text-sm font-semibold text-emerald-600 dark:text-emerald-400 leading-snug"><?php echo $msg; ?></p>
                    </div>
                <?php endif; ?>
            <?php endif; ?>

            <form method="POST" class="space-y-4">
                <div>
                    <label class="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 block">Email Address</label>
                    <div class="relative group">
                        <i class="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition text-sm"></i>
                        <input type="email" name="email" required placeholder="name@example.com" 
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
                        Send Reset Link
                    </button>
                </div>
            </form>

            <div class="mt-8 text-center bg-slate-50 dark:bg-slate-900/50 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-4 border-t border-slate-100 dark:border-slate-800 rounded-b-[6px]">
                <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Remember your password? <a href="/login" class="text-primary font-bold hover:underline transition ml-1">Sign in</a>
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

</body>
</html>
