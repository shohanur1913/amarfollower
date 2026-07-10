<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

// Helper to run query safely
function getStat($conn, $sql) {
    $res = mysqli_query($conn, $sql);
    return ($res) ? mysqli_fetch_assoc($res) : ['val' => 0];
}

// Stats
$total_sales = mysqli_fetch_assoc(mysqli_query($conn, "SELECT SUM(charge) as total FROM orders WHERE status='completed'"))['total'] ?? 0;
$total_users = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(id) as count FROM users"))['count'] ?? 0;
$pending_orders = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(id) as count FROM orders WHERE status='pending'"))['count'] ?? 0;
$active_services = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(id) as count FROM services WHERE status=1"))['count'] ?? 0;

// Fetch Recent Orders (With fallback if columns missing)
$recent_orders = mysqli_fetch_all(mysqli_query($conn, "SELECT o.id, o.charge, o.status, u.username, s.name as service_name FROM orders o JOIN users u ON o.user_id = u.id JOIN services s ON o.service_id = s.id ORDER BY o.id DESC LIMIT 5"), MYSQLI_ASSOC);

// Fetch Newest Users
$new_users = mysqli_fetch_all(mysqli_query($conn, "SELECT username, email FROM users ORDER BY id DESC LIMIT 5"), MYSQLI_ASSOC);
?>

<div class="space-y-8" x-data="{ 
    initChart() {
        if(document.getElementById('revenueChart')) {
            new Chart(document.getElementById('revenueChart'), {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Revenue',
                        data: [10, 20, 15, 30, 25, 40, 35],
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: { responsive: true, plugins: { legend: { display: false } } }
            });
        }
    }
}" x-init="initChart()">

    <!-- 1. STATS GRID -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white dark:bg-[#18181b] p-5 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Revenue</p>
            <p class="text-lg font-black text-slate-900 dark:text-white mt-1"><?php echo $settings['currency_symbol'] . number_format($total_sales, 2); ?></p>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-5 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Users</p>
            <p class="text-lg font-black text-slate-900 dark:text-white mt-1"><?php echo $total_users; ?></p>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-5 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
            <p class="text-lg font-black text-amber-500 mt-1"><?php echo $pending_orders; ?></p>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-5 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Services</p>
            <p class="text-lg font-black text-slate-900 dark:text-white mt-1"><?php echo $active_services; ?></p>
        </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Revenue Chart -->
        <div class="lg:col-span-2 bg-white dark:bg-[#18181b] p-6 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">Revenue Trend</h3>
            <canvas id="revenueChart" height="150"></canvas>
        </div>

        <!-- Recent Clients -->
        <div class="bg-white dark:bg-[#18181b] rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Recent Signups</h3>
            </div>
            <div class="divide-y divide-slate-100 dark:divide-slate-800">
                <?php foreach($new_users as $u): ?>
                    <div class="px-6 py-4">
                        <p class="text-xs font-bold text-slate-700 dark:text-slate-200"><?php echo $u['username']; ?></p>
                        <p class="text-[9px] text-slate-400"><?php echo $u['email']; ?></p>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <!-- RECENT ORDERS TABLE -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 class="text-[10px] font-black uppercase tracking-widest">Latest Orders</h3>
            <button @click="loadPage('orders')" class="text-primary font-black text-[9px] uppercase hover:underline">View All</button>
        </div>
        <table class="w-full text-left">
            <thead class="bg-slate-50 dark:bg-slate-900/50 text-[9px] font-black uppercase text-slate-400">
                <tr>
                    <th class="px-6 py-3">User</th>
                    <th class="px-6 py-3">Service</th>
                    <th class="px-6 py-3">Charge</th>
                    <th class="px-6 py-3">Status</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <?php foreach($recent_orders as $o): ?>
                    <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td class="px-6 py-4 text-xs font-bold text-slate-700 dark:text-slate-200"><?php echo $o['username']; ?></td>
                        <td class="px-6 py-4 text-xs font-bold text-slate-500 truncate max-w-xs"><?php echo $o['service_name']; ?></td>
                        <td class="px-6 py-4 text-xs font-black text-slate-900 dark:text-white"><?php echo $settings['currency_symbol'] . $o['charge']; ?></td>
                        <td class="px-6 py-4">
                            <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-primary/10 text-primary"><?php echo $o['status']; ?></span>
                        </td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
