<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

$platforms = mysqli_fetch_all(mysqli_query($conn, "SELECT id, name FROM platforms WHERE status=1 ORDER BY name ASC"), MYSQLI_ASSOC);
$providers = mysqli_fetch_all(mysqli_query($conn, "SELECT id, name FROM providers WHERE status=1"), MYSQLI_ASSOC);
?>

<div class="space-y-6 pb-32" x-data="{ 
    providerId: '', 
    loading: false, 
    markup: 20,
    search: '',
    externalServices: [],
    visibleLimit: 50,
    selectedIds: [],
    bulkImporting: false,
    progress: 0,
    platforms: <?php echo htmlspecialchars(json_encode($platforms), ENT_QUOTES); ?>,

    fetchServices() {
        if(!this.providerId) return window.dispatchEvent(new CustomEvent('show-toast', {detail: {message: 'Select a provider', type: 'error'}}));
        this.loading = true;
        this.externalServices = [];
        this.selectedIds = [];
        this.visibleLimit = 50;
        
        fetch(`api/get_provider_services.php?id=${this.providerId}`)
            .then(res => res.json())
            .then(data => {
                this.externalServices = data.map(s => {
                    let detectedPlat = this.platforms.find(p => 
                        s.name.toLowerCase().includes(p.name.toLowerCase()) || 
                        s.category.toLowerCase().includes(p.name.toLowerCase())
                    );
                    return { ...s, platform_id: detectedPlat ? detectedPlat.id : '', importing: false, imported: false };
                });
                this.loading = false;
            });
    },

    async bulkImport() {
        if(this.selectedIds.length === 0) return;
        this.bulkImporting = true;
        this.progress = 0;
        let total = this.selectedIds.length;
        
        for (let i = 0; i < total; i++) {
            let s = this.externalServices.find(item => item.service == this.selectedIds[i]);
            if(s && !s.imported) {
                await this.importService(s, true);
            }
            this.progress = Math.round(((i + 1) / total) * 100);
        }
        
        this.bulkImporting = false;
        window.dispatchEvent(new CustomEvent('show-toast', {detail: {message: 'Bulk Import Complete'}}));
        this.selectedIds = [];
    },

    async importService(s, isBulk = false) {
        if(!s.platform_id) return;
        s.importing = true;
        let formData = new FormData();
        formData.append('provider_id', this.providerId);
        formData.append('platform_id', s.platform_id);
        formData.append('api_service_id', s.service);
        formData.append('name', s.name);
        formData.append('external_category', s.category);
        formData.append('price', ((parseFloat(s.rate) * <?php echo $settings['usd_rate']; ?>) * (1 + this.markup/100)).toFixed(2));
        formData.append('min', s.min);
        formData.append('max', s.max);

        const response = await fetch('api/import_actions.php', { method: 'POST', body: formData });
        const data = await response.json();
        
        s.importing = false;
        if(data.success) {
            s.imported = true;
            if(!isBulk) window.dispatchEvent(new CustomEvent('show-toast', {detail: {message: 'Imported #' + s.service}}));
        }
    },

    get filteredServices() {
        let list = this.externalServices.filter(s => 
            s.name.toLowerCase().includes(this.search.toLowerCase()) || 
            s.category.toLowerCase().includes(this.search.toLowerCase())
        );
        return list.slice(0, this.visibleLimit);
    }
}" @scroll.window="if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) visibleLimit += 50">

    <!-- 1. Header & Bulk Actions -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">API Management</h2>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Bulk Import Engine & Lazy Loading</p>
        </div>
        
        <div x-show="selectedIds.length > 0" x-transition class="flex items-center gap-3">
            <span class="text-[10px] font-black text-primary uppercase" x-text="selectedIds.length + ' selected'"></span>
            <button @click="bulkImport()" :disabled="bulkImporting" 
                class="relative overflow-hidden bg-primary text-white font-black px-8 py-2.5 rounded-md text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 transition">
                <span class="relative z-10" x-text="bulkImporting ? 'Importing...' : 'Bulk Import Selected'"></span>
                <!-- Progress Bar Layer -->
                <div class="absolute inset-0 bg-black/20 transition-all duration-500" :style="`width: ${progress}%`" x-show="bulkImporting"></div>
            </button>
        </div>
    </div>

    <!-- 2. Control Bar -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-sm">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Source Provider</label>
                <select x-model="providerId" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary transition">
                    <option value="">Choose API...</option>
                    <?php foreach($providers as $p): ?> <option value="<?php echo $p['id']; ?>"><?php echo $p['name']; ?></option> <?php endforeach; ?>
                </select>
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Markup %</label>
                <input type="number" x-model="markup" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Filter List</label>
                <input type="text" x-model="search" placeholder="Search..." class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none">
            </div>
            <button @click="fetchServices()" :disabled="loading" class="bg-slate-900 dark:bg-primary text-white font-black py-2.5 rounded-md text-[10px] uppercase tracking-widest shadow-md hover:opacity-90 transition">
                <i x-show="!loading" class="fa-solid fa-sync mr-2"></i>
                <i x-show="loading" class="fa-solid fa-spinner animate-spin"></i>
                Fetch Services
            </button>
        </div>
    </div>

    <!-- 3. Skeleton Loader -->
    <div x-show="loading" class="space-y-3">
        <template x-for="i in 10">
            <div class="h-16 bg-white dark:bg-[#18181b] animate-pulse border border-slate-100 dark:border-slate-800 rounded-md"></div>
        </template>
    </div>

    <!-- 4. Main Table -->
    <div x-show="!loading && externalServices.length > 0" class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <tr>
                        <th class="px-6 py-4 w-10">
                            <input type="checkbox" @change="selectedIds = $event.target.checked ? externalServices.map(i => i.service) : []" class="rounded border-slate-300 text-primary focus:ring-primary">
                        </th>
                        <th class="px-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (BDT)</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform</th>
                        <th class="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                    <template x-for="s in filteredServices" :key="s.service">
                        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition" :class="s.imported ? 'opacity-40' : ''">
                            <td class="px-6 py-4">
                                <input type="checkbox" :value="s.service" x-model="selectedIds" :disabled="s.imported" class="rounded border-slate-300 text-primary">
                            </td>
                            <td class="px-4 py-4">
                                <span class="text-[9px] font-black text-primary uppercase" x-text="s.category"></span>
                                <p class="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight mt-1" x-text="s.name"></p>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-xs font-black text-green-600" x-text="'৳' + ((parseFloat(s.rate) * <?php echo $settings['usd_rate']; ?>) * (1 + markup/100)).toFixed(2)"></span>
                            </td>
                            <td class="px-6 py-4">
                                <select x-model="s.platform_id" class="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-[10px] font-bold outline-none w-32">
                                    <option value="">Choose Platform</option>
                                    <template x-for="p in platforms">
                                        <option :value="p.id" x-text="p.name"></option>
                                    </template>
                                </select>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <button @click="importService(s)" :disabled="s.importing || s.imported"
                                    class="bg-primary/10 text-primary px-4 py-1.5 rounded-md text-[10px] font-black uppercase hover:bg-primary hover:text-white transition">
                                    <span x-show="!s.importing && !s.imported">Import</span>
                                    <i x-show="s.importing" class="fa-solid fa-circle-notch animate-spin"></i>
                                    <i x-show="s.imported" class="fa-solid fa-check"></i>
                                </button>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
        <!-- Load More indicator -->
        <div x-show="visibleLimit < externalServices.length" class="p-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 dark:border-slate-800">
            Scroll down to load more services (Loaded <span x-text="visibleLimit"></span> of <span x-text="externalServices.length"></span>)
        </div>
    </div>
</div>