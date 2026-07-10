import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Sparkles, UserPlus, Wallet, ShoppingCart,
  Star, Bolt, Percent, Headset, Rocket,
  Heart, ArrowUpRight, Ellipsis,
} from "lucide-react";

export default async function HomePage() {
  const user = await getSession();
  if (user) {
    redirect("/dashboard");
  }

  const settings = await prisma.setting.findMany({
    where: { key: { in: ["site_name", "logo_url", "favicon_url", "primary_color"] } },
  });
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => { settingsMap[s.key] = s.value; });

  const siteName = settingsMap.site_name || "AmarFollower";
  const logoUrl = settingsMap.logo_url || "";
  const primaryColor = settingsMap.primary_color || "#6366f1";

  return (
    <div className="relative min-h-screen flex flex-col text-slate-900 antialiased overflow-x-hidden w-full bg-[#FDFDFF] font-sans">
      {/* Background decorative circles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute rounded-full border-[60px] border-[#F4F7FF] w-[900px] h-[900px] top-[300px] left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block" />
        <div className="absolute rounded-full border-[80px] border-[#F8FAFF] w-[1500px] h-[1500px] top-[300px] left-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block" />
      </div>

      {/* Navbar */}
      <div className="w-full max-w-[1200px] mx-auto px-4 pt-4 md:pt-6 relative z-50 animate-fade-in-up">
        <nav className="bg-white rounded-2xl md:rounded-full px-4 md:px-6 py-3 flex items-center justify-between shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] border border-slate-100">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-8 max-w-[160px] object-contain" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {siteName.charAt(0)}
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-800">{siteName}</span>
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-600">
            <Link href="/" className="bg-primary/10 text-primary px-5 py-2 rounded-full">Home</Link>
            <Link href="/services" className="hover:text-primary px-5 py-2 transition">Service List</Link>
            <Link href="/docs" className="hover:text-primary px-5 py-2 transition">Docs</Link>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-primary px-2 md:px-4 py-2 transition">
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-primary text-white text-xs md:text-sm font-semibold px-4 md:px-6 py-2 md:py-2.5 rounded-full hover:opacity-90 transition shadow-md shadow-primary/20"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </div>

      <main className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col items-center pt-16 md:pt-24 pb-16 px-4">
        {/* Floating stat cards */}
        <div className="hidden xl:block absolute left-4 top-[10%] z-20 animate-float">
          <div className="bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 p-3 flex items-center gap-3 w-max">
            <img src="https://i.pravatar.cc/100?img=5" className="w-8 h-8 rounded-full" alt="" />
            <span className="text-xs font-semibold text-slate-700">
              You got New followers! <span className="text-lg">🎉</span>
            </span>
          </div>
        </div>

        <div className="hidden xl:block absolute left-[2%] top-[30%] z-20 animate-float-delayed">
          <div className="bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 p-5 w-[280px]">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-semibold text-slate-400">Net Follower Gain</span>
              <Ellipsis className="h-3 w-3 text-slate-300" />
            </div>
            <div className="text-2xl font-bold text-slate-800">$550,000</div>
            <div className="flex justify-between items-center mt-3">
              <div className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                Boost Activated <Rocket className="h-2.5 w-2.5" />
              </div>
              <div className="text-right">
                <div className="text-[9px] text-slate-400 flex items-center gap-1 justify-end">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" /> Followers
                </div>
                <div className="text-sm font-bold text-slate-800">250,000</div>
              </div>
            </div>
            <div className="mt-4 relative h-12 w-full flex items-end">
              <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d="M0,30 Q20,35 40,20 T70,10 T100,5" fill="none" stroke="#E2E8F0" strokeWidth="2" />
                <path d="M0,25 Q20,30 40,15 T70,25 T100,0" fill="none" stroke={primaryColor} strokeWidth="2" />
              </svg>
              <div className="absolute left-[70%] top-[20px] w-2 h-2 bg-primary rounded-full ring-4 ring-primary/20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                <div className="absolute -top-6 bg-slate-800 text-white px-2 py-0.5 rounded text-[8px]">16K</div>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[8px] text-slate-400 font-medium px-1">
              <span>April</span><span>May</span><span>June</span><span>July</span><span>August</span>
            </div>
          </div>
        </div>

        <div className="hidden xl:block absolute right-[5%] top-[15%] z-20 animate-float-slow">
          <div className="bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 p-5 w-[260px]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-800">Order #1345</span>
              <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full">In Progress</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <img src="https://i.pravatar.cc/100?img=9" className="w-8 h-8 rounded-full" alt="" />
                <span className="text-[10px] font-semibold text-slate-600">@elenaturkale</span>
              </div>
              <span className="text-[9px] font-bold text-slate-800">
                1000<span className="text-slate-400">/10,000,000</span>
              </span>
            </div>
            <div className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 mb-2">
              Boost Active <Rocket className="h-2.5 w-2.5" />
            </div>
            <div className="flex gap-0.5 w-full h-2 mt-1">
              <div className="bg-primary h-full w-1/12 rounded-l-sm" />
              <div className="bg-primary h-full w-1/12" />
              <div className="bg-primary h-full w-1/12" />
              <div className="bg-primary/20 h-full w-1/12" />
              <div className="bg-primary/20 h-full w-1/12" />
              <div className="bg-primary/20 h-full w-1/12" />
              <div className="bg-primary/20 h-full w-1/12" />
              <div className="bg-primary/20 h-full w-1/12" />
              <div className="bg-primary/20 h-full w-1/12" />
              <div className="bg-primary/20 h-full w-1/12" />
              <div className="bg-primary/20 h-full w-1/12 rounded-r-sm" />
            </div>
          </div>
        </div>

        <div className="hidden xl:block absolute right-[8%] top-[45%] z-20 animate-float">
          <div className="bg-white rounded-2xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100 p-4 w-[240px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded text-primary flex justify-center items-center text-[10px]">
                  <ShoppingCart className="h-3 w-3" />
                </div>
                <span className="text-xs font-semibold text-slate-700">My Clothing Brand</span>
              </div>
              <ArrowUpRight className="h-3 w-3 text-primary" />
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Net Sales</div>
            <div className="flex items-end gap-3 mt-1">
              <span className="text-2xl font-bold text-slate-800">$500,000</span>
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full mb-1">+110%</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="text-center max-w-[700px] flex flex-col items-center mt-4 md:mt-8 px-2">
          <div className="animate-fade-in-up stagger-1 bg-white border border-slate-100 shadow-sm rounded-full px-1 py-1 flex items-center gap-2 md:gap-3 pr-3 md:pr-4 mb-6 md:mb-8 max-w-full">
            <span className="bg-primary/10 text-primary text-[10px] md:text-xs font-bold px-2 md:px-3 py-1 rounded-full whitespace-nowrap">
              Major Update!
            </span>
            <span className="text-[10px] md:text-xs font-semibold text-slate-600 truncate">
              {siteName} v2.0 is now online!
            </span>
          </div>

          <h1 className="animate-fade-in-up stagger-2 text-4xl md:text-5xl lg:text-6xl font-[800] text-slate-900 leading-[1.15] md:leading-[1.15] tracking-tight">
            <span className="text-primary">Best & Cheap SMM Panel</span>
            <Sparkles className="text-primary text-3xl md:text-4xl hidden sm:inline-block ml-2" />
            <br />
            for Social<br />Media Growth
          </h1>

          <p className="animate-fade-in-up stagger-3 mt-4 md:mt-6 text-slate-500 font-medium text-sm md:text-base max-w-[600px] px-4 leading-relaxed">
            {siteName} is a simple and affordable SMM panel to grow your social media.
            Get more followers, likes, and views fast with real results.
            Trusted by many users with quick support.
            Start growing today with {siteName}.
          </p>

          <Link
            href="/register"
            className="animate-fade-in-up stagger-3 mt-8 bg-primary text-white text-sm font-semibold px-8 py-4 rounded-full shadow-lg shadow-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 flex items-center gap-2"
          >
            Signup for free today! <UserPlus className="h-4 w-4" />
          </Link>

          <div className="animate-fade-in-up stagger-3 mt-10 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  className={`w-8 h-8 rounded-full border-2 border-white ${i === 1 ? "relative z-40" : i === 2 ? "relative z-30" : i === 3 ? "relative z-20" : "relative z-10"}`}
                  src={`https://i.pravatar.cc/100?img=${i}`}
                  alt=""
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Star className="h-4 w-4 text-orange-400 fill-orange-400" />
              <span className="text-slate-800">4.8 / 5</span> Rating over 500 Reviews
            </div>
          </div>

          <div className="animate-fade-in-up stagger-3 mt-10 md:mt-12 flex flex-wrap justify-center gap-2 md:gap-3 px-2">
            {[
              { icon: Percent, label: "Starting at Just $0.001/K." },
              { icon: Percent, label: "Non-drop services" },
              { icon: Percent, label: "Lifetime Refills" },
              { icon: Headset, label: "24/7 Support" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-white shadow-sm border border-slate-100 rounded-full px-3 md:px-4 py-2 flex items-center gap-2 text-[10px] md:text-xs font-semibold text-slate-700 hover:-translate-y-0.5 transition duration-300"
                >
                  <div className="bg-primary/10 text-primary w-5 h-5 rounded-full flex justify-center items-center text-[10px]">
                    <Icon className="h-3 w-3" />
                  </div>
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Platforms */}
        <div className="animate-fade-in-up stagger-3 mt-20 md:mt-28 w-full text-center">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
            Providing solutions for best platforms
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-14 text-slate-400 opacity-70 px-4">
            <div className="flex items-center gap-2 text-xl md:text-2xl font-bold hover:text-slate-800 transition cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              YouTube
            </div>
            <div className="flex items-center gap-2 text-xl md:text-2xl font-bold hover:text-slate-800 transition cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              twitter
            </div>
            <div className="flex items-center gap-2 text-xl md:text-2xl font-bold hover:text-slate-800 transition cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Instagram
            </div>
            <div className="flex items-center gap-2 text-xl md:text-2xl font-bold hover:text-slate-800 transition cursor-pointer text-[#333]">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
              </svg>
              TikTok
            </div>
            <div className="flex items-center gap-2 text-xl md:text-2xl font-bold hover:text-slate-800 transition cursor-pointer">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              facebook
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 md:mt-32 text-center w-full px-4 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white border border-slate-100 shadow-sm rounded-full px-4 py-1.5 mb-6">
            <div className="bg-primary/10 text-primary w-5 h-5 rounded-full flex justify-center items-center text-[10px]">
              <Bolt className="h-3 w-3" />
            </div>
            <span className="text-xs font-bold text-primary">How it works ?</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-[800] text-slate-900 tracking-tight">
            How to <span className="text-primary">grow</span> in social in{" "}
            <span className="text-primary">3 steps</span> ?
          </h2>
          <p className="mt-3 text-slate-500 font-medium text-sm">
            The All-In-One Social Media Marketing tool you will need!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[1000px] mx-auto mt-12 w-full text-left">
            {[
              {
                icon: UserPlus,
                title: "Signup for free!",
                desc: "Create a free account in less than a minute. No credit card required to explore our amazing dashboard.",
              },
              {
                icon: Wallet,
                title: "Add funds",
                desc: "Top up your account balance securely using our wide range of supported global payment methods.",
              },
              {
                icon: ShoppingCart,
                title: "Select service & order!",
                desc: "Pick the social media service you need, paste your link, and watch the magic happen instantly.",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="bg-white rounded-2xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.04)] border border-slate-100 p-6 flex flex-col md:flex-row items-start gap-4 hover:-translate-y-1 hover:shadow-lg transition duration-300"
                >
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex justify-center items-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{step.title}</h4>
                    <p className="text-sm text-slate-500 mt-2 font-medium">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-slate-100 bg-white relative z-10 w-full pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-5 group cursor-pointer w-max">
                {logoUrl ? (
                  <img src={logoUrl} alt={siteName} className="h-12 max-w-[200px] object-contain" />
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gradient-to-br from-primary to-blue-400 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-primary/30 group-hover:scale-105 group-hover:shadow-primary/50 transition-all duration-300 border border-white/20 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                      {siteName.charAt(0)}
                    </div>
                    <span className="text-2xl font-[800] tracking-tight text-slate-900 group-hover:text-primary transition-colors">
                      {siteName}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-slate-500 text-sm max-w-sm leading-relaxed mb-6 font-medium">
                The all-in-one social media marketing tool to supercharge your online presence.
                Fast, reliable, and secure automated services.
              </p>

              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/amar.follower" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="#" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://www.facebook.com/amarfollower" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-5">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><Link href="/services" className="hover:text-primary transition">Services List</Link></li>
                <li><Link href="/apis" className="hover:text-primary transition">API Documentation</Link></li>
                <li><Link href="/affiliate" className="hover:text-primary transition">Affiliate Program</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-5">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 font-medium">
                <li><Link href="/tickets" className="hover:text-primary transition">Contact Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400 font-medium">
              &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              Made with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> for creators
            </div>
          </div>
        </div>
      </footer>

      <style>{`
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
      `}</style>
    </div>
  );
}
