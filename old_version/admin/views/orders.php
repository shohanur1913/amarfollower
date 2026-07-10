<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

// 1. URL Filters
$status_filter = $_GET['status'] ?? 'all';
$search_query = mysqli_real_escape_string($conn, (string)($_GET['search'] ?? ''));

// 2. Dashboard Stats (Calculated in real-time)
$stats = [
    'pending'   => mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(id) as count FROM orders WHERE status='pending'"))['count'] ?? 0,
    'active'    => mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(id) as count FROM orders WHERE status='processing'"))['count'] ?? 0,
    'completed' => mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(id) as count FROM orders WHERE status='completed'"))['count'] ?? 0,
    'revenue'   => mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(charge) as total FROM orders WHERE status != 'cancelled'"))['total'] ?? 0
];

// 3. Main Query: Join Users, Services and Providers
$sql = "SELECT o.*, u.username, u.email, s.name as service_name, p.name as provider_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        LEFT JOIN services s ON o.service_id = s.id 
        LEFT JOIN providers p ON o.provider_id = p.id
        WHERE 1=1";

if ($status_filter !== 'all') { $sql .= " AND o.status = '$status_filter'"; }
if (!empty($search_query)) { 
    $sql .= " AND (o.link LIKE '%$search_query%' OR o.id LIKE '%$search_query%' OR u.username LIKE '%$search_query%')"; 
}

$sql .= " ORDER BY o.id DESC";
$result = mysqli_query($conn, $sql);
$orders = ($result) ? mysqli_fetch_all($result, MYSQLI_ASSOC) : [];
?>

<div class="space-y-6 pb-24" x-data="{
    selectedIds: [],
    selectAll: false,
    orders: <?php echo htmlspecialchars(json_encode($orders), ENT_QUOTES, 'UTF-8'); ?>,

    toggleAll() {
        this.selectedIds = this.selectAll ? this.orders.map(o => o.id.toString()) : [];
    },

    // AJAX: Update Status via Icons
    async quickUpdate(id, newStatus) {
        let fd = new FormData();
        fd.append('action', 'update_status');
        fd.append('order_id', id);
        fd.append('status', newStatus);
        
        const res = await fetch('api/order_actions.php', { method: 'POST', body: fd });
        const data = await res.json();
        if(data.success) {
            this.orders.find(o => o.id == id).status = newStatus;
            window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'Order #' + id + ' set to ' + newStatus}}));
        }
    },

    // AJAX: Bulk Actions
    async bulkAction(action) {
        if(this.selectedIds.length === 0) return;
        if(!confirm('Execute ' + action + ' on ' + this.selectedIds.length + ' orders?')) return;
        
        let fd = new FormData();
        fd.append('action', 'bulk_' + action);
        fd.append('ids', JSON.stringify(this.selectedIds));
        
        const res = await fetch('api/order_actions.php', { method: 'POST', body: fd });
        const data = await res.json();
        if(data.success) {
            window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'Bulk ' + action + ' complete'}}));
            loadPage('orders'); // Refresh list
        }
    },

    // AJAX: Live Provider Sync
    async syncAPI(id) {
        window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'Contacting Provider API...'}}));
        const res = await fetch(`api/order_actions.php?action=sync_api&id=${id}`);
        const data = await res.json();
        if(data.success) {
            this.orders.find(o => o.id == id).status = data.new_status;
            window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'Sync Success: ' + data.new_status}}));
        } else {
            window.dispatchEvent(new CustomEvent('notify', {detail: {message: data.message, type: 'error'}}));
        }
    }
}">
    
    <!-- 1. COMPACT STATS GRID -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div class="bg-white dark:bg-[#18181b] p-4 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Waiting</p>
            <p class="text-lg font-bold text-amber-500 mt-1"><?php echo number_format($stats['pending']); ?></p>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-4 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Active</p>
            <p class="text-lg font-bold text-blue-500 mt-1"><?php echo number_format($stats['active']); ?></p>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-4 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Completed</p>
            <p class="text-lg font-bold text-green-600 mt-1"><?php echo number_format($stats['completed']); ?></p>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-4 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Revenue</p>
            <p class="text-lg font-black text-slate-900 dark:text-white mt-1"><?php echo ($settings['currency_symbol'] ?? '৳') . number_format($stats['revenue'], 2); ?></p>
        </div>
    </div>

    <!-- 2. FILTER & BULK BAR -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-3 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            <?php foreach(['all', 'pending', 'processing', 'completed', 'cancelled'] as $tab): ?>
                <button @click="loadPage('orders&status=<?php echo $tab; ?>')" 
                    class="px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all
                    <?php echo ($status_filter === $tab) ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'; ?>">
                    <?php echo $tab; ?>
                </button>
            <?php endforeach; ?>
        </div>

        <div class="flex items-center gap-2">
            <!-- Bulk Action Icons (Show only when items selected) -->
            <div x-show="selectedIds.length > 0" x-transition class="flex items-center gap-1 mr-2 border-r border-slate-200 dark:border-slate-800 pr-2">
                <button @click="bulkAction('completed')" title="Bulk Complete" class="p-2 text-green-600 hover:bg-green-50 rounded-md"><i class="fa-solid fa-check-double"></i></button>
                <button @click="bulkAction('cancelled')" title="Bulk Cancel" class="p-2 text-red-600 hover:bg-red-50 rounded-md"><i class="fa-solid fa-ban"></i></button>
                <button @click="bulkAction('delete')" title="Bulk Delete" class="p-2 text-slate-900 dark:text-white hover:bg-slate-100 rounded-md"><i class="fa-solid fa-trash-can"></i></button>
            </div>
            
            <div class="relative">
                <input type="text" placeholder="Search orders..." @keyup.enter="loadPage('orders&search=' + $event.target.value)" 
                    class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-8 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-primary w-48">
                <i class="fa-solid fa-magnifying-glass absolute left-2.5 top-2.5 text-slate-400 text-[10px]"></i>
            </div>
        </div>
    </div>

    <!-- 3. MAIN TABLE -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <tr class="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <th class="px-4 py-4 w-10"><input type="checkbox" x-model="selectAll" @change="toggleAll()" class="rounded border-slate-300 text-primary"></th>
                        <th class="px-4 py-4">Customer</th>
                        <th class="px-4 py-4">Service & Cost</th>
                        <th class="px-4 py-4 text-center">Status</th>
                        <th class="px-4 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <template x-for="o in orders" :key="o.id">
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                            <td class="px-4 py-4"><input type="checkbox" :value="o.id" x-model="selectedIds" class="rounded border-slate-300 text-primary"></td>
                            <td class="px-4 py-4">
                                <p class="text-xs font-bold text-slate-700 dark:text-slate-200" x-text="o.username"></p>
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-tighter" x-text="o.email"></p>
                            </td>
                            <td class="px-4 py-4">
                                <p class="text-xs font-bold text-slate-600 dark:text-slate-400 truncate w-48" x-text="o.service_name"></p>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded" x-text="'#'+o.id"></span>
                                    <span class="text-[9px] font-black text-primary" x-text="'<?php echo ($settings['currency_symbol'] ?? '৳'); ?>'+parseFloat(o.charge).toFixed(3)"></span>
                                </div>
                            </td>
                            <td class="px-4 py-4 text-center">
                                <span :class="{
                                    'bg-amber-500/10 text-amber-600 border-amber-500/20': o.status === 'pending',
                                    'bg-blue-500/10 text-blue-600 border-blue-500/20': o.status === 'processing',
                                    'bg-green-500/10 text-green-600 border-green-500/20': o.status === 'completed',
                                    'bg-red-500/10 text-red-600 border-red-500/20': o.status === 'cancelled'
                                }" class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border italic" x-text="o.status"></span>
                            </td>
                            <td class="px-4 py-4 text-right">
                                <div class="flex items-center justify-end gap-1">
                                    <!-- Sync API -->
                                    <button @click="syncAPI(o.id)" title="Sync with Provider" class="p-2 text-slate-400 hover:text-blue-500 transition hover:bg-blue-50 rounded-md"><i class="fa-solid fa-arrows-rotate text-xs"></i></button>
                                    <!-- Quick Complete -->
                                    <button @click="quickUpdate(o.id, 'completed')" title="Mark Completed" class="p-2 text-slate-400 hover:text-green-500 transition hover:bg-green-50 rounded-md"><i class="fa-solid fa-circle-check text-xs"></i></button>
                                    <!-- Quick Cancel -->
                                    <button @click="quickUpdate(o.id, 'cancelled')" title="Mark Cancelled" class="p-2 text-slate-400 hover:text-red-500 transition hover:bg-red-50 rounded-md"><i class="fa-solid fa-circle-xmark text-xs"></i></button>
                                    <!-- Trash -->
                                    <button @click="selectedIds=[o.id.toString()]; bulkAction('delete')" title="Delete Order" class="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition hover:bg-slate-100 rounded-md"><i class="fa-solid fa-trash-can text-xs"></i></button>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</div>