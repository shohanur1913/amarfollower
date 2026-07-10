<div class="max-w-4xl mx-auto space-y-8" x-data="{ 
    category: '', 
    service: '', 
    quantity: 0, 
    price: 0,
    services: [],
    updatePrice() {
        let s = this.services.find(i => i.id == this.service);
        if(s) {
            this.price = (s.rate * this.quantity / 1000).toFixed(4);
        }
    }
}">
    <div>
        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white">Place New Order</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Select a service and enter your link.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main Form -->
        <div class="lg:col-span-2 space-y-6">
            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <form class="space-y-5">
                    <div>
                        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                        <select x-model="category" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none text-sm">
                            <option value="">Choose Category...</option>
                            <option value="1">Instagram Followers</option>
                            <option value="2">Facebook Likes</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Service</label>
                        <select x-model="service" @change="updatePrice()" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none text-sm">
                            <option value="">Choose Service...</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Link</label>
                        <input type="text" placeholder="https://..." class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none text-sm">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Quantity</label>
                        <input type="number" x-model="quantity" @input="updatePrice()" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition outline-none text-sm">
                    </div>

                    <div class="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div class="flex justify-between items-center">
                            <span class="text-sm font-bold text-slate-500">Total Charge</span>
                            <span class="text-xl font-black text-primary" x-text="'$' + price"></span>
                        </div>
                    </div>

                    <button type="submit" class="w-full bg-primary hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                        Confirm Order
                    </button>
                </form>
            </div>
        </div>

        <!-- Sidebar Info -->
        <div class="space-y-6">
            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h4 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Service Details
                </h4>
                <div class="text-sm text-slate-600 dark:text-slate-400 space-y-3 leading-relaxed">
                    <p><b class="text-slate-900 dark:text-white">Min Order:</b> 100</p>
                    <p><b class="text-slate-900 dark:text-white">Max Order:</b> 10,000</p>
                    <p><b class="text-slate-900 dark:text-white">Average Time:</b> 2 Hours</p>
                    <hr class="border-slate-100 dark:border-slate-800">
                    <p>Ensuring high quality and fast delivery. Refill guaranteed for 30 days.</p>
                </div>
            </div>
        </div>
    </div>
</div>