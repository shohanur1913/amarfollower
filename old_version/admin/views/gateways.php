<?php
// CRITICAL: Double dots to go up from admin/views/ to root
require_once '../../includes/config.php'; 
require_once '../../includes/auth.php'; 
checkAdmin();

// Fetch all gateways for the management table
$sql = "SELECT * FROM gateways ORDER BY id ASC";
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo "<div class='p-4 bg-red-500/10 text-red-500 rounded-md border border-red-500/20'>SQL Error: " . mysqli_error($conn) . "</div>";
    $gateways = [];
} else {
    $gateways = mysqli_fetch_all($result, MYSQLI_ASSOC);
}
?>

<div class="space-y-6" x-data="{ search: '' }">
    
    <!-- Top Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Payment Gateways</h2>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Configure automated payment methods</p>
        </div>
        
        <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="relative group">
                <input type="text" x-model="search" placeholder="Filter gateways..." 
                    class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md px-10 py-2.5 text-xs outline-none focus:border-primary transition w-48 lg:w-64 font-bold shadow-sm">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 group-focus-within:text-primary transition text-xs"></i>
            </div>
        </div>
    </div>

    <!-- Gateway Table Card -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Identity</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Endpoint URL</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Currency</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <?php if (empty($gateways)): ?>
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center">
                                <i class="fa-solid fa-credit-card text-4xl text-slate-200 dark:text-slate-800 mb-2 block"></i>
                                <p class="text-slate-500 font-bold text-xs uppercase tracking-widest">No Gateways Configured</p>
                            </td>
                        </tr>
                    <?php else: ?>
                        <?php foreach($gateways as $gw): ?>
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group" 
                            x-show="'<?php echo strtolower($gw['display_name']); ?>'.includes(search.toLowerCase())">
                            
                            <!-- Display Name & Icon -->
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="h-9 w-9 bg-primary/5 border border-primary/10 rounded-md flex items-center justify-center text-primary transition group-hover:scale-105 shadow-sm">
                                        <i class="fa-solid fa-building-columns text-sm"></i>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight"><?php echo $gw['display_name']; ?></span>
                                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5"><?php echo $gw['name']; ?></span>
                                    </div>
                                </div>
                            </td>
                            
                            <!-- Base URL -->
                            <td class="px-6 py-4">
                                <span class="text-xs font-mono text-slate-500 dark:text-slate-400 opacity-70">
                                    <?php echo $gw['base_url']; ?>
                                </span>
                            </td>

                            <!-- Currency -->
                            <td class="px-6 py-4">
                                <span class="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-slate-700">
                                    <?php echo $gw['currency']; ?>
                                </span>
                            </td>
                            
                            <!-- Status Badge -->
                            <td class="px-6 py-4">
                                <?php if($gw['status'] == 1): ?>
                                    <span class="px-2.5 py-0.5 rounded-md bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-widest border border-green-500/20 italic">Live</span>
                                <?php else: ?>
                                    <span class="px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-600 text-[9px] font-black uppercase tracking-widest border border-red-500/20 italic">Disabled</span>
                                <?php endif; ?>
                            </td>
                            
                            <!-- Control Actions -->
                            <td class="px-6 py-4 text-right">
                                <button @click="loadPage('edit_gateway&id=<?php echo $gw['id']; ?>')" 
                                    class="bg-white dark:bg-[#1d1d21] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm hover:border-primary hover:text-primary transition">
                                    Configure
                                </button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Security Component (Filament Style) -->
    <div class="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-4 flex items-start gap-3">
        <i class="fa-solid fa-shield-halved text-slate-400 mt-0.5 text-lg"></i>
        <p class="text-[11px] text-slate-500 font-medium leading-relaxed">
            Automated gateways require valid <span class="text-primary font-bold uppercase tracking-tighter">API Keys</span> and callback URLs. 
            Ensure your server allows outbound cURL requests to the endpoint URL. 
            For <span class="font-bold">Paymently</span>, the default base URL is <span class="font-mono bg-slate-100 dark:bg-slate-800 px-1 rounded">https://paymently.link</span>.
        </p>
    </div>
</div>
                                    