<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
$user = getLoggedUser($conn);

$tickets = mysqli_fetch_all(mysqli_query($conn, "SELECT * FROM tickets WHERE user_id = {$user['id']} ORDER BY id DESC"), MYSQLI_ASSOC);
?>

<div class="max-w-4xl mx-auto space-y-6 pb-24" x-data="{ openCreate: false }">
    <!-- Header -->
    <div class="flex items-center justify-between">
        <div>
            <h2 class="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Support Desk</h2>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2">Instant AI-Powered Assistance</p>
        </div>
        <button @click="openCreate = !openCreate" class="bg-primary text-white font-black px-6 py-2.5 rounded-md text-[10px] uppercase tracking-widest shadow-lg shadow-primary/30 transition transform active:scale-95">
            <i class="fa-solid fa-plus mr-2"></i> New Ticket
        </button>
    </div>

    <!-- Create Ticket Form (Flat Design) -->
    <div x-show="openCreate" x-transition class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md p-6 shadow-sm">
        <form @submit.prevent="
            let fd = new FormData($el);
            fd.append('action', 'create');
            fetch('api/ticket_actions.php', { method: 'POST', body: fd })
                .then(r => r.json())
                .then(data => {
                    if(data.success) {
                        window.dispatchEvent(new CustomEvent('notify', {detail: {message: data.message}}));
                        loadPage(data.redirect);
                    }
                })
        " class="space-y-4">
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Problem Subject</label>
                <input type="text" name="subject" required placeholder="e.g. Order #12345 Not Delivering" class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition">
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Detailed Message</label>
                <textarea name="message" required rows="4" placeholder="Explain your issue clearly..." class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition"></textarea>
            </div>
            <button type="submit" class="w-full bg-primary text-white font-black py-3 rounded-md text-[11px] uppercase tracking-[0.2em] shadow-md">Create Ticket</button>
        </form>
    </div>

    <!-- Ticket List Table -->
    <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden shadow-sm">
        <table class="w-full text-left">
            <thead class="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <tr class="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    <th class="px-6 py-4">Topic</th>
                    <th class="px-6 py-4">Status</th>
                    <th class="px-6 py-4 text-right">Last Update</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <?php if(empty($tickets)): ?>
                    <tr><td colspan="3" class="px-6 py-12 text-center text-slate-400 text-xs font-bold uppercase italic tracking-widest">No tickets found</td></tr>
                <?php endif; ?>
                <?php foreach($tickets as $t): ?>
                <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer" @click="loadPage('view_ticket&id=<?php echo $t['id']; ?>')">
                    <td class="px-6 py-4">
                        <p class="text-sm font-bold text-slate-700 dark:text-slate-200"><?php echo $t['subject']; ?></p>
                        <span class="text-[9px] font-black text-slate-400 uppercase">Ref: #<?php echo $t['id']; ?></span>
                    </td>
                    <td class="px-6 py-4">
                        <?php 
                            $st = strtolower($t['status']);
                            $class = ($st == 'open') ? 'bg-green-500/10 text-green-600 border-green-500/20' : (($st == 'answered') ? 'bg-primary/10 text-primary border-primary/20' : 'bg-slate-100 text-slate-500 border-slate-200');
                        ?>
                        <span class="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase border italic <?php echo $class; ?>">
                            <?php echo $t['status']; ?>
                        </span>
                    </td>
                    <td class="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase"><?php echo date('d M, H:i', strtotime($t['created_at'])); ?></td>
                </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</div>
