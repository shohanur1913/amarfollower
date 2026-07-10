<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';

// Fetch user status
$isLoggedIn = isset($_SESSION['user_id']);
$user = $isLoggedIn ? getLoggedUser($conn) : null;

// Dynamic API URL
$siteUrl = rtrim($settings['site_url'] ?? (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]", '/');
$apiUrl = $siteUrl . "/api/v2";
?>

<div class="max-w-5xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
    
    <!-- 1. PAGE HEADER -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Api Documentations</h2>
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2 italic">Standard Integration Protocol</p>
        </div>
        <div class="flex gap-2">
             <a href="<?php echo $siteUrl; ?>/example.txt" target="_blank" class="bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-[10px] font-black uppercase px-4 py-2 rounded-md shadow-md hover:opacity-90 transition">
                <i class="fa-brands fa-php mr-2"></i> PHP Code Example
            </a>
        </div>
    </div>

    <!-- 2. SERVICE INFO CARDS -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">HTTP Method</p>
                <p class="text-sm font-bold text-slate-700 dark:text-slate-200">POST</p>
            </div>
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">API URL</p>
                <p class="text-sm font-mono font-bold text-primary truncate select-all"><?php echo $apiUrl; ?></p>
            </div>
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">API Key</p>
                <?php if($isLoggedIn): ?>
                    <p class="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 truncate select-all"><?php echo $user['api_key'] ?? 'Missing'; ?></p>
                <?php else: ?>
                    <p class="text-xs font-bold text-primary">Get an API key on the <button @click="loadPage('profile')" class="underline">Account page</button></p>
                <?php endif; ?>
            </div>
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Response format</p>
                <p class="text-sm font-bold text-slate-700 dark:text-slate-200">JSON</p>
            </div>
        </div>
    </div>

    <!-- 3. SERVICE LIST METHOD -->
    <div class="space-y-4">
        <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">Service list</h3>
        <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <tr class="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <th class="px-6 py-4">Parameters</th>
                        <th class="px-6 py-4">Description</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-bold">
                    <tr><td class="px-6 py-4 text-primary">key</td><td class="px-6 py-4 text-slate-500">Your API key</td></tr>
                    <tr><td class="px-6 py-4 text-primary">action</td><td class="px-6 py-4 text-slate-500">services</td></tr>
                </tbody>
            </table>
        </div>
        <div class="bg-[#09090b] p-6 rounded-md shadow-inner">
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Example response</p>
            <pre class="text-[11px] font-mono text-cyan-400 overflow-x-auto">[
    {
        "service": 1,
        "name": "Followers",
        "type": "Default",
        "category": "First Category",
        "rate": "0.90",
        "min": "50",
        "max": "10000",
        "refill": true,
        "cancel": true
    }
]</pre>
        </div>
    </div>

    <!-- 4. ADD ORDER METHOD -->
    <div class="space-y-4">
        <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">Add order</h3>
        <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <tr><th class="px-6 py-4">Parameters</th><th class="px-6 py-4">Description</th></tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-sm font-bold">
                    <tr><td class="px-6 py-4 text-primary">key</td><td class="px-6 py-4 text-slate-500">Your API key</td></tr>
                    <tr><td class="px-6 py-4 text-primary">action</td><td class="px-6 py-4 text-slate-500">add</td></tr>
                    <tr><td class="px-6 py-4 text-primary">service</td><td class="px-6 py-4 text-slate-500">Service ID</td></tr>
                    <tr><td class="px-6 py-4 text-primary">link</td><td class="px-6 py-4 text-slate-500">Link to page</td></tr>
                    <tr><td class="px-6 py-4 text-primary">quantity</td><td class="px-6 py-4 text-slate-500">Needed quantity</td></tr>
                </tbody>
            </table>
        </div>
        <div class="bg-[#09090b] p-6 rounded-md shadow-inner">
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Example response</p>
            <pre class="text-[11px] font-mono text-cyan-400 overflow-x-auto">{
    "order": 23501
}</pre>
        </div>
    </div>

    <!-- 5. ORDER STATUS -->
    <div class="space-y-4">
        <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">Order status</h3>
        <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
            <table class="w-full text-left border-collapse text-sm font-bold">
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td class="px-6 py-4 text-primary w-48 uppercase">order</td><td class="px-6 py-4 text-slate-500">Order ID</td></tr>
                </tbody>
            </table>
        </div>
        <div class="bg-[#09090b] p-6 rounded-md shadow-inner">
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Example response</p>
            <pre class="text-[11px] font-mono text-cyan-400 overflow-x-auto">{
    "charge": "0.27819",
    "start_count": "3572",
    "status": "Partial",
    "remains": "157",
    "currency": "<?php echo $settings['currency_code'] ?? 'BDT'; ?>"
}</pre>
        </div>
    </div>

    <!-- 6. MULTIPLE STATUS -->
    <div class="space-y-4">
        <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">Multiple orders status</h3>
        <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
            <table class="w-full text-left border-collapse text-sm font-bold">
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td class="px-6 py-4 text-primary w-48 uppercase">orders</td><td class="px-6 py-4 text-slate-500">Order IDs (separated by a comma, up to 100 IDs)</td></tr>
                </tbody>
            </table>
        </div>
        <div class="bg-[#09090b] p-6 rounded-md shadow-inner">
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Example response</p>
            <pre class="text-[11px] font-mono text-cyan-400 overflow-x-auto">{
    "1": {
        "charge": "0.27819",
        "status": "Partial",
        "remains": "157"
    },
    "10": {
        "error": "Incorrect order ID"
    }
}</pre>
        </div>
    </div>

    <!-- 7. REFILLS -->
    <div class="space-y-4">
        <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">Create refill</h3>
        <div class="bg-[#09090b] p-6 rounded-md shadow-inner">
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Example response</p>
            <pre class="text-[11px] font-mono text-cyan-400 overflow-x-auto">{
    "refill": "1"
}</pre>
        </div>
    </div>

    <!-- 8. USER BALANCE -->
    <div class="space-y-4">
        <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest px-1">User balance</h3>
        <div class="bg-[#09090b] p-6 rounded-md shadow-inner">
            <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Example response</p>
            <pre class="text-[11px] font-mono text-cyan-400 overflow-x-auto">{
    "balance": "<?php echo number_format($user['balance'] ?? 0, 4); ?>",
    "currency": "<?php echo $settings['currency_code'] ?? 'BDT'; ?>"
}</pre>
        </div>
    </div>

    <!-- BOTTOM HELP SECTION -->
    <div class="bg-primary/5 border border-primary/20 p-8 rounded-md flex flex-col md:flex-row items-center gap-8">
        <div class="flex-1 text-center md:text-left">
            <h4 class="text-sm font-black uppercase text-primary tracking-widest mb-2">Need Custom Integration?</h4>
            <p class="text-xs font-bold text-slate-500 uppercase tracking-tighter leading-relaxed">
                If you are a developer or master panel owner, our technical team provides support for any custom endpoint requirements.
            </p>
        </div>
        <button @click="loadPage('tickets')" class="bg-primary text-white font-black px-8 py-3 rounded-md text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition active:scale-95">
            Contact Technical Team
        </button>
    </div>

</div>