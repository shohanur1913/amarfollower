<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

$id = (int)($_GET['id'] ?? 0);
$category = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM categories WHERE id = $id"));
$platforms = mysqli_fetch_all(mysqli_query($conn, "SELECT id, name FROM platforms WHERE status=1 ORDER BY name ASC"), MYSQLI_ASSOC);

if(!$category) { echo "<div class='p-8 text-center font-bold text-red-500 uppercase'>Category Not Found!</div>"; exit; }
?>

<div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
        <button @click="loadPage('categories')" class="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 hover:text-primary transition shadow-sm">
            <i class="fa-solid fa-arrow-left"></i>
        </button>
        <h2 class="text-xl font-bold uppercase tracking-tight leading-none">Edit Category #<?php echo $id; ?></h2>
    </div>

    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        <form action="api/category_actions.php" method="POST" class="p-8 space-y-6">
            <input type="hidden" name="action" value="update">
            <input type="hidden" name="id" value="<?php echo $id; ?>">

            <!-- Linked Platform -->
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Linked Platform</label>
                <select name="platform_id" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 font-bold text-sm outline-none focus:border-primary transition">
                    <?php foreach($platforms as $p): ?>
                        <option value="<?php echo $p['id']; ?>" <?php echo ($p['id'] == $category['platform_id']) ? 'selected' : ''; ?>>
                            <?php echo $p['name']; ?>
                        </option>
                    <?php endforeach; ?>
                </select>
                <p class="text-[9px] text-slate-400 mt-1 italic">Determines which icon grid button this category appears under.</p>
            </div>

            <!-- Category Name -->
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Category Name</label>
                <input type="text" name="name" value="<?php echo $category['name']; ?>" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 font-bold text-sm outline-none focus:border-primary">
            </div>

            <div class="grid grid-cols-2 gap-6">
                <!-- Sort Order -->
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sort Order</label>
                    <input type="number" name="sort_order" value="<?php echo $category['sort_order']; ?>" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 font-bold text-sm outline-none">
                </div>
                
                <!-- Status -->
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                    <select name="status" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 font-bold text-sm outline-none">
                        <option value="1" <?php echo ($category['status'] == 1) ? 'selected' : ''; ?>>Active</option>
                        <option value="0" <?php echo ($category['status'] == 0) ? 'selected' : ''; ?>>Disabled</option>
                    </select>
                </div>
            </div>

            <button type="submit" class="w-full bg-primary text-white font-black py-4 rounded-md uppercase tracking-widest text-[11px] shadow-md transition active:scale-95">Update Category Details</button>
        </form>
    </div>
</div>