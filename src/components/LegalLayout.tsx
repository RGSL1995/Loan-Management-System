"use client";

import React, { useState, useEffect } from "react";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { MarketingFooter } from "@/components/MarketingFooter";
import { Calendar, Clock } from "lucide-react";

interface Section {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  /* Pass section IDs + labels for the sticky ToC */
  sections?: Section[];
}

export function LegalLayout({ children, title, description, sections }: LegalLayoutProps) {
  const [activeSection, setActiveSection] = useState<string>("");

  // Highlight the current section in the ToC as the user scrolls
  useEffect(() => {
    if (!sections?.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const updatedDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <MarketingNavbar />

      {/* Page Hero */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700 mb-3">Legal</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">{title}</h1>
          {description && <p className="text-gray-500 text-lg max-w-xl">{description}</p>}
          <div className="flex items-center gap-6 mt-6 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Last updated: {updatedDate}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              ~5 min read
            </span>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 lg:px-12 py-16">
        <div className="flex gap-16 items-start">

          {/* Sticky Table of Contents (hidden on mobile) */}
          {sections && sections.length > 0 && (
            <aside className="hidden lg:block w-56 flex-shrink-0 sticky top-28 self-start">
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-4">On this page</p>
              <nav className="space-y-1">
                {sections.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={`block text-sm py-1.5 px-3 rounded-lg transition-all border-l-2 ${
                      activeSection === id
                        ? "text-brand-700 font-semibold bg-brand-50 border-brand-500"
                        : "text-gray-500 hover:text-gray-900 border-transparent hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </aside>
          )}

          {/* Content */}
          <article className="flex-grow min-w-0 space-y-8">
            {children}
          </article>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
}

/* ─── Reusable section card component ────────────────────────────────────── */
interface LegalSectionProps {
  id: string;
  number: string | number;
  title: string;
  children: React.ReactNode;
}

export function LegalSection({ id, number, title, children }: LegalSectionProps) {
  return (
    <section
      id={id}
      className="bg-gray-50 border border-gray-100 rounded-2xl p-8 scroll-mt-28"
    >
      <div className="flex items-start gap-5 mb-5">
        <span className="flex-shrink-0 w-9 h-9 rounded-xl bg-brand-900 text-white text-sm font-bold flex items-center justify-center shadow-sm">
          {number}
        </span>
        <h2 className="text-xl font-bold text-gray-900 pt-1">{title}</h2>
      </div>
      <div className="text-gray-600 leading-relaxed space-y-4 text-[15px]">
        {children}
      </div>
    </section>
  );
}

/* ─── Styled list ────────────────────────────────────────────────────────── */
export function LegalList({ items }: { items: { label: string; detail: string }[] }) {
  return (
    <ul className="space-y-3 mt-2">
      {items.map(({ label, detail }) => (
        <li key={label} className="flex gap-3">
          <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
          <p>
            <strong className="text-gray-800">{label}:</strong> {detail}
          </p>
        </li>
      ))}
    </ul>
  );
}
