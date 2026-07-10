<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

$id = mysqli_real_escape_string($conn, $_GET['id']);
$service = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM services WHERE id = '$id'"));
$categories = mysqli_fetch_all(mysqli_query($conn, "SELECT * FROM categories ORDER BY name ASC"), MYSQLI_ASSOC);

if(!$service) { echo "Service not found!"; exit; }
?>

<div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center gap-4">
        <button @click="loadPage('services')" class="p-2 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500 hover:text-primary transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>
        <h2 class="text-xl font-bold uppercase tracking-tight">Edit Service #<?php echo $id; ?></h2>
    </div>

    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        <form action="api/service_actions.php" method="POST" class="p-6 lg:p-10 space-y-6">
            <input type="hidden" name="action" value="update">
            <input type="hidden" name="id" value="<?php echo $id; ?>">

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Name</label>
                    <input type="text" name="name" value="<?php echo $service['name']; ?>" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <select name="category_id" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                        <?php foreach($categories as $cat): ?>
                            <option value="<?php echo $cat['id']; ?>" <?php echo ($cat['id'] == $service['category_id']) ? 'selected' : ''; ?>><?php echo $cat['name']; ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price Rate</label>
                    <input type="text" name="price_per_k" value="<?php echo $service['price_per_k']; ?>" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Per Amount</label>
                    <input type="number" name="per_amount" value="<?php echo $service['per_amount']; ?>" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                    <select name="status" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
                        <option value="1" <?php echo ($service['status'] == 1) ? 'selected' : ''; ?>>Active</option>
                        <option value="0" <?php echo ($service['status'] == 0) ? 'selected' : ''; ?>>Disabled</option>
                    </select>
                </div>
            </div>

            <p class="text-[10px] font-black text-primary uppercase tracking-[0.2em] pt-4 border-t border-slate-50 dark:border-slate-800">Specifications</p>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <input type="text" name="start_time" value="<?php echo $service['start_time']; ?>" placeholder="Start Time" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 text-xs font-bold outline-none">
                <input type="text" name="speed" value="<?php echo $service['speed']; ?>" placeholder="Speed" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 text-xs font-bold outline-none">
                <input type="text" name="guarantee" value="<?php echo $service['guarantee']; ?>" placeholder="Guarantee" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 text-xs font-bold outline-none">
                <input type="text" name="quality" value="<?php echo $service['quality']; ?>" placeholder="Quality" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 text-xs font-bold outline-none">
            </div>

            <div class="pt-6">
                <button type="submit" class="w-full bg-primary text-white font-black py-3 rounded-md shadow-sm uppercase tracking-widest text-xs">Update Service</button>
            </div>
        </form>
    </div>
</div>
            