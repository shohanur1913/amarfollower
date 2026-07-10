<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

$id = (int)$_GET['id'];
$ticket = mysqli_fetch_assoc(mysqli_query($conn, "SELECT t.*, u.username FROM tickets t JOIN users u ON t.user_id = u.id WHERE t.id = $id"));
$messages = mysqli_fetch_all(mysqli_query($conn, "SELECT * FROM ticket_messages WHERE ticket_id = $id ORDER BY id ASC"), MYSQLI_ASSOC);
?>

<div class="max-w-4xl mx-auto space-y-6 pb-40" x-data="{ 
    msg: '', 
    aiMuted: <?php echo $ticket['ai_muted']; ?>,
    sendManualReply() {
        if(!this.msg) return;
        let fd = new FormData();
        fd.append('action', 'admin_reply');
        fd.append('ticket_id', '<?php echo $id; ?>');
        fd.append('message', this.msg);
        fd.append('mute_ai', this.aiMuted ? 1 : 0);

        fetch('api/ticket_admin_actions.php', { method: 'POST', body: fd })
            .then(() => {
                this.msg = '';
                loadPage('view_ticket&id=<?php echo $id; ?>');
                window.dispatchEvent(new CustomEvent('notify', {detail: {message: 'Reply Sent!'}}));
            });
    }
}">
    <!-- Header -->
    <div class="bg-white dark:bg-[#18181b] p-4 rounded-md border border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div class="flex items-center gap-3">
            <button @click="loadPage('tickets')" class="text-slate-400 hover:text-primary"><i class="fa-solid fa-arrow-left"></i></button>
            <h2 class="text-sm font-bold"><?php echo $ticket['username']; ?>: <?php echo $ticket['subject']; ?></h2>
        </div>
        <div class="flex items-center gap-2">
            <label class="flex items-center gap-2 cursor-pointer">
                <span class="text-[9px] font-black uppercase text-slate-500">Mute AI</span>
                <input type="checkbox" x-model="aiMuted" class="rounded text-red-500">
            </label>
        </div>
    </div>

    <!-- Messages -->
    <div class="space-y-4">
        <?php foreach($messages as $m): ?>
            <div class="flex <?php echo $m['sender_role'] === 'admin' ? 'justify-end' : 'justify-start'; ?>">
                <div class="max-w-[85%] p-4 rounded-md border shadow-sm 
                    <?php echo $m['sender_role'] === 'admin' ? 'bg-slate-800 text-white border-slate-700' : ($m['sender_role'] === 'ai' ? 'bg-cyan-50 text-cyan-700 border-cyan-100' : 'bg-white dark:bg-[#111113] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'); ?>">
                    <p class="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1"><?php echo $m['sender_role']; ?></p>
                    <p class="text-sm font-bold"><?php echo nl2br($m['message']); ?></p>
                </div>
            </div>
        <?php endforeach; ?>
    </div>

    <!-- ADMIN MANUAL REPLY BOX -->
    <div class="fixed bottom-6 left-0 lg:left-72 right-0 px-6">
        <div class="max-w-4xl mx-auto bg-white dark:bg-[#1d1d21] p-2 rounded-md border-2 border-primary/20 shadow-2xl flex gap-2">
            <input type="text" x-model="msg" @keyup.enter="sendManualReply()" placeholder="Write manual reply to customer..." 
                class="flex-1 bg-transparent border-none px-4 py-3 text-sm font-bold focus:ring-0">
            <button @click="sendManualReply()" class="bg-primary text-white px-8 py-3 rounded-md font-black text-[10px] uppercase tracking-widest shadow-lg">
                Send Reply
            </button>
        </div>
    </div>
</div>