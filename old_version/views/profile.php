<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
$user = getLoggedUser($conn);
?>

<div class="max-w-4xl mx-auto space-y-8 pb-32" x-data="{
    loading: false,
    
    submitForm(formId, actionName) {
        this.loading = actionName;
        let form = document.getElementById(formId);
        let fd = new FormData(form);
        fd.append('action', actionName);

        fetch('api/profile_actions.php', { method: 'POST', body: fd })
            .then(r => r.json())
            .then(data => {
                this.loading = false;
                window.dispatchEvent(new CustomEvent('notify', {detail: {message: data.message, type: data.success ? 'success' : 'error'}}));
                if(data.success && actionName === 'generate_api') {
                    document.getElementById('api_key_display').value = data.api_key;
                }
                if(data.success && actionName === 'update_password') {
                    form.reset();
                }
            })
            .catch(() => {
                this.loading = false;
                window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'Server Error', type: 'error'}}));
            });
    },

    copyApi() {
        let key = document.getElementById('api_key_display');
        key.select();
        document.execCommand('copy');
        window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'API Key Copied!'}}));
    }
}">

    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">Account Settings</h2>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Manage your profile and security</p>
        </div>
        <div class="h-10 w-10 bg-primary text-white rounded-md flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20">
            <?php echo strtoupper(substr($user['username'], 0, 1)); ?>
        </div>
    </div>

    <!-- 1. ACCOUNT DETAILS CARD -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-2">
            <i class="fa-solid fa-user text-primary text-xs"></i>
            <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Profile Information</h3>
        </div>
        
        <form id="profileForm" @submit.prevent="submitForm('profileForm', 'update_profile')" class="p-6 lg:p-8 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username (Fixed)</label>
                    <input type="text" value="<?php echo $user['username']; ?>" disabled class="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-4 py-3 text-sm font-bold text-slate-500 cursor-not-allowed">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                    <input type="email" name="email" value="<?php echo $user['email']; ?>" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition">
                </div>
            </div>
            <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="submit" :disabled="loading === 'update_profile'" class="bg-slate-900 dark:bg-primary text-white font-black px-8 py-3 rounded-md shadow-md hover:opacity-90 transition active:scale-95 uppercase tracking-widest text-[10px]">
                    <span x-show="loading !== 'update_profile'">Save Changes</span>
                    <i x-show="loading === 'update_profile'" class="fa-solid fa-spinner animate-spin"></i>
                </button>
            </div>
        </form>
    </div>

    <!-- 2. SECURITY CARD -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center gap-2">
            <i class="fa-solid fa-lock text-amber-500 text-xs"></i>
            <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Security & Password</h3>
        </div>
        
        <form id="passwordForm" @submit.prevent="submitForm('passwordForm', 'update_password')" class="p-6 lg:p-8 space-y-6">
            <div class="space-y-2 max-w-md">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Current Password</label>
                <input type="password" name="current_password" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Password</label>
                    <input type="password" name="new_password" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm New Password</label>
                    <input type="password" name="confirm_password" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition">
                </div>
            </div>
            <div class="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="submit" :disabled="loading === 'update_password'" class="bg-amber-500 text-white font-black px-8 py-3 rounded-md shadow-md hover:opacity-90 transition active:scale-95 uppercase tracking-widest text-[10px]">
                    <span x-show="loading !== 'update_password'">Update Password</span>
                    <i x-show="loading === 'update_password'" class="fa-solid fa-spinner animate-spin"></i>
                </button>
            </div>
        </form>
    </div>

    <!-- 3. DEVELOPER API CARD -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <i class="fa-solid fa-code text-cyan-500 text-xs"></i>
                <h3 class="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Developer API</h3>
            </div>
            <span class="px-2 py-0.5 bg-cyan-500/10 text-cyan-600 border border-cyan-500/20 rounded text-[8px] font-black uppercase tracking-widest">Advanced</span>
        </div>
        
        <form id="apiForm" @submit.prevent="submitForm('apiForm', 'generate_api')" class="p-6 lg:p-8 space-y-6">
            <p class="text-xs font-bold text-slate-500 leading-relaxed">
                Use this API key to connect your own scripts or panels to your <?php echo $settings['site_name']; ?> account. Do not share this key with anyone.
            </p>
            
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Your Secret API Key</label>
                <div class="flex gap-2">
                    <input type="text" id="api_key_display" readonly value="<?php echo $user['api_key'] ?? 'No key generated yet'; ?>" class="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-mono font-bold text-slate-600 dark:text-slate-300 outline-none">
                    <button type="button" @click="copyApi()" class="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black px-5 py-3 rounded-md hover:text-primary transition shadow-sm">
                        <i class="fa-regular fa-copy"></i>
                    </button>
                </div>
            </div>

            <div class="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="submit" :disabled="loading === 'generate_api'" class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-black px-6 py-3 rounded-md shadow-sm hover:border-primary hover:text-primary transition active:scale-95 uppercase tracking-widest text-[10px]">
                    <span x-show="loading !== 'generate_api'">Generate New API Key</span>
                    <i x-show="loading === 'generate_api'" class="fa-solid fa-spinner animate-spin"></i>
                </button>
            </div>
        </form>
    </div>

</div>