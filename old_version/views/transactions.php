<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
$user = getLoggedUser($conn);

// 1. Fetch active gateways
$gateways = mysqli_fetch_all(mysqli_query($conn, "SELECT * FROM gateways WHERE status=1"), MYSQLI_ASSOC);
$fee_percent = (float)($settings['processing_fee_percent'] ?? 5.00);

// 2. Fetch Recent Transactions for this user
$uid = (int)$user['id'];
$sql = "SELECT * FROM payments WHERE user_id = $uid ORDER BY id DESC LIMIT 10";
$res = mysqli_query($conn, $sql);
$history = ($res) ? mysqli_fetch_all($res, MYSQLI_ASSOC) : [];
?>

<div class="max-w-xl mx-auto space-y-8 pb-32" x-data="{ 
    amount: '', 
    fee: <?php echo $fee_percent; ?>,
    get feeAmount() { return (this.amount * (this.fee / 100)).toFixed(2); },
    get finalAmount() { return (parseFloat(this.amount || 0) + (parseFloat(this.amount || 0) * (this.fee / 100))).toFixed(2); }
}">
    
    <!-- ADD FUNDS FORM -->
    <div class="space-y-6">
        <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Add Funds</h2>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Select payment method and add balance</p>
        </div>

        <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
            <form action="api/initiate_payment.php" method="POST" class="p-8 space-y-6">
                
                <!-- Gateway Selection -->
                <div class="space-y-3">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Payment Method</label>
                    <div class="grid grid-cols-1 gap-2">
                        <?php foreach($gateways as $gw): ?>
                        <label class="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md cursor-pointer hover:border-primary transition group">
                            <input type="radio" name="gateway" value="<?php echo $gw['name']; ?>" required class="text-primary focus:ring-primary">
                            <span class="text-sm font-bold text-slate-700 dark:text-slate-200"><?php echo $gw['display_name']; ?></span>
                        </label>
                        <?php endforeach; ?>
                    </div>
                </div>

                <!-- Amount Input -->
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Deposit Amount (<?php echo $settings['currency_symbol']; ?>)</label>
                    <input type="number" name="amount" x-model="amount" step="0.01" required placeholder="0.00" 
                        class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition">
                </div>

                <!-- Fee Breakdown -->
                <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-100 dark:border-slate-800 space-y-2">
                    <div class="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Processing Fee (<span x-text="fee + '%'"></span>)</span>
                        <span x-text="'<?php echo $settings['currency_symbol']; ?>' + feeAmount"></span>
                    </div>
                    <div class="flex justify-between font-black text-slate-900 dark:text-white uppercase tracking-tight pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span>Total to Pay</span>
                        <span class="text-primary" x-text="'<?php echo $settings['currency_symbol']; ?>' + finalAmount"></span>
                    </div>
                </div>

                <button type="submit" class="w-full bg-primary text-white font-black py-4 rounded-md shadow-lg shadow-primary/20 hover:opacity-95 transition transform active:scale-95 uppercase tracking-[0.2em] text-[11px]">
                    Proceed to Payment
                </button>
            </form>
        </div>
    </div>

    <!-- RECENT TRANSACTIONS TABLE -->
    <div class="space-y-6">
        <div>
            <h2 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Recent Deposits</h2>
            <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Your last 10 payment attempts</p>
        </div>

        <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <tr class="text-[9px] font-black uppercase text-slate-400 tracking-widest">
                            <th class="px-6 py-3">ID / Date</th>
                            <th class="px-6 py-3">Amount</th>
                            <th class="px-6 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                        <?php if(empty($history)): ?>
                            <tr><td colspan="3" class="px-6 py-10 text-center text-slate-400 text-[10px] font-bold uppercase italic tracking-widest">No transaction records found</td></tr>
                        <?php else: ?>
                            <?php foreach($history as $p): 
                                $s = strtolower($p['status']);
                                $statusClass = 'bg-slate-100 text-slate-500 border-slate-200'; // Default
                                if($s === 'completed') $statusClass = 'bg-green-500/10 text-green-600 border-green-500/20';
                                if($s === 'pending')   $statusClass = 'bg-amber-500/10 text-amber-600 border-amber-500/20';
                                if($s === 'failed')    $statusClass = 'bg-red-500/10 text-red-600 border-red-500/20';
                            ?>
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                                <td class="px-6 py-4">
                                    <p class="text-xs font-mono font-bold text-slate-400 uppercase"><?php echo substr($p['transaction_id'], 0, 10); ?>...</p>
                                    <p class="text-[9px] font-bold text-slate-500 uppercase mt-0.5"><?php echo date('d M, Y', strtotime($p['created_at'])); ?></p>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-sm font-black text-slate-900 dark:text-white">
                                        <?php echo ($settings['currency_symbol'] ?? '$') . number_format($p['amount'], 2); ?>
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <span class="px-2 py-0.5 rounded-md text-[8px] font-black uppercase border italic <?php echo $statusClass; ?>">
                                        <?php echo ($s === 'failed') ? 'Cancelled' : $s; ?>
                                    </span>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>