import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  Menu,
  X,
  BrainCircuit,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Mail,
  BookOpen
} from 'lucide-react';

export default function LandingPage({ user }) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('home');

  const token = localStorage.getItem('eduinsight_token');
  const storedUser = user || (() => {
    try {
      const saved = localStorage.getItem('eduinsight_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })();
  const isLoggedIn = !!token && !!storedUser;

  const getDashboardRoute = () => {
    if (storedUser?.role === 'ADMIN') return '/admin/dashboard';
    if (storedUser?.role === 'TEACHER') return '/teacher/dashboard';
    return '/student/dashboard';
  };

  const scrollToSection = (id) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#102B59] font-sans antialiased selection:bg-[#E7F2FF] selection:text-[#1677FF]">
      {/* ─── 1. Header / Navigation Bar ───────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E7F2FF] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Logo */}
          <div
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1677FF] to-[#4D91FF] flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-[#102B59]">
              EduInsight <span className="text-[#1677FF]">AI</span>
            </span>
          </div>

          {/* Center Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              type="button"
              onClick={() => scrollToSection('home')}
              className={`text-sm font-semibold transition-colors relative py-1 ${
                activeNav === 'home'
                  ? 'text-[#1677FF]'
                  : 'text-[#526B91] hover:text-[#102B59]'
              }`}
            >
              Home
              {activeNav === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1677FF] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className={`text-sm font-semibold transition-colors relative py-1 ${
                activeNav === 'features'
                  ? 'text-[#1677FF]'
                  : 'text-[#526B91] hover:text-[#102B59]'
              }`}
            >
              Features
              {activeNav === 'features' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1677FF] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about')}
              className={`text-sm font-semibold transition-colors relative py-1 ${
                activeNav === 'about'
                  ? 'text-[#1677FF]'
                  : 'text-[#526B91] hover:text-[#102B59]'
              }`}
            >
              About
              {activeNav === 'about' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1677FF] rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('contact')}
              className={`text-sm font-semibold transition-colors relative py-1 ${
                activeNav === 'contact'
                  ? 'text-[#1677FF]'
                  : 'text-[#526B91] hover:text-[#102B59]'
              }`}
            >
              Contact
              {activeNav === 'contact' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1677FF] rounded-full" />
              )}
            </button>
          </nav>

          {/* Right Action Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate(getDashboardRoute())}
                  className="px-5 py-2.5 bg-[#1677FF] hover:bg-[#1060d4] text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-4 py-2.5 bg-white border border-[#C8DFFF] text-[#526B91] hover:text-[#1677FF] hover:border-[#1677FF] font-semibold text-sm rounded-xl hover:bg-[#F2F8FF] transition-all cursor-pointer"
                  title="Switch user account"
                >
                  Switch User
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-5 py-2.5 bg-white border border-[#1677FF] text-[#1677FF] font-semibold text-sm rounded-xl hover:bg-[#F2F8FF] transition-all shadow-xs cursor-pointer"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="px-5 py-2.5 bg-[#1677FF] hover:bg-[#1060d4] text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 transition-all cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#526B91] hover:text-[#102B59] hover:bg-[#F2F8FF] rounded-xl transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E7F2FF] px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={() => scrollToSection('home')}
                className="text-left py-2 px-3 rounded-lg text-sm font-bold text-[#1677FF] bg-[#F2F8FF]"
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#526B91] hover:bg-[#F2F8FF]"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#526B91] hover:bg-[#F2F8FF]"
              >
                About
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('contact')}
                className="text-left py-2 px-3 rounded-lg text-sm font-semibold text-[#526B91] hover:bg-[#F2F8FF]"
              >
                Contact
              </button>
            </div>
            <div className="pt-3 border-t border-[#E7F2FF] flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate(getDashboardRoute())}
                    className="w-full py-2.5 bg-[#1677FF] text-white font-semibold text-sm rounded-xl text-center shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl text-center hover:bg-[#F2F8FF] cursor-pointer"
                  >
                    Switch User / Login
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full py-2.5 border border-[#1677FF] text-[#1677FF] font-semibold text-sm rounded-xl text-center hover:bg-[#F2F8FF] cursor-pointer"
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="w-full py-2.5 bg-[#1677FF] text-white font-semibold text-sm rounded-xl text-center shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── 2. Hero Section ─────────────────────────────────────────── */}
      <section
        id="home"
        className="relative bg-gradient-to-b from-[#F2F8FF] via-white to-white pt-10 sm:pt-16 pb-20 sm:pb-28 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Heading, Subheading & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F2FF] border border-[#C8DFFF] text-[#1677FF] text-xs sm:text-sm font-bold shadow-2xs">
                <Sparkles className="w-4 h-4 text-[#1677FF]" />
                <span>AI-Powered Learning Intelligence</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-[#102B59] leading-[1.12]">
                Smarter Insights.
                <br />
                <span className="text-[#1677FF]">Better Learning.</span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#526B91] leading-relaxed max-w-xl mx-auto lg:mx-0 font-normal">
                EduInsight AI helps students, teachers and administrators understand learning
                better with data-driven insights, personalized recommendations and intelligent analytics.
              </p>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
                {isLoggedIn ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate(getDashboardRoute())}
                      className="w-full sm:w-auto px-7 py-3.5 bg-[#1677FF] hover:bg-[#1060d4] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>Go to Dashboard</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="w-full sm:w-auto px-7 py-3.5 bg-white border border-[#1677FF] text-[#1677FF] hover:bg-[#F2F8FF] font-bold text-sm sm:text-base rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Login / Switch User
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate('/register')}
                      className="w-full sm:w-auto px-7 py-3.5 bg-[#1677FF] hover:bg-[#1060d4] text-white font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/login')}
                      className="w-full sm:w-auto px-7 py-3.5 bg-white border border-[#1677FF] text-[#1677FF] hover:bg-[#F2F8FF] font-bold text-sm sm:text-base rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Login
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right Column: Custom Student Vector Illustration */}
            <div className="lg:col-span-6 flex justify-center items-center relative">
              <div className="relative w-full max-w-[500px]">
                {/* Vector SVG Illustration */}
                <svg
                  viewBox="0 0 540 440"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto drop-shadow-sm select-none"
                >
                  <defs>
                    {/* Gradients */}
                    <linearGradient id="bgBlobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E7F2FF" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#D2E5FF" stopOpacity="0.5" />
                    </linearGradient>
                    <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E3A8A" />
                      <stop offset="100%" stopColor="#102B59" />
                    </linearGradient>
                    <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#1677FF" />
                    </linearGradient>
                    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#F8FAFC" />
                    </linearGradient>
                    <filter id="shadowLight" x="-10%" y="-10%" width="125%" height="125%">
                      <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1677FF" floodOpacity="0.12" />
                    </filter>
                  </defs>

                  {/* 1. Soft Abstract Pale-Blue Background Blobs */}
                  <path
                    d="M120,200 C70,120 160,40 280,45 C400,50 490,130 460,240 C430,350 340,390 220,380 C110,370 170,280 120,200 Z"
                    fill="url(#bgBlobGrad)"
                  />
                  <circle cx="430" cy="110" r="45" fill="#E7F2FF" />
                  <circle cx="95" cy="280" r="30" fill="#EAF3FF" />

                  {/* 2. Dotted Connecting Arc Lines */}
                  <path
                    d="M120,110 C180,60 260,80 320,85"
                    stroke="#4D91FF"
                    strokeWidth="2"
                    strokeDasharray="4 5"
                    fill="none"
                    opacity="0.6"
                  />
                  <path
                    d="M380,105 C420,140 435,200 425,250"
                    stroke="#4D91FF"
                    strokeWidth="2"
                    strokeDasharray="4 5"
                    fill="none"
                    opacity="0.6"
                  />

                  {/* 3. Modern Minimal Desk */}
                  <path d="M70,335 L470,335" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />
                  <line x1="110" y1="335" x2="110" y2="420" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />
                  <line x1="430" y1="335" x2="430" y2="420" stroke="#94A3B8" strokeWidth="6" strokeLinecap="round" />

                  {/* 4. Plant on Desk (Right side) */}
                  <path d="M400,335 L420,335 L416,305 L404,305 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
                  <path d="M410,305 C400,285 390,275 395,265 C402,260 410,280 410,305 Z" fill="#10B981" />
                  <path d="M410,305 C420,280 430,270 425,262 C417,258 412,280 410,305 Z" fill="#059669" />
                  <path d="M410,305 C406,275 412,260 410,250 C408,260 410,280 410,305 Z" fill="#34D399" />

                  {/* 5. Stack of Books on Desk (Left side) */}
                  <rect x="95" y="322" width="55" height="13" rx="2" fill="#4D91FF" />
                  <rect x="98" y="309" width="50" height="13" rx="2" fill="#1677FF" />
                  <rect x="102" y="296" width="44" height="13" rx="2" fill="#F59E0B" />

                  {/* 6. Chair */}
                  <rect x="235" y="225" width="70" height="90" rx="8" fill="#E2E8F0" />
                  <path d="M270,315 L270,390" stroke="#94A3B8" strokeWidth="7" strokeLinecap="round" />
                  <path d="M230,390 L310,390" stroke="#64748B" strokeWidth="6" strokeLinecap="round" />

                  {/* 7. Student Sitting at Desk */}
                  {/* Torso in Bright Blue Top */}
                  <path
                    d="M230,265 C230,225 310,225 310,265 L315,335 L225,335 Z"
                    fill="#1677FF"
                  />
                  {/* Collar */}
                  <path d="M255,228 L270,245 L285,228 Z" fill="#FFFFFF" opacity="0.9" />

                  {/* Head & Face */}
                  <ellipse cx="270" cy="180" rx="26" ry="30" fill="#FCD34D" />
                  {/* Hair */}
                  <path
                    d="M242,175 C242,150 255,142 270,142 C288,142 298,152 298,175 C298,160 286,152 270,152 C254,152 245,162 242,175 Z"
                    fill="#1E293B"
                  />
                  {/* Smile */}
                  <path d="M263,192 Q270,198 277,192" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none" />
                  {/* Glasses */}
                  <rect x="252" y="174" width="14" height="10" rx="2" stroke="#1E293B" strokeWidth="2" fill="none" />
                  <rect x="274" y="174" width="14" height="10" rx="2" stroke="#1E293B" strokeWidth="2" fill="none" />
                  <line x1="266" y1="179" x2="274" y2="179" stroke="#1E293B" strokeWidth="2" />

                  {/* Arms typing on laptop */}
                  <path d="M235,270 L255,315 L270,315" stroke="#FCD34D" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M305,270 L285,315 L270,315" stroke="#FCD34D" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />

                  {/* 8. Laptop (Navy Open Laptop) */}
                  {/* Base */}
                  <path d="M230,332 L310,332 L300,320 L240,320 Z" fill="#102B59" />
                  {/* Screen */}
                  <path d="M242,320 L298,320 L304,265 L248,265 Z" fill="url(#laptopGrad)" />
                  {/* Glowing Screen Content */}
                  <rect x="252" y="270" width="46" height="42" rx="3" fill="url(#screenGrad)" />
                  <line x1="258" y1="280" x2="278" y2="280" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                  <line x1="258" y1="288" x2="288" y2="288" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
                  <line x1="258" y1="296" x2="272" y2="296" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.9" />

                  {/* 9. Floating Educational Icon Cards */}
                  {/* Top Left: Lightbulb (Ideas / Intelligence) */}
                  <g filter="url(#shadowLight)" transform="translate(85, 80)">
                    <rect width="52" height="52" rx="14" fill="url(#cardGrad)" stroke="#C8DFFF" strokeWidth="1.5" />
                    <circle cx="26" cy="26" r="14" fill="#FEF3C7" />
                    {/* Bulb filament */}
                    <path d="M26,17 C22,17 20,20 20,24 C20,26.5 21.5,28.5 23,30 L29,30 C30.5,28.5 32,26.5 32,24 C32,20 30,17 26,17 Z" fill="#F59E0B" />
                    <rect x="23.5" y="31" width="5" height="3" rx="1" fill="#D97706" />
                  </g>

                  {/* Top Right: Graduation Cap (Academic Mastery) */}
                  <g filter="url(#shadowLight)" transform="translate(370, 65)">
                    <rect width="52" height="52" rx="14" fill="url(#cardGrad)" stroke="#C8DFFF" strokeWidth="1.5" />
                    <circle cx="26" cy="26" r="14" fill="#E0F2FE" />
                    <path d="M26,18 L36,23 L26,28 L16,23 Z" fill="#1677FF" />
                    <path d="M20,25.5 L20,31 C20,33 32,33 32,31 L32,25.5" fill="#1677FF" />
                    <line x1="36" y1="23" x2="36" y2="30" stroke="#0284C7" strokeWidth="1.5" />
                  </g>

                  {/* Middle Right: Analytics Chart Card (Data-Driven Insights) */}
                  <g filter="url(#shadowLight)" transform="translate(390, 210)">
                    <rect width="60" height="54" rx="14" fill="url(#cardGrad)" stroke="#C8DFFF" strokeWidth="1.5" />
                    {/* Mini bar chart */}
                    <rect x="15" y="32" width="6" height="12" rx="2" fill="#93C5FD" />
                    <rect x="24" y="24" width="6" height="20" rx="2" fill="#60A5FA" />
                    <rect x="33" y="16" width="6" height="28" rx="2" fill="#1677FF" />
                    <path d="M14,30 Q25,20 38,13" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </g>

                  {/* Decorative Sparkles / Stars */}
                  <path d="M190,75 Q192,85 202,87 Q192,89 190,99 Q188,89 178,87 Q188,85 190,75 Z" fill="#4D91FF" opacity="0.75" />
                  <path d="M340,150 Q341,156 347,157 Q341,158 340,164 Q339,158 333,157 Q339,156 340,150 Z" fill="#1677FF" opacity="0.6" />
                  <circle cx="160" cy="220" r="4" fill="#38BDF8" opacity="0.6" />
                  <circle cx="360" cy="330" r="3.5" fill="#4D91FF" opacity="0.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 3. Subtle Pale-Blue Wave Bottom Decoration ───────────── */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden leading-none z-10">
          <svg
            viewBox="0 0 1440 90"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-12 sm:h-20 text-white fill-current"
            preserveAspectRatio="none"
          >
            <path d="M0,45 C280,85 520,15 800,55 C1080,95 1300,30 1440,50 L1440,90 L0,90 Z" />
          </svg>
        </div>
      </section>

      {/* ─── 4. Features Section ──────────────────────────────────────── */}
      <section id="features" className="py-20 bg-white border-t border-[#F2F8FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1677FF] bg-[#E7F2FF] px-3.5 py-1.5 rounded-full border border-[#C8DFFF]">
              Intelligent Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#102B59] tracking-tight">
              Designed for Academic Excellence
            </h2>
            <p className="text-[#526B91] text-sm sm:text-base leading-relaxed">
              EduInsight AI combines Bayesian Knowledge Tracing with state-of-the-art machine learning
              to optimize classroom learning and personalized study pathways.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-[#F2F8FF] border border-[#C8DFFF]/60 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#C8DFFF] flex items-center justify-center text-[#1677FF] shadow-xs">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#102B59]">Dynamic Learning Twin</h3>
              <p className="text-sm text-[#526B91] leading-relaxed">
                Tracks mastery probability across every curriculum concept in real-time using Bayesian
                Knowledge Tracing (BKT) as students solve practice questions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-[#F2F8FF] border border-[#C8DFFF]/60 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#C8DFFF] flex items-center justify-center text-[#1677FF] shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#102B59]">Early Risk Detection</h3>
              <p className="text-sm text-[#526B91] leading-relaxed">
                Trained machine learning models identify at-risk learners early based on response speed,
                hint usage, and accuracy patterns, enabling timely teacher interventions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-[#F2F8FF] border border-[#C8DFFF]/60 space-y-4 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#C8DFFF] flex items-center justify-center text-[#1677FF] shadow-xs">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#102B59]">Subject-Scoped Quizzes</h3>
              <p className="text-sm text-[#526B91] leading-relaxed">
                Teachers generate, edit, and assign quizzes scoped directly to their subject curriculum,
                with randomized question delivery each time students practice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 5. About Section ─────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-[#F2F8FF] border-t border-[#E7F2FF]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1677FF]">
                About EduInsight AI
              </span>
              <h2 className="text-3xl font-extrabold text-[#102B59] tracking-tight">
                Empowering Students &amp; Educators Alike
              </h2>
              <p className="text-sm sm:text-base text-[#526B91] leading-relaxed">
                EduInsight AI was built to replace arbitrary scores with deep diagnostic intelligence.
                By connecting student attempts with explainable AI (SHAP) and knowledge models, we turn
                every quiz response into actionable learning progress.
              </p>
              <ul className="space-y-2.5 pt-2 text-sm text-[#102B59] font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1677FF]" />
                  <span>Personalized concept mastery tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1677FF]" />
                  <span>Teacher dashboards with real class performance metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#1677FF]" />
                  <span>Explainable AI diagnostics with zero guesswork</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#C8DFFF] shadow-md space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#E7F2FF] rounded-2xl text-[#1677FF]">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#102B59]">Curriculum Aligned</h4>
                  <p className="text-xs text-[#526B91]">Math, Science, English &amp; Computer Science</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#526B91] leading-relaxed">
                Whether you are a student striving to master difficult concepts or a teacher guiding
                a classroom of diverse learners, EduInsight AI provides the clarity and data you need.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-[#1677FF] hover:bg-[#1060d4] text-white text-sm font-bold rounded-xl shadow-md transition-all text-center"
              >
                Access Portal
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. Contact / Footer ─────────────────────────────────────── */}
      <footer id="contact" className="bg-[#102B59] text-white py-14 border-t border-[#102B59]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#1677FF] flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                EduInsight <span className="text-[#4D91FF]">AI</span>
              </span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-300">
              <button type="button" onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">
                Home
              </button>
              <button type="button" onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">
                Features
              </button>
              <button type="button" onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">
                About
              </button>
              <button type="button" onClick={() => navigate('/login')} className="hover:text-white transition-colors">
                Login
              </button>
              <button type="button" onClick={() => navigate('/register')} className="hover:text-white transition-colors">
                Register
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} EduInsight AI. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#4D91FF]" />
              <span>contact@eduinsight.ai</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
