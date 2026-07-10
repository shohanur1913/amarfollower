<?php
require_once '../includes/config.php';
require_once '../includes/auth.php';
require_once '../includes/gemini_helper.php';

// Security Check
checkLogin();
$user = getLoggedUser($conn);

// 1. Initialize AI with dynamic model from settings
$aiModel = $settings['gemini_model'] ?? 'gemini-1.5-flash';
$ai = new GeminiAI($settings['gemini_api_key'], $aiModel);
$knowledge_file = '../includes/knowledge_base.txt';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = (string)($_POST['action'] ?? '');

    // ==========================================
    // ACTION 1: CREATE NEW TICKET
    // ==========================================
    if ($action === 'create') {
        $subject = mysqli_real_escape_string($conn, (string)$_POST['subject']);
        $message = mysqli_real_escape_string($conn, (string)$_POST['message']);

        // A. SMART MERGE LOGIC (AI Detection)
        if (($settings['ai_merging'] ?? 'on') === 'on') {
            $check = mysqli_query($conn, "SELECT id, subject FROM tickets WHERE user_id = {$user['id']} AND status != 'closed' ORDER BY id DESC LIMIT 1");
            if ($row = mysqli_fetch_assoc($check)) {
                $mergeCheck = $ai->ask("User is opening a ticket: '$subject'. They already have an open ticket: '{$row['subject']}'. Is this likely the same issue or a follow-up? Reply ONLY YES or NO.");
                
                if (strpos(strtoupper($mergeCheck), 'YES') !== false) {
                    $tid = (int)$row['id'];
                    mysqli_query($conn, "INSERT INTO ticket_messages (ticket_id, sender_role, message) VALUES ($tid, 'user', '[System Auto-Merge]: $message')");
                    echo json_encode(['success' => true, 'redirect' => 'view_ticket&id='.$tid, 'message' => 'Linked to your current ticket.']);
                    exit;
                }
            }
        }

        // B. CREATE DATABASE RECORD
        mysqli_query($conn, "INSERT INTO tickets (user_id, subject, status) VALUES ({$user['id']}, '$subject', 'open')");
        $tid = mysqli_insert_id($conn);
        mysqli_query($conn, "INSERT INTO ticket_messages (ticket_id, sender_role, message) VALUES ($tid, 'user', '$message')");

        // C. STRICT AI PROMPT (Human Tone + 1 Task Limit)
        $diary = file_exists($knowledge_file) ? substr(file_get_contents($knowledge_file), -1500) : "";
        
        $system_prompt = "
            You are 'Niloy', the human Admin of Amar Follower SMM Panel.
            USER MESSAGE: '$message'
            PAST KNOWLEDGE: $diary
            
            REPLY RULES:
            1. Speak like a real person. Be extremely short and direct. Max 2 sentences.
            2. DO NOT use markdown, bolding, italics, bullet points, or asterisks (*). Use plain text only.
            3. If they give an Order ID, DO NOT ask them for more details. Just say 'I am checking this for you right now.'
            4. If they say an order is cancelled or stuck, say 'I will look into this and fix it or refund you.'
            
            TASK RULES (FOR THE ADMIN TO-DO LIST):
            1. You must write EXACTLY ONE line starting with 'TASK:'.
            2. The task must be a direct command to the admin, containing the Order ID or Username.
            3. DO NOT write generic steps. Write what needs to be clicked or checked.
            
            GOOD TASK: TASK: Check Order ID 5542 in SMMGen and issue a refund.
            BAD TASK: TASK: Investigate the root cause of the prolonged issue with your service.

            FORMAT YOUR OUTPUT EXACTLY LIKE THIS:
            [REPLY]: (Your short human reply)
            [TASKS]:
            TASK: (The single command for the admin)
        ";

        $rawResponse = $ai->ask($system_prompt);

        // D. EXTRACT EXACTLY ONE TASK FOR ADMIN
        $todo_inserted = false;
        preg_match_all('/TASK:\s*(.*)/i', $rawResponse, $taskMatches);
        
        if (!empty($taskMatches[1])) {
            // Force limit to 1 task by grabbing index [0]
            $clean_task = trim(str_replace(['*', '#', '`', 'Your', 'your', 'our', 'Our'], '', $taskMatches[1][0]));
            if (!empty($clean_task)) {
                mysqli_query($conn, "INSERT INTO todo_list (ticket_id, task_description, is_completed) VALUES ($tid, '" . mysqli_real_escape_string($conn, $clean_task) . "', 0)");
                $todo_inserted = true;
            }
        }

        // FAILSAFE: If AI failed to write a task but an Order ID was in the user message
        if (!$todo_inserted && preg_match('/(?:order|#|id)\s*(\d+)/i', $message, $id_match)) {
            $fallback_task = "Check Order ID " . $id_match[1] . " and resolve the issue.";
            mysqli_query($conn, "INSERT INTO todo_list (ticket_id, task_description, is_completed) VALUES ($tid, '" . mysqli_real_escape_string($conn, $fallback_task) . "', 0)");
        }

        // E. CLEAN AI REPLY (Strip Markdown & Task tags)
        $finalReply = preg_replace('/\[TASKS\].*/is', '', $rawResponse);
        $finalReply = str_replace('[REPLY]:', '', $finalReply);
        $finalReply = trim(str_replace(['*', '#', '`'], '', $finalReply));

        // F. SAVE REPLY & UPDATE STATUS
        mysqli_query($conn, "INSERT INTO ticket_messages (ticket_id, sender_role, message) VALUES ($tid, 'ai', '" . mysqli_real_escape_string($conn, $finalReply) . "')");
        mysqli_query($conn, "UPDATE tickets SET status = 'answered' WHERE id = $tid");

        // G. LOG TO DIARY
        file_put_contents($knowledge_file, "Q: $message | A: $finalReply\n---\n", FILE_APPEND);

        echo json_encode(['success' => true, 'redirect' => 'view_ticket&id='.$tid, 'message' => 'Ticket created!']);
        exit;
    }


    // ==========================================
    // ACTION 2: USER REPLY TO EXISTING TICKET
    // ==========================================
    if ($action === 'reply') {
        $tid = (int)$_POST['ticket_id'];
        $message = mysqli_real_escape_string($conn, (string)$_POST['message']);

        // Check ownership & Mute status
        $t_res = mysqli_query($conn, "SELECT ai_muted, status FROM tickets WHERE id = $tid AND user_id = {$user['id']}");
        $t_data = mysqli_fetch_assoc($t_res);

        if ($t_data && $t_data['status'] !== 'closed') {
            // Save User Message
            mysqli_query($conn, "INSERT INTO ticket_messages (ticket_id, sender_role, message) VALUES ($tid, 'user', '$message')");
            mysqli_query($conn, "UPDATE tickets SET status = 'open' WHERE id = $tid");

            $new_msgs = [['role' => 'user', 'msg' => $_POST['message']]];

            // AI Logic (Only if not muted by admin)
            if ($t_data['ai_muted'] == 0) {
                $replyPrompt = "You are Niloy. User replied to ticket #$tid. New message: '$message'. 
                Give a short, human-like response without markdown (*). 
                If you need me (admin) to do something, add exactly ONE line at the bottom starting with 'TASK:'.";
                
                $raw = $ai->ask($replyPrompt);
                
                // Extract task
                preg_match_all('/TASK:\s*(.*)/i', $raw, $taskMatches);
                if (!empty($taskMatches[1])) {
                    $clean_task = mysqli_real_escape_string($conn, trim(str_replace(['*', '#', '`'], '', $taskMatches[1][0])));
                    if(!empty($clean_task)) {
                        mysqli_query($conn, "INSERT INTO todo_list (ticket_id, task_description, is_completed) VALUES ($tid, '$clean_task', 0)");
                    }
                }

                // Clean Reply
                $aiMsg = trim(preg_replace('/TASK:.*/i', '', $raw));
                $aiMsg = str_replace(['*', '#', '`'], '', $aiMsg);

                mysqli_query($conn, "INSERT INTO ticket_messages (ticket_id, sender_role, message) VALUES ($tid, 'ai', '" . mysqli_real_escape_string($conn, $aiMsg) . "')");
                mysqli_query($conn, "UPDATE tickets SET status = 'answered' WHERE id = $tid");
                
                $new_msgs[] = ['role' => 'ai', 'msg' => $aiMsg];
            }

            echo json_encode(['success' => true, 'new_messages' => $new_msgs]);
            exit;
        }
    }


    // ==========================================
    // ACTION 3: USER CLOSES TICKET
    // ==========================================
    if ($action === 'close_ticket') {
        $tid = (int)$_POST['ticket_id'];
        
        // Ensure user owns the ticket
        $ownership = mysqli_query($conn, "SELECT id FROM tickets WHERE id = $tid AND user_id = {$user['id']}");
        if (mysqli_num_rows($ownership) > 0) {
            
            // Mark as closed and mute AI so it stops responding
            mysqli_query($conn, "UPDATE tickets SET status = 'closed', ai_muted = 1 WHERE id = $tid");
            
            // Auto-clear any pending tasks since the issue is resolved
            mysqli_query($conn, "UPDATE todo_list SET is_completed = 1 WHERE ticket_id = $tid");
            
            echo json_encode(['success' => true]);
            exit;
        }
    }

}

echo json_encode(['success' => false, 'message' => 'Invalid Request']);
