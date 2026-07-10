<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

$platforms = mysqli_fetch_all(mysqli_query($conn, "SELECT id, name FROM platforms WHERE status=1 ORDER BY name ASC"), MYSQLI_ASSOC);
?>

<div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
        <button @click="loadPage('categories')" class="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 hover:text-primary transition">
            <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h2 class="text-xl font-bold uppercase tracking-tight">Add Category</h2>
    </div>

    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        <form action="api/category_actions.php" method="POST" class="p-8 space-y-6">
            <input type="hidden" name="action" value="create">

            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Linked Platform</label>
                <select name="platform_id" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary transition">
                    <option value="">Select Platform...</option>
                    <?php foreach($platforms as $p): ?>
                        <option value="<?php echo $p['id']; ?>"><?php echo $p['name']; ?></option>
                    <?php endforeach; ?>
                </select>
            </div>

            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category Name</label>
                <input type="text" name="name" placeholder="e.g. Facebook Likes" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sort Order</label>
                    <input type="number" name="sort_order" value="0" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                    <select name="status" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                        <option value="1">Active</option>
                        <option value="0">Disabled</option>
                    </select>
                </div>
            </div>

            <button type="submit" class="w-full bg-primary text-white font-black py-3 rounded-md uppercase tracking-widest text-[11px] shadow-md transition active:scale-95">Save Category</button>
        </form>
    </div>
</div>