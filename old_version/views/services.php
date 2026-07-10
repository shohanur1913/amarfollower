<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
// Fetch categories and their related services in one clean sweep
$categories_sql = "SELECT c.*, p.name as platform_name, p.icon_class 
                   FROM categories c 
                   LEFT JOIN platforms p ON c.platform_id = p.id 
                   WHERE c.status = 1 
                   ORDER BY p.sort_order ASC, c.sort_order ASC";
$categories_res = mysqli_query($conn, $categories_sql);
$categories = ($categories_res) ? mysqli_fetch_all($categories_res, MYSQLI_ASSOC) : [];

$services_sql = "SELECT * FROM services WHERE status = 1 ORDER BY id ASC";
$services_res = mysqli_query($conn, $services_sql);
$services = ($services_res) ? mysqli_fetch_all($services_res, MYSQLI_ASSOC) : [];

// Safe JSON for Alpine
$categories_json = htmlspecialchars(json_encode($categories), ENT_QUOTES, 'UTF-8');
$services_json = htmlspecialchars(json_encode($services), ENT_QUOTES, 'UTF-8');
?>

<div class="space-y-6 pb-32" x-data='{ 
    search: "",
    categories: <?php echo $categories_json; ?>,
    services: <?php echo $services_json; ?>,
    
    // Group services by category for easier rendering
    get groupedServices() {
        let grouped = [];
        
        this.categories.forEach(cat => {
            let catServices = this.services.filter(s => s.category_id == cat.id);
            
            // Apply Search Filter if searching
            if (this.search.trim() !== "") {
                let s = this.search.toLowerCase();
                catServices = catServices.filter(srv => 
                    srv.name.toLowerCase().includes(s) || 
                    srv.id.toString().includes(s) ||
                    cat.name.toLowerCase().includes(s) ||
                    (cat.platform_name && cat.platform_name.toLowerCase().includes(s))
                );
            }
            
            // Only add category if it has services matching the search
            if (catServices.length > 0) {
                grouped.push({
                    category: cat,
                    services: catServices
                });
            }
        });
        
        return grouped;
    }
}'>

    <!-- Header & Search -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Service Pricing</h2>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Explore our SMM inventory</p>
        </div>
        
        <div class="relative group w-full md:max-w-xs">
            <input type="text" x-model="search" placeholder="Search service, ID or platform..." 
                class="w-full bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md px-10 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition font-bold shadow-sm">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary transition text-xs"></i>
            
            <!-- Clear Search Button -->
            <button x-show="search.length > 0" @click="search = ''" class="absolute right-4 top-3.5 text-slate-400 hover:text-red-500 transition">
                <i class="fa-solid fa-xmark text-xs"></i>
            </button>
        </div>
    </div>

    <!-- No Results State -->
    <div x-show="groupedServices.length === 0" x-transition x-cloak class="py-16 text-center bg-white dark:bg-[#18181b] rounded-md border border-dashed border-slate-300 dark:border-slate-800 shadow-sm">
        <i class="fa-solid fa-box-open text-4xl text-slate-300 dark:text-slate-700 mb-4 block"></i>
        <p class="text-slate-500 font-bold text-xs uppercase tracking-widest">No services found matching your criteria</p>
    </div>

    <!-- Service Categories Loop -->
    <div class="space-y-8">
        <template x-for="group in groupedServices" :key="group.category.id">
            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                
                <!-- Category Header -->
                <div class="px-6 py-4 bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="h-8 w-8 bg-primary/10 text-primary rounded-md flex items-center justify-center shadow-sm border border-primary/20">
                            <i :class="group.category.icon_class || 'fa-solid fa-folder'" class="text-sm"></i>
                        </div>
                        <div>
                            <h3 class="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none" x-text="group.category.name"></h3>
                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1" x-text="group.category.platform_name || 'General Platform'"></p>
                        </div>
                    </div>
                </div>

                <!-- Services Table inside Category -->
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-white dark:bg-[#18181b] border-b border-slate-100 dark:border-slate-800/50">
                            <tr>
                                <th class="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none w-16">ID</th>
                                <th class="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Service Information</th>
                                <th class="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none text-center hidden md:table-cell">Min / Max</th>
                                <th class="px-6 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none text-right">Price Rate</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 dark:divide-slate-800/50">
                            <template x-for="s in group.services" :key="s.id">
                                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group/row cursor-default">
                                    
                                    <!-- ID -->
                                    <td class="px-6 py-4">
                                        <span class="text-xs font-bold text-slate-400" x-text="'#' + s.id"></span>
                                    </td>
                                    
                                    <!-- Name & Specs -->
                                    <td class="px-6 py-4">
                                        <p class="text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug group-hover/row:text-primary transition" x-text="s.name"></p>
                                        
                                        <!-- Mini Specs Row (Hidden on mobile for cleanliness) -->
                                        <div class="hidden sm:flex items-center gap-4 mt-2 opacity-60">
                                            <span class="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                                <i class="fa-solid fa-clock text-blue-500"></i> <span x-text="s.start_time || '0-15 Min'"></span>
                                            </span>
                                            <span class="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                                <i class="fa-solid fa-bolt text-cyan-500"></i> <span x-text="s.speed || '100K/Day'"></span>
                                            </span>
                                            <span class="text-[9px] font-bold text-slate-500 uppercase flex items-center gap-1">
                                                <i class="fa-solid fa-rotate text-green-500"></i> <span x-text="s.guarantee || 'No Refill'"></span>
                                            </span>
                                        </div>
                                    </td>
                                    
                                    <!-- Min/Max -->
                                    <td class="px-6 py-4 text-center hidden md:table-cell">
                                        <div class="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded border border-slate-200 dark:border-slate-800">
                                            <span class="text-[10px] font-black text-slate-500 uppercase" x-text="s.min"></span>
                                            <span class="text-slate-300 dark:text-slate-600">/</span>
                                            <span class="text-[10px] font-black text-slate-500 uppercase" x-text="s.max"></span>
                                        </div>
                                    </td>
                                    
                                    <!-- Price & Order Action -->
                                    <td class="px-6 py-4 text-right">
                                        <div class="flex flex-col items-end gap-2">
                                            <div class="flex flex-col text-right">
                                                <span class="text-sm font-black text-slate-900 dark:text-white" x-text="'<?php echo $settings['currency_symbol'] ?? '$'; ?>' + parseFloat(s.price_per_k).toFixed(2)"></span>
                                                <span class="text-[9px] font-bold text-slate-400 uppercase tracking-widest" x-text="'Per ' + (s.per_amount || 1000)"></span>
                                            </div>
                                            <!-- Smart Redirect to Order -->
                                            <button @click="loadPage('dashboard')" class="text-[9px] font-black bg-primary/10 text-primary px-3 py-1.5 rounded uppercase tracking-widest hover:bg-primary hover:text-white transition">
                                                Order
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>
            </div>
        </template>
    </div>

</div>
                                