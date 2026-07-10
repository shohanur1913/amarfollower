<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
require_once '../../includes/smm_api.php';
checkAdmin();

$api = new SmmGenAPI();
$sql = "SELECT * FROM providers ORDER BY id DESC";
$res = mysqli_query($conn, $sql);
$providers = mysqli_fetch_all($res, MYSQLI_ASSOC);
?>

<div class="space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">API Providers</h2>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">External panel connections</p>
        </div>
        <button @click="loadPage('add_provider')" class="bg-primary text-white font-black px-5 py-2 rounded-md shadow-sm text-[10px] uppercase tracking-widest hover:opacity-90 transition">+ Add Provider</button>
    </div>

    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <table class="w-full text-left">
            <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <tr>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider Name</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">API Balance</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <?php foreach($providers as $p): 
                    // Fetch real-time balance from SMMGen
                    $balData = $api->request($p['api_url'], ['key' => $p['api_key'], 'action' => 'balance']);
                    $balance = $balData['balance'] ?? 'Error';
                ?>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td class="px-6 py-4 text-xs font-bold text-slate-400">#<?php echo $p['id']; ?></td>
                    <td class="px-6 py-4">
                        <span class="text-sm font-bold text-slate-700 dark:text-slate-200"><?php echo $p['name']; ?></span>
                        <p class="text-[9px] text-slate-400 truncate w-48"><?php echo $p['api_url']; ?></p>
                    </td>
                    <td class="px-6 py-4">
                        <span class="px-2 py-1 rounded-md bg-green-500/10 text-green-600 text-[10px] font-black border border-green-500/20 italic">
                            $<?php echo $balance; ?>
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right space-x-3">
                        <button @click="loadPage('edit_provider&id=<?php echo $p['id']; ?>')" class="text-primary font-bold text-[10px] uppercase tracking-widest hover:underline">Edit</button>
                    </td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
