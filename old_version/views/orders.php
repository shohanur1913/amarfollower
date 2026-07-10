<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
$user = getLoggedUser($conn);

// Get Filter Status & Search
$status_filter = $_GET['status'] ?? 'all';
$search_query = mysqli_real_escape_string($conn, (string)($_GET['search'] ?? ''));

// Build Query
$sql = "SELECT o.*, s.name as service_name, s.guarantee 
        FROM orders o 
        LEFT JOIN services s ON o.service_id = s.id 
        WHERE o.user_id = {$user['id']}";

if ($status_filter !== 'all') {
    $sql .= " AND o.status = '$status_filter'";
}
if (!empty($search_query)) {
    $sql .= " AND (o.link LIKE '%$search_query%' OR o.id LIKE '%$search_query%')";
}

$sql .= " ORDER BY o.id DESC";
$result = mysqli_query($conn, $sql);
$orders = ($result) ? mysqli_fetch_all($result, MYSQLI_ASSOC) : [];
?>

<div class="space-y-6 pb-24" x-data="{ 
    search: '<?php echo $search_query; ?>',
    requestRefill(orderId) {
        if(!confirm('Request a refill for this order?')) return;
        
        let fd = new FormData();
        fd.append('order_id', orderId);

        fetch('api/request_refill.php', { method: 'POST', body: fd })
            .then(r => r.json())
            .then(data => {
                window.dispatchEvent(new CustomEvent('notify', {
                    detail: { message: data.message, type: data.success ? 'success' : 'error' }
                }));
            });
    }
}">
    
    <!-- 1. Header & Search -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">My Orders</h2>
            <p class="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">History of your service deployments</p>
        </div>
        
        <div class="relative group max-w-sm w-full">
            <input type="text" x-model="search" @keyup.enter="loadPage('orders&search=' + search)" 
                placeholder="Find order ID or link..." 
                class="w-full bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md px-10 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20 transition font-bold shadow-sm">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 group-focus-within:text-primary transition text-xs"></i>
        </div>
    </div>

    <!-- 2. Status Navigation -->
    <div class="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide">
        <?php 
        $tabs = ['all', 'pending', 'processing', 'completed', 'cancelled', 'refunded'];
        foreach($tabs as $tab): 
            $active = ($status_filter === $tab);
        ?>
            <button @click="loadPage('orders&status=<?php echo $tab; ?>')" 
                class="px-4 py-2 rounded-md text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap border
                <?php echo $active ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white dark:bg-[#18181b] text-slate-500 border-slate-200 dark:border-slate-800 hover:border-primary/40'; ?>">
                <?php echo $tab; ?>
            </button>
        <?php endforeach; ?>
    </div>

    <!-- 3. Orders Table -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <tr class="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">Service</th>
                        <th class="px-6 py-4">Target / Qty</th>
                        <th class="px-6 py-4">Cost</th>
                        <th class="px-6 py-4 text-center">Status</th>
                        <th class="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <?php if (empty($orders)): ?>
                        <tr><td colspan="6" class="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase italic tracking-widest leading-loose">No transaction records found<br><button @click="loadPage('dashboard')" class="text-primary underline">Place your first order</button></td></tr>
                    <?php else: ?>
                        <?php foreach($orders as $o): 
                            $status = strtolower($o['status']);
                            $badgeClass = [
                                'pending'    => 'bg-amber-500/10 text-amber-600 border-amber-500/20',
                                'processing' => 'bg-blue-500/10 text-blue-600 border-blue-500/20',
                                'completed'  => 'bg-green-500/10 text-green-600 border-green-500/20',
                                'cancelled'  => 'bg-red-500/10 text-red-600 border-red-500/20',
                                'refunded'   => 'bg-purple-500/10 text-purple-600 border-purple-500/20',
                            ][$status] ?? 'bg-slate-100 text-slate-600';
                        ?>
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                            <td class="px-6 py-4">
                                <span class="text-xs font-bold text-slate-400">#<?php echo $o['id']; ?></span>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex flex-col max-w-[220px]">
                                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200 truncate"><?php echo $o['service_name']; ?></span>
                                    <span class="text-[9px] font-black text-primary uppercase tracking-tighter mt-0.5">Refill: <?php echo $o['guarantee'] ?: 'No'; ?></span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <div class="flex flex-col">
                                    <a href="<?php echo $o['link']; ?>" target="_blank" class="text-xs font-bold text-blue-500 hover:underline truncate max-w-[150px]">
                                        <?php echo $o['link']; ?>
                                    </a>
                                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Quantity: <?php echo number_format($o['quantity']); ?></span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-sm font-black text-slate-900 dark:text-white">
                                    <?php echo ($settings['currency_symbol'] ?? '$') . number_format($o['charge'], 3); ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 text-center">
                                <span class="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border italic <?php echo $badgeClass; ?>">
                                    <?php echo $o['status']; ?>
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <!-- Refill Logic: Only if Completed -->
                                <?php if($status === 'completed'): ?>
                                    <button @click="requestRefill(<?php echo $o['id']; ?>)" 
                                        class="bg-slate-900 dark:bg-primary text-white text-[9px] font-black uppercase px-3 py-1.5 rounded-md shadow-sm transition transform active:scale-95 flex items-center gap-2 ml-auto">
                                        <i class="fa-solid fa-rotate-right text-[10px]"></i> Refill
                                    </button>
                                <?php else: ?>
                                    <span class="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase italic">Locked</span>
                                <?php endif; ?>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
                                    