<?php
// CRITICAL: Double dots to go up from admin/views/ to root
require_once '../../includes/config.php'; 
require_once '../../includes/auth.php'; 
checkAdmin();

// Note: $settings array is already globally available via config.php
?>

<div class="max-w-5xl mx-auto space-y-8 pb-24" x-data="{ 
    loading: false, 
    successMsg: '',
    errorMsg: '',
    submitSettings() {
        this.loading = true;
        this.successMsg = '';
        this.errorMsg = '';
        
        let formData = new FormData(this.$refs.settingsForm);
        
        fetch('api/save_settings.php', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            this.loading = false;
            if(data.success) {
                this.successMsg = data.message;
                // Apply branding changes immediately by reloading the CSS/Config
                setTimeout(() => { location.reload(); }, 1500);
            } else {
                this.errorMsg = data.message;
            }
        })
        .catch(err => {
            this.loading = false;
            this.errorMsg = 'Failed to connect to server.';
        });
    }
}">

    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">System Settings</h2>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Core Configuration, Branding & Security</p>
        </div>
    </div>

    <template x-if="successMsg">
        <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <i class="fa-solid fa-circle-check text-green-500"></i>
            <span class="text-xs font-bold text-green-600 uppercase tracking-widest" x-text="successMsg"></span>
        </div>
    </template>
    <template x-if="errorMsg">
        <div class="p-4 bg-red-500/10 border border-red-500/20 rounded-md flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <i class="fa-solid fa-circle-exclamation text-red-500"></i>
            <span class="text-xs font-bold text-red-600 uppercase tracking-widest" x-text="errorMsg"></span>
        </div>
    </template>

    <form x-ref="settingsForm" @submit.prevent="submitSettings()" enctype="multipart/form-data" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="space-y-2 sticky top-24 h-max hidden lg:block">
            <div class="p-4 bg-primary/5 border-l-4 border-primary rounded-md">
                <h4 class="text-xs font-black text-primary uppercase tracking-widest leading-none">General & Branding</h4>
                <p class="text-[9px] text-slate-400 font-bold uppercase mt-1">Identity, Currency & Colors</p>
            </div>
            <div class="p-4 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md opacity-70">
                <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Security & Auth</h4>
                <p class="text-[9px] text-slate-400 font-bold uppercase mt-1">Google & Captcha</p>
            </div>
            <div class="p-4 bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md opacity-70">
                <h4 class="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">System & AI</h4>
                <p class="text-[9px] text-slate-400 font-bold uppercase mt-1">Maintenance & Support AI</p>
            </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
            
            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <h3 class="text-[10px] font-black uppercase tracking-widest leading-none">Panel Identity</h3>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Site Name</label>
                        <input type="text" name="site_name" value="<?php echo $settings['site_name'] ?? 'Amar Follower'; ?>" required class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary transition">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Site URL (with https)</label>
                        <input type="url" name="site_url" value="<?php echo $settings['site_url'] ?? ''; ?>" required placeholder="https://amarfollower.com" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary transition">
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <h3 class="text-[10px] font-black uppercase tracking-widest leading-none">Brand & SEO</h3>
                </div>
                <div class="p-6 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Logo (PNG)</label>
                            <input type="file" name="logo_url" accept="image/png" class="w-full text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:font-black focus:outline-none">
                            <?php if(!empty($settings['logo_url'])): ?>
                                <p class="text-[9px] text-slate-400 italic px-1 mt-1">Current: <?php echo basename($settings['logo_url']); ?></p>
                            <?php endif; ?>
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Favicon (PNG)</label>
                            <input type="file" name="favicon_url" accept="image/png" class="w-full text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary/10 file:text-primary file:font-black focus:outline-none">
                            <?php if(!empty($settings['favicon_url'])): ?>
                                <p class="text-[9px] text-slate-400 italic px-1 mt-1">Current: <?php echo basename($settings['favicon_url']); ?></p>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Site Description</label>
                        <textarea name="site_description" rows="3" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-bold outline-none focus:border-primary transition"><?php echo $settings['site_description'] ?? ''; ?></textarea>
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">SEO Keywords</label>
                        <input type="text" name="site_keywords" value="<?php echo $settings['site_keywords'] ?? ''; ?>" placeholder="smm panel, cheap followers, social media" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-bold outline-none focus:border-primary transition">
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <h3 class="text-[10px] font-black uppercase tracking-widest leading-none">Localization & Branding</h3>
                </div>
                <div class="p-6 space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Currency Symbol</label>
                            <input type="text" name="currency_symbol" value="<?php echo $settings['currency_symbol'] ?? '৳'; ?>" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">USD Exchange Rate ($1 = ?)</label>
                            <input type="text" name="usd_rate" value="<?php echo $settings['usd_rate'] ?? '120.00'; ?>" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
                        </div>
                    </div>
                    
                    <div class="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-6">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Primary Brand Color</label>
                        <div class="flex items-center gap-4">
                            <input type="text" name="primary_color" value="<?php echo $settings['primary_color'] ?? '#6366f1'; ?>" class="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-mono text-sm outline-none focus:border-primary">
                            <input type="color" value="<?php echo $settings['primary_color'] ?? '#6366f1'; ?>" @input="$refs.settingsForm.primary_color.value = $event.target.value" class="h-10 w-10 border-none bg-transparent cursor-pointer rounded-md">
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <h3 class="text-[10px] font-black uppercase tracking-widest leading-none">Google Social Login</h3>
                </div>
                <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Google Client ID</label>
                        <input type="text" name="google_client_id" value="<?php echo $settings['google_client_id'] ?? ''; ?>" placeholder="xxx-xxx.apps.googleusercontent.com" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-xs outline-none focus:border-primary transition">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Google Client Secret</label>
                        <input type="password" name="google_client_secret" value="<?php echo $settings['google_client_secret'] ?? ''; ?>" placeholder="GOCSPX-xxxx" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-xs outline-none focus:border-primary transition">
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden" x-data="{ captcha: '<?php echo $settings['captcha_type'] ?? 'off'; ?>' }">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <h3 class="text-[10px] font-black uppercase tracking-widest leading-none">Anti-Spam Protection</h3>
                </div>
                <div class="p-6 space-y-6">
                    <div class="space-y-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Captcha Provider</label>
                        <select name="captcha_type" x-model="captcha" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
                            <option value="off">Disabled</option>
                            <option value="cloudflare">Cloudflare Turnstile (Recommended)</option>
                            <option value="google">Google reCAPTCHA v2</option>
                        </select>
                    </div>

                    <div x-show="captcha !== 'off'" x-transition class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1" x-text="captcha === 'google' ? 'reCAPTCHA Site Key' : 'Turnstile Site Key'"></label>
                            <input type="text" name="captcha_site_key" value="<?php echo $settings['captcha_site_key'] ?? ''; ?>" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-xs outline-none focus:border-primary">
                        </div>
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1" x-text="captcha === 'google' ? 'reCAPTCHA Secret Key' : 'Turnstile Secret Key'"></label>
                            <input type="password" name="captcha_secret_key" value="<?php echo $settings['captcha_secret_key'] ?? ''; ?>" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-xs outline-none focus:border-primary">
                        </div>
                    </div>
                </div>
            </div>

            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <h3 class="text-[10px] font-black uppercase tracking-widest leading-none">Support AI Engine</h3>
                </div>
                <div class="p-6 space-y-6">
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gemini API Key</label>
                            <input type="password" name="gemini_api_key" value="<?php echo $settings['gemini_api_key'] ?? ''; ?>" placeholder="AIzaSy..." class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary transition">
                        </div>

                        <div class="space-y-2">
                            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gemini Model Name</label>
                            <input type="text" name="gemini_model" value="<?php echo $settings['gemini_model'] ?? 'gemini-1.5-flash'; ?>" placeholder="e.g. gemini-1.5-flash" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary transition">
                            <p class="text-[9px] text-slate-400 italic px-1">Type exact model ID (e.g. gemini-1.5-flash)</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
                            <div>
                                <h4 class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Smart Merging</h4>
                                <p class="text-[9px] text-slate-500 uppercase font-bold">Auto-combine tickets</p>
                            </div>
                            <select name="ai_merging" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[10px] font-black uppercase outline-none focus:border-primary">
                                <option value="on" <?php echo ($settings['ai_merging'] ?? 'on') == 'on' ? 'selected' : ''; ?>>On</option>
                                <option value="off" <?php echo ($settings['ai_merging'] ?? 'on') == 'off' ? 'selected' : ''; ?>>Off</option>
                            </select>
                        </div>

                        <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
                            <div>
                                <h4 class="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">Auto Triage</h4>
                                <p class="text-[9px] text-slate-500 uppercase font-bold">Generate To-Do list</p>
                            </div>
                            <select name="ai_triage" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[10px] font-black uppercase outline-none focus:border-primary">
                                <option value="on" <?php echo ($settings['ai_triage'] ?? 'on') == 'on' ? 'selected' : ''; ?>>On</option>
                                <option value="off" <?php echo ($settings['ai_triage'] ?? 'on') == 'off' ? 'selected' : ''; ?>>Off</option>
                            </select>
                        </div>
                    </div>

                </div>
            </div>

            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <h3 class="text-[10px] font-black uppercase tracking-widest leading-none">System Status</h3>
                </div>
                <div class="p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200">Maintenance Mode</h4>
                            <p class="text-[10px] text-slate-500 uppercase tracking-tight">Block user access while updating the panel</p>
                        </div>
                        <select name="maintenance_mode" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2 text-xs font-black uppercase outline-none focus:border-primary">
                            <option value="off" <?php echo ($settings['maintenance_mode'] ?? 'off') === 'off' ? 'selected' : ''; ?>>Online</option>
                            <option value="on" <?php echo ($settings['maintenance_mode'] ?? 'off') === 'on' ? 'selected' : ''; ?>>Maintenance</option>
                        </select>
                    </div>
                </div>
            </div>

<div class="space-y-2">
    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Processing Fee (%)</label>
    <input type="text" name="processing_fee_percent" value="<?php echo $settings['processing_fee_percent'] ?? '5.00'; ?>" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-2.5 font-bold text-sm outline-none focus:border-primary">
    <p class="text-[9px] text-slate-400 italic">Example: 5.00 for 5% fee.</p>
</div>

            <div class="flex justify-end pt-4 sticky bottom-4 z-10">
                <button type="submit" :disabled="loading" 
                    class="bg-primary text-white font-black px-10 py-4 rounded-md shadow-xl shadow-primary/30 hover:opacity-90 transition transform active:scale-95 uppercase tracking-[0.2em] text-[11px] flex items-center gap-3">
                    <template x-if="!loading"><span>Save Global Configuration</span></template>
                    <template x-if="loading">
                        <div class="flex items-center gap-2">
                            <i class="fa-solid fa-spinner animate-spin"></i>
                            <span>Saving Changes...</span>
                        </div>
                    </template>
                </button>
            </div>

        </div>
    </form>
</div>

        