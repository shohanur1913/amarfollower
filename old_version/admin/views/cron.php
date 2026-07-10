<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

// --- 1. Fetch State Data ---
$lastOrders = $settings['cron_last_run_orders'] ?? 'Never';
$lastServices = $settings['cron_last_run_services'] ?? 'Never';

// --- 2. Cron Setup Checker (WHMCS Logic) ---
// Order Sync should run every 5 minutes. Consider healthy if run within last 15 mins (900 secs).
$orderHealthy = false;
$nextOrderRun = 'Unknown';
if ($lastOrders !== 'Never') {
    $timeDiffOrders = time() - strtotime($lastOrders);
    $orderHealthy = ($timeDiffOrders <= 900);
    $nextOrderRun = date('M d, H:i', strtotime($lastOrders) + 300); // +5 minutes
} else {
    $nextOrderRun = 'ASAP';
}

// Service Sync should run once a day. Consider healthy if run within last 36 hours (129600 secs).
$serviceHealthy = false;
$nextServiceRun = 'Unknown';
if ($lastServices !== 'Never') {
    $timeDiffServices = time() - strtotime($lastServices);
    $serviceHealthy = ($timeDiffServices <= 129600);
    $nextServiceRun = date('M d, H:i', strtotime($lastServices) + 86400); // +24 hours
} else {
    $nextServiceRun = 'ASAP';
}

$overallHealthy = ($orderHealthy && $serviceHealthy);

// --- 3. Health & Time Formatting ---
function timeAgo($timestamp) {
    if ($timestamp === 'Never') return 'Never';
    $time = strtotime($timestamp);
    $diff = time() - $time;
    if ($diff < 60) return $diff . ' sec ago';
    if ($diff < 3600) return round($diff / 60) . ' mins ago';
    if ($diff < 86400) return round($diff / 3600) . ' hours ago';
    return round($diff / 86400) . ' days ago';
}

$logs = mysqli_fetch_all(mysqli_query($conn, "SELECT * FROM cron_logs ORDER BY id DESC LIMIT 15"), MYSQLI_ASSOC);
$serverPath = dirname(dirname(__DIR__));
?>

<div class="space-y-6 pb-24" x-data="{ 
    running: '',
    runCron(action) {
        this.running = action;
        // Use absolute path to ensure it always hits the root script
        fetch('/cron.php?action=' + action)
            .then(res => {
                if (!res.ok) throw new Error('Server error');
                return res.text();
            })
            .then(msg => {
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'success' }}));
                this.running = '';
                // 'this' correctly points to the Alpine component so loadPage works
                this.loadPage('cron'); 
            })
            .catch(err => {
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to run cron manually.', type: 'error' }}));
                this.running = '';
            });
    }
}">
    <div class="flex items-center justify-between mb-2">
        <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white">Automation Status</h2>
            <p class="text-xs font-semibold text-slate-500 mt-1">Monitor background tasks, sync statuses, and manage cron commands.</p>
        </div>
    </div>

    <div class="p-6 rounded-md border shadow-sm" :class="{
        'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50': <?php echo $overallHealthy ? 'false' : 'true'; ?>,
        'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50': <?php echo $overallHealthy ? 'true' : 'false'; ?>
    }">
        <div class="flex items-center gap-4">
            <div class="h-12 w-12 flex items-center justify-center rounded-full text-2xl shadow-sm" 
                 :class="<?php echo $overallHealthy ? "'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'" : "'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'"; ?>">
                <i class="fa-solid <?php echo $overallHealthy ? 'fa-check' : 'fa-xmark'; ?>"></i>
            </div>
            <div>
                <h3 class="text-lg font-black uppercase tracking-tight leading-none <?php echo $overallHealthy ? 'text-emerald-800 dark:text-emerald-400' : 'text-red-800 dark:text-red-400'; ?>">
                    <?php echo $overallHealthy ? 'Cron Status: Healthy' : 'Cron Status: Action Required'; ?>
                </h3>
                <p class="text-xs font-bold mt-1 <?php echo $overallHealthy ? 'text-emerald-700 dark:text-emerald-500' : 'text-red-700 dark:text-red-500'; ?>">
                    <?php echo $overallHealthy ? 'All automation tasks are running perfectly on schedule.' : 'One or more automated tasks have missed their scheduled run time. Please verify your cPanel cron configuration.'; ?>
                </p>
            </div>
        </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="bg-white dark:bg-[#18181b] border <?php echo $orderHealthy ? 'border-slate-200 dark:border-slate-800' : 'border-red-300 dark:border-red-800'; ?> rounded-md shadow-sm p-6 space-y-5">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white">Order Status Sync</h4>
                    <p class="text-[11px] font-semibold text-slate-500 mt-1">Checks pending orders with providers and processes refunds.</p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest <?php echo $orderHealthy ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'; ?>">
                    <?php echo $orderHealthy ? 'Active' : 'Failed'; ?>
                </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-center bg-slate-50 dark:bg-[#111113] p-3 rounded-md border border-slate-100 dark:border-slate-800/50">
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Previous Run</p>
                    <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1"><?php echo timeAgo($lastOrders); ?></p>
                </div>
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estimated Next Run</p>
                    <p class="text-sm font-bold text-primary mt-1"><?php echo $nextOrderRun; ?></p>
                </div>
            </div>

            <button @click="runCron('orders')" :disabled="running === 'orders'"
                class="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black py-3 rounded-md text-[11px] uppercase tracking-widest transition flex justify-center items-center gap-2">
                <span x-show="running !== 'orders'">Run Order Sync Manually</span>
                <i x-show="running === 'orders'" class="fa-solid fa-spinner animate-spin"></i>
            </button>
        </div>

        <div class="bg-white dark:bg-[#18181b] border <?php echo $serviceHealthy ? 'border-slate-200 dark:border-slate-800' : 'border-amber-300 dark:border-amber-800'; ?> rounded-md shadow-sm p-6 space-y-5">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white">Service Catalog Sync</h4>
                    <p class="text-[11px] font-semibold text-slate-500 mt-1">Syncs prices and disables removed services from providers.</p>
                </div>
                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest <?php echo $serviceHealthy ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'; ?>">
                    <?php echo $serviceHealthy ? 'Active' : 'Warning'; ?>
                </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-center bg-slate-50 dark:bg-[#111113] p-3 rounded-md border border-slate-100 dark:border-slate-800/50">
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Previous Run</p>
                    <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1"><?php echo timeAgo($lastServices); ?></p>
                </div>
                <div>
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Estimated Next Run</p>
                    <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1"><?php echo $nextServiceRun; ?></p>
                </div>
            </div>

            <button @click="runCron('services')" :disabled="running === 'services'"
                class="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black py-3 rounded-md text-[11px] uppercase tracking-widest transition flex justify-center items-center gap-2">
                <span x-show="running !== 'services'">Run Service Sync Manually</span>
                <i x-show="running === 'services'" class="fa-solid fa-spinner animate-spin"></i>
            </button>
        </div>
    </div>

    <div class="bg-slate-900 dark:bg-[#09090b] border border-slate-800 rounded-md p-6 shadow-xl">
        <h3 class="text-sm font-black uppercase tracking-widest text-white mb-1">Cron Job Configuration</h3>
        <p class="text-xs font-semibold text-slate-400 mb-6">Add the following commands to your cPanel Cron Jobs section to automate the platform.</p>
        
        <div class="space-y-5 font-mono">
            <div>
                <div class="flex items-center justify-between mb-2">
                    <p class="text-[11px] text-slate-300 font-bold uppercase tracking-wider">1. Order Sync <span class="text-primary">(Run Every 5 Minutes)</span></p>
                    <span class="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">*/5 * * * *</span>
                </div>
                <div class="flex items-center justify-between bg-black/50 p-3 rounded-md border border-slate-700/50">
                    <code class="text-emerald-400 text-xs break-all" id="cmd1">php -q <?php echo $serverPath; ?>/cron.php action=orders >/dev/null 2>&1</code>
                    <button onclick="navigator.clipboard.writeText(document.getElementById('cmd1').innerText); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Command Copied!', type: 'success' }}));" class="text-slate-400 hover:text-white transition ml-4 bg-slate-800 p-2 rounded">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                </div>
            </div>

            <div>
                <div class="flex items-center justify-between mb-2">
                    <p class="text-[11px] text-slate-300 font-bold uppercase tracking-wider">2. Service Catalog Sync <span class="text-primary">(Run Once Per Day)</span></p>
                    <span class="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">0 0 * * *</span>
                </div>
                <div class="flex items-center justify-between bg-black/50 p-3 rounded-md border border-slate-700/50">
                    <code class="text-emerald-400 text-xs break-all" id="cmd2">php -q <?php echo $serverPath; ?>/cron.php action=services >/dev/null 2>&1</code>
                    <button onclick="navigator.clipboard.writeText(document.getElementById('cmd2').innerText); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Command Copied!', type: 'success' }}));" class="text-slate-400 hover:text-white transition ml-4 bg-slate-800 p-2 rounded">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111113]">
            <h3 class="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Recent Automation Logs</h3>
        </div>
        <div class="divide-y divide-slate-100 dark:divide-slate-800/50">
            <?php if(empty($logs)): ?>
                <div class="px-6 py-8 text-center text-slate-500 text-sm font-semibold">No cron executions logged yet.</div>
            <?php else: ?>
                <?php foreach($logs as $l): ?>
                <div class="px-6 py-3.5 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/20 transition">
                    <div class="col-span-3 text-[11px] font-bold text-slate-500 flex flex-col">
                        <span class="text-slate-700 dark:text-slate-300"><?php echo date('M d, Y', strtotime($l['created_at'])); ?></span>
                        <span><?php echo date('h:i:s A', strtotime($l['created_at'])); ?></span>
                    </div>
                    <div class="col-span-2">
                        <span class="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest text-center <?php echo $l['action'] === 'orders' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-800/10 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'; ?>">
                            <?php echo htmlspecialchars($l['action']); ?>
                        </span>
                    </div>
                    <div class="col-span-7 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                        <?php 
                            $isError = strpos(strtolower($l['result']), 'failed') !== false;
                            echo '<span class="' . ($isError ? 'text-red-500' : '') . '">' . htmlspecialchars($l['result']) . '</span>';
                        ?>
                    </div>
                </div>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>
