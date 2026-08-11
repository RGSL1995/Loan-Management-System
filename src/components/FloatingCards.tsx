"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useRef } from "react";

/**
 * FloatingCards — Hero section 3D credit card display.
 *
 * Features:
 * - Mouse-tracking 3D tilt via CSS perspective + framer-motion transforms
 * - Holographic shimmer sweep on the purple card
 * - EMV chip icon with metallic gradient
 * - Glass reflection line animation
 * - Floating "Loan Approved" notification card above
 * - Back card with brand-50 tint so it's visible on white backgrounds
 */
export function FloatingCards() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw mouse position relative to container center (range: -0.5 to 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring-smoothed rotation values for 3D tilt
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 20,
  });

  /**
   * Handles mouse movement over the card container.
   * Calculates normalized position (-0.5 to 0.5) from container center.
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  /** Reset tilt to neutral when mouse leaves */
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-lg mx-auto h-80 md:h-[450px]"
      style={{ perspective: "1200px" }}
    >
      {/* ===== Back Card (Light Glass with brand tint — visible on white) ===== */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotateZ: [-10, -8, -10],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ rotateX, rotateY }}
        className="absolute top-10 left-4 md:left-10 w-64 md:w-72 h-40 md:h-48 bg-brand-50/90 backdrop-blur-xl rounded-2xl border border-brand-200/60 p-6 shadow-xl flex flex-col justify-between"
      >
        {/* Back card header — circle icon + pill indicator */}
        <div className="flex justify-between items-center">
          <div className="w-8 h-8 rounded-full bg-brand-200/70"></div>
          <div className="w-12 h-6 rounded-full bg-brand-200/70"></div>
        </div>
        {/* Back card body — skeleton lines */}
        <div className="space-y-3">
          <div className="h-3 w-3/4 bg-brand-200/60 rounded-full"></div>
          <div className="h-3 w-1/2 bg-brand-200/60 rounded-full"></div>
        </div>
      </motion.div>

      {/* ===== Front Card (Solid Purple Gradient with 3D effects) ===== */}
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotateZ: [5, 8, 5],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{ rotateX, rotateY }}
        className="absolute top-24 right-4 md:right-10 w-72 md:w-80 h-44 md:h-48 bg-gradient-to-br from-brand-700 via-brand-900 to-[#2D1139] backdrop-blur-xl rounded-2xl border border-brand-500/30 p-6 shadow-2xl flex flex-col justify-between z-10 overflow-hidden"
      >
        {/* Holographic shimmer sweep overlay */}
        <div
          className="absolute inset-0 pointer-events-none animate-shimmer opacity-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            width: "60%",
            height: "200%",
            top: "-50%",
          }}
        ></div>

        {/* Glass reflection line */}
        <div
          className="absolute inset-0 pointer-events-none animate-glass-reflection opacity-10"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            width: "30%",
            height: "300%",
            top: "-100%",
            animationDelay: "1.5s",
          }}
        ></div>

        {/* Card header — chip + MasterCard circles + brand name */}
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            {/* EMV Chip with metallic gradient */}
            <div
              className="w-10 h-7 rounded-md border border-yellow-500/40"
              style={{
                background:
                  "linear-gradient(135deg, #D4A843 0%, #F5D998 30%, #C4993D 50%, #E8C66B 70%, #D4A843 100%)",
              }}
            >
              {/* Chip lines */}
              <div className="w-full h-full flex flex-col justify-center items-center gap-[2px] px-1.5">
                <div className="w-full h-[1px] bg-yellow-800/30"></div>
                <div className="w-full h-[1px] bg-yellow-800/30"></div>
                <div className="w-full h-[1px] bg-yellow-800/30"></div>
              </div>
            </div>
            {/* Contactless indicator */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/50">
              <path d="M8.5 16.5C9.5 15.5 10.5 14 10.5 12S9.5 8.5 8.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 19C14 17 15.5 14.5 15.5 12S14 7 12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M15.5 21.5C18 19 20 15.5 20 12S18 5 15.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="text-white opacity-90 text-xs font-semibold tracking-wider">RGSL CARD</div>
        </div>

        {/* Card number */}
        <div className="relative z-10">
          <div className="text-white font-mono text-lg md:text-xl tracking-[0.2em] mb-4 opacity-100 drop-shadow-md">
            4000 1234 5678 9010
          </div>
          {/* Cardholder + Expiry */}
          <div className="flex justify-between text-[10px] md:text-xs text-brand-200 uppercase tracking-wider">
            <div>
              <div className="opacity-70 mb-1">Cardholder</div>
              <div className="font-semibold text-white drop-shadow-sm">John Doe</div>
            </div>
            <div>
              <div className="opacity-70 mb-1">Expires</div>
              <div className="font-semibold text-white drop-shadow-sm">12/28</div>
            </div>
          </div>
        </div>

        {/* MasterCard circles in bottom-right corner */}
        <div className="absolute bottom-4 right-5 flex items-center gap-[-4px] z-10">
          <div className="w-6 h-6 rounded-full bg-red-500/60"></div>
          <div className="w-6 h-6 rounded-full bg-orange-400/60 -ml-3"></div>
        </div>
      </motion.div>

      {/* ===== Floating Notification Card (storytelling) ===== */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{
          opacity: 1,
          y: [0, -8, 0],
          scale: 1,
        }}
        transition={{
          opacity: { duration: 0.8, delay: 1 },
          scale: { duration: 0.8, delay: 1 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 },
        }}
        className="absolute -top-2 right-0 md:right-4 bg-white rounded-xl border border-gray-200 shadow-lg px-4 py-3 z-20 flex items-center gap-3"
      >
        {/* Success check icon */}
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        </div>
        <div>
          <div className="text-xs font-bold text-gray-900">Loan Approved</div>
          <div className="text-[10px] text-gray-500 font-medium">₹5,00,000 • 2 min ago</div>
        </div>
      </motion.div>
    </div>
  );
}
