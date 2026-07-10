<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
checkLogin();
$user = getLoggedUser($conn);
?>
<!DOCTYPE html>
<html lang="en" :class="{ 'dark': darkMode }" x-data="userApp()" x-init="init()" @popstate.window="handleBackNavigation($event)">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <title><?php echo $settings['site_name'] ?? 'Amar Follower'; ?></title>
    <meta name="description" content="<?php echo $settings['site_description'] ?? 'Fastest SMM Panel'; ?>">
    <meta name="keywords" content="<?php echo $settings['site_keywords'] ?? 'smm, services'; ?>">
    <link rel="icon" type="image/png" href="<?php echo $settings['favicon_url'] ?? 'assets/favicon.png'; ?>">
    
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '<?php echo $settings['primary_color'] ?? "#6366f1"; ?>',
                        danger: '#ef4444',
                        success: '#22c55e',
                    },
                    fontFamily: { sans: ['Nunito', 'sans-serif'] },
                }
            }
        }

        const BASE_PATH = '<?php echo rtrim(dirname($_SERVER['SCRIPT_NAME']), '/'); ?>';

        // --- MASTER SPA ROUTING ENGINE ---
        function userApp() {
            return {
                darkMode: localStorage.getItem('darkMode') === 'true',
                sidebarOpen: false,
                profileOpen: false,
                page: '',
                loading: false,

                // 1. Initial Page Load (Reads clean URLs)
                init() {
                    // Get the path without leading/trailing slashes (e.g. "transactions")
                    let path = window.location.pathname.replace(new RegExp('^' + BASE_PATH + '/?'), '').replace(/^index\.php\/?/, '').replace(/\/$/, '');
                    let initialPage = path || 'dashboard';
                    
                    const urlParams = new URLSearchParams(window.location.search);
                    
                    // Fallback just in case someone visits via the old ?p= URL
                    if (urlParams.has('p')) {
                        initialPage = urlParams.get('p');
                    }

                    // Reconstruct full request with secondary params (e.g. ?id=5)
                    let fullRequest = initialPage;
                    urlParams.forEach((value, key) => {
                        if (key !== 'p') fullRequest += `&${key}=${value}`;
                    });

                    this.loadPage(fullRequest, false);
                },

                toggleTheme() {
                    this.darkMode = !this.darkMode;
                    localStorage.setItem('darkMode', this.darkMode);
                },

                // 2. Main AJAX Loader (Updates URL and Content)
                loadPage(request, pushState = true) {
                    if (!request) return;
                    this.loading = true;
                    this.sidebarOpen = false;

                    let parts = request.split('&');
                    let fileName = parts[0]; 
                    
                    // For fetching from the server, we use '&'
                    let queryParamsForFetch = parts.length > 1 ? '&' + parts.slice(1).join('&') : '';
                    // For the browser URL bar, we use '?'
                    let queryParamsForUrl = parts.length > 1 ? '?' + parts.slice(1).join('&') : '';

                    // FETCH THROUGH THE LOADER
                    const fetchUrl = BASE_PATH + '/load_view.php?p=' + fileName + queryParamsForFetch;

                    fetch(fetchUrl)
                        .then(res => {
                            if (!res.ok) throw new Error('Server Error');
                            return res.text();
                        })
                        .then(html => {
                            const contentArea = document.getElementById('content');
                            if (contentArea) {
                                contentArea.innerHTML = html;
                                this.page = fileName;
                                
                                if (pushState) {
                                    // Construct clean friendly URL
                                    const newUrl = BASE_PATH + '/' + fileName + queryParamsForUrl;
                                    window.history.pushState({ path: request }, '', newUrl);
                                }
                            }
                            this.loading = false;
                            window.scrollTo(0, 0);
                        })
                        .catch(err => {
                            this.loading = false;
                            console.error(err);
                        });
                },

                // 3. Handle Browser Back/Forward Buttons
                handleBackNavigation(event) {
                    if (event.state && event.state.path) {
                        this.loadPage(event.state.path, false);
                    } else {
                        // Fallback if history state is empty
                        let path = window.location.pathname.replace(new RegExp('^' + BASE_PATH + '/?'), '').replace(/^index\.php\/?/, '').replace(/\/$/, '');
                        this.loadPage(path || 'dashboard', false);
                    }
                }
            }
        }
    </script>

    <style>
        :root { --primary-color: <?php echo $settings['primary_color'] ?? '#6366f1'; ?>; }
        [x-cloak] { display: none !important; }
        body { transition: background-color 0.3s ease, color 0.3s ease; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
    </style>
</head>
<body class="bg-[#f8fafc] text-slate-900 dark:bg-[#09090b] dark:text-slate-200 antialiased">

    <div x-data="{ 
        show: false, 
        message: '', 
        type: 'success',
        init() {
            window.addEventListener('notify', (e) => {
                this.message = e.detail.message;
                this.type = e.detail.type || 'success';
                this.show = true;
                setTimeout(() => { this.show = false; }, 4000);
            });
        }
    }" 
    x-show="show" x-transition x-cloak
    class="fixed top-20 right-4 z-[100] w-full max-w-xs">
        <div class="flex items-center p-4 bg-white dark:bg-[#18181b] rounded-md shadow-xl border border-slate-100 dark:border-slate-800" role="alert">
            <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-md"
                 :class="type === 'success' ? 'text-green-500 bg-green-100 dark:bg-green-500/10' : 'text-red-500 bg-red-100 dark:bg-red-500/10'">
                <template x-if="type === 'success'">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                </template>
                <template x-if="type === 'error'">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                </template>
            </div>
            <div class="ml-3 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300" x-text="message"></div>
            <button @click="show = false" type="button" class="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"></path></svg>
            </button>
        </div>
    </div>
            
    <header class="h-16 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 fixed top-0 w-full z-40">
        <div class="h-full px-4 lg:px-8 flex items-center justify-between">
            <div class="flex items-center gap-3">
                <button @click="sidebarOpen = !sidebarOpen" class="p-2 rounded-md lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
                
                <div class="flex items-center cursor-pointer" @click="loadPage('dashboard')">
                    <?php if(!empty($settings['logo_url'])): ?>
                        <img src="<?php echo htmlspecialchars($settings['logo_url']); ?>?v=<?php echo time(); ?>" 
                             alt="Logo" 
                             class="h-7 max-w-[150px] object-contain block dark:brightness-200"
                             onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                        
                        <h1 class="hidden text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                            <?php echo htmlspecialchars($settings['site_name'] ?? 'AmarFollower'); ?>
                        </h1>
                    <?php else: ?>
                        <h1 class="text-lg font-black uppercase tracking-tighter text-slate-900 dark:text-white">
                            <?php echo htmlspecialchars($settings['site_name'] ?? 'AmarFollower'); ?>
                        </h1>
                    <?php endif; ?>
                </div>
            </div>

            <div class="flex items-center gap-2 lg:gap-5">
                <div class="hidden sm:flex items-center px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                    <span class="text-xs font-bold text-primary mr-1"><?php echo $settings['currency_symbol'] ?? '$'; ?></span>
                    <span class="text-sm font-bold text-primary"><?php echo number_format($user['balance'], 2); ?></span>
                </div>

                <button @click="toggleTheme()" class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-500">
                    <template x-if="!darkMode"> <i class="fa-solid fa-moon"></i> </template>
                    <template x-if="darkMode"> <i class="fa-solid fa-sun"></i> </template>
                </button>

                <div class="relative">
                    <button @click="profileOpen = !profileOpen" @click.away="profileOpen = false" class="flex items-center focus:outline-none group">
                        <div class="h-9 w-9 rounded-md bg-slate-200 dark:bg-slate-800 border-2 border-transparent group-hover:border-primary transition flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 uppercase">
                            <?php echo substr($user['username'], 0, 1); ?>
                        </div>
                    </button>
                    <div x-show="profileOpen" x-cloak x-transition class="absolute right-0 mt-2 w-48 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-xl z-50 overflow-hidden">
                        <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                            Signed in as <br><span class="font-bold text-slate-900 dark:text-white"><?php echo $user['username']; ?></span>
                        </div>
                        <button @click="loadPage('profile'); profileOpen = false" class="w-full text-left block px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">Profile Settings</button>
                        <a href="logout.php" class="block px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition border-t border-slate-100 dark:border-slate-800">Sign out</a>
                    </div>
                </div>
            </div>
        </div>
    </header>
