<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

$id = (int)$_GET['id'];
$u = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM users WHERE id = $id"));
if(!$u) { echo "User not found"; exit; }
?>

<div class="max-w-5xl mx-auto space-y-6 pb-24">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
            <button @click="loadPage('users')" class="p-2 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm"><i class="fa-solid fa-arrow-left"></i></button>
            <h2 class="text-xl font-bold uppercase tracking-tight">Edit Profile: <?php echo $u['username']; ?></h2>
        </div>
        <span class="text-[10px] font-black text-slate-400 uppercase bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-md">Joined <?php echo date('d M, Y', strtotime($u['created_at'])); ?></span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- LEFT: Profile & Balance -->
        <div class="lg:col-span-2 space-y-6">
            <!-- Balance Adjustment -->
            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-primary/5">
                    <h3 class="text-[10px] font-black uppercase text-primary tracking-widest">Financial Control</h3>
                </div>
                <form action="api/user_actions.php" method="POST" class="p-6 space-y-6">
                    <input type="hidden" name="id" value="<?php echo $id; ?>">
                    <input type="hidden" name="action" value="adjust_balance">
                    
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
                        <p class="text-xs font-bold text-slate-500 uppercase">Current Balance</p>
                        <p class="text-2xl font-black text-slate-900 dark:text-white"><?php echo $settings['currency_symbol'] . number_format($u['balance'], 2); ?></p>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount</label>
                            <input type="number" name="amount" step="0.01" required placeholder="0.00" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Operation</label>
                            <select name="type" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                                <option value="add">Add to Balance (+)</option>
                                <option value="subtract">Deduct from Balance (-)</option>
                            </select>
                        </div>
                    </div>
                    <button type="submit" class="bg-primary text-white font-black px-6 py-2.5 rounded-md text-[10px] uppercase tracking-widest shadow-md">Update Funds</button>
                </form>
            </div>

            <!-- Profile Info -->
            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50">
                    <h3 class="text-[10px] font-black uppercase tracking-widest">Account Details</h3>
                </div>
                <form action="api/user_actions.php" method="POST" class="p-6 space-y-6">
                    <input type="hidden" name="id" value="<?php echo $id; ?>">
                    <input type="hidden" name="action" value="update_profile">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username</label>
                            <input type="text" name="username" value="<?php echo $u['username']; ?>" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                            <input type="email" name="email" value="<?php echo $u['email']; ?>" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                        </div>
                    </div>
                    <button type="submit" class="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black px-6 py-2.5 rounded-md text-[10px] uppercase tracking-widest transition active:scale-95">Update Profile</button>
                </form>
            </div>
        </div>

        <!-- RIGHT: Permissions & Danger -->
        <div class="space-y-6">
            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50">
                    <h3 class="text-[10px] font-black uppercase tracking-widest">Permissions</h3>
                </div>
                <div class="p-6 space-y-4">
                    <!-- Status -->
                    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
                        <span class="text-xs font-bold text-slate-600 dark:text-slate-400">Account Status</span>
                        <a href="api/user_actions.php?action=toggle_status&id=<?php echo $id; ?>" class="px-3 py-1 rounded-md text-[9px] font-black uppercase <?php echo $u['status'] == 'active' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'; ?>">
                            <?php echo $u['status']; ?>
                        </a>
                    </div>
                    <!-- Order Toggle -->
                    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-md">
                        <span class="text-xs font-bold text-slate-600 dark:text-slate-400">Ordering Ability</span>
                        <a href="api/user_actions.php?action=toggle_order&id=<?php echo $id; ?>" class="px-3 py-1 rounded-md text-[9px] font-black uppercase <?php echo $u['can_order'] == 1 ? 'bg-primary text-white' : 'bg-slate-400 text-white'; ?>">
                            <?php echo $u['can_order'] == 1 ? 'Enabled' : 'Disabled'; ?>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Danger Zone -->
            <div class="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-md p-6">
                <h3 class="text-[10px] font-black uppercase text-red-600 dark:text-red-400 tracking-widest mb-4">Danger Zone</h3>
                <p class="text-[10px] text-red-500 font-bold uppercase leading-relaxed mb-4">Deleting a user is permanent. All history and balance data will be lost.</p>
                <a href="api/user_actions.php?action=delete&id=<?php echo $id; ?>" onclick="return confirm('Permanently delete this user?')" class="block text-center bg-red-600 text-white font-black py-2 rounded-md text-[10px] uppercase tracking-widest hover:bg-red-700 transition">Delete User Account</a>
            </div>
        </div>

    </div>
</div>