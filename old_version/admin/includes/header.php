<?php
require_once '../includes/config.php';
require_once '../includes/auth.php';
checkAdmin();
$user = getLoggedUser($conn);
?>
<!DOCTYPE html>
<html lang="en" :class="{ 'dark': darkMode }" x-data="adminApp()" x-init="init()" @popstate.window="handleBackNavigation($event)">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Suite | <?php echo $settings['site_name']; ?></title>
    
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script defer src="https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '<?php echo $settings['primary_color'] ?? "#6366f1"; ?>',
                        darkPanel: '#18181b',
                        darkBg: '#09090b',
                    },
                    fontFamily: { sans: ['Nunito', 'sans-serif'] },
                }
            }
        }

        // --- THE ADMIN ROUTING & STATE ENGINE ---
        function adminApp() {
            return {
                darkMode: localStorage.getItem('darkMode') === 'true',
                sidebarOpen: false, 
                page: '', 
                loading: false,

                // 1. Initialize logic (Reads clean URLs)
                init() {
                    // Extract page from clean URL (e.g., /admin/users)
                    let pathName = window.location.pathname;
                    let adminIndex = pathName.indexOf('/admin/');
                    let initialPage = 'dashboard';
                    
                    if (adminIndex !== -1) {
                        let relativePath = pathName.substring(adminIndex + 7).replace(/^\/|\/$/g, '');
                        if (relativePath && relativePath !== 'index.php') {
                            initialPage = relativePath;
                        }
                    }

                    const urlParams = new URLSearchParams(window.location.search);
                    
                    // Fallback for ?p= if accessed via the old URL structure
                    if (urlParams.has('p')) {
                        initialPage = urlParams.get('p');
                    }
                    
                    // Re-construct the full request string including extra IDs or Filters
                    let fullRequest = initialPage;
                    urlParams.forEach((value, key) => {
                        if (key !== 'p') {
                            fullRequest += '&' + key + '=' + value;
                        }
                    });

                    this.loadPage(fullRequest, false);
                },

                toggleTheme() {
                    this.darkMode = !this.darkMode;
                    localStorage.setItem('darkMode', this.darkMode);
                },

                // 2. Main AJAX Loader
                loadPage(request, pushState = true) {
                    if (!request) return;
                    this.loading = true;
                    this.sidebarOpen = false;

                    let parts = request.split('&');
                    let fileName = parts[0]; 
                    
                    let queryParams = parts.length > 1 ? '?' + parts.slice(1).join('&') : '';

                    fetch('views/' + fileName + '.php' + queryParams)
                        .then(res => {
                            if (!res.ok) throw new Error('File not found');
                            return res.text();
                        })
                        .then(html => {
                            const contentArea = document.getElementById('admin-content');
                            if (contentArea) {
                                contentArea.innerHTML = html;
                                this.page = fileName;

                                if (pushState) {
                                    // Ensure we maintain the /admin/ base when pushing the new URL state
                                    let path = window.location.pathname;
                                    let adminIndex = path.indexOf('/admin/');
                                    let baseUrl = adminIndex !== -1 ? path.substring(0, adminIndex + 7) : '/admin/';
                                    
                                    const newUrl = baseUrl + fileName + queryParams;
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

                // 3. Browser Navigation Fix
                handleBackNavigation(event) {
                    if (event.state && event.state.path) {
                        this.loadPage(event.state.path, false);
                    } else {
                        // Fallback parsing if the history state is empty
                        let pathName = window.location.pathname;
                        let adminIndex = pathName.indexOf('/admin/');
                        let initialPage = 'dashboard';
                        
                        if (adminIndex !== -1) {
                            let relativePath = pathName.substring(adminIndex + 7).replace(/^\/|\/$/g, '');
                            if (relativePath && relativePath !== 'index.php') {
                                initialPage = relativePath;
                            }
                        }
                        this.loadPage(initialPage, false);
                    }
                }
            }
        }
    </script>

    <style>
        :root { --primary-color: <?php echo $settings['primary_color'] ?? '#6366f1'; ?>; }
        [x-cloak] { display: none !important; }
        body { transition: background-color 0.3s ease; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
    </style>
</head>
<body class="bg-[#f8fafc] text-slate-900 dark:bg-darkBg dark:text-slate-200 antialiased">

<div x-data="{ 
    showToast: false, 
    message: '', 
    type: 'success',
    init() {
        window.addEventListener('show-toast', (e) => {
            this.message = e.detail.message;
            this.type = e.detail.type || 'success';
            this.showToast = true;
            setTimeout(() => { this.showToast = false; }, 3000);
        });
    }
}" 
x-show="showToast" x-transition x-cloak class="fixed top-20 right-4 z-[100] w-full max-w-xs">
    <div class="flex items-center p-4 bg-white dark:bg-[#18181b] rounded-md shadow-2xl border border-slate-100 dark:border-slate-800" role="alert">
        <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-md"
             :class="type === 'success' ? 'text-green-500 bg-green-100 dark:bg-green-500/10' : 'text-red-500 bg-red-100 dark:bg-red-500/10'">
            <template x-if="type === 'success'">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
            </template>
            <template x-if="type === 'error'">
                <i class="fa-solid fa-xmark"></i>
            </template>
        </div>
        <div class="ml-3 text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300" x-text="message"></div>
        <button @click="showToast = false" type="button" class="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"></path></svg>
        </button>
    </div>
</div>

<header class="h-16 bg-white/80 dark:bg-darkPanel/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 fixed top-0 w-full z-40 px-4 lg:px-8">
    <div class="h-full flex items-center justify-between">
        
        <div class="flex items-center gap-4">
            <button @click="sidebarOpen = !sidebarOpen" class="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
            </button>
            
            <div class="flex items-center gap-3 cursor-pointer" @click="loadPage('dashboard')">
                <?php if(!empty($settings['logo_url'])): ?>
                    <img src="../<?php echo htmlspecialchars($settings['logo_url']); ?>?v=<?php echo time(); ?>" 
                         alt="Admin Logo" 
                         class="h-7 w-auto object-contain dark:brightness-200"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                         
                    <div class="hidden items-center gap-2">
                        <span class="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-primary/30">
                            <?php echo substr($settings['site_name'] ?? 'A', 0, 1); ?>
                        </span>
                        <span class="font-black text-sm uppercase tracking-widest hidden sm:block">Control Center</span>
                    </div>
                <?php else: ?>
                    <span class="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white font-black text-xl italic shadow-lg shadow-primary/30">
                        <?php echo substr($settings['site_name'] ?? 'A', 0, 1); ?>
                    </span>
                    <span class="font-black text-sm uppercase tracking-widest hidden sm:block">Control Center</span>
                <?php endif; ?>
            </div>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
            <a href="../index.php" target="_blank" class="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 shadow-sm">
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                View Site
            </a>

            <button @click="toggleTheme()" class="p-2.5 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-slate-500">
                <template x-if="!darkMode"><i class="fa-solid fa-moon"></i></template>
                <template x-if="darkMode"><i class="fa-solid fa-sun"></i></template>
            </button>

            <div class="h-10 w-10 rounded-md bg-primary text-white flex items-center justify-center font-black shadow-lg shadow-primary/20 uppercase">
                <?php echo substr($user['username'], 0, 1); ?>
            </div>
        </div>
    </div>
</header>
