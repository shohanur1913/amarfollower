<div class="flex flex-col items-center justify-center py-16 md:py-24 px-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
    
    <div class="relative w-32 h-32 mb-8 group">
        <div class="absolute inset-0 bg-primary/20 dark:bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
        <div class="relative bg-white dark:bg-[#18181b] border border-slate-100 dark:border-slate-800 shadow-xl rounded-full w-full h-full flex items-center justify-center text-primary text-5xl group-hover:scale-105 transition-transform duration-500">
            <i class="fa-solid fa-satellite-dish fa-beat-fade" style="--fa-beat-fade-opacity: 0.6; --fa-beat-fade-scale: 1.05;"></i>
        </div>
    </div>

    <h1 class="text-7xl md:text-9xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 leading-none drop-shadow-sm">
        4<span class="text-primary">0</span>4
    </h1>
    
    <div class="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-6 border border-primary/20 shadow-sm">
        Connection Lost
    </div>

    <h2 class="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">
        Page Not Found
    </h2>
    
    <p class="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mb-10 leading-relaxed">
        Oops! The page you are looking for seems to have vanished into the digital void. It might have been moved, deleted, or you may have mistyped the address.
    </p>

    <div class="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
        
        <button onclick="if(typeof loadPage === 'function') { loadPage('dashboard'); } else { window.location.href='/'; }" 
                class="w-full sm:w-auto bg-primary text-white font-bold text-sm py-3.5 px-8 rounded-full shadow-lg shadow-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 flex items-center justify-center gap-2">
            <i class="fa-solid fa-house text-xs"></i> 
            Back to Dashboard
        </button>
        
        <button onclick="window.history.back()" 
                class="w-full sm:w-auto bg-white dark:bg-[#111113] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm py-3.5 px-8 rounded-full shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2">
            <i class="fa-solid fa-arrow-left text-xs"></i> 
            Go Back
        </button>

    </div>
    
    <div class="mt-12 text-xs font-semibold text-slate-400">
        Think this is a mistake? 
        <button onclick="if(typeof loadPage === 'function') { loadPage('tickets'); } else { window.location.href='/tickets'; }" class="text-primary hover:underline transition ml-1">
            Contact Support
        </button>
    </div>

</div>
