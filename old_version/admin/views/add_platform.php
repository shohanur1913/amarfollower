<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();
?>

<div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
        <button @click="loadPage('platforms')" class="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 hover:text-primary transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <h2 class="text-xl font-bold uppercase tracking-tight">Create Platform</h2>
    </div>

    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        <form action="api/platform_actions.php" method="POST" class="p-8 space-y-6">
            <input type="hidden" name="action" value="create">

            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Platform Name</label>
                <input type="text" name="name" placeholder="e.g. Instagram" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sort Order</label>
                    <input type="number" name="sort_order" value="0" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                    <select name="status" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                        <option value="1">Active</option>
                        <option value="0">Disabled</option>
                    </select>
                </div>
            </div>

            <div class="space-y-2">
    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Font Awesome Class</label>
    <div class="flex gap-4">
        <input type="text" name="icon_class" value="<?php echo $platform['icon_class'] ?? 'fa-solid fa-globe'; ?>" 
            placeholder="fa-brands fa-facebook" 
            class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
        <div class="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-md flex items-center justify-center text-primary border border-slate-200 dark:border-slate-700">
            <i class="<?php echo $platform['icon_class'] ?? 'fa-solid fa-globe'; ?> text-xl"></i>
        </div>
    </div>
    <p class="text-[9px] text-slate-400 mt-1 italic leading-none">
        Brands use: <span class="font-bold">fa-brands fa-instagram</span> | Solid icons use: <span class="font-bold">fa-solid fa-user</span>
    </p>
</div>

            <button type="submit" class="w-full bg-primary text-white font-black py-3 rounded-md uppercase tracking-widest text-[11px] shadow-md transition active:scale-95">Save Platform</button>
        </form>
    </div>
</div>