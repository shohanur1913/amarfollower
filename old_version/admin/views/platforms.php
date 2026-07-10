<?php
// Securely go up two levels to find config
require_once '../../includes/config.php'; 
require_once '../../includes/auth.php'; 
checkAdmin();

// Fetch all platforms for the management table
$sql = "SELECT * FROM platforms ORDER BY sort_order ASC";
$result = mysqli_query($conn, $sql);

if (!$result) {
    echo "<div class='p-4 bg-red-500/10 text-red-500 rounded-md border border-red-500/20'>SQL Error: " . mysqli_error($conn) . "</div>";
    $platforms = [];
} else {
    $platforms = mysqli_fetch_all($result, MYSQLI_ASSOC);
}
?>

<div class="space-y-6" x-data="{ search: '' }">
    
    <!-- Header & Action Bar -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Platform Grid</h2>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Manage Dashboard Iconic Navigation</p>
        </div>
        
        <div class="flex items-center gap-3">
            <!-- Search -->
            <div class="relative group">
                <input type="text" x-model="search" placeholder="Filter platforms..." 
                    class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md px-10 py-2.5 text-xs outline-none focus:border-primary transition w-48 lg:w-64 font-bold shadow-sm">
                <i class="ph ph-magnifying-glass absolute left-3.5 top-3 text-slate-400 group-focus-within:text-primary transition"></i>
            </div>
            
            <!-- Create Button -->
            <button @click="loadPage('add_platform')" 
                class="bg-primary text-white font-black px-6 py-2.5 rounded-md shadow-sm hover:opacity-90 transition text-[10px] uppercase tracking-widest flex items-center gap-2">
                <i class="ph ph-plus-bold"></i>
                Add Platform
            </button>
        </div>
    </div>

    <!-- Platform Table Card -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Order</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Identity</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <?php if (empty($platforms)): ?>
                        <tr>
                            <td class="px-6 py-4">
    <div class="h-10 w-10 bg-primary/5 border border-primary/10 rounded-md flex items-center justify-center text-primary transition group-hover:scale-110">
        <!-- We render the full class stored in the database -->
        <i class="<?php echo !empty($p['icon_class']) ? $p['icon_class'] : 'fa-solid fa-globe'; ?> text-lg"></i>
    </div>
</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach($platforms as $p): ?>
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group" 
                            x-show="'<?php echo strtolower($p['name']); ?>'.includes(search.toLowerCase())">
                            
                            <!-- Sort Order -->
                            <td class="px-6 py-4">
                                <span class="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-md text-[10px] font-black">
                                    <?php echo $p['sort_order']; ?>
                                </span>
                            </td>
                            
                            <!-- Name & Icon -->
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-4">
                                    <div class="h-10 w-10 bg-primary/5 border border-primary/10 rounded-md flex items-center justify-center text-primary transition group-hover:scale-110">
                                        <i class="<?php echo !empty($p['icon_class']) ? $p['icon_class'] : 'ph-globe'; ?> text-xl leading-none"></i>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-tight"><?php echo $p['name']; ?></span>
                                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5"><?php echo $p['icon_class'] ?? 'ph-globe'; ?></span>
                                    </div>
                                </div>
                            </td>
                            
                            <!-- Status Badge -->
                            <td class="px-6 py-4">
                                <?php if($p['status'] == 1): ?>
                                    <span class="px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 text-[9px] font-black uppercase tracking-widest border border-green-500/20">Active</span>
                                <?php else: ?>
                                    <span class="px-2 py-0.5 rounded-md bg-red-500/10 text-red-600 text-[9px] font-black uppercase tracking-widest border border-red-500/20">Hidden</span>
                                <?php endif; ?>
                            </td>
                            
                            <!-- Control Actions -->
                            <td class="px-6 py-4 text-right">
                                <button @click="loadPage('edit_platform&id=<?php echo $p['id']; ?>')" 
                                    class="text-primary font-bold text-[10px] uppercase tracking-widest hover:underline transition">
                                    Edit Settings
                                </button>
                            </td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Help Component (Filament Style) -->
    <div class="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-md p-4 flex items-start gap-3">
        <i class="ph ph-info text-slate-400 mt-0.5 text-lg"></i>
        <p class="text-[11px] text-slate-500 font-medium leading-relaxed">
            Platforms are the top-level iconic categories on the user dashboard. 
            Assigning a <span class="text-primary font-bold uppercase">Sort Order</span> allows you to control the exact position of icons in the user panel iconic grid. 
            Ensure you use valid <span class="font-bold">Phosphor Icons</span> class names for the branding to render correctly.
        </p>
    </div>
</div>
                