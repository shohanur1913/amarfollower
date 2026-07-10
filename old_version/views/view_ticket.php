<?php
require_once 'includes/config.php';
require_once 'includes/auth.php';
$user = getLoggedUser($conn);
$id = (int)$_GET['id'];

// Security Check: Only allow if the ticket belongs to the logged-in user
$ticket = mysqli_fetch_assoc(mysqli_query($conn, "SELECT * FROM tickets WHERE id = $id AND user_id = {$user['id']}"));
if(!$ticket) { echo "<div class='p-8 text-center text-red-500 font-bold uppercase'>Access Denied</div>"; exit; }

// Fetch all messages for this ticket
$messages = mysqli_fetch_all(mysqli_query($conn, "SELECT * FROM ticket_messages WHERE ticket_id = $id ORDER BY id ASC"), MYSQLI_ASSOC);
?>

<div class="max-w-3xl mx-auto pb-40" x-data="{ 
    msg: '', 
    sending: false,
    status: '<?php echo $ticket['status']; ?>',
    list: <?php echo htmlspecialchars(json_encode($messages), ENT_QUOTES); ?>,
    
    sendReply() {
        if(!this.msg || this.status === 'closed') return;
        this.sending = true;
        
        let fd = new FormData();
        fd.append('action', 'reply');
        fd.append('ticket_id', '<?php echo $id; ?>');
        fd.append('message', this.msg);

        fetch('api/ticket_actions.php', { method: 'POST', body: fd })
            .then(r => r.json())
            .then(data => {
                this.sending = false;
                if(data.success) {
                    // Instantly push the new messages to the UI list
                    data.new_messages.forEach(m => {
                        this.list.push({ 
                            sender_role: m.role, 
                            message: m.msg, 
                            created_at: new Date().toISOString() 
                        });
                    });
                    this.msg = '';
                    window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'Reply Sent Successfully'}}));
                    
                    // Scroll to bottom
                    this.$nextTick(() => { window.scrollTo(0, document.body.scrollHeight); });
                }
            });
    },

    closeTicket() {
        if(!confirm('Are you sure you want to close this ticket?')) return;
        
        fetch('api/ticket_actions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=close_ticket&ticket_id=<?php echo $id; ?>`
        })
        .then(r => r.json())
        .then(data => {
            if(data.success) {
                this.status = 'closed';
                window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'Ticket Closed'}}));
            }
        });
    }
}">

    <!-- Chat Header -->
    <div class="bg-white dark:bg-[#18181b] p-4 rounded-md border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shadow-sm sticky top-0 z-10">
        <div class="flex items-center gap-3">
            <button @click="loadPage('tickets')" class="h-8 w-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary transition shadow-sm">
                <i class="fa-solid fa-arrow-left text-xs"></i>
            </button>
            <div>
                <h2 class="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white leading-tight"><?php echo $ticket['subject']; ?></h2>
                <p class="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">Support Thread #<?php echo $id; ?></p>
            </div>
        </div>
        
        <div class="flex items-center gap-3">
            <!-- Dynamic Status Badge -->
            <span class="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border italic"
                :class="status === 'closed' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-green-500/10 text-green-600 border-green-500/20'"
                x-text="status === 'closed' ? 'Archived' : 'Live Session'">
            </span>
            
            <!-- Close Button (Only show if open) -->
            <button x-show="status !== 'closed'" @click="closeTicket()" 
                class="bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition border border-red-500/20 hover:border-red-500 shadow-sm">
                Mark Resolved
            </button>
        </div>
    </div>

    <!-- Message Bubbles Container -->
    <div class="space-y-6 px-2">
        <template x-for="m in list" :key="m.id || Math.random()">
            <div class="flex" :class="m.sender_role === 'user' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[85%] space-y-1">
                    
                    <!-- Bubble -->
                    <div class="px-5 py-4 rounded-md shadow-sm border animate-in fade-in slide-in-from-bottom-2"
                        :class="
                            m.sender_role === 'user' ? 'bg-primary text-white border-primary shadow-primary/20' : 
                            (m.sender_role === 'ai' ? 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 border-cyan-100 dark:border-cyan-900/50' : 
                            'bg-white dark:bg-[#111113] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300')
                        ">
                        <p class="text-[13px] font-bold leading-relaxed whitespace-pre-wrap" x-text="m.message"></p>
                    </div>

                    <!-- Meta Data -->
                    <p class="text-[8px] font-black uppercase tracking-widest opacity-50 px-1" 
                       :class="m.sender_role === 'user' ? 'text-right' : 'text-left'" 
                       x-text="m.sender_role === 'user' ? 'You' : (m.sender_role === 'ai' ? 'AI Assistant' : 'Support Admin')"></p>
                </div>
            </div>
        </template>
    </div>

    <!-- Sticky AJAX Reply Box -->
    <div class="fixed bottom-20 lg:bottom-8 left-0 lg:left-72 right-0 px-4 transition-all">
        <div class="max-w-3xl mx-auto bg-white dark:bg-[#18181b] p-2 rounded-md border border-slate-200 dark:border-slate-800 shadow-2xl">
            
            <!-- Input Area (Disabled if closed) -->
            <div x-show="status !== 'closed'" class="flex gap-2">
                <input type="text" x-model="msg" @keyup.enter="sendReply()" placeholder="Message Support..." 
                    class="flex-1 bg-slate-50 dark:bg-slate-900 border-none rounded-md px-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition">
                
                <button @click="sendReply()" :disabled="sending || !msg" 
                    class="bg-primary text-white px-8 rounded-md shadow-lg shadow-primary/30 transition transform active:scale-95 disabled:opacity-50 text-[10px] font-black uppercase tracking-widest">
                    <span x-show="!sending">Send</span>
                    <i x-show="sending" class="fa-solid fa-circle-notch animate-spin text-sm"></i>
                </button>
            </div>

            <!-- Closed State Message -->
            <div x-show="status === 'closed'" class="py-3 text-center">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">This ticket has been resolved and closed.</p>
            </div>

        </div>
    </div>
</div>
                