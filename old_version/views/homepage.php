<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
$user = getLoggedUser($conn);
?>

<div class="space-y-8">
    
    <!-- Welcome Hero Card -->
    <div class="relative bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md p-8 lg:p-12 shadow-sm overflow-hidden">
        <!-- Decorative Background Blur -->
        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div class="relative z-10 max-w-2xl">
            <span class="inline-block px-3 py-1 bg-primary/10 text-primary rounded text-[9px] font-black uppercase tracking-widest mb-4 border border-primary/20">Welcome Back</span>
            <h1 class="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Hello, <?php echo htmlspecialchars($user['username']); ?>!<br>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-500">Ready to boost your socials?</span>
            </h1>
            <p class="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
                You are currently logged into <?php echo $settings['site_name']; ?>. Explore our vast inventory of social media marketing services designed to deliver high-quality results at lightning speed.
            </p>
            
            <div class="mt-8 flex flex-wrap items-center gap-4">
                <button @click="loadPage('dashboard')" class="bg-primary text-white font-black px-8 py-3.5 rounded-md shadow-lg shadow-primary/30 hover:opacity-90 transition transform active:scale-95 uppercase tracking-[0.2em] text-[10px]">
                    <i class="fa-solid fa-rocket mr-2"></i> Place New Order
                </button>
                <button @click="loadPage('services')" class="bg-white dark:bg-[#1d1d21] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black px-8 py-3.5 rounded-md shadow-sm hover:border-primary hover:text-primary transition uppercase tracking-[0.2em] text-[10px]">
                    View Pricing
                </button>
            </div>
        </div>
    </div>

    <!-- How it Works Section -->
    <div>
        <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-4">How It Works</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <!-- Step 1 -->
            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 p-6 rounded-md shadow-sm relative overflow-hidden group">
                <div class="absolute top-4 right-4 text-5xl font-black text-slate-100 dark:text-slate-800/50 group-hover:scale-110 transition duration-500">1</div>
                <div class="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-md flex items-center justify-center text-lg mb-4 relative z-10"><i class="fa-solid fa-wallet"></i></div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white relative z-10">Add Funds</h4>
                <p class="text-xs font-bold text-slate-500 mt-2 relative z-10 leading-relaxed">Top up your account balance using our secure, automated payment gateways to start ordering.</p>
                <button @click="loadPage('transactions')" class="mt-4 text-[10px] font-black text-primary uppercase tracking-widest hover:underline relative z-10">Deposit Now &rarr;</button>
            </div>

            <!-- Step 2 -->
            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 p-6 rounded-md shadow-sm relative overflow-hidden group">
                <div class="absolute top-4 right-4 text-5xl font-black text-slate-100 dark:text-slate-800/50 group-hover:scale-110 transition duration-500">2</div>
                <div class="h-10 w-10 bg-cyan-500/10 text-cyan-500 rounded-md flex items-center justify-center text-lg mb-4 relative z-10"><i class="fa-solid fa-list-check"></i></div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white relative z-10">Select Service</h4>
                <p class="text-xs font-bold text-slate-500 mt-2 relative z-10 leading-relaxed">Choose from our wide range of services. Pick a platform, enter your link, and set the quantity.</p>
                <button @click="loadPage('dashboard')" class="mt-4 text-[10px] font-black text-primary uppercase tracking-widest hover:underline relative z-10">Browse Services &rarr;</button>
            </div>

            <!-- Step 3 -->
            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 p-6 rounded-md shadow-sm relative overflow-hidden group">
                <div class="absolute top-4 right-4 text-5xl font-black text-slate-100 dark:text-slate-800/50 group-hover:scale-110 transition duration-500">3</div>
                <div class="h-10 w-10 bg-green-500/10 text-green-500 rounded-md flex items-center justify-center text-lg mb-4 relative z-10"><i class="fa-solid fa-rocket"></i></div>
                <h4 class="text-sm font-bold text-slate-900 dark:text-white relative z-10">Enjoy Results</h4>
                <p class="text-xs font-bold text-slate-500 mt-2 relative z-10 leading-relaxed">Sit back and relax. Our automated systems will begin delivering your order at blazing speeds.</p>
                <button @click="loadPage('orders')" class="mt-4 text-[10px] font-black text-primary uppercase tracking-widest hover:underline relative z-10">Track Orders &rarr;</button>
            </div>

        </div>
    </div>

    <!-- Need Help Banner -->
    <div class="bg-slate-900 dark:bg-[#111113] rounded-md p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-primary shadow-xl">
        <div class="flex items-center gap-4">
            <div class="h-12 w-12 bg-white/10 rounded-md flex items-center justify-center text-white text-xl">
                <i class="fa-solid fa-headset"></i>
            </div>
            <div>
                <h4 class="text-white font-bold text-base">Need assistance with an order?</h4>
                <p class="text-slate-400 text-xs font-bold mt-1">Our AI Support Agent is available 24/7 to resolve your issues.</p>
            </div>
        </div>
        <button @click="loadPage('tickets')" class="w-full md:w-auto bg-white text-slate-900 font-black px-8 py-3 rounded-md uppercase tracking-[0.2em] text-[10px] hover:bg-slate-200 transition active:scale-95">
            Open Support Ticket
        </button>
    </div>

</div>