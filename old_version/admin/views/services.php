<?php
// CRITICAL: Double dots to go up from admin/views/ to root
require_once '../../includes/config.php'; 
require_once '../../includes/auth.php'; 
checkAdmin();

// Fetch services (only active ones) along with category and provider names
$sql = "SELECT s.*, c.name as cat_name, p.name as provider_name 
        FROM services s 
        LEFT JOIN categories c ON s.category_id = c.id 
        LEFT JOIN providers p ON s.provider_id = p.id 
        WHERE s.is_deleted = 0 
        ORDER BY s.id DESC";

$result = mysqli_query($conn, $sql);
$services = ($result) ? mysqli_fetch_all($result, MYSQLI_ASSOC) : [];
$providers = mysqli_fetch_all(mysqli_query($conn, "SELECT id, name FROM providers WHERE status=1"), MYSQLI_ASSOC);
?>

<div class="space-y-6 pb-24" 
    x-data="{
        search: '',
        provFilter: '',
        selectedIds: [],
        selectAll: false,
        allServices: <?php echo htmlspecialchars(json_encode($services), ENT_QUOTES, 'UTF-8'); ?>,
        displayLimit: 25,
        initialLoading: true,

        init() {
            setTimeout(() => { 
                this.initialLoading = false; 
                setTimeout(() => {
                    let observer = new IntersectionObserver((entries) => {
                        if(entries[0].isIntersecting && this.displayLimit < this.filteredServices.length) {
                            this.displayLimit += 25;
                        }
                    }, { rootMargin: '100px' });
                    if (this.$refs.loadTrigger) observer.observe(this.$refs.loadTrigger);
                }, 200);
            }, 500);
        },

        get filteredServices() {
            let filtered = this.allServices;
            if (this.search !== '') {
                let s = this.search.toLowerCase();
                filtered = filtered.filter(i => 
                    i.name.toLowerCase().includes(s) || 
                    i.id.toString().includes(s) ||
                    (i.cat_name && i.cat_name.toLowerCase().includes(s))
                );
            }
            if (this.provFilter !== '') {
                filtered = filtered.filter(i => i.provider_id == this.provFilter);
            }
            return filtered;
        },

        get displayedServices() {
            return this.filteredServices.slice(0, this.displayLimit);
        },

        toggleAll() {
            this.selectedIds = this.selectAll ? this.filteredServices.map(s => s.id.toString()) : [];
        },

        deleteSingle(id) {
            if(!confirm('Are you sure you want to delete this service?')) return;
            this.executeDelete([id.toString()]);
        },

        bulkDelete() {
            if(this.selectedIds.length === 0) return;
            if(!confirm('Delete ' + this.selectedIds.length + ' selected services?')) return;
            this.executeDelete(this.selectedIds);
        },

        executeDelete(idsArray) {
            let fd = new FormData();
            fd.append('action', 'delete');
            fd.append('ids', JSON.stringify(idsArray));
            
            fetch('api/service_actions.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if(data.success) {
                        window.dispatchEvent(new CustomEvent('show-toast', {detail: {message: 'Deleted successfully', type: 'success'}}));
                        this.allServices = this.allServices.filter(s => !idsArray.includes(s.id.toString()));
                        this.selectedIds = [];
                        this.selectAll = false;
                    }
                });
        }
    }">

    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#18181b] p-4 rounded-2xl shadow-sm">
        <div class="flex items-center gap-4">
            <div class="relative">
                <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input type="text" x-model="search" placeholder="Search services..." 
                    class="bg-slate-50 dark:bg-slate-900/50 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition w-56 dark:text-white border-transparent">
            </div>
            
            <select x-model="provFilter" class="bg-slate-50 dark:bg-slate-900/50 rounded-xl px-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-primary/20 transition cursor-pointer dark:text-white border-transparent">
                <option value="">All Providers</option>
                <?php foreach($providers as $p): ?> 
                    <option value="<?php echo $p['id']; ?>"><?php echo htmlspecialchars($p['name']); ?></option> 
                <?php endforeach; ?>
            </select>
        </div>

        <div class="flex items-center gap-2">
            <button x-show="selectedIds.length > 0" @click="bulkDelete()" x-transition 
                class="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500 font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-red-500 hover:text-white transition flex items-center gap-2 outline-none border-transparent">
                <i class="fa-solid fa-trash-can"></i> 
                <span>Delete Selected</span>
                <span class="bg-red-500 text-white px-2 py-0.5 rounded-lg text-[10px]" x-text="selectedIds.length"></span>
            </button>

            <button @click="loadPage('import_services')" class="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-4 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition text-xs flex items-center gap-2 outline-none border-transparent">
                <i class="fa-solid fa-file-import"></i> Import API
            </button>

            <button @click="loadPage('add_service')" class="bg-primary text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-primary/20 hover:opacity-90 transition transform active:scale-95 text-xs flex items-center gap-2 outline-none border-transparent">
                <i class="fa-solid fa-plus"></i> New Service
            </button>
        </div>
    </div>

    <div class="bg-white dark:bg-[#18181b] rounded-2xl overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[1000px]">
                <thead class="bg-slate-50/50 dark:bg-slate-900/20">
                    <tr>
                        <th class="px-6 py-5 w-12 text-center">
                            <input type="checkbox" x-model="selectAll" @change="toggleAll()" class="rounded border-slate-300 text-primary w-4 h-4 cursor-pointer">
                        </th>
                        <th class="px-6 py-5 w-20 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID</th>
                        <th class="px-6 py-5 w-[45%] text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Service Details</th>
                        <th class="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Rate</th>
                        <th class="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Provider</th>
                        <th class="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    
                    <template x-if="initialLoading">
                        <template x-for="i in 8">
                            <tr class="animate-pulse">
                                <td colspan="6" class="px-6 py-4"><div class="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg w-full"></div></td>
                            </tr>
                        </template>
                    </template>

                    <template x-if="!initialLoading">
                        <template x-for="s in displayedServices" :key="s.id">
                            <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                <td class="px-6 py-4 text-center">
                                    <input type="checkbox" :value="s.id" x-model="selectedIds" class="rounded border-slate-300 text-primary w-4 h-4 cursor-pointer">
                                </td>
                                <td class="px-6 py-4 text-xs font-bold text-slate-400" x-text="'#' + s.id"></td>
                                <td class="px-6 py-4 pr-10">
                                    <div class="flex flex-col">
                                        <span class="text-[9px] font-bold text-primary uppercase tracking-wider mb-1" x-text="s.cat_name"></span>
                                        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-snug" x-text="s.name"></span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex flex-col">
                                        <span class="text-sm font-bold text-slate-900 dark:text-white"><?php echo $settings['currency_symbol'] ?? '$'; ?><span x-text="s.price_per_k"></span></span>
                                        <span class="text-[9px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Per <span x-text="s.per_amount"></span></span>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase" x-text="s.provider_name || 'Manual'"></span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <div class="flex items-center justify-end gap-2">
                                        <button @click="loadPage('edit_service&id=' + s.id)" class="px-3 py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary hover:text-white transition outline-none border-transparent">
                                            <i class="fa-solid fa-pen text-[10px] mr-1"></i> Edit
                                        </button>
                                        <button @click="deleteSingle(s.id)" class="px-3 py-2 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition outline-none border-transparent">
                                            <i class="fa-solid fa-trash-can text-[10px]"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </template>

                    <tr x-show="!initialLoading && displayLimit < filteredServices.length">
                        <td colspan="6" class="py-4">
                            <div x-ref="loadTrigger" class="flex justify-center"><i class="fa-solid fa-circle-notch fa-spin text-slate-300 text-xl"></i></div>
                        </td>
                    </tr>

                </tbody>
            </table>
        </div>
    </div>
</div>

                        