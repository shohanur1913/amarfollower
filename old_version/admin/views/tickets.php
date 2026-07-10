<?php
require_once '../../includes/config.php';
require_once '../../includes/auth.php';
checkAdmin();

// SMART SORTING: Active tickets at top, Closed at bottom
$sql = "SELECT t.*, u.username, u.email 
        FROM tickets t 
        JOIN users u ON t.user_id = u.id 
        ORDER BY (t.status = 'closed') ASC, t.id DESC";

$res = mysqli_query($conn, $sql);
$tickets = mysqli_fetch_all($res, MYSQLI_ASSOC);
?>

<div class="space-y-6 pb-32" x-data="{
    // State management for instant UI updates
    ticketsList: <?php echo htmlspecialchars(json_encode($tickets), ENT_QUOTES); ?>,
    search: '',
    
    // AJAX: Close/Dismiss Ticket
    closeTicket(id) {
        if(!confirm('Archive this ticket?')) return;
        
        fetch(`api/ticket_admin_actions.php?action=close_ticket&id=${id}`)
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    // Instantly update the local state without reloading
                    let tIndex = this.ticketsList.findIndex(t => t.id == id);
                    if(tIndex > -1) {
                        this.ticketsList[tIndex].status = 'closed';
                        // Move to bottom of the list visually
                        let item = this.ticketsList.splice(tIndex, 1)[0];
                        this.ticketsList.push(item);
                        window.dispatchEvent(new CustomEvent('show-toast', {detail: {message: 'Ticket Archived'}}));
                    }
                }
            });
    },

    // AJAX: Complete a To-Do Task
    completeTask(taskId, el) {
        fetch(`api/ticket_admin_actions.php?action=complete_task&id=${taskId}`)
            .then(res => res.json())
            .then(data => {
                if(data.success) {
                    // Visually hide the task row
                    el.closest('.task-row').classList.add('opacity-0', 'scale-95');
                    setTimeout(() => { el.closest('.task-row').remove(); }, 300);
                    window.dispatchEvent(new CustomEvent('show-toast', {detail: {message: 'Task Marked Complete'}}));
                }
            });
    },

    get filteredTickets() {
        return this.ticketsList.filter(t => 
            t.subject.toLowerCase().includes(this.search.toLowerCase()) || 
            t.username.toLowerCase().includes(this.search.toLowerCase()) ||
            t.id.toString().includes(this.search)
        );
    }
}">

    <!-- HEADER & SEARCH -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 class="text-xl font-bold uppercase tracking-tight text-slate-900 dark:text-white leading-none">Support Queue</h2>
            <div class="flex items-center gap-2 mt-2">
                <div class="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI-Driven Triage Active</p>
            </div>
        </div>
        
        <div class="flex items-center gap-3">
            <div class="relative group">
                <input type="text" x-model="search" placeholder="Search Subject, User, or ID..." 
                    class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md px-10 py-2.5 text-xs outline-none focus:border-primary transition w-64 font-bold shadow-sm">
                <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3 text-slate-400 group-focus-within:text-primary transition text-xs"></i>
            </div>
            <button @click="loadPage('settings')" class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-md hover:text-primary transition shadow-sm">
                <i class="fa-solid fa-gears text-sm"></i>
            </button>
        </div>
    </div>

    <!-- TICKET LIST -->
    <div class="grid grid-cols-1 gap-4">
        <!-- Empty State -->
        <div x-show="filteredTickets.length === 0" x-transition class="p-12 text-center bg-white dark:bg-[#18181b] rounded-md border border-dashed border-slate-300 dark:border-slate-800 shadow-sm">
            <i class="fa-solid fa-inbox text-3xl text-slate-300 mb-3 block"></i>
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">Inbox is empty</p>
        </div>

        <template x-for="t in filteredTickets" :key="t.id">
            <div class="bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden transition-all duration-500" 
                 :class="t.status === 'closed' ? 'opacity-50 grayscale' : 'ring-1 ring-primary/5'">
                
                <!-- Ticket Header -->
                <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-slate-50 dark:hover:bg-slate-900/50">
                    <div @click="loadPage('view_ticket&id=' + t.id)" class="cursor-pointer flex-1 group">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[9px] font-black px-1.5 py-0.5 rounded uppercase transition" 
                                  :class="t.status === 'closed' ? 'bg-slate-200 text-slate-500' : 'bg-primary text-white'" x-text="'#' + t.id"></span>
                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest" x-text="t.username"></span>
                            <span class="text-[9px] font-black uppercase" 
                                  :class="t.status === 'open' ? 'text-green-500' : 'text-slate-400'" x-text="'• ' + t.status"></span>
                        </div>
                        <h3 class="text-sm font-bold transition" 
                            :class="t.status === 'closed' ? 'text-slate-500' : 'text-slate-800 dark:text-slate-200 group-hover:text-primary'" 
                            x-text="t.subject"></h3>
                    </div>
                    
                    <!-- Actions -->
                    <div class="flex items-center gap-2">
                        <template x-if="t.status !== 'closed'">
                            <div class="flex gap-2">
                                <button @click="closeTicket(t.id)" class="text-[9px] font-black uppercase text-slate-400 hover:text-red-500 px-3 py-2 transition">
                                    Dismiss
                                </button>
                                <button @click="loadPage('view_ticket&id=' + t.id)" class="bg-slate-900 dark:bg-primary text-white text-[9px] font-black uppercase px-5 py-2 rounded-md shadow-md transition transform active:scale-95">
                                    Manage
                                </button>
                            </div>
                        </template>
                        <template x-if="t.status === 'closed'">
                            <span class="text-[10px] font-bold text-slate-400 uppercase italic px-4 underline decoration-slate-200">Archived</span>
                        </template>
                    </div>
                </div>

                <!-- TO-DO LIST SECTION (PHP Rendered, JS Controlled) -->
                <div x-show="t.status !== 'closed'">
                    <?php foreach($tickets as $php_t): 
                        $tid = (int)$php_t['id'];
                        $t_res = mysqli_query($conn, "SELECT * FROM todo_list WHERE ticket_id = $tid AND is_completed = 0");
                        $pending_tasks = mysqli_fetch_all($t_res, MYSQLI_ASSOC);
                        
                        if(!empty($pending_tasks)):
                    ?>
                    <!-- This block only shows for the specific ticket matching the Alpine loop -->
                    <div x-show="t.id == <?php echo $tid; ?>" class="px-4 pb-4">
                        <div class="p-4 rounded-md border border-dashed bg-primary/5 border-primary/20">
                            <p class="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                <i class="fa-solid fa-list-check"></i> Action Plan Required
                            </p>
                            <div class="space-y-2">
                                <?php foreach($pending_tasks as $task): ?>
                                    <label class="task-row flex items-start gap-3 group cursor-pointer transition-all duration-300">
                                        <input type="checkbox" 
                                            @change="completeTask(<?php echo $task['id']; ?>, $event.target)" 
                                            class="mt-0.5 w-4 h-4 rounded border-primary/30 text-primary focus:ring-primary transition shadow-sm">
                                        <span class="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition leading-snug">
                                            <?php echo $task['task_description']; ?>
                                        </span>
                                    </label>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                    <?php endif; endforeach; ?>
                </div>

            </div>
        </template>
    </div>
</div>
                        