<!-- Sidebar Overlay for Mobile -->
<div x-show="sidebarOpen" x-cloak @click="sidebarOpen = false" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"></div>

<!-- Admin Sidebar Container -->
<aside 
    :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    class="fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#111113] border-r border-slate-200 dark:border-slate-800 z-50 transition-transform duration-300 lg:pt-16 flex flex-col">
    
    <div class="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-hide">
        
        <!-- SECTION: SYSTEM -->
        <div class="space-y-1">
            <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Main Console</p>
            
            <button @click="loadPage('dashboard')" :class="page === 'dashboard' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                Overview
            </button>

            <button @click="loadPage('settings')" :class="page === 'settings' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
                System Settings
            </button>
        </div>

        <!-- SECTION: SMM CORE -->
        <div class="space-y-1">
            <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Service Catalog</p>
            
            <button @click="loadPage('platforms')" :class="page === 'platforms' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path></svg>
                Icon Platforms
            </button>

            <button @click="loadPage('categories')" :class="page === 'categories' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                Service Categories
            </button>

            <button @click="loadPage('services')" :class="page === 'services' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                Manage Services
            </button>

            <button @click="loadPage('providers')" :class="page === 'providers' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                API Providers
            </button>
        </div>

        <!-- SECTION: OPERATIONS -->
        <div class="space-y-1">
            <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Operations</p>
            
            <button @click="loadPage('users')" :class="page === 'users' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-9-4.912"></path></svg>
                Manage Clients
            </button>

            <button @click="loadPage('orders')" :class="page === 'orders' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                Client Orders
            </button>

            <button @click="loadPage('refills')" :class="page === 'refills' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Refill Requests
            </button>
        </div>

        <!-- SECTION: FINANCE -->
        <div class="space-y-1">
            <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Financials</p>
            
            <button @click="loadPage('transactions')" :class="page === 'transactions' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Payment History
            </button>

            <button @click="loadPage('gateways')" :class="page === 'gateways' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                Payment Methods
            </button>
        </div>

        <!-- SECTION: SUPPORT -->
        <div class="space-y-1">
            <p class="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Communication</p>
            
            <button @click="loadPage('tickets')" :class="page === 'tickets' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"></path></svg>
                Support Desk
            </button>

            <button @click="loadPage('cron')" :class="page === 'cron' ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
                class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-all group font-bold text-sm outline-none">
                <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Automation Logs
            </button>
        </div>

    </div>

    <!-- SIDEBAR FOOTER -->
    <div class="p-4 border-t border-slate-200 dark:border-slate-800">
        <a href="../logout.php" class="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-bold text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Sign Out
        </a>
    </div>
</aside>
                    