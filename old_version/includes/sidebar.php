<!-- Sidebar Overlay for Mobile -->
<div x-show="sidebarOpen" x-cloak @click="sidebarOpen = false" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" x-transition.opacity></div>

<!-- Sidebar (Desktop) -->
<aside 
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    class="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#09090b] z-50 transition-transform duration-300 ease-in-out flex flex-col box-border border-r border-slate-200 dark:border-slate-800">
    
    <div class="h-16 px-6 flex justify-between items-center shrink-0">
        <div class="flex items-center gap-3">
            <?php if(!empty($settings['logo_url'])): ?>
                <img src="<?php echo htmlspecialchars($settings['logo_url']); ?>?v=<?php echo time(); ?>" alt="Logo" class="h-8 w-auto object-contain dark:brightness-200" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <h1 class="hidden text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[150px]"><?php echo htmlspecialchars($settings['site_name'] ?? 'AmarFollower'); ?></h1>
            <?php else: ?>
                <h1 class="text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-[150px]"><?php echo htmlspecialchars($settings['site_name'] ?? 'AmarFollower'); ?></h1>
            <?php endif; ?>
        </div>
        
        <button @click="sidebarOpen = false" class="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition bg-slate-50 dark:bg-slate-800 p-1.5 rounded-md">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    </div>

    <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar pb-24 lg:pb-6">
        
        <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">General</p>
        
        <button @click="loadPage('dashboard')" 
            :class="page === 'dashboard' ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 outline-none">
            <i class="fa-solid fa-wand-magic-sparkles w-5 text-center text-lg opacity-80" :class="page === 'dashboard' ? 'text-primary' : ''"></i>
            <span class="font-semibold text-sm">Order Now</span>
        </button>

        <button @click="loadPage('services')" 
            :class="page === 'services' ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 outline-none">
            <i class="fa-solid fa-list-ul w-5 text-center text-lg opacity-80" :class="page === 'services' ? 'text-primary' : ''"></i>
            <span class="font-semibold text-sm">Services</span>
        </button>

        <div class="my-4 mx-2"></div>
        <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">History & Funds</p>

        <button @click="loadPage('orders')" 
            :class="page === 'orders' ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 outline-none">
            <i class="fa-solid fa-clock-rotate-left w-5 text-center text-lg opacity-80" :class="page === 'orders' ? 'text-primary' : ''"></i>
            <span class="font-semibold text-sm">Orders</span>
        </button>

        <button @click="loadPage('transactions')" 
            :class="page === 'transactions' ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 outline-none">
            <i class="fa-solid fa-wallet w-5 text-center text-lg opacity-80" :class="page === 'transactions' ? 'text-primary' : ''"></i>
            <span class="font-semibold text-sm">Add Funds</span>
        </button>

        <div class="my-4 mx-2"></div>
        <p class="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Support & Settings</p>

        <button @click="loadPage('tickets')" 
            :class="page === 'tickets' ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 outline-none">
            <i class="fa-solid fa-headset w-5 text-center text-lg opacity-80" :class="page === 'tickets' ? 'text-primary' : ''"></i>
            <span class="font-semibold text-sm">Tickets</span>
        </button>

        <!-- Fixed API Link -->
        <button @click="loadPage('apis')" 
            :class="page === 'apis' ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 outline-none">
            <i class="fa-solid fa-code w-5 text-center text-lg opacity-80" :class="page === 'apis' ? 'text-primary' : ''"></i>
            <span class="font-semibold text-sm">Developer API</span>
        </button>

        <button @click="loadPage('profile')" 
            :class="page === 'profile' ? 'bg-primary/10 text-primary shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
            class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 outline-none">
            <i class="fa-regular fa-circle-user w-5 text-center text-lg opacity-80" :class="page === 'profile' ? 'text-primary' : ''"></i>
            <span class="font-semibold text-sm">Account</span>
        </button>

        <a href="logout.php" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all mt-4">
            <i class="fa-solid fa-arrow-right-from-bracket w-5 text-center text-lg opacity-80"></i>
            <span class="font-semibold text-sm">Logout</span>
        </a>
    </nav>
</aside>

<!-- Mobile Bottom Navigation -->
<div class="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-md z-50 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.5)] border-t border-slate-100 dark:border-slate-800">
    <div class="flex items-center justify-around h-full relative max-w-md mx-auto">
        
        <button @click="loadPage('tickets')" :class="page === 'tickets' ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'" class="flex flex-col items-center justify-center h-full w-full transition outline-none">
            <i class="fa-solid fa-headset text-lg mb-0.5"></i>
            <span class="text-[10px] font-semibold leading-none mt-1">Tickets</span>
        </button>
        
        <button @click="loadPage('transactions')" :class="page === 'transactions' ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'" class="flex flex-col items-center justify-center h-full w-full transition outline-none">
            <i class="fa-solid fa-wallet text-lg mb-0.5"></i>
            <span class="text-[10px] font-semibold leading-none mt-1">Funds</span>
        </button>
        
        <div class="relative w-full flex justify-center h-full">
            <button @click="loadPage('dashboard')" 
                class="absolute -top-5 bg-primary h-14 w-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/40 transform transition hover:scale-105 active:scale-95 outline-none"
                :class="page === 'dashboard' ? 'ring-4 ring-white dark:ring-[#18181b]' : ''">
                <i class="fa-solid fa-plus text-xl"></i>
            </button>
        </div>

        <button @click="loadPage('orders')" :class="page === 'orders' ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'" class="flex flex-col items-center justify-center h-full w-full transition outline-none">
            <i class="fa-solid fa-clock-rotate-left text-lg mb-0.5"></i>
            <span class="text-[10px] font-semibold leading-none mt-1">Orders</span>
        </button>
        
        <button @click="loadPage('profile')" :class="page === 'profile' ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'" class="flex flex-col items-center justify-center h-full w-full transition outline-none">
            <i class="fa-regular fa-circle-user text-lg mb-0.5"></i>
            <span class="text-[10px] font-semibold leading-none mt-1">Profile</span>
        </button>
        
    </div>
</div>