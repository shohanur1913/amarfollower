<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

$id = (int)($_GET['id'] ?? 0);
$gw = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM gateways WHERE id = $id"));

if(!$gw) { echo "Gateway not found!"; exit; }
?>

<div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
        <button @click="loadPage('gateways')" class="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 hover:text-primary transition">
            <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h2 class="text-xl font-bold uppercase tracking-tight">Edit Gateway: <?php echo $gw['name']; ?></h2>
    </div>

    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        <form action="api/gateway_actions.php" method="POST" class="p-8 space-y-6">
            <input type="hidden" name="id" value="<?php echo $gw['id']; ?>">

            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Display Name (User Sees This)</label>
                <input type="text" name="display_name" value="<?php echo $gw['display_name']; ?>" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
            </div>

            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">API Key / Secret</label>
                <input type="password" name="api_key" value="<?php echo $gw['api_key']; ?>" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
            </div>

            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">API Base URL</label>
                <input type="text" name="base_url" value="<?php echo $gw['base_url']; ?>" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
                <p class="text-[9px] text-slate-400 italic">Example: https://paymently.link (No trailing slash)</p>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Currency Code</label>
                    <input type="text" name="currency" value="<?php echo $gw['currency']; ?>" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                    <select name="status" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                        <option value="1" <?php echo $gw['status'] == 1 ? 'selected' : ''; ?>>Enabled</option>
                        <option value="0" <?php echo $gw['status'] == 0 ? 'selected' : ''; ?>>Disabled</option>
                    </select>
                </div>
            </div>

            <button type="submit" class="w-full bg-primary text-white font-black py-3 rounded-md uppercase tracking-widest text-[11px] shadow-md transition active:scale-95">Update Gateway Settings</button>
        </form>
    </div>

    <!-- Security Info -->
    <div class="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md flex gap-3">
        <i class="fa-solid fa-shield-halved text-amber-500 mt-1"></i>
        <p class="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
            Keep your API Keys secret. Never share this URL or screenshots of this page. 
            Ensure your <span class="font-bold uppercase">Site URL</span> in branding settings is set to your correct domain so webhooks work properly.
        </p>
    </div>
</div>