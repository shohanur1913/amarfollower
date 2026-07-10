<?php
// CRITICAL: Double dots to go up from admin/views/ to root
require_once '../../includes/config.php'; 
require_once '../../includes/auth.php'; 
checkAdmin();

// Fetch categories with platform names
$sql = "SELECT c.*, p.name as platform_name, p.icon_class 
        FROM categories c 
        LEFT JOIN platforms p ON c.platform_id = p.id 
        WHERE c.status != 2 -- Assuming 2 is soft-deleted
        ORDER BY p.name ASC, c.sort_order ASC";

$result = mysqli_query($conn, $sql);
$categories = mysqli_fetch_all($result, MYSQLI_ASSOC);
$platforms = mysqli_fetch_all(mysqli_query($conn, "SELECT id, name FROM platforms WHERE status=1"), MYSQLI_ASSOC);
?>

<div class="space-y-6 pb-24" 
    x-data="{ 
        search: '', 
        platFilter: '', 
        selectedIds: [],
        selectAll: false,
        allCategories: <?php echo htmlspecialchars(json_encode($categories), ENT_QUOTES, 'UTF-8'); ?>,
        displayLimit: 25,
        initialLoading: true,

        init() {
            setTimeout(() => { 
                this.initialLoading = false; 
                setTimeout(() => {
                    let observer = new IntersectionObserver((entries) => {
                        if(entries[0].isIntersecting && this.displayLimit < this.filteredCategories.length) {
                            this.displayLimit += 25;
                        }
                    }, { rootMargin: '100px' });
                    if (this.$refs.loadTrigger) observer.observe(this.$refs.loadTrigger);
                }, 200);
            }, 500);
        },

        get filteredCategories() {
            let filtered = this.allCategories;
            if (this.search !== '') {
                let s = this.search.toLowerCase();
                filtered = filtered.filter(i => 
                    i.name.toLowerCase().includes(s) || 
                    (i.platform_name && i.platform_name.toLowerCase().includes(s))
                );
            }
            if (this.platFilter !== '') {
                filtered = filtered.filter(i => i.platform_name === this.platFilter);
            }
            return filtered;
        },

        get displayedCategories() {
            return this.filteredCategories.slice(0, this.displayLimit);
        },

        toggleAll() {
            this.selectedIds = this.selectAll ? this.filteredCategories.map(c => c.id.toString()) : [];
        },

        deleteSingle(id) {
            if(!confirm('Are you sure you want to delete this category?')) return;
            this.executeDelete([id.toString()]);
        },

        bulkDelete() {
            if(this.selectedIds.length === 0) return;
            if(!confirm('Delete ' + this.selectedIds.length + ' selected categories?')) return;
            this.executeDelete(this.selectedIds);
        },

        executeDelete(idsArray) {
            let fd = new FormData();
            fd.append('action', 'delete');
            fd.append('ids', JSON.stringify(idsArray));
            
            fetch('api/category_actions.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if(data.success) {
                        window.dispatchEvent(new CustomEvent('show-toast', {detail: {message: 'Deleted successfully', type: 'success'}}));
                        this.allCategories = this.allCategories.filter(c => !idsArray.includes(c.id.toString()));
                        this.selectedIds = [];
                        this.selectAll = false;
                    }
                });
        }
    }">

    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-4 rounded-md shadow-sm border-none">
        <div class="flex items-center gap-3">
            <div class="relative">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[10px]"></i>
                <input type="text" x-model="search" placeholder="Filter categories..." 
                    class="bg-slate-50 dark:bg-slate-900/50 rounded-md pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition w-56 dark:text-white border-none">
            </div>
            
            <select x-model="platFilter" class="bg-slate-50 dark:bg-slate-900/50 rounded-md px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition cursor-pointer dark:text-white border-none">
                <option value="">All Platforms</option>
                <?php foreach($platforms as $p): ?> 
                    <option value="<?php echo htmlspecialchars($p['name']); ?>"><?php echo htmlspecialchars($p['name']); ?></option> 
                <?php endforeach; ?>
            </select>
        </div>

        <div class="flex items-center gap-2">
            <button x-show="selectedIds.length > 0" @click="bulkDelete()" x-transition 
                class="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 font-bold px-4 py-2 rounded-md text-xs hover:bg-red-500 hover:text-white transition flex items-center gap-2 outline-none border-none">
                <i class="fa-solid fa-trash-can text-[10px]"></i> 
                <span>Delete Selected</span>
                <span class="bg-red-600 text-white px-2 py-0.5 rounded text-[9px]" x-text="selectedIds.length"></span>
            </button>

            <button @click="loadPage('add_category')" class="bg-primary text-white font-bold px-5 py-2 rounded-md shadow-md shadow-primary/20 hover:opacity-90 transition transform active:scale-95 text-xs flex items-center gap-2 outline-none border-none">
                <i class="fa-solid fa-plus"></i> New Category
            </button>
        </div>
    </div>

    <div class="bg-white dark:bg-[#18181b] rounded-md overflow-hidden shadow-sm border-none">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[700px]">
                <thead class="bg-slate-50/50 dark:bg-slate-900/20">
                    <tr>
                        <th class="px-6 py-4 w-12 text-center">
                            <input type="checkbox" x-model="selectAll" @change="toggleAll()" class="rounded-[4px] border-slate-300 text-primary w-4 h-4 cursor-pointer focus:ring-0 focus:ring-offset-0">
                        </th>
                        <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Platform</th>
                        <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Category Name</th>
                        <th class="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    
                    <template x-if="initialLoading">
                        <template x-for="i in 6">
                            <tr class="animate-pulse">
                                <td colspan="4" class="px-6 py-4"><div class="h-11 bg-slate-50 dark:bg-slate-900/50 rounded-md w-full"></div></td>
                            </tr>
                        </template>
                    </template>

                    <template x-if="!initialLoading">
                        <template x-for="c in displayedCategories" :key="c.id">
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-none">
                                <td class="px-6 py-4 text-center">
                                    <input type="checkbox" :value="c.id" x-model="selectedIds" class="rounded-[4px] border-slate-300 text-primary w-4 h-4 cursor-pointer focus:ring-0 focus:ring-offset-0">
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center gap-2">
                                        <div class="w-6 h-6 rounded-md bg-primary/5 flex items-center justify-center">
                                            <i :class="c.icon_class || 'fa-solid fa-folder'" class="text-primary text-[10px]"></i>
                                        </div>
                                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tight" x-text="c.platform_name || 'Unlinked'"></span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="text-sm font-semibold text-slate-700 dark:text-slate-200" x-text="c.name"></span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button @click="loadPage('edit_category&id=' + c.id)" class="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-[11px] font-bold hover:bg-primary hover:text-white transition outline-none border-none">
                                            <i class="fa-solid fa-pen text-[9px] mr-1"></i> Edit
                                        </button>
                                        <button @click="deleteSingle(c.id)" class="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-md text-[11px] font-bold hover:bg-red-500 hover:text-white transition outline-none border-none">
                                            <i class="fa-solid fa-trash-can text-[9px]"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </template>

                    <tr x-show="!initialLoading && displayLimit < filteredCategories.length">
                        <td colspan="4" class="py-4">
                            <div x-ref="loadTrigger" class="flex justify-center"><i class="fa-solid fa-circle-notch fa-spin text-slate-300 text-xl"></i></div>
                        </td>
                    </tr>

                    <tr x-show="!initialLoading && filteredCategories.length === 0">
                        <td colspan="4" class="px-6 py-20 text-center">
                            <div class="inline-flex items-center justify-center w-14 h-14 rounded-md bg-slate-50 dark:bg-slate-900 text-slate-400 mb-4">
                                <i class="fa-solid fa-folder-open text-xl"></i>
                            </div>
                            <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300">No matching categories</h3>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
    </div>
</div>

                            