<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Maintenance | <?php echo $settings['site_name']; ?></title>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    <style>
        body { font-family: 'Nunito', sans-serif; background-color: #f8fafc; }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-6">
    <div class="max-w-md w-full text-center space-y-6">
        <div class="inline-flex h-20 w-20 bg-indigo-500/10 text-indigo-500 rounded-2xl items-center justify-center text-3xl mb-4">
            <i class="fa-solid fa-clock-rotate-left"></i>
        </div>
        
        <h1 class="text-2xl font-black text-slate-900 uppercase tracking-tight">We'll be back soon!</h1>
        
        <p class="text-slate-500 text-sm leading-relaxed">
            <?php echo $settings['site_name']; ?> is currently undergoing scheduled maintenance to improve our services. We apologize for the inconvenience.
        </p>

        <div class="pt-6 border-t border-slate-200">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Support</p>
            <div class="mt-4 flex justify-center gap-4">
                <a href="#" class="h-10 w-10 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600 hover:text-indigo-500 transition shadow-sm">
                    <i class="fa-brands fa-whatsapp"></i>
                </a>
                <a href="#" class="h-10 w-10 bg-white border border-slate-200 rounded-md flex items-center justify-center text-slate-600 hover:text-indigo-500 transition shadow-sm">
                    <i class="fa-solid fa-envelope"></i>
                </a>
            </div>
        </div>
        
        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">&copy; <?php echo date('Y'); ?> <?php echo $settings['site_name']; ?></p>
    </div>
</body>
</html>