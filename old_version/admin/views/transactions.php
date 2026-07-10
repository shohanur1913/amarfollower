<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

// 1. Fetch Summary Stats for the Header
$total_stats = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(amount) as net, SUM(fee_amount) as fees FROM payments WHERE status='completed'"));
$net_collected = $total_stats['net'] ?? 0;
$fees_collected = $total_stats['fees'] ?? 0;

// 2. Fetch All Transactions joined with User Data
$sql = "SELECT p.*, u.username, u.email, u.id as uid 
        FROM payments p 
        LEFT JOIN users u ON p.user_id = u.id 
        ORDER BY p.id DESC";
$result = mysqli_query($conn, $sql);
$payments = ($result) ? mysqli_fetch_all($result, MYSQLI_ASSOC) : [];

// 3. Get unique gateways for the filter dropdown
$gateways_list = mysqli_query($conn, "SELECT DISTINCT gateway FROM payments");
?>

<div class="space-y-6 pb-24" x-data="{ 
    search: '',
    statusFilter: '',
    gatewayFilter: '',
    payments: <?php echo htmlspecialchars(json_encode($payments), ENT_QUOTES, 'UTF-8'); ?>,
    
    // THE FILTER ENGINE
    get filteredPayments() {
        return this.payments.filter(p => {
            const matchesSearch = (p.email?.toLowerCase().includes(this.search.toLowerCase()) || 
                                   p.transaction_id?.toLowerCase().includes(this.search.toLowerCase()) ||
                                   p.username?.toLowerCase().includes(this.search.toLowerCase()) ||
                                   p.uid.toString().includes(this.search));
            const matchesStatus = this.statusFilter === '' || p.status === this.statusFilter;
            const matchesGateway = this.gatewayFilter === '' || p.gateway === this.gatewayFilter;
            
            return matchesSearch && matchesStatus && matchesGateway;
        });
    },

    updateStatus(id, newStatus) {
        if(!confirm('Update balance logic for this user?')) return;
        let fd = new FormData();
        fd.append('id', id);
        fd.append('status', newStatus);
        fetch('api/payment_actions.php', { method: 'POST', body: fd })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'Finance record updated'}}));
                    loadPage('transactions');
                }
            });
    }
}">

    <!-- 1. FINANCE OVERVIEW CARDS -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-white dark:bg-[#18181b] p-5 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Net Revenue (Success)</p>
                <p class="text-2xl font-bold text-slate-900 dark:text-white mt-2"><?php echo $settings['currency_symbol'] . number_format($net_collected, 2); ?></p>
            </div>
            <div class="h-12 w-12 bg-green-500/10 text-green-600 rounded-md flex items-center justify-center text-xl"><i class="fa-solid fa-money-bill-trend-up"></i></div>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-5 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Fees Collected</p>
                <p class="text-2xl font-bold text-slate-900 dark:text-white mt-2"><?php echo $settings['currency_symbol'] . number_format($fees_collected, 2); ?></p>
            </div>
            <div class="h-12 w-12 bg-primary/10 text-primary rounded-md flex items-center justify-center text-xl"><i class="fa-solid fa-percent"></i></div>
        </div>
    </div>

    <!-- 2. SMART FILTER BAR -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div class="relative group">
                <input type="text" x-model="search" placeholder="Search Email, TXN, ID..." 
                    class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-10 py-2 text-xs font-bold outline-none focus:border-primary transition">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-2.5 text-slate-400 group-focus-within:text-primary transition text-[10px]"></i>
            </div>
            
            <select x-model="statusFilter" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs font-bold outline-none">
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed/Cancelled</option>
            </select>

            <select x-model="gatewayFilter" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-3 py-2 text-xs font-bold outline-none">
                <option value="">All Gateways</option>
                <?php while($gw = mysqli_fetch_assoc($gateways_list)): ?>
                    <option value="<?php echo $gw['gateway']; ?>"><?php echo ucfirst($gw['gateway']); ?></option>
                <?php endwhile; ?>
            </select>

            <div class="flex items-center justify-end px-2">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest" x-text="filteredPayments.length + ' Results'"></span>
            </div>
        </div>
    </div>

    <!-- 3. TRANSACTIONS TABLE -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Identity</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Financial Detail</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Gateway/TXN</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Action</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Date/Time</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <template x-for="p in filteredPayments" :key="p.id">
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                            <!-- Client Info -->
                            <td class="px-6 py-4">
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200" x-text="p.username"></span>
                                    <div class="flex items-center gap-2 mt-0.5">
                                        <span class="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded" x-text="'UID: ' + p.uid"></span>
                                        <span class="text-[9px] font-bold text-slate-400 truncate w-32" x-text="p.email"></span>
                                    </div>
                                </div>
                            </td>

                            <!-- Money Info -->
                            <td class="px-6 py-4">
                                <div class="flex flex-col">
                                    <span class="text-sm font-black text-slate-900 dark:text-white" x-text="'<?php echo $settings['currency_symbol']; ?>' + parseFloat(p.amount).toFixed(2)"></span>
                                    <p class="text-[9px] font-bold text-red-400 uppercase tracking-tighter" x-text="'+ ' + p.fee_amount + ' fee charged'"></p>
                                </div>
                            </td>
                            
                            <!-- TXN Info -->
                            <td class="px-6 py-4">
                                <div class="flex flex-col">
                                    <span class="text-[10px] font-black text-primary uppercase tracking-widest" x-text="p.gateway"></span>
                                    <span class="text-xs font-mono text-slate-500 mt-1 select-all" x-text="p.transaction_id"></span>
                                </div>
                            </td>

                            <!-- Control -->
                            <td class="px-6 py-4">
                                <select @change="updateStatus(p.id, $event.target.value)" 
                                    :class="{
                                        'bg-amber-500/10 text-amber-600': p.status === 'pending',
                                        'bg-green-500/10 text-green-600': p.status === 'completed',
                                        'bg-red-500/10 text-red-600': p.status === 'failed'
                                    }"
                                    class="border-none rounded-md px-2 py-1 text-[10px] font-black uppercase outline-none transition focus:ring-2 focus:ring-primary/20">
                                    <option value="pending" :selected="p.status === 'pending'">Pending</option>
                                    <option value="completed" :selected="p.status === 'completed'">Completed</option>
                                    <option value="failed" :selected="p.status === 'failed'">Failed</option>
                                </select>
                            </td>
                            
                            <!-- Date -->
                            <td class="px-6 py-4 text-right">
                                <div class="flex flex-col">
                                    <span class="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase" x-text="p.created_at.split(' ')[0]"></span>
                                    <span class="text-[9px] font-medium text-slate-400 uppercase" x-text="p.created_at.split(' ')[1]"></span>
                                </div>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</div>
