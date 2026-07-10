<?php 
require_once '../includes/config.php'; 
require_once '../includes/auth.php'; 

// Security Check: Only Admins can reach this file
checkAdmin();

// Load Layout Components
// Note: Logic and Routing are now inside header.php
include 'includes/header.php'; 
include 'includes/sidebar.php'; 
?>

<!-- MAIN ADMIN CONTENT AREA -->
<main class="lg:ml-72 pt-20 min-h-screen transition-all bg-[#f8fafc] dark:bg-darkBg">
    <div class="p-4 lg:p-10 max-w-7xl mx-auto">

        <!-- Global SPA Loader -->
        <!-- Shows automatically when 'loading' is true in adminApp() -->
        <div x-show="loading" x-cloak class="flex flex-col items-center justify-center py-32 space-y-4">
            <div class="h-10 w-10 border-4 border-slate-200 dark:border-slate-800 border-t-primary animate-spin rounded-full"></div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse leading-none">
                Fetching Admin Data...
            </p>
        </div>

        <!-- AJAX Injection Point -->
        <!-- The adminApp().loadPage() function targets this ID specifically -->
        <div 
            id="admin-content" 
            x-show="!loading" 
            class="animate-in fade-in slide-in-from-bottom-2 duration-500"
        >
            <!-- Partial Admin Views (dashboard.php, users.php, etc.) will load here -->
        </div>

    </div>
</main>

<!-- Footer scripts are not needed here as they are handled in header.php -->
</body>
</html>
            