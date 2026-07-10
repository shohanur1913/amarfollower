<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';

// Security: Ensure only logged-in users access this
$user = getLoggedUser($conn);
$userApiKey = $user['api_key'] ?? '';

// Professional URL Detection
$siteUrl = rtrim($settings['site_url'] ?? (isset($_SERVER['HTTPS']) ? "https" : "http") . "://$_SERVER[HTTP_HOST]", '/');
$apiUrl = $siteUrl . "/api/v2";
?>

<div class="max-w-4xl mx-auto space-y-8 pb-32" x-data="{
    apiKey: '<?php echo $userApiKey; ?>',
    loading: false,
    results: null,
    error: null,
    step: 'none',

    async runTest(action) {
        if(!this.apiKey) {
            window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'Generate an API key first!', type: 'error'}}));
            return;
        }

        this.loading = true;
        this.error = null;
        this.results = null;
        this.step = action;

        let fd = new FormData();
        fd.append('key', this.apiKey);
        fd.append('action', action === 'import' ? 'services' : 'balance');

        try {
            // We call the v2 endpoint directly
            const response = await fetch('api/v2.php', { method: 'POST', body: fd });
            const data = await response.json();

            if (data.error) {
                this.error = data.error;
            } else {
                if (action === 'import') {
                    // Filter: 1 service per category
                    let filtered = [];
                    let catsSeen = new Set();
                    data.forEach(s => {
                        if (!catsSeen.has(s.category)) {
                            filtered.push(s);
                            catsSeen.add(s.category);
                        }
                    });
                    this.results = filtered;
                } else {
                    this.results = data;
                }
                window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'API Protocol Verified'}}));
            }
        } catch (e) {
            this.error = 'Failed to connect to API endpoint.';
        } finally {
            this.loading = false;
        }
    }
}">

    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">API Connectivity Health</h2>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Test your integration status</p>
        </div>
        <div class="flex items-center gap-2">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Endpoint:</span>
            <code class="text-[10px] font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded border border-primary/10 select-all"><?php echo $apiUrl; ?></code>
        </div>
    </div>

    <!-- 1. AUTHENTICATION TEST CARD -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
            <h3 class="text-[10px] font-black uppercase tracking-widest">Connection Parameters</h3>
            <?php if(empty($userApiKey)): ?>
                <span class="text-[9px] font-black text-red-500 uppercase italic">No Key Found</span>
            <?php endif; ?>
        </div>
        
        <div class="p-6 lg:p-8 space-y-6">
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Your API Key</label>
                <div class="flex gap-2">
                    <input type="text" x-model="apiKey" placeholder="Your key will appear here..." 
                        class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-primary/20 transition">
                    <button @click="navigator.clipboard.writeText(apiKey); window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'Key Copied'}}))" 
                        class="px-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md hover:text-primary transition">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                <button @click="runTest('auth')" :disabled="loading" 
                    class="bg-primary text-white font-black py-3 rounded-md text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition transform active:scale-95 disabled:opacity-50">
                    <i x-show="!loading || step !== 'auth'" class="fa-solid fa-shield-check mr-2"></i>
                    <i x-show="loading && step === 'auth'" class="fa-solid fa-spinner animate-spin mr-2"></i>
                    Test Auth & Balance
                </button>
                <button @click="runTest('import')" :disabled="loading" 
                    class="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black py-3 rounded-md text-[10px] uppercase tracking-widest shadow-md transition transform active:scale-95 disabled:opacity-50">
                    <i x-show="!loading || step !== 'import'" class="fa-solid fa-cloud-arrow-down mr-2"></i>
                    <i x-show="loading && step === 'import'" class="fa-solid fa-spinner animate-spin mr-2"></i>
                    Test Service Fetch
                </button>
            </div>
        </div>
    </div>

    <!-- 2. ERROR STATE -->
    <template x-if="error">
        <div class="p-6 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-md flex items-start gap-4 animate-in fade-in slide-in-from-top-2">
            <div class="h-10 w-10 bg-red-100 text-red-600 rounded-md flex items-center justify-center shrink-0"><i class="fa-solid fa-circle-xmark text-xl"></i></div>
            <div>
                <h4 class="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-tight">API Handshake Failed</h4>
                <p class="text-xs font-bold text-red-600/80 mt-1" x-text="error"></p>
            </div>
        </div>
    </template>

    <!-- 3. RESULTS AREA -->
    <template x-if="results">
        <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            <!-- Result: Balance -->
            <template x-if="step === 'auth'">
                <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md p-6 shadow-sm flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="h-12 w-12 bg-green-500/10 text-green-600 rounded-md flex items-center justify-center text-xl"><i class="fa-solid fa-check-double"></i></div>
                        <div>
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">API Key Authorized</p>
                            <p class="text-xl font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">Status: Active</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Your API Balance</p>
                        <p class="text-2xl font-black text-primary mt-1" x-text="results.balance + ' ' + results.currency"></p>
                    </div>
                </div>
            </template>

            <!-- Result: Service Import Sample -->
            <template x-if="step === 'import'">
                <div class="space-y-4">
                    <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-1">Smart Import Preview (Sample Set)</h3>
                    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
                        <table class="w-full text-left">
                            <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black uppercase text-slate-400">
                                <tr>
                                    <th class="px-6 py-3">Category Mapping</th>
                                    <th class="px-6 py-3">Service Name</th>
                                    <th class="px-6 py-3 text-right">Rate</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                                <template x-for="s in results" :key="s.service">
                                    <tr>
                                        <td class="px-6 py-4"><span class="text-[10px] font-black text-primary uppercase" x-text="s.category"></span></td>
                                        <td class="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-300" x-text="s.name"></td>
                                        <td class="px-6 py-4 text-right text-sm font-black text-slate-900 dark:text-white" x-text="'<?php echo $settings['currency_symbol'] ?? '৳'; ?>' + parseFloat(s.rate).toFixed(2)"></td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>
            </template>

            <!-- Raw Debug -->
            <div class="bg-[#09090b] rounded-md p-6 border border-white/5 shadow-2xl">
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Raw JSON Protocol Data</p>
                <pre class="text-[11px] font-mono text-cyan-400 overflow-x-auto" x-text="JSON.stringify(results, null, 4)"></pre>
            </div>
        </div>
    </template>

</div>