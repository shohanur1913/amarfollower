<?php 
require_once 'includes/config.php'; 
require_once 'includes/auth.php'; 

/**
 * 1. INITIAL STATE CHECKS
 */
$isLoggedIn = isset($_SESSION['user_id']);
$isAdmin    = (isset($_SESSION['role']) && $_SESSION['role'] === 'admin');
$isMaintenance = ($settings['maintenance_mode'] ?? 'off') === 'on';

// Catch the requested URL from the .htaccess SPA rewrite
$requestedRoute = isset($_GET['p']) ? trim($_GET['p'], '/') : '';
$safePage = preg_replace('/[^a-zA-Z0-9_-]/', '', $requestedRoute);

/**
 * 2. SERVER-SIDE 404 LOGIC
 * If a user types a wrong URL, we catch it here before it loads the landing page or SPA shell.
 */
if (!empty($safePage)) {
    if (!file_exists("views/{$safePage}.php") && !in_array($safePage, ['dashboard', 'login', 'register'])) {
        ?>
        <!DOCTYPE html>
        <html lang="en" class="dark">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 Not Found - <?php echo htmlspecialchars($settings['site_name'] ?? 'SMM Panel'); ?></title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
            <script>
                tailwind.config = { darkMode: 'class', theme: { extend: { colors: { primary: '<?php echo htmlspecialchars($settings['primary_color'] ?? "#6366f1"); ?>' } } } }
            </script>
        </head>
        <body class="bg-[#f8fafc] dark:bg-[#09090b] text-slate-900 dark:text-white min-h-screen flex items-center justify-center">
            <?php include 'views/404.php'; ?>
        </body>
        </html>
        <?php
        exit;
    }
}

/**
 * 3. MAINTENANCE MODE LOGIC
 */
if ($isMaintenance && !$isAdmin) {
    include 'views/maintenance.php';
    exit;
}

/**
 * 4. PAYMENT CANCELLATION HANDLER
 */
if ($isLoggedIn && isset($_GET['status']) && $_GET['status'] === 'cancel' && isset($_GET['tid'])) {
    $tid = mysqli_real_escape_string($conn, $_GET['tid']);
    $uid = (int)$_SESSION['user_id'];
    mysqli_query($conn, "UPDATE payments SET status = 'failed' WHERE transaction_id = '$tid' AND user_id = $uid AND status = 'pending'");
    $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
    header("Location: $basePath/index.php?p=transactions&error=Payment cancelled by user.");
    exit;
}

/**
 * 5. PUBLIC ALLOWED ROUTES
 * Allow non-logged-in users to view specific pages like /services and /api
 */
$publicRoutes = ['services', 'apis']; // ADDED 'api' HERE

if (!$isLoggedIn && in_array($safePage, $publicRoutes)) {
    // We wrap the view in a beautiful public shell
    ?>
    <!DOCTYPE html>
    <html lang="en" class="dark">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title><?php echo ucfirst($safePage); ?> - <?php echo htmlspecialchars($settings['site_name'] ?? 'SMM Panel'); ?></title>
        
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
        
        <script>
            tailwind.config = { darkMode: 'class', theme: { extend: { colors: { primary: '<?php echo htmlspecialchars($settings['primary_color'] ?? "#6366f1"); ?>' } } } }
        </script>
        <style>
            body { background-color: #f8fafc; }
            .dark body { background-color: #09090b; }
            [x-cloak] { display: none !important; }
        </style>
    </head>
    <body class="text-slate-900 dark:text-white antialiased overflow-x-hidden">
        
        <header class="h-16 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 fixed top-0 w-full z-40">
            <div class="max-w-7xl mx-auto h-full px-4 flex items-center justify-between">
                <a href="/" class="flex items-center gap-3">
                    <?php if(!empty($settings['logo_url'])): ?>
                        <img src="<?php echo htmlspecialchars($settings['logo_url']); ?>?v=<?php echo time(); ?>" class="h-8 max-w-[150px] object-contain block dark:brightness-200" alt="Logo">
                    <?php else: ?>
                        <div class="h-8 w-8 bg-primary/10 text-primary rounded-md flex items-center justify-center font-bold">
                            <?php echo substr($settings['site_name'] ?? 'A', 0, 1); ?>
                        </div>
                        <span class="font-bold text-lg tracking-tight"><?php echo htmlspecialchars($settings['site_name'] ?? 'Amar Follower'); ?></span>
                    <?php endif; ?>
                </a>
                <div class="flex items-center gap-4">
                    <a href="/login" class="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition">Sign In</a>
                    <a href="/register" class="text-xs md:text-sm font-bold bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition shadow-md">Sign Up</a>
                </div>
            </div>
        </header>

        <main class="pt-24 pb-16 px-4 max-w-7xl mx-auto">
            <?php include "views/{$safePage}.php"; ?>
        </main>

    </body>
    </html>
    <?php
    exit; // Stop execution so it doesn't load the landing page
}

/**
 * 6. PUBLIC LANDING PAGE LOGIC
 * If the user is not logged in, and NOT requesting a public route, show the landing page.
 */
if (!$isLoggedIn) {
    if (file_exists('views/landing.php')) {
        include 'views/landing.php';
    } else {
        include 'login.php';
    }
    exit;
}

/**
 * 7. PRIVATE DASHBOARD LOGIC (SPA SHELL)
 * If we reached here, the user is logged in.
 */
$user = getLoggedUser($conn);

// Load the Layout Components
include 'includes/header.php'; 
include 'includes/sidebar.php'; 
?>

<main class="lg:ml-72 pt-20 min-h-screen transition-all bg-[#f8fafc] dark:bg-[#09090b]">
    <div class="p-4 lg:p-10 max-w-7xl mx-auto">
        
        <?php if($isMaintenance && $isAdmin): ?>
            <div class="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-3 animate-in fade-in">
                <i class="fa-solid fa-screwdriver-wrench text-amber-500"></i>
                <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">
                    System Maintenance is ON (Users are currently blocked)
                </p>
            </div>
        <?php endif; ?>

        <div x-show="loading" x-cloak class="flex flex-col items-center justify-center py-32 space-y-4">
            <div class="h-10 w-10 border-4 border-slate-200 dark:border-slate-800 border-t-primary animate-spin rounded-full"></div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Syncing Data...</p>
        </div>

        <div id="content" x-show="!loading" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
            </div>

    </div>
</main>

</body>
</html>
