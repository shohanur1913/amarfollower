<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();
?>
<div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
        <button @click="loadPage('providers')" class="p-2 bg-slate-100 dark:bg-slate-800 rounded-md"><i class="fa-solid fa-arrow-left"></i></button>
        <h2 class="text-xl font-bold uppercase tracking-tight">Connect New Provider</h2>
    </div>

    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm">
        <form action="api/provider_actions.php" method="POST" class="p-8 space-y-6">
            <input type="hidden" name="action" value="create">
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider Name</label>
                <input type="text" name="name" required placeholder="e.g. SMMGen" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">API URL</label>
                <input type="text" name="api_url" required placeholder="https://smmgen.com/api/v2" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">API Key</label>
                <input type="password" name="api_key" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
            </div>
            <button type="submit" class="w-full bg-primary text-white font-black py-3 rounded-md uppercase tracking-widest text-[11px] shadow-md">Connect API</button>
        </form>
    </div>
</div>