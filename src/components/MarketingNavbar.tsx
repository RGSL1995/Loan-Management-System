"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import LoginModal from "@/components/LoginModal";

/**
 * MarketingNavbar — Sticky navigation bar for the marketing/landing pages.
 *
 * Features:
 * - Glassmorphic sticky header
 * - Desktop nav links with hover underline animation
 * - Mobile hamburger menu with AnimatePresence slide-down panel
 * - Auth-aware: shows Dashboard + ProfileDrawer when logged in, Sign in otherwise
 */
export function MarketingNavbar() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check for active Supabase session on mount
  useEffect(() => {
    const checkSession = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = await createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    }
    checkSession();
  }, []);

  /** Navigation link items — shared between desktop and mobile */
  const navLinks = [
    { href: "/#features", label: "Features", sectionId: "features" },
    { href: "/#solutions", label: "Solutions", sectionId: "solutions" },
    { href: "/about", label: "Company", sectionId: null },
  ];

  /**
   * Smooth-scroll to a section by ID using scrollIntoView.
   * This avoids browser hash-jump behaviour which can trap the user
   * when html has overflow constraints.
   */
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string | null) => {
    if (!sectionId) return; // Let normal navigation happen for real page links
    e.preventDefault();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white font-bold text-xl drop-shadow-sm">R</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-brand-900">RGSL</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-10 text-sm font-medium text-gray-600">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.sectionId)}
                  className="relative group hover:text-brand-900 transition-colors"
                >
                  {link.label}
                  <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-brand-500 transition-all group-hover:w-full rounded-full"></span>
                </Link>
              ))}
            </div>

            {/* Desktop Auth Buttons + Mobile Hamburger */}
            <div className="flex items-center gap-4">
              {/* Auth buttons — visible on desktop */}
              <div className="hidden md:flex items-center gap-4">
                {session ? (
                  <>
                    <Link href="/dashboard" className="text-sm font-medium text-brand-900 hover:text-brand-700 transition-colors bg-brand-50 px-4 py-2 rounded-full border border-brand-200">
                      Dashboard
                    </Link>
                    <ProfileDrawer />
                  </>
                ) : (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="text-sm font-medium bg-gradient-to-r from-brand-700 to-brand-900 text-white px-6 py-2.5 rounded-full hover:shadow-lg transition-all active:scale-95 border border-brand-900"
                  >
                    Sign in
                  </button>
                )}
              </div>

              {/* Mobile hamburger button — visible on < md */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* ===== Mobile Slide-Down Menu Panel ===== */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="px-6 py-6 space-y-4">
                {/* Mobile nav links */}
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-base font-medium text-gray-700 hover:text-brand-900 transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                ))}

                {/* Mobile auth action */}
                <div className="pt-4 border-t border-gray-100">
                  {session ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-center text-sm font-medium text-white bg-gradient-to-r from-brand-700 to-brand-900 px-6 py-3 rounded-full"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setShowLoginModal(true);
                      }}
                      className="w-full text-sm font-medium bg-gradient-to-r from-brand-700 to-brand-900 text-white px-6 py-3 rounded-full hover:shadow-lg transition-all active:scale-95"
                    >
                      Sign in
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
