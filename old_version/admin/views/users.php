<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

// 1. Fetch High Level Stats
$total_users = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(id) as count FROM users"))['count'] ?? 0;
$banned_users = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(id) as count FROM users WHERE status='banned'"))['count'] ?? 0;

// 2. Fetch User List
$sql = "SELECT id, username, email, balance, status, created_at FROM users ORDER BY id DESC";
$res = mysqli_query($conn, $sql);
$users = ($res) ? mysqli_fetch_all($res, MYSQLI_ASSOC) : [];
?>

<div class="space-y-6 pb-32" x-data="{ 
    search: '',
    users: <?php echo htmlspecialchars(json_encode($users), ENT_QUOTES, 'UTF-8'); ?>,
    
    get filteredUsers() {
        if (!this.search) return this.users;
        const s = this.search.toLowerCase();
        return this.users.filter(u => 
            u.username.toLowerCase().includes(s) || 
            u.email.toLowerCase().includes(s) || 
            u.id.toString().includes(s)
        );
    }
}">

    <!-- 1. RESPONSIVE STATS GRID -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div class="bg-white dark:bg-[#18181b] p-4 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Clients</p>
            <p class="text-lg font-bold text-slate-900 dark:text-white mt-1"><?php echo number_format($total_users); ?></p>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-4 rounded-md border border-slate-200 dark:border-slate-800 shadow-sm">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Banned Accounts</p>
            <p class="text-lg font-bold text-red-500 mt-1"><?php echo number_format($banned_users); ?></p>
        </div>
    </div>

    <!-- 2. SEARCH & HEADER -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
            <h2 class="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white">User Directory</h2>
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Manage <?php echo count($users); ?> registered profiles</p>
        </div>
        
        <div class="relative group w-full md:w-72">
            <input type="text" x-model="search" placeholder="Search name, email, id..." 
                class="w-full bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md px-10 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition shadow-sm">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 group-focus-within:text-primary transition text-xs"></i>
        </div>
    </div>

    <!-- 3. MOBILE-FRIENDLY TABLE -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <tr class="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <th class="px-4 py-4 md:px-6">User / Details</th>
                        <th class="px-4 py-4 text-center">Balance</th>
                        <th class="px-4 py-4 text-center hidden sm:table-cell">Status</th>
                        <th class="px-4 py-4 text-right">Action</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <!-- Empty State -->
                    <template x-if="filteredUsers.length === 0">
                        <tr><td colspan="4" class="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase italic tracking-widest">No matching users found</td></tr>
                    </template>

                    <!-- User Loop -->
                    <template x-for="u in filteredUsers" :key="u.id">
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                            <!-- Column 1: Identity -->
                            <td class="px-4 py-4 md:px-6">
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[120px] md:max-w-none" x-text="u.username"></span>
                                    <div class="flex items-center gap-1.5 mt-0.5">
                                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-tighter" x-text="'#' + u.id"></span>
                                        <span class="text-[9px] font-medium text-slate-400 truncate max-w-[100px] md:max-w-none" x-text="u.email"></span>
                                    </div>
                                    <!-- Mobile Only Status Badge -->
                                    <div class="sm:hidden mt-2">
                                        <span :class="u.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'" 
                                              class="px-2 py-0.5 rounded text-[8px] font-black uppercase italic" x-text="u.status"></span>
                                    </div>
                                </div>
                            </td>

                            <!-- Column 2: Financials -->
                            <td class="px-4 py-4 text-center">
                                <span class="text-sm font-black text-slate-900 dark:text-white" x-text="'<?php echo $settings['currency_symbol'] ?? '$'; ?>' + parseFloat(u.balance).toFixed(2)"></span>
                            </td>

                            <!-- Column 3: Desktop Status -->
                            <td class="px-4 py-4 text-center hidden sm:table-cell">
                                <span :class="u.status === 'active' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'" 
                                      class="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border italic" x-text="u.status"></span>
                            </td>

                            <!-- Column 4: Controls -->
                            <td class="px-4 py-4 text-right">
                                <button @click="loadPage('edit_user&id=' + u.id)" 
                                    class="bg-primary/10 text-primary hover:bg-primary hover:text-white px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition shadow-sm">
                                    Manage
                                </button>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Mobile Navigation Help -->
    <div class="md:hidden p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md">
        <p class="text-[9px] text-slate-500 font-bold text-center uppercase tracking-widest leading-none">Tap "Manage" to adjust balance or ban account</p>
    </div>

</div>
                                        