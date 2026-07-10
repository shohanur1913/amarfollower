<?php
// Two levels up to reach root includes
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

// Fetch Refills with User and Order details
$sql = "SELECT r.*, u.username, s.name as service_name 
        FROM refills r 
        LEFT JOIN users u ON r.user_id = u.id 
        LEFT JOIN orders o ON r.order_id = o.id
        LEFT JOIN services s ON o.service_id = s.id
        ORDER BY (r.status = 'pending') DESC, r.id DESC";

$result = mysqli_query($conn, $sql);
$refills = ($result) ? mysqli_fetch_all($result, MYSQLI_ASSOC) : [];
?>

<div class="space-y-6 pb-24" x-data="{
    updateStatus(id, newStatus) {
        if(!confirm('Update refill status?')) return;
        
        let fd = new FormData();
        fd.append('id', id);
        fd.append('status', newStatus);

        fetch('api/refill_actions.php', { method: 'POST', body: fd })
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    window.dispatchEvent(new CustomEvent('show-toast', {detail: {message: 'Status updated successfully'}}));
                    loadPage('refills');
                } else {
                    alert('Error: ' + data.message);
                }
            });
    }
}">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Refill Requests</h2>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Manage customer guarantee claims</p>
        </div>
    </div>

    <!-- Main Table -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                    <tr>
                        <th class="px-6 py-4">ID</th>
                        <th class="px-6 py-4">User / Order</th>
                        <th class="px-6 py-4">Service</th>
                        <th class="px-6 py-4">Status Control</th>
                        <th class="px-6 py-4 text-right">Date</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <?php if (empty($refills)): ?>
                        <tr><td colspan="5" class="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase italic tracking-widest">No refill requests found</td></tr>
                    <?php else: ?>
                        <?php foreach($refills as $r): ?>
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <td class="px-6 py-4 text-xs font-bold text-slate-400">#<?php echo $r['id']; ?></td>
                            <td class="px-6 py-4">
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200"><?php echo $r['username'] ?? 'Deleted User'; ?></span>
                                    <span class="text-[9px] font-black text-primary uppercase">Order ID: #<?php echo $r['order_id']; ?></span>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-xs font-bold text-slate-500 truncate w-48 block"><?php echo $r['service_name'] ?? 'Unknown Service'; ?></span>
                            </td>
                            <td class="px-6 py-4">
                                <select @change="updateStatus(<?php echo $r['id']; ?>, $event.target.value)" 
                                    class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-[10px] font-black uppercase outline-none focus:ring-1 focus:ring-primary transition">
                                    <option value="pending" <?php echo ($r['status'] == 'pending') ? 'selected' : ''; ?>>Pending</option>
                                    <option value="processing" <?php echo ($r['status'] == 'processing') ? 'selected' : ''; ?>>Processing</option>
                                    <option value="completed" <?php echo ($r['status'] == 'completed') ? 'selected' : ''; ?>>Completed</option>
                                    <option value="rejected" <?php echo ($r['status'] == 'rejected') ? 'selected' : ''; ?>>Rejected</option>
                                </select>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <span class="text-[10px] font-bold text-slate-400 uppercase"><?php echo date('d M, H:i', strtotime($r['created_at'])); ?></span>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>
