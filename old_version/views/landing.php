<?php 
require_once 'includes/config.php'; 
require_once 'includes/auth.php'; 
require_once 'includes/router.php';

// 1. Check User State & Database Settings
$isLoggedIn = isset($_SESSION['user_id']);
$user = $isLoggedIn ? getLoggedUser($conn) : null;
$isAdmin = ($_SESSION['role'] ?? 'user') === 'admin';
$isMaintenance = ($settings['maintenance_mode'] ?? 'off') === 'on';
$siteName = htmlspecialchars($settings['site_name'] ?? 'SMM Panel');
$primaryColor = htmlspecialchars($settings['primary_color'] ?? '#2B59FF');
$logoUrl = htmlspecialchars($settings['logo_url'] ?? '');
$faviconUrl = htmlspecialchars($settings['favicon_url'] ?? '');

// =================================================================
// MASTER CONFIGURATION FOR LANDING PAGE & FOOTER
// Easily change your texts, links, and visibilities here
// =================================================================

// --- Landing Page Content ---
$siteVersion = "v2.0";
$lpUpdateBadgeText = "Major Update!";
$lpUpdateBadgeDesc = "$siteName $siteVersion is now online!";

$lpHeroTitleTop = "Best & Cheap SMM Panel";
$lpHeroTitleBottom = "for Social<br>Media Growth";

$lpHeroDescription = "$siteName is a simple and affordable SMM panel to grow your social media. Get more followers, likes, and views fast with real results. Trusted by many users with quick support. Start growing today with $siteName.";

// --- Footer & Link Configuration ---
// Set 'show' to true or false to easily hide/show specific links
$footerConfig = [
    'socials' => [
        'twitter'   => ['url' => 'https://www.instagram.com/amar.follower', 'show' => true, 'icon' => 'fa-twitter'],
        'instagram' => ['url' => '#', 'show' => true, 'icon' => 'fa-instagram'],
        'facebook'  => ['url' => 'https://www.facebook.com/amarfollower', 'show' => true, 'icon' => 'fa-facebook-f'],
        'youtube'   => ['url' => '#', 'show' => false, 'icon' => 'fa-youtube'] // Example of a hidden item
    ],
    'product_links' => [
        'Services List'     => ['url' => 'services', 'show' => true],
        'Pricing & Plans'   => ['url' => '#', 'show' => false],
        'API Documentation' => ['url' => 'apis', 'show' => true],
        'Affiliate Program' => ['url' => 'affiliate', 'show' => true]
    ],
    'company_links' => [
        'About Us'         => ['url' => '#', 'show' => false],
        'Contact Support'  => ['url' => 'tickets', 'show' => true],
        'Terms of Service' => ['url' => 'terms', 'show' => false],
        'Privacy Policy'   => ['url' => '#privacy', 'show' => false]
    ]
];

// 2. Immediate Payment Cancellation Handler
if ($isLoggedIn && isset($_GET['status']) && $_GET['status'] === 'cancel' && isset($_GET['tid'])) {
    $tid = mysqli_real_escape_string($conn, $_GET['tid']);
    mysqli_query($conn, "UPDATE payments SET status = 'failed' WHERE transaction_id = '$tid' AND user_id = {$user['id']} AND status = 'pending'");
    header("Location: transactions?error=Payment cancelled");
    exit;
}

// 3. Maintenance Mode Logic (Applies to both guests and users)
if ($isMaintenance && !$isAdmin) {
    include 'views/maintenance.php';
    exit;
}

// =================================================================
// STATE A: THE LANDING PAGE (For Non-Logged In Users)
// =================================================================
if (!$isLoggedIn) {
?>
<!DOCTYPE html>
<html lang="en" class="scroll-smooth overflow-x-hidden w-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    
    <title><?php echo $lpHeroTitleTop; ?> - <?php echo $siteName; ?></title>
    <meta name="description" content="<?php echo htmlspecialchars(strip_tags($lpHeroDescription)); ?>">
    <meta name="keywords" content="<?php echo htmlspecialchars($settings['site_keywords'] ?? 'smm panel, social media marketing, followers, engagement'); ?>">
    
    <?php if(!empty($faviconUrl)): ?>
        <link rel="icon" type="image/png" href="<?php echo $faviconUrl; ?>?v=<?php echo time(); ?>">
    <?php endif; ?>

    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: { 
                        primary: '<?php echo $primaryColor; ?>', 
                        bglight: '#FAFBFF',
                    },
                    fontFamily: { sans: ['Inter', 'sans-serif'] },
                    boxShadow: {
                        'float': '0 20px 40px -10px rgba(0,0,0,0.05)',
                        'nav': '0 4px 20px -2px rgba(0,0,0,0.03)',
                        'card': '0 10px 30px -5px rgba(0,0,0,0.04)',
                    }
                }
            }
        }
    </script>
    <style>
        body { background-color: #FDFDFF; overflow-x: hidden; }
        .circle-bg {
            position: absolute;
            border-radius: 50%;
            border: 60px solid #F4F7FF;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .circle-1 { width: 900px; height: 900px; top: 300px;}
        .circle-2 { width: 1500px; height: 1500px; top: 300px; border-color: #F8FAFF; border-width: 80px;}
        
        /* Smooth Floating Animations */
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
        }
        @keyframes float-delayed {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 7s ease-in-out 2s infinite; }
        .animate-float-slow { animation: float 8s ease-in-out 1s infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; }
        .stagger-1 { animation-delay: 0.1s; opacity: 0; }
        .stagger-2 { animation-delay: 0.3s; opacity: 0; }
        .stagger-3 { animation-delay: 0.5s; opacity: 0; }
    </style>
</head>
<body class="text-slate-900 antialiased min-h-screen flex flex-col relative overflow-x-hidden w-full">
    
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div class="circle-bg circle-1 hidden md:block"></div>
        <div class="circle-bg circle-2 hidden md:block"></div>
    </div>

    <div class="w-full max-w-[1200px] mx-auto px-4 pt-4 md:pt-6 relative z-50 animate-fade-in-up">
        <nav class="bg-white rounded-2xl md:rounded-full px-4 md:px-6 py-3 flex items-center justify-between shadow-nav border border-slate-100 box-border">
            
            <div class="flex items-center gap-3">
                <?php if(!empty($logoUrl)): ?>
                    <img src="<?php echo $logoUrl; ?>?v=<?php echo time(); ?>" 
                         alt="<?php echo $siteName; ?> Logo" 
                         class="h-8 max-w-[160px] object-contain block"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    
                    <div class="hidden items-center gap-3">
                        <div class="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                            <?php echo substr($siteName, 0, 1); ?>
                        </div>
                        <span class="text-lg font-bold tracking-tight text-slate-800"><?php echo $siteName; ?></span>
                    </div>
                <?php else: ?>
                    <div class="flex items-center gap-3">
                        <div class="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                            <?php echo substr($siteName, 0, 1); ?>
                        </div>
                        <span class="text-lg font-bold tracking-tight text-slate-800"><?php echo $siteName; ?></span>
                    </div>
                <?php endif; ?>
            </div>
            
            <div class="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
                <a href="#" class="bg-primary/10 text-primary px-5 py-2 rounded-full">Home</a>
                <a href="#" class="hover:text-primary px-5 py-2 transition">Service List</a>
                <a href="#" class="hover:text-primary px-5 py-2 transition">Docs</a>
                <a href="#" class="hover:text-primary px-5 py-2 transition">Blog</a>
            </div>

            <div class="flex items-center gap-2 md:gap-4 shrink-0">
                <a href="login.php" class="text-sm font-semibold text-slate-700 hover:text-primary px-2 md:px-4 py-2 transition">Sign in</a>
                <a href="register.php" class="bg-primary text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:opacity-90 transition shadow-md shadow-primary/20">Sign up</a>
            </div>
        </nav>
    </div>

    <main class="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col items-center pt-16 md:pt-24 pb-16 px-4 box-border">
        
        <div class="hidden xl:block absolute left-4 top-[10%] z-20 animate-float">
            <div class="bg-white rounded-2xl shadow-float border border-slate-100 p-3 flex items-center gap-3 w-max">
                <img src="https://i.pravatar.cc/100?img=5" class="w-8 h-8 rounded-full" alt="Avatar">
                <span class="text-xs font-semibold text-slate-700">You got New followers! <span class="text-lg">🎉</span></span>
            </div>
        </div>

        <div class="hidden xl:block absolute left-[2%] top-[30%] z-20 animate-float-delayed">
            <div class="bg-white rounded-2xl shadow-float border border-slate-100 p-5 w-[280px]">
                <div class="flex justify-between items-start mb-2">
                    <span class="text-[10px] font-semibold text-slate-400">Net Follower Gain</span>
                    <i class="fa-solid fa-ellipsis text-slate-300"></i>
                </div>
                <div class="text-2xl font-bold text-slate-800">$550,000</div>
                <div class="flex justify-between items-center mt-3">
                    <div class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                        Boost Activated <i class="fa-solid fa-rocket"></i>
                    </div>
                    <div class="text-right">
                        <div class="text-[9px] text-slate-400 flex items-center gap-1 justify-end"><span class="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Followers</div>
                        <div class="text-sm font-bold text-slate-800">250,000</div>
                    </div>
                </div>
                <div class="mt-4 relative h-12 w-full flex items-end">
                    <svg class="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <path d="M0,30 Q20,35 40,20 T70,10 T100,5" fill="none" stroke="#E2E8F0" stroke-width="2"/>
                        <path d="M0,25 Q20,30 40,15 T70,25 T100,0" fill="none" stroke="<?php echo $primaryColor; ?>" stroke-width="2"/>
                    </svg>
                    <div class="absolute left-[70%] top-[20px] w-2 h-2 bg-primary rounded-full ring-4 ring-primary/20 -translate-x-1/2 -translate-y-1/2 text-[9px] text-white font-bold flex items-center justify-center">
                        <div class="absolute -top-6 bg-slate-800 text-white px-2 py-0.5 rounded text-[8px]">16K</div>
                    </div>
                </div>
                <div class="flex justify-between mt-2 text-[8px] text-slate-400 font-medium px-1">
                    <span>April</span><span>May</span><span>June</span><span>July</span><span>August</span>
                </div>
            </div>
        </div>

        <div class="hidden xl:block absolute right-[5%] top-[15%] z-20 animate-float-slow">
            <div class="bg-white rounded-2xl shadow-float border border-slate-100 p-5 w-[260px]">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-[10px] font-bold text-slate-800">Order #1345</span>
                    <span class="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full">In Progress</span>
                </div>
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2">
                        <img src="https://i.pravatar.cc/100?img=9" class="w-8 h-8 rounded-full" alt="Avatar">
                        <span class="text-[10px] font-semibold text-slate-600">@elenaturkale</span>
                    </div>
                    <span class="text-[9px] font-bold text-slate-800">1000<span class="text-slate-400">/10,000,000</span></span>
                </div>
                <div class="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-md inline-block mb-2">Boost Active 🚀</div>
                <div class="flex gap-0.5 w-full h-2 mt-1">
                    <div class="bg-primary h-full w-1/12 rounded-l-sm"></div>
                    <div class="bg-primary h-full w-1/12"></div>
                    <div class="bg-primary h-full w-1/12"></div>
                    <div class="bg-primary/20 h-full w-1/12"></div>
                    <div class="bg-primary/20 h-full w-1/12"></div>
                    <div class="bg-primary/20 h-full w-1/12"></div>
                    <div class="bg-primary/20 h-full w-1/12"></div>
                    <div class="bg-primary/20 h-full w-1/12"></div>
                    <div class="bg-primary/20 h-full w-1/12"></div>
                    <div class="bg-primary/20 h-full w-1/12"></div>
                    <div class="bg-primary/20 h-full w-1/12 rounded-r-sm"></div>
                </div>
            </div>
        </div>

        <div class="hidden xl:block absolute right-[8%] top-[45%] z-20 animate-float">
            <div class="bg-white rounded-2xl shadow-float border border-slate-100 p-4 w-[240px]">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 bg-primary/10 rounded text-primary flex justify-center items-center text-[10px]"><i class="fa-solid fa-shirt"></i></div>
                        <span class="text-xs font-semibold text-slate-700">My Clothing Brand</span>
                    </div>
                    <i class="fa-solid fa-arrow-trend-up text-primary text-xs"></i>
                </div>
                <div class="text-[10px] text-slate-400 font-medium">Net Sales</div>
                <div class="flex items-end gap-3 mt-1">
                    <span class="text-2xl font-bold text-slate-800">$500,000</span>
                    <span class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">+110%</span>
                </div>
            </div>
        </div>

        <div class="text-center max-w-[700px] flex flex-col items-center mt-4 md:mt-8 px-2">
            
            <div class="animate-fade-in-up stagger-1 bg-white border border-slate-100 shadow-sm rounded-full px-1 py-1 flex items-center gap-2 md:gap-3 pr-3 md:pr-4 mb-6 md:mb-8 max-w-full">
                <span class="bg-primary/10 text-primary text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full whitespace-nowrap"><?php echo $lpUpdateBadgeText; ?></span>
                <span class="text-[10px] md:text-xs font-semibold text-slate-600 truncate"><?php echo $lpUpdateBadgeDesc; ?></span>
            </div>

            <h1 class="animate-fade-in-up stagger-2 text-4xl md:text-5xl lg:text-6xl font-[800] text-slate-900 leading-[1.15] md:leading-[1.15] tracking-tight">
                <span class="text-primary"><?php echo $lpHeroTitleTop; ?></span> 
                <i class="fa-solid fa-wand-magic-sparkles text-primary text-3xl md:text-4xl hidden sm:inline-block"></i><br>
                <?php echo $lpHeroTitleBottom; ?>
            </h1>

            <p class="animate-fade-in-up stagger-3 mt-4 md:mt-6 text-slate-500 font-medium text-sm md:text-base max-w-[600px] px-4 leading-relaxed">
                <?php echo $lpHeroDescription; ?>
            </p>

            <a href="register.php" class="animate-fade-in-up stagger-3 mt-8 bg-primary text-white text-sm font-semibold px-8 py-4 rounded-full shadow-lg shadow-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 flex items-center gap-2">
                Signup for free today! <i class="fa-solid fa-user-plus ml-1"></i>
            </a>

            <div class="animate-fade-in-up stagger-3 mt-10 flex flex-col sm:flex-row items-center gap-4">
                <div class="flex -space-x-3">
                    <img class="w-8 h-8 rounded-full border-2 border-white relative z-40" src="https://i.pravatar.cc/100?img=1" alt="user">
                    <img class="w-8 h-8 rounded-full border-2 border-white relative z-30" src="https://i.pravatar.cc/100?img=2" alt="user">
                    <img class="w-8 h-8 rounded-full border-2 border-white relative z-20" src="https://i.pravatar.cc/100?img=3" alt="user">
                    <img class="w-8 h-8 rounded-full border-2 border-white relative z-10" src="https://i.pravatar.cc/100?img=4" alt="user">
                </div>
                <div class="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <i class="fa-solid fa-star text-orange-400 text-sm"></i>
                    <span class="text-slate-800">4.8 / 5</span> Rating over 500 Reviews
                </div>
            </div>

            <div class="animate-fade-in-up stagger-3 mt-10 md:mt-12 flex flex-wrap justify-center gap-2 md:gap-3 px-2">
                <div class="bg-white shadow-sm border border-slate-100 rounded-full px-3 md:px-4 py-2 flex items-center gap-2 text-[10px] md:text-xs font-semibold text-slate-700 hover:-translate-y-0.5 transition duration-300">
                    <div class="bg-primary/10 text-primary w-5 h-5 rounded-full flex justify-center items-center text-[10px]"><i class="fa-solid fa-percent"></i></div> Starting at Just $0.001/K.
                </div>
                <div class="bg-white shadow-sm border border-slate-100 rounded-full px-3 md:px-4 py-2 flex items-center gap-2 text-[10px] md:text-xs font-semibold text-slate-700 hover:-translate-y-0.5 transition duration-300">
                    <div class="bg-primary/10 text-primary w-5 h-5 rounded-full flex justify-center items-center text-[10px]"><i class="fa-solid fa-percent"></i></div> Non-drop services
                </div>
                <div class="bg-white shadow-sm border border-slate-100 rounded-full px-3 md:px-4 py-2 flex items-center gap-2 text-[10px] md:text-xs font-semibold text-slate-700 hover:-translate-y-0.5 transition duration-300">
                    <div class="bg-primary/10 text-primary w-5 h-5 rounded-full flex justify-center items-center text-[10px]"><i class="fa-solid fa-percent"></i></div> Lifetime Refills
                </div>
                <div class="bg-white shadow-sm border border-slate-100 rounded-full px-3 md:px-4 py-2 flex items-center gap-2 text-[10px] md:text-xs font-semibold text-slate-700 hover:-translate-y-0.5 transition duration-300">
                    <div class="bg-primary/10 text-primary w-5 h-5 rounded-full flex justify-center items-center text-[10px]"><i class="fa-solid fa-headset"></i></div> 24/7 Support
                </div>
            </div>

        </div>

        <div class="animate-fade-in-up stagger-3 mt-20 md:mt-28 w-full text-center">
            <h3 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Providing solutions for best platforms</h3>
            <div class="flex flex-wrap justify-center items-center gap-6 md:gap-14 text-slate-400 opacity-70 px-4">
                <div class="flex items-center gap-2 text-xl md:text-2xl font-bold hover:text-slate-800 transition cursor-pointer"><i class="fa-brands fa-youtube"></i> YouTube</div>
                <div class="flex items-center gap-2 text-xl md:text-2xl font-bold hover:text-slate-800 transition cursor-pointer"><i class="fa-brands fa-twitter"></i> twitter</div>
                <div class="flex items-center gap-2 text-xl md:text-2xl font-bold hover:text-slate-800 transition cursor-pointer"><i class="fa-brands fa-instagram"></i> Instagram</div>
                <div class="flex items-center gap-2 text-xl md:text-2xl font-bold hover:text-slate-800 transition cursor-pointer"><i class="fa-brands fa-tiktok"></i> TikTok</div>
                <div class="flex items-center gap-2 text-xl md:text-2xl font-bold hover:text-slate-800 transition cursor-pointer"><i class="fa-brands fa-facebook"></i> facebook</div>
            </div>
        </div>

        <div class="mt-24 md:mt-32 text-center w-full px-4 animate-fade-in-up">
            <div class="inline-flex items-center gap-2 bg-white border border-slate-100 shadow-sm rounded-full px-4 py-1.5 mb-6">
                <div class="bg-primary/10 text-primary w-5 h-5 rounded-full flex justify-center items-center text-[10px]"><i class="fa-solid fa-bolt"></i></div>
                <span class="text-xs font-bold text-primary">How it works ?</span>
            </div>
            
            <h2 class="text-3xl md:text-4xl font-[800] text-slate-900 tracking-tight">
                How to <span class="text-primary">grow</span> in social in <span class="text-primary">3 steps</span> ?
            </h2>
            <p class="mt-3 text-slate-500 font-medium text-sm">
                The All-In-One Social Media Marketing tool you will need!
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto mt-12 w-full text-left">
                
                <div class="bg-white rounded-2xl shadow-card border border-slate-100 p-6 flex flex-col md:flex-row items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition duration-300">
                    <div class="bg-primary/10 text-primary w-12 h-12 rounded-xl flex justify-center items-center shrink-0 text-lg">
                        <i class="fa-solid fa-user-plus"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-lg">Signup for free!</h4>
                        <p class="text-sm text-slate-500 mt-2 font-medium">Create a free account in less than a minute. No credit card required to explore our amazing dashboard.</p>
                    </div>
                </div>

                <div class="bg-white rounded-2xl shadow-card border border-slate-100 p-6 flex flex-col md:flex-row items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition duration-300">
                    <div class="bg-primary/10 text-primary w-12 h-12 rounded-xl flex justify-center items-center shrink-0 text-lg">
                        <i class="fa-solid fa-wallet"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-lg">Add funds</h4>
                        <p class="text-sm text-slate-500 mt-2 font-medium">Top up your account balance securely using our wide range of supported global payment methods.</p>
                    </div>
                </div>

                <div class="bg-white rounded-2xl shadow-card border border-slate-100 p-6 flex flex-col md:flex-row items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition duration-300">
                    <div class="bg-primary/10 text-primary w-12 h-12 rounded-xl flex justify-center items-center shrink-0 text-lg">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-lg">Select service & order!</h4>
                        <p class="text-sm text-slate-500 mt-2 font-medium">Pick the social media service you need, paste your link, and watch the magic happen instantly.</p>
                    </div>
                </div>

            </div>
        </div>

    </main>

    <footer class="mt-24 border-t border-slate-100 bg-white relative z-10 w-full pt-16 pb-8 box-border">
        <div class="max-w-[1200px] mx-auto px-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
                <div class="col-span-1 md:col-span-2">
                    
                    <div class="flex items-center gap-3 mb-5 group cursor-pointer w-max">
                        <?php if(!empty($logoUrl)): ?>
                            <img src="<?php echo $logoUrl; ?>?v=<?php echo time(); ?>" 
                                 alt="<?php echo $siteName; ?> Logo" 
                                 class="h-10 max-w-[200px] object-contain group-hover:scale-105 transition-transform duration-300 block"
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                            
                            <div class="hidden items-center gap-3">
                                <div class="h-12 w-12 bg-gradient-to-br from-primary to-blue-400 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-primary/30 group-hover:scale-105 group-hover:shadow-primary/50 transition-all duration-300 border border-white/20 relative overflow-hidden">
                                    <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                                    <?php echo substr($siteName, 0, 1); ?>
                                </div>
                                <span class="text-2xl font-[800] tracking-tight text-slate-900 group-hover:text-primary transition-colors"><?php echo $siteName; ?></span>
                            </div>
                        <?php else: ?>
                            <div class="flex items-center gap-3">
                                <div class="h-12 w-12 bg-gradient-to-br from-primary to-blue-400 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-primary/30 group-hover:scale-105 group-hover:shadow-primary/50 transition-all duration-300 border border-white/20 relative overflow-hidden">
                                    <div class="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                                    <?php echo substr($siteName, 0, 1); ?>
                                </div>
                                <span class="text-2xl font-[800] tracking-tight text-slate-900 group-hover:text-primary transition-colors"><?php echo $siteName; ?></span>
                            </div>
                        <?php endif; ?>
                    </div>

                    <p class="text-slate-500 text-sm max-w-sm leading-relaxed mb-6 font-medium">
                        <?php echo htmlspecialchars($settings['site_description'] ?? 'The all-in-one social media marketing tool to supercharge your online presence. Fast, reliable, and secure automated services.'); ?>
                    </p>
                    
                    <div class="flex items-center gap-3">
                        <?php foreach($footerConfig['socials'] as $key => $social): ?>
                            <?php if($social['show']): ?>
                                <a href="<?php echo $social['url']; ?>" class="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm"><i class="fa-brands <?php echo $social['icon']; ?>"></i></a>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div>
                    <h4 class="font-bold text-slate-900 mb-5">Product</h4>
                    <ul class="space-y-3 text-sm text-slate-500 font-medium">
                        <?php foreach($footerConfig['product_links'] as $label => $item): ?>
                            <?php if($item['show']): ?>
                                <li><a href="<?php echo $item['url']; ?>" class="hover:text-primary transition"><?php echo $label; ?></a></li>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </ul>
                </div>

                <div>
                    <h4 class="font-bold text-slate-900 mb-5">Company</h4>
                    <ul class="space-y-3 text-sm text-slate-500 font-medium">
                        <?php foreach($footerConfig['company_links'] as $label => $item): ?>
                            <?php if($item['show']): ?>
                                <li><a href="<?php echo $item['url']; ?>" class="hover:text-primary transition"><?php echo $label; ?></a></li>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </ul>
                </div>
            </div>

            <div class="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-sm text-slate-400 font-medium">&copy; <?php echo date('Y'); ?> <?php echo $siteName; ?>. All rights reserved.</p>
                <div class="flex items-center gap-2 text-sm text-slate-400 font-medium bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    Made with <i class="fa-solid fa-heart text-red-500 mx-1"></i> for creators
                </div>
            </div>
        </div>
    </footer>

</body>
</html>
<?php 
    exit; // Stop script execution so the dashboard HTML below doesn't load for guests.
} 

// =================================================================
// STATE B: THE SPA DASHBOARD (For Logged In Users)
// =================================================================
// $user is already populated at the top of the file via getLoggedUser($conn) if logged in.
include 'includes/header.php'; 
include 'includes/sidebar.php'; 
?>

<main 
    x-data="appController()" 
    x-init="init()"
    @popstate.window="handleBackNavigation($event)"
    class="lg:ml-72 pt-20 min-h-screen transition-all bg-[#f8fafc] dark:bg-[#09090b] overflow-x-hidden w-full"
>
    <div class="p-4 lg:p-10 max-w-7xl mx-auto box-border">
        
        <?php if($isMaintenance && $isAdmin): ?>
            <div class="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-3">
                <i class="fa-solid fa-screwdriver-wrench text-amber-500"></i>
                <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">Maintenance Mode is ON (Public access blocked)</p>
            </div>
        <?php endif; ?>

        <div x-show="loading" x-cloak class="flex items-center justify-center py-32">
            <div class="h-10 w-10 border-4 border-slate-200 dark:border-slate-800 border-t-primary animate-spin rounded-full"></div>
        </div>

        <div id="content" x-show="!loading" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
            </div>

    </div>
</main>

<script>
function appController() {
    return {
        loading: false,
        page: '',

        init() {
            // Fix: Detect current page from URL on refresh
            // If the URL is yoursite.com/transactions, this will load transactions.php
            const path = window.location.pathname.split('/').pop() || 'dashboard';
            const params = new URLSearchParams(window.location.search);
            
            // Check for potential query strings like &id= or &status=
            const fullRequest = params.toString() ? path + '&' + params.toString() : path;
            
            this.loadPage(fullRequest, false);
            
            // Note: If you need link interception for sidebar links without reloading:
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (!link) return;
                
                // Assuming internal routing links don't have .php extension and aren't external
                const href = link.getAttribute('href');
                if (href && !href.startsWith('http') && !href.startsWith('#') && !href.includes('.php')) {
                    e.preventDefault();
                    
                    // Extract just the page name (and query parameters if any)
                    const url = new URL(link.href);
                    let requestedPage = url.pathname.split('/').pop() || 'dashboard';
                    if(url.search) requestedPage += url.search.replace('?', '&');
                    
                    this.loadPage(requestedPage);
                }
            });

            // Check for success/error messages from PHP redirects (preserved from old logic)
            const errorMsg = params.get('error');
            const successMsg = params.get('order_success') || params.get('success');
            const msgBody = params.get('msg');
            
            if(errorMsg) {
                setTimeout(() => window.dispatchEvent(new CustomEvent('notify', {detail: {message: errorMsg, type: 'error'}})), 500);
            } else if(successMsg) {
                setTimeout(() => window.dispatchEvent(new CustomEvent('notify', {detail: {message: msgBody || 'Operation Successful', type: 'success'}})), 500);
            }
        },

        loadPage(request, pushState = true) {
            if (!request) return;
            this.loading = true;

            // Separate filename and parameters
            let parts = request.split('&');
            let fileName = parts[0]; 
            let queryParams = parts.length > 1 ? '?' + parts.slice(1).join('&') : '';

            fetch('views/' + fileName + '.php' + queryParams)
                .then(res => {
                    if (!res.ok) throw new Error('Page not found');
                    return res.text();
                })
                .then(html => {
                    document.getElementById('content').innerHTML = html;
                    
                    // Fix: Change URL to look professional
                    if (pushState) {
                        // URL will now look like: yoursite.com/transactions
                        const cleanUrl = '/' + request.replace('&', '?');
                        history.pushState({ path: request }, '', cleanUrl);
                    }
                    
                    this.page = fileName;
                    this.loading = false;
                    window.scrollTo(0, 0);
                })
                .catch(err => {
                    console.error('SPA Error:', err);
                    document.getElementById('content').innerHTML = `
                        <div class="p-12 text-center bg-white dark:bg-[#18181b] rounded-xl border border-red-500/20 shadow-sm">
                            <i class="fa-solid fa-triangle-exclamation text-4xl text-red-500 mb-4 block"></i>
                            <p class="text-sm font-bold text-red-500 uppercase tracking-widest">Error Loading Page</p>
                            <p class="text-xs text-slate-500 mt-2 font-medium">The requested page "${fileName}" could not be found.</p>
                        </div>`;
                    this.loading = false;
                });
        },

        handleBackNavigation(event) {
            const path = (event.state && event.state.path) ? event.state.path : 'dashboard';
            this.loadPage(path, false);
        }
    }
}
</script>

</body>
</html>
