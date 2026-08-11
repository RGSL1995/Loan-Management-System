"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  Variants,
  AnimatePresence,
} from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  Building2,
  Landmark,
  Smartphone,
  TrendingUp,
  Clock,
  Users,
  Activity,
  ChevronRight,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { FloatingCards } from "@/components/FloatingCards";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { MarketingFooter } from "@/components/MarketingFooter";

/* ============================================
   Animation Variants
   ============================================ */

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

/* ============================================
   Animated Counter Component
   Counts up a number when it scrolls into view.
   ============================================ */
function AnimatedCounter({
  target,
  prefix = "",
  suffix = "",
  duration = 2,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for natural deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(target * easedProgress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {displayValue.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* ============================================
   3D Tilt Card Component
   Tilts toward the mouse cursor on hover.
   ============================================ */
function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 200,
    damping: 25,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 200,
    damping: 25,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, perspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ============================================
   Animated Progress Bar — fills on scroll-in
   ============================================ */
function AnimatedBar({ width, color = "bg-green-400", delay = 0 }: { width: string; color?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={isInView ? { width } : { width: 0 }}
        transition={{ duration: 1.2, delay, ease: "easeOut" }}
        className={`h-full ${color} rounded-full`}
      />
    </div>
  );
}

/* ============================================
   Live Typing Effect — simulates text being typed
   ============================================ */
function TypingText({ text, speed = 60 }: { text: string; speed?: number }) {
  const [displayText, setDisplayText] = useState("");
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let i = 0;
    setDisplayText("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [isInView, text, speed]);

  return (
    <span ref={ref}>
      {displayText}
      <span className="animate-blink text-brand-500">|</span>
    </span>
  );
}

/* ============================================
   Main Landing Page Component
   ============================================ */
export default function Home() {
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);
  const [isHoveringFeatures, setIsHoveringFeatures] = useState(false);

  // For the continuous narrative line
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);

  /* --- Auto-cycle feature tabs every 4s (pause on hover) --- */
  useEffect(() => {
    if (isHoveringFeatures) return;
    const interval = setInterval(() => {
      setActiveFeatureTab((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHoveringFeatures]);

  /* --- Revolving How It Works State --- */
  const [activeHowItWorksStep, setActiveHowItWorksStep] = useState(0);
  const [isHowItWorksAutoPlaying, setIsHowItWorksAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isHowItWorksAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveHowItWorksStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, [isHowItWorksAutoPlaying]);

  /* --- How It Works steps --- */
  const howItWorksSteps = [
    {
      step: "01",
      title: "Apply",
      description:
        "Borrowers submit applications through a seamless digital flow. Auto-capture KYC, income, and documents in seconds.",
      icon: <Smartphone className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600",
    },
    {
      step: "02",
      title: "Underwrite",
      description:
        "AI-powered risk engine evaluates creditworthiness, runs bureau checks, and generates instant scorecards.",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "from-brand-500 to-brand-900",
    },
    {
      step: "03",
      title: "Disburse",
      description:
        "Approved loans are disbursed directly to borrower accounts with automated compliance checks and e-signatures.",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600",
    },
    {
      step: "04",
      title: "Manage",
      description:
        "Track payments, manage collections, and monitor portfolio health through an intelligent servicing dashboard.",
      icon: <Wallet className="w-6 h-6" />,
      color: "from-purple-500 to-fuchsia-600",
    },
  ];

  /* --- Stats data --- */
  const stats = [
    { value: 500, prefix: "₹", suffix: "Cr+", label: "Disbursed", icon: <TrendingUp className="w-5 h-5" /> },
    { value: 99.9, prefix: "", suffix: "%", label: "Uptime SLA", icon: <Activity className="w-5 h-5" /> },
    { value: 10, prefix: "", suffix: "x", label: "Faster Processing", icon: <Clock className="w-5 h-5" /> },
    { value: 50, prefix: "", suffix: "+", label: "Institutions", icon: <Users className="w-5 h-5" /> },
  ];

  /* --- Solutions data --- */
  const solutions = [
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "For NBFCs",
      description:
        "End-to-end loan origination system tailored for NBFCs — from lead capture to collections with full RBI compliance baked in.",
      features: ["IRAC Provisioning", "NPA Management", "Bureau Integration"],
    },
    {
      icon: <Landmark className="w-8 h-8" />,
      title: "For Banks",
      description:
        "Enterprise-grade lending infrastructure that integrates with your core banking system via Fineract APIs.",
      features: ["CBS Integration", "Multi-branch Support", "Audit Trail"],
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: "For Digital Lenders",
      description:
        "API-first platform built for speed. Launch new lending products in days, not months. Mobile-ready from day one.",
      features: ["API-First Design", "White-label Ready", "Real-time Analytics"],
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col min-h-screen bg-white text-gray-900 overflow-x-hidden font-sans"
    >
      {/* Fixed Background Layer to contain glows without stretching document height */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-200/30 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[-10%] w-[40%] h-[60%] bg-brand-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-brand-200/20 rounded-full blur-[100px]" />
      </div>

      <MarketingNavbar />

      <main className="flex-grow z-10 relative">
        {/* ============================================
            SECTION 1: Hero
            ============================================ */}
        <section className="relative pt-11 pb-32 lg:pt-18 lg:pb-38">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-2xl"
              >
                {/* Badge */}
                <motion.div
                  variants={fadeIn}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-xs md:text-sm font-semibold text-brand-900 mb-8 border border-brand-200 shadow-sm"
                >
                  <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
                  The new standard for loan origination
                </motion.div>

                {/* Heading */}
                <motion.div variants={fadeIn}>
                  <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] text-gray-900">
                    Lending infrastructure <br className="hidden md:block" /> for{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-500 to-brand-900">
                      modern teams.
                    </span>
                  </h1>
                </motion.div>

                {/* Subheading */}
                <motion.p
                  variants={fadeIn}
                  className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed"
                >
                  RGSL streamlines your entire loan lifecycle. From instant origination to
                  intelligent servicing, all in one minimalist, powerful platform.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  variants={fadeIn}
                  className="flex flex-col sm:flex-row items-center gap-4 w-full"
                >
                  <Link
                    href="/login"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-brand-700 to-brand-900 text-white px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 text-lg"
                  >
                    Access Portal
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/demo"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-brand-900 border border-gray-200 shadow-sm px-8 py-4 rounded-full font-medium hover:bg-gray-50 transition-all active:scale-95 text-lg"
                  >
                    Book a Demo
                  </Link>
                </motion.div>
              </motion.div>

              {/* 3D Floating Card Elements */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="hidden lg:block relative"
              >
                {/* Decorative Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%]">
                  {/* Subtle Grid */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: "radial-gradient(#49225B 1.5px, transparent 1.5px)",
                      backgroundSize: "24px 24px",
                      maskImage: "radial-gradient(circle, black 40%, transparent 70%)",
                      WebkitMaskImage: "radial-gradient(circle, black 40%, transparent 70%)",
                    }}
                  ></div>

                  {/* Floating Orbs */}
                  <div
                    className="absolute top-10 right-10 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl animate-pulse"
                    style={{ animationDuration: "4s" }}
                  ></div>
                  <div
                    className="absolute bottom-10 left-10 w-40 h-40 bg-brand-700/10 rounded-full blur-3xl animate-pulse"
                    style={{ animationDuration: "6s", animationDelay: "1s" }}
                  ></div>

                  {/* Cosmetic Ring */}
                  <div className="absolute top-[20%] left-[10%] w-64 h-64 border border-brand-200/50 rounded-full border-dashed opacity-50"></div>
                </div>

                {/* Actual 3D Cards */}
                <div className="relative z-10">
                  <FloatingCards />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 2: How It Works — 3-step animated flow
            ============================================ */}
        {false && (
        <section className="py-28 relative">
          {/* Subtle section background accent */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-50/20 to-transparent pointer-events-none" />

          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-24 text-center max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl mb-6">
                Four steps. Zero friction.
              </h2>
              <p className="text-xl text-gray-600">
                From application to active management — a streamlined digital lending journey.
              </p>
            </motion.div>

            {/* The Interactive Animated Cycle */}
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              
              {/* LEFT: Orbital Visualization */}
              <div className="relative aspect-square max-w-[550px] mx-auto w-full flex items-center justify-center">
                
                {/* BACKGROUND ORBITS */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                  <defs>
                    <linearGradient id="orbit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#d946ef" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                  
                  {/* Stationary Outer Orbit */}
                  <circle cx="50%" cy="50%" r="48%" fill="none" stroke="url(#orbit-grad)" strokeWidth="1" strokeDasharray="8 12" />
                  
                  {/* Middle Floating Circle (Rotating) */}
                  <motion.circle 
                    cx="50%" cy="50%" r="35%" fill="none" 
                    stroke="rgba(165, 106, 189, 0.2)" strokeWidth="1" 
                    strokeDasharray="4 8"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: 'center' }}
                  />

                  {/* ACTIVE BEAM (Connecting line) */}
                  <motion.line
                    x1="50%" y1="50%" 
                    x2={`${50 + (Math.cos(((activeHowItWorksStep * 90) - 90) * Math.PI / 180) * 48)}%`} 
                    y2={`${50 + (Math.sin(((activeHowItWorksStep * 90) - 90) * Math.PI / 180) * 48)}%`}
                    stroke="rgba(165, 106, 189, 0.4)" strokeWidth="1.5" strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                </svg>

                {/* Central Hub */}
                <div className="relative z-20 w-1/2 h-1/2 flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-brand-500/10 blur-[40px]" 
                  />
                  <div className="relative w-full h-full rounded-full bg-white shadow-2xl shadow-brand-200/50 flex items-center justify-center p-8 lg:p-10 border border-brand-100 backdrop-blur-xl">
                    <div className="text-center w-full">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeHowItWorksStep}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="flex flex-col items-center"
                        >
                          <div className={`w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br ${howItWorksSteps[activeHowItWorksStep].color} text-white flex items-center justify-center mb-4 lg:mb-6 shadow-xl bg-[length:200%_auto] animate-gradient-x`}>
                            {howItWorksSteps[activeHowItWorksStep].icon}
                          </div>
                          <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-brand-500 mb-1 lg:mb-2">
                            Step {howItWorksSteps[activeHowItWorksStep].step}
                          </span>
                          <h4 className="text-xl lg:text-2xl font-black text-gray-900 leading-tight tracking-tight">
                            {howItWorksSteps[activeHowItWorksStep].title}
                          </h4>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Orbiting Icons */}
                {howItWorksSteps.map((step, index) => {
                  const angle = (index * 90) - 90;
                  const radian = (angle * Math.PI) / 180;
                  const x = Math.cos(radian) * 48; // Adjusted distance
                  const y = Math.sin(radian) * 48;

                  return (
                    <button
                      key={index}
                      onMouseEnter={() => { setActiveHowItWorksStep(index); setIsHowItWorksAutoPlaying(false); }}
                      onMouseLeave={() => setIsHowItWorksAutoPlaying(true)}
                      onClick={() => setActiveHowItWorksStep(index)}
                      className={`absolute w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all duration-700 z-30 group
                        ${activeHowItWorksStep === index 
                          ? "bg-white shadow-[0_20px_50px_rgba(165,106,189,0.3)] scale-110 border-2 border-brand-500" 
                          : "bg-white/80 hover:bg-white text-gray-400 hover:text-brand-600 border border-gray-100 shadow-sm"
                        }`}
                      style={{
                        left: `${50 + x}%`,
                        top: `${50 + y}%`,
                        transform: `translate(-50%, -50%)`
                      }}
                    >
                      <div className={`transition-all duration-500 ${activeHowItWorksStep === index ? "scale-110 rotate-[360deg] text-brand-600" : "group-hover:rotate-12"}`}>
                        {step.icon}
                      </div>
                      
                      {/* Subtle label */}
                      <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 transition-all duration-500 whitespace-nowrap
                        ${activeHowItWorksStep === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
                        <span className="text-[10px] font-bold text-brand-700 uppercase tracking-widest">{step.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* RIGHT: High-End Content Card */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeHowItWorksStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <div className={`inline-flex items-center gap-2 mb-6 text-sm font-black uppercase tracking-[0.2em] bg-gradient-to-r ${howItWorksSteps[activeHowItWorksStep].color} bg-clip-text text-transparent`}>
                      PHASE {howItWorksSteps[activeHowItWorksStep].step}
                      <ChevronRight size={16} className="text-brand-300" />
                    </div>
                    
                    <h4 className="text-3xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-8">
                      {howItWorksSteps[activeHowItWorksStep].title}
                    </h4>
                    
                    <p className="text-lg text-gray-500 font-medium leading-relaxed mb-10 max-w-lg">
                      {howItWorksSteps[activeHowItWorksStep].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
                
                {/* Progress Indicators (Step bars) */}
                <div className="flex gap-2 mt-8 lg:mt-12">
                  {howItWorksSteps.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${activeHowItWorksStep === i ? "w-12 bg-brand-600" : "w-3 bg-gray-200"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ============================================
            SECTION 3: Features (with live animated mockups)
            ============================================ */}
        <section id="features" className="py-32 relative bg-gray-50/50">
          <div className="absolute inset-0 bg-white/40 border-t border-b border-gray-100 backdrop-blur-xl"></div>
          <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-20 text-center max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl mb-6">
                Everything you need to scale lending.
              </h2>
              <p className="text-xl text-gray-600">
                A unified platform designed to remove friction, reduce risk, and accelerate
                your loan operations.
              </p>
            </motion.div>

            <div
              className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
              onMouseEnter={() => setIsHoveringFeatures(true)}
              onMouseLeave={() => setIsHoveringFeatures(false)}
            >
              {/* Left Column: Feature Tabs with auto-cycle progress */}
              <div className="space-y-4">
                {[
                  {
                    icon: <Zap className="w-5 h-5" />,
                    title: "Lightning Fast Origination",
                    description:
                      "Process applications in seconds with our automated decision engine and seamless integrations.",
                  },
                  {
                    icon: <ShieldCheck className="w-5 h-5" />,
                    title: "Intelligent Underwriting",
                    description:
                      "Leverage advanced analytics and customizable risk models to make better lending decisions.",
                  },
                  {
                    icon: <LayoutDashboard className="w-5 h-5" />,
                    title: "Unified Servicing",
                    description:
                      "Manage your entire portfolio from a single, intuitive dashboard built for modern financial teams.",
                  },
                ].map((feature, idx) => {
                  const isActive = activeFeatureTab === idx;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      onClick={() => setActiveFeatureTab(idx)}
                      className={`cursor-pointer group p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                        isActive
                          ? "bg-white border-brand-500 shadow-[0_10px_30px_rgba(73,34,91,0.08)] scale-[1.02]"
                          : "bg-transparent border-transparent hover:bg-white/50"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"
                        />
                      )}
                      {/* Auto-cycle progress bar — shows only on active tab */}
                      {isActive && !isHoveringFeatures && (
                        <motion.div
                          key={`progress-${idx}`}
                          className="absolute bottom-0 left-0 h-[2px] bg-brand-500/40"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 4, ease: "linear" }}
                        />
                      )}
                      <div className="flex items-start gap-5 relative z-10">
                        <div
                          className={`mt-1 p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                            isActive
                              ? "bg-brand-50 text-brand-700"
                              : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                          }`}
                        >
                          {feature.icon}
                        </div>
                        <div>
                          <h3
                            className={`text-xl font-bold mb-2 transition-colors ${
                              isActive
                                ? "text-brand-900"
                                : "text-gray-700 group-hover:text-gray-900"
                            }`}
                          >
                            {feature.title}
                          </h3>
                          <p
                            className={`text-sm leading-relaxed transition-colors ${
                              isActive ? "text-gray-600" : "text-gray-500"
                            }`}
                          >
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Right Column: LIVE Interactive Display */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative h-[450px] w-full rounded-3xl bg-white border border-gray-200 shadow-xl overflow-hidden flex items-center justify-center"
              >
                {/* Subtle background pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
                    backgroundSize: "16px 16px",
                  }}
                ></div>

                <AnimatePresence mode="wait">
                  {/* Tab 0: Origination Form with typing & live cursor */}
                  {activeFeatureTab === 0 && (
                    <motion.div
                      key="tab-0"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="w-full max-w-sm"
                    >
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-md p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div className="text-sm font-bold text-gray-900">New Application</div>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                            className="h-6 w-16 bg-brand-50 text-brand-700 text-[10px] font-bold flex items-center justify-center rounded-full uppercase tracking-wider"
                          >
                            Step 2
                          </motion.div>
                        </div>
                        <div className="space-y-4 mb-6">
                          {/* Applicant Name with typing effect */}
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Applicant Name
                            </div>
                            <div className="h-10 w-full bg-gray-50 border border-gray-100 rounded-lg flex items-center px-3 text-sm text-gray-700 font-medium">
                              <TypingText text="Rajesh Kumar" speed={80} />
                            </div>
                          </motion.div>
                          {/* Loan Amount */}
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Loan Amount
                            </div>
                            <div className="h-10 w-full bg-gray-50 border border-gray-100 rounded-lg flex items-center px-3 text-sm text-gray-700 font-medium">
                              ₹5,00,000
                            </div>
                          </motion.div>
                          <div className="grid grid-cols-2 gap-4">
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Tenure
                              </div>
                              <div className="h-10 w-full bg-gray-50 border border-gray-100 rounded-lg flex items-center px-3 text-sm text-gray-700 font-medium">
                                36 months
                              </div>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                Rate
                              </div>
                              <div className="h-10 w-full bg-gray-50 border border-gray-100 rounded-lg flex items-center px-3 text-sm text-gray-700 font-medium">
                                12.5% p.a.
                              </div>
                            </motion.div>
                          </div>
                        </div>
                        {/* Animated submit button */}
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1 }}
                          className="h-10 w-full bg-brand-900 rounded-lg flex items-center justify-center shadow-sm cursor-pointer hover:bg-brand-700 transition-colors group"
                        >
                          <span className="text-white text-xs font-semibold flex items-center gap-1">
                            Continue to KYC <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Tab 1: Underwriting Dashboard with animated bars */}
                  {activeFeatureTab === 1 && (
                    <motion.div
                      key="tab-1"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="w-full max-w-sm"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        {/* Credit Score Card with animated number */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1, type: "spring" }}
                          className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center h-32 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/10 rounded-full blur-xl"></div>
                          {/* Circular progress ring */}
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                            <motion.circle
                              cx="50" cy="50" r="40"
                              fill="none"
                              stroke="rgba(34,197,94,0.15)"
                              strokeWidth="3"
                            />
                            <motion.circle
                              cx="50" cy="50" r="40"
                              fill="none"
                              stroke="rgba(34,197,94,0.5)"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray="251"
                              initial={{ strokeDashoffset: 251 }}
                              animate={{ strokeDashoffset: 251 * (1 - 0.84) }}
                              transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
                            />
                          </svg>
                          <div className="relative z-10">
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                              <AnimatedCounter target={840} duration={1.5} />
                            </div>
                            <div className="text-[10px] font-semibold text-green-600 uppercase tracking-widest">
                              Excellent
                            </div>
                          </div>
                        </motion.div>
                        {/* Side metrics */}
                        <div className="space-y-4">
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-14 flex items-center gap-3"
                          >
                            <div className="w-2 h-full rounded-full bg-brand-500"></div>
                            <div>
                              <div className="text-[9px] text-gray-400 font-medium uppercase">DTI Ratio</div>
                              <div className="text-sm font-bold text-gray-900">32.4%</div>
                            </div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-14 flex items-center gap-3"
                          >
                            <div className="w-2 h-full rounded-full bg-blue-500"></div>
                            <div>
                              <div className="text-[9px] text-gray-400 font-medium uppercase">Income</div>
                              <div className="text-sm font-bold text-gray-900">₹1.2L/mo</div>
                            </div>
                          </motion.div>
                        </div>
                        {/* Risk Assessment Bar with animated fill */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="col-span-2 bg-brand-900 rounded-xl p-5 text-white shadow-md relative overflow-hidden"
                        >
                          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-brand-200 font-medium">
                              Risk Assessment
                            </span>
                            <motion.span
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 1.5, type: "spring" }}
                              className="text-[10px] bg-green-500/20 text-green-300 px-2 py-1 rounded"
                            >
                              ✓ Approved
                            </motion.span>
                          </div>
                          <AnimatedBar width="85%" color="bg-green-400" delay={0.8} />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}

                  {/* Tab 2: Servicing Table with staggered row slide-in */}
                  {activeFeatureTab === 2 && (
                    <motion.div
                      key="tab-2"
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="w-full max-w-[400px]"
                    >
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden">
                        <div className="bg-gray-50 border-b border-gray-100 p-4 flex justify-between items-center">
                          <div className="text-sm font-bold text-gray-900">Active Loans</div>
                          <div className="flex gap-2">
                            <div className="h-6 w-6 bg-white border border-gray-200 rounded-md"></div>
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="h-6 w-16 bg-brand-900 rounded-md flex items-center justify-center cursor-pointer"
                            >
                              <span className="text-[9px] text-white font-semibold">Export</span>
                            </motion.div>
                          </div>
                        </div>
                        <div className="p-0">
                          {[
                            { name: "Rahul Sharma", amount: "₹5,00,000", status: "Active", emi: "₹16,104" },
                            { name: "Priya Patel", amount: "₹3,50,000", status: "Active", emi: "₹11,273" },
                            { name: "Amit Singh", amount: "₹8,00,000", status: "Current", emi: "₹25,766" },
                            { name: "Neha Gupta", amount: "₹2,25,000", status: "Active", emi: "₹7,247" },
                          ].map((loan, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.15 * i, duration: 0.4 }}
                              className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-brand-50/30 transition-colors cursor-default group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                                  <span className="text-[10px] font-bold text-brand-700">
                                    {loan.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-xs font-semibold text-gray-900">{loan.name}</div>
                                  <div className="text-[10px] text-gray-400">EMI: {loan.emi}/mo</div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end">
                                <div className="text-xs font-bold text-gray-900">{loan.amount}</div>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: "auto" }}
                                  transition={{ delay: 0.3 + 0.15 * i }}
                                  className="overflow-hidden"
                                >
                                  <div className="text-[9px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded whitespace-nowrap">
                                    {loan.status}
                                  </div>
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 4: Stats / Metrics Bar
            ============================================ */}
        <section className="py-20 relative bg-brand-900 overflow-hidden">
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 left-[10%] w-64 h-64 bg-brand-500/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-[10%] w-48 h-48 bg-brand-700/30 rounded-full blur-[80px] pointer-events-none"></div>

          {/* Subtle animated grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                  className="text-center group"
                >
                  {/* Icon with pulse glow */}
                  <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-brand-200 animate-pulse-glow group-hover:bg-white/20 transition-colors">
                    {stat.icon}
                  </div>
                  {/* Animated number */}
                  <div className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
                    <AnimatedCounter
                      target={stat.value}
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </div>
                  <div className="text-xs font-medium text-brand-200/70 uppercase tracking-[0.15em]">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 5: Solutions
            ============================================ */}
        <section id="solutions" className="py-32 relative">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="mb-20 text-center max-w-3xl mx-auto"
            >
              <h2 className="text-4xl font-bold tracking-tight text-brand-900 sm:text-5xl mb-6">
                Built for every lender.
              </h2>
              <p className="text-xl text-gray-600">
                Whether you are an NBFC, a bank, or a digital-first lender — RGSL adapts to
                your workflow.
              </p>
            </motion.div>

            {/* Solution Cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {solutions.map((solution, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.15 }}
                >
                  <TiltCard className="h-full p-8 rounded-3xl bg-white/70 backdrop-blur-md border border-gray-200 hover:border-brand-300 hover:shadow-[0_20px_60px_rgba(73,34,91,0.12)] transition-all duration-500 group relative overflow-hidden">
                    {/* Hover gradient glow overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-50/0 via-brand-50/0 to-brand-100/0 group-hover:from-brand-50/40 group-hover:via-transparent group-hover:to-brand-50/20 transition-all duration-500 rounded-3xl pointer-events-none" />

                    {/* Icon */}
                    <div className="relative z-10 mb-6 w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-700 group-hover:bg-brand-900 group-hover:text-white group-hover:border-brand-900 transition-all duration-500 group-hover:shadow-lg group-hover:scale-110">
                      {solution.icon}
                    </div>

                    <h3 className="relative z-10 text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-900 transition-colors">{solution.title}</h3>
                    <p className="relative z-10 text-sm text-gray-600 leading-relaxed mb-6">
                      {solution.description}
                    </p>

                    {/* Feature pills with staggered hover reveal */}
                    <div className="relative z-10 flex flex-wrap gap-2">
                      {solution.features.map((feature, fIdx) => (
                        <span
                          key={fIdx}
                          className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-100 group-hover:bg-brand-100 group-hover:border-brand-200 transition-all duration-300"
                          style={{ transitionDelay: `${fIdx * 50}ms` }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Explore arrow — slides in on hover */}
                    <motion.div className="relative z-10 mt-6 flex items-center gap-1 text-xs font-semibold text-brand-500 opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 transition-all duration-300">
                      Explore <ArrowRight className="w-3 h-3" />
                    </motion.div>
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================
            SECTION 6: CTA (Enhanced)
            ============================================ */}
        <section className="py-40 relative overflow-hidden">
          {/* Background gradient wash */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-brand-50/50 to-white pointer-events-none"></div>

          {/* Decorative floating elements */}
          <div
            className="absolute top-20 left-[10%] w-20 h-20 bg-brand-200/40 rounded-2xl blur-sm animate-float opacity-40"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute bottom-20 right-[15%] w-16 h-16 bg-brand-500/20 rounded-full blur-sm animate-float opacity-30"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 right-[8%] w-12 h-12 bg-brand-200/30 rounded-lg blur-sm animate-float opacity-30"
            style={{ animationDelay: "1s" }}
          ></div>

          <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl mx-auto"
            >
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-gray-900">
                Ready to transform your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-900">
                  lending experience?
                </span>
              </h2>
              <p className="text-xl text-gray-600 mb-12">
                Join forward-thinking financial institutions using RGSL to power their loan
                operations securely and transparently.
              </p>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block"
              >
                <Link
                  href="/login"
                  className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-brand-700 to-brand-900 text-white px-10 py-5 rounded-full font-bold hover:shadow-2xl hover:-translate-y-1 transition-all text-lg shadow-lg"
                >
                  Start Building Today
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 text-base text-gray-500 font-medium">
                {["Enterprise Security", "Rapid Deployment", "24/7 Support"].map((item, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5 text-brand-500" /> {item}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
