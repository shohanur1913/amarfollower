<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
$user = getLoggedUser($conn);
$uid = (int)$user['id'];

/** 
 * REAL-TIME STATS 
 */
$spent_query = mysqli_query($conn, "SELECT SUM(charge) as total FROM orders WHERE user_id = $uid AND status != 'cancelled'");
$total_spent = number_format(mysqli_fetch_assoc($spent_query)['total'] ?? 0, 2);
$order_count = mysqli_fetch_assoc(mysqli_query($conn, "SELECT COUNT(id) as total FROM orders WHERE user_id = $uid"))['total'] ?? 0;

function fetchSafeVibe($conn, $sql) {
    $res = mysqli_query($conn, $sql);
    return ($res && mysqli_num_rows($res) > 0) ? mysqli_fetch_all($res, MYSQLI_ASSOC) : [];
}

$platforms  = fetchSafeVibe($conn, "SELECT * FROM platforms WHERE status=1 ORDER BY sort_order ASC");
$categories = fetchSafeVibe($conn, "SELECT * FROM categories WHERE status=1");
$services   = fetchSafeVibe($conn, "SELECT * FROM services WHERE status=1");

$currency = $settings['currency_symbol'] ?? '৳';
?>

<style>
    [x-cloak] { display: none !important; }
    body { font-family: 'Nunito', sans-serif; }
    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #dbdbdb; border-radius: 10px; }
    .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%); background-size: 200% 100%; animation: skeleton-loading 1.5s infinite; }
    @keyframes skeleton-loading { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
</style>

<div class="space-y-4 pb-10" x-cloak x-data='{ 
    platforms: <?php echo htmlspecialchars(json_encode($platforms), ENT_QUOTES, "UTF-8"); ?>,
    categories: <?php echo htmlspecialchars(json_encode($categories), ENT_QUOTES, "UTF-8"); ?>,
    services: <?php echo htmlspecialchars(json_encode($services), ENT_QUOTES, "UTF-8"); ?>,
    selectedPlatform: null,
    selectedCategory: null,
    selectedService: null,
    catOpen: false, serOpen: false, searchOpen: false, infoOpen: false,
    quantity: 0, globalSearch: "",
    orderLoading: false,
    receipt: null,
    searchLimit: 20,

    init() {
        if(this.platforms.length > 0) { 
            this.selectedPlatform = this.platforms[0].id; 
            this.resetSelections(); 
        }
    },

    resetSelections() {
        const filtered = this.categories.filter(c => c.platform_id == this.selectedPlatform);
        if(filtered.length > 0) {
            this.selectedCategory = filtered[0];
            this.autoSelectService();
        } else {
            this.selectedCategory = null;
            this.selectedService = null;
        }
    },

    autoSelectService() {
        if(!this.selectedCategory) return;
        const filtered = this.services.filter(s => s.category_id == this.selectedCategory.id);
        this.selectedService = filtered.length > 0 ? filtered[0] : null;
    },

    selectFromSearch(s) {
        const cat = this.categories.find(c => c.id == s.category_id);
        if(cat) {
            this.selectedPlatform = cat.platform_id;
            this.selectedCategory = cat;
            this.selectedService = s;
        }
        this.searchOpen = false;
        this.globalSearch = "";
        window.dispatchEvent(new CustomEvent("notify", {detail: {message: "Service loaded!"}}));
    },

    get filteredSearch() {
        if(!this.globalSearch) return [];
        return this.services.filter(s => s.name.toLowerCase().includes(this.globalSearch.toLowerCase())).slice(0, this.searchLimit);
    },

    get filteredCategories() {
        return this.selectedPlatform ? this.categories.filter(c => c.platform_id == this.selectedPlatform) : [];
    },

    get filteredServices() {
        return this.selectedCategory ? this.services.filter(s => s.category_id == this.selectedCategory.id) : [];
    },

    get totalCharge() {
        if (!this.selectedService || !this.quantity) return "0.000";
        let price = parseFloat(this.selectedService.price_per_k);
        let per = parseInt(this.selectedService.per_amount) || 1000;
        return ((price * this.quantity) / per).toFixed(3);
    },

    async submitOrder() {
        if(!this.selectedService) return;
        if(this.quantity < this.selectedService.min) {
            window.dispatchEvent(new CustomEvent("notify", {detail: {message: "Quantity below minimum limit!", type: "error"}}));
            return;
        }
        
        this.orderLoading = true;
        let fd = new FormData(this.$refs.orderForm);
        fd.append("service_id", this.selectedService.id);

        try {
            const res = await fetch("api/place_order.php", { method: "POST", body: fd });
            const data = await res.json();
            this.orderLoading = false;

            if(data.success) {
                this.receipt = data;
                this.quantity = 0;
                window.dispatchEvent(new CustomEvent("notify", {detail: {message: "Order Success!"}}));
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                window.dispatchEvent(new CustomEvent("notify", {detail: {message: data.message, type: "error"}}));
            }
        } catch (e) {
            this.orderLoading = false;
            window.dispatchEvent(new CustomEvent("notify", {detail: {message: "Network error", type: "error"}}));
        }
    }
}'>

    <!-- 1. TOP STATS: 4 BOXES -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div class="bg-white dark:bg-[#18181b] p-3 rounded-[6px] border border-gray-200 dark:border-white/5 shadow-sm">
            <p class="text-[10px] font-bold text-gray-500 uppercase">Username</p>
            <p class="text-base font-extrabold text-gray-900 dark:text-white"><?php echo $user['username']; ?></p>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-3 rounded-[6px] border border-gray-200 dark:border-white/5 shadow-sm">
            <p class="text-[10px] font-bold text-gray-500 uppercase">Balance</p>
            <p class="text-base font-extrabold text-primary">≈ <span x-text="'<?php echo $currency; ?>' + (receipt ? receipt.new_balance : '<?php echo number_format($user['balance'], 2); ?>')"></span></p>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-3 rounded-[6px] border border-gray-200 dark:border-white/5 shadow-sm">
            <p class="text-[10px] font-bold text-gray-500 uppercase">Total Spend</p>
            <p class="text-base font-extrabold text-gray-900 dark:text-white">≈ <?php echo $currency . $total_spent; ?></p>
        </div>
        <div class="bg-white dark:bg-[#18181b] p-3 rounded-[6px] border border-gray-200 dark:border-white/5 shadow-sm">
            <p class="text-[10px] font-bold text-gray-500 uppercase">Your Orders</p>
            <p class="text-base font-extrabold text-gray-900 dark:text-white"><?php echo $order_count; ?></p>
        </div>
    </div>

    <!-- 2. SUCCESS RECEIPT (GREEN THEME) -->
    <template x-if="receipt">
        <div class="bg-white dark:bg-[#18181b] border-2 border-green-500 p-5 rounded-[6px] shadow-lg animate-in slide-in-from-top-4 relative">
            <button @click="receipt = null" class="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition"><i class="fa-solid fa-xmark"></i></button>
            <h4 class="text-xs font-black uppercase tracking-[0.2em] mb-4 text-green-600 flex items-center gap-2">
                <i class="fa-solid fa-circle-check text-sm"></i> Your order received
            </h4>
            <div class="space-y-1.5 font-bold text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300">
                <p>ID: <span class="text-primary" x-text="receipt.order_id"></span></p>
                <p>Service: <span x-text="receipt.service_name"></span></p>
                <p>Link: <span class="lowercase text-slate-500" x-text="receipt.link"></span></p>
                <p>Quantity: <span x-text="receipt.qty"></span></p>
                <p>Charge: <span x-text="'≈ <?php echo $currency; ?>' + receipt.charge"></span></p>
                <p>Balance: <span x-text="'≈ <?php echo $currency; ?>' + receipt.new_balance"></span></p>
            </div>
        </div>
    </template>

    <!-- 3. PLATFORMS (FULL WIDTH GRID) -->
    <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
        <template x-for="p in platforms" :key="p.id">
            <button type="button" @click="selectedPlatform = p.id; resetSelections()" 
                :class="selectedPlatform == p.id ? 'bg-primary/20 border-primary text-primary shadow-md' : 'bg-white dark:bg-[#18181b] border-gray-200 dark:border-white/5 text-slate-600 dark:text-slate-300'"
                class="h-14 w-full flex items-center justify-center rounded-[6px] border transition-all outline-none">
                <i :class="p.icon_class || 'fa-solid fa-globe'" class="text-2xl"></i>
            </button>
        </template>
    </div>

    <!-- 4. CONFIGURE ORDER CARD -->
    <div class="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 rounded-[6px] shadow-sm overflow-hidden">
        <div class="px-4 py-2 border-b border-gray-100 dark:border-white/5 flex items-center gap-2 bg-gray-50/50 dark:bg-white/[0.02]">
            <div class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
            <h3 class="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">Configure Order</h3>
        </div>

        <div class="p-4 space-y-4">
            <!-- LAZY SEARCH BAR -->
            <div class="relative">
                <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1 text-left">Quick Search Service</label>
                <div class="relative">
                    <input type="text" x-model="globalSearch" @focus="searchOpen = true" placeholder="Find any service instantly..." 
                        class="w-full bg-slate-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-[6px] px-10 py-2.5 text-sm font-bold outline-none focus:ring-1 focus:ring-primary transition text-left">
                    <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 text-xs"></i>
                </div>
                <div x-show="searchOpen && globalSearch.length > 1" @click.away="searchOpen = false" 
                    class="absolute w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-[6px] shadow-2xl z-[60] max-h-72 overflow-y-auto custom-scroll"
                    @scroll="if ($el.scrollTop + $el.clientHeight >= $el.scrollHeight - 10) searchLimit += 20">
                    <template x-for="s in filteredSearch" :key="s.id">
                        <div @click="selectFromSearch(s)" class="px-4 py-3 hover:bg-primary/5 cursor-pointer border-b border-gray-50 dark:border-white/5 transition text-left">
                            <p class="text-xs font-bold text-slate-700 dark:text-slate-200" x-text="s.name"></p>
                            <p class="text-[9px] font-black text-primary uppercase mt-1" x-text="'<?php echo $currency; ?>' + s.price_per_k"></p>
                        </div>
                    </template>
                </div>
            </div>

            <form x-ref="orderForm" @submit.prevent="submitOrder()" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <!-- CATEGORY DROPDOWN -->
                    <div class="relative">
                        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1 text-left">Category</label>
                        <button type="button" @click="catOpen = !catOpen"
                            class="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-[6px] px-3 py-2.5 text-sm font-semibold flex items-center justify-between outline-none text-left">
                            <span class="truncate" x-text="selectedCategory ? selectedCategory.name : 'Choose Category'"></span>
                            <i class="fa-solid fa-chevron-down text-[9px]"></i>
                        </button>
                        <div x-show="catOpen" @click.away="catOpen = false" class="absolute w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-[6px] shadow-xl z-50 max-h-72 overflow-y-auto custom-scroll">
                            <template x-for="c in filteredCategories" :key="c.id">
                                <div @click="selectedCategory = c; catOpen = false; autoSelectService()" class="px-3 py-3 hover:bg-primary hover:text-white cursor-pointer text-xs font-bold border-b dark:border-white/5 transition text-left leading-relaxed h-auto" x-text="c.name"></div>
                            </template>
                        </div>
                    </div>

                    <!-- SERVICE DROPDOWN -->
                    <div class="relative">
                        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1 text-left">Service</label>
                        <button type="button" @click="serOpen = !serOpen"
                            class="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-[6px] px-3 py-2.5 text-sm font-semibold flex items-center justify-between outline-none text-left">
                            <span x-text="selectedService ? selectedService.name : 'Choose Service'"></span>
                            <i class="fa-solid fa-chevron-down text-[9px]"></i>
                        </button>
                        
                        <!-- PRICING BADGE -->
                        <template x-if="selectedService">
                            <div class="mt-2 flex">
                                <span class="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded-[4px] border border-primary/20">
                                    Price: <span x-text="'<?php echo $currency; ?>' + selectedService.price_per_k"></span> / <span x-text="selectedService.per_amount || 1000"></span>
                                </span>
                            </div>
                        </template>

                        <div x-show="serOpen" @click.away="serOpen = false" class="absolute w-full mt-1 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-[6px] shadow-xl z-50 max-h-72 overflow-y-auto custom-scroll">
                            <template x-for="s in filteredServices" :key="s.id">
                                <div @click="selectedService = s; serOpen = false" class="px-3 py-3 border-b dark:border-white/5 hover:bg-primary hover:text-white cursor-pointer text-left h-auto">
                                    <p class="font-bold text-xs leading-relaxed" x-text="s.name"></p>
                                    <p class="text-[9px] font-black uppercase opacity-60 mt-1" x-text="'Price: <?php echo $currency; ?>' + s.price_per_k"></p>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="relative">
                        <label class="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-1 mb-1 px-1 text-left">
                            Link or Account ID 
                            <span class="relative" x-data="{ open: false }">
                                <i class="fa-solid fa-circle-info text-[10px] cursor-pointer text-primary" @click="open = !open"></i>
                                <div x-cloak x-show="open" @click.away="open = false" class="absolute z-[70] bottom-full mb-2 left-0 w-48 p-2 bg-slate-900 text-white text-[9px] rounded shadow-xl font-bold uppercase tracking-tighter leading-tight">
                                    Inputting wrong information will result in cancellation and refund.
                                </div>
                            </span>
                        </label>
                        <input type="text" name="link" required placeholder="URL or UID..." class="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-[6px] px-3 py-2 text-sm font-bold outline-none focus:ring-1 focus:ring-primary text-left">
                    </div>
                    <div>
                        <label class="text-[10px] font-bold text-gray-500 uppercase block mb-1 px-1 text-left">Quantity</label>
                        <input type="number" name="quantity" x-model="quantity" required placeholder="0" class="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-[6px] px-3 py-2 text-sm font-bold outline-none focus:ring-1 focus:ring-primary text-left">
                        <template x-if="selectedService">
                            <div class="flex gap-2 mt-2 px-1">
                                <span class="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded-[4px] border border-primary/20" x-text="'Min: ' + selectedService.min"></span>
                                <span class="bg-primary/10 text-primary text-[10px] font-bold uppercase px-2 py-0.5 rounded-[4px] border border-primary/20" x-text="'Max: ' + selectedService.max"></span>
                            </div>
                        </template>
                    </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t dark:border-white/5">
                    <div class="text-left">
                        <p class="text-[9px] font-bold text-gray-500 uppercase leading-none">Estimated Cost</p>
                        <p class="text-xl font-black text-primary mt-1" x-text="'<?php echo $currency; ?>' + totalCharge"></p>
                    </div>
                    <button type="submit" :disabled="orderLoading" class="bg-primary text-white font-black px-10 py-3 rounded-[6px] shadow-lg shadow-primary/20 hover:brightness-110 transition-all uppercase text-[10px] tracking-widest flex items-center gap-2">
                        <span x-show="!orderLoading">Place Order</span>
                        <i x-show="orderLoading" class="fa-solid fa-circle-notch animate-spin"></i>
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- 5. SPECS & DESCRIPTION -->
    <div x-show="selectedService" x-transition.opacity class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <template x-for="spec in [
                {label: 'Start Time', val: selectedService.start_time, icon: 'fa-bolt', color: 'text-amber-500'},
                {label: 'Speed', val: selectedService.speed, icon: 'fa-gauge-high', color: 'text-cyan-500'},
                {label: 'Refill', val: selectedService.guarantee, icon: 'fa-rotate', color: 'text-green-500'}
            ]">
                <div class="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/5 p-3 rounded-[6px] flex items-center gap-3 shadow-sm">
                    <div class="h-8 w-8 rounded-[6px] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-xs" :class="spec.color">
                        <i class="fa-solid" :class="spec.icon"></i>
                    </div>
                    <div class="text-left">
                        <p class="text-[9px] font-bold text-gray-400 uppercase leading-none" x-text="spec.label"></p>
                        <p class="text-xs font-black dark:text-white mt-1" x-text="spec.val || 'N/A'"></p>
                    </div>
                </div>
            </template>
        </div>

        <div class="bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 p-3 rounded-[6px] text-left">
            <p class="text-[10px] font-bold text-primary uppercase mb-1">Service Description</p>
            <p class="text-xs text-gray-600 dark:text-gray-400 leading-relaxed font-bold uppercase tracking-tighter" x-text="selectedService.description || 'Quality prioritized service. Ensures delivery within time frame.'"></p>
        </div>
    </div>

    <!-- SKELETON LOADER -->
    <div x-show="orderLoading" class="space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="h-16 skeleton rounded-[6px]"></div>
            <div class="h-16 skeleton rounded-[6px]"></div>
            <div class="h-16 skeleton rounded-[6px]"></div>
        </div>
    </div>
</div>