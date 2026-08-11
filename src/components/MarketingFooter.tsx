"use client";

import Link from "next/link";
import { ArrowRight, Globe, Mail } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="bg-[#F9F8F6] pt-24 pb-12 relative z-10 overflow-hidden border-t border-gray-200">
      {/* Cosmetic: Top Left Concentric Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full border-[1px] border-dashed border-gray-300/50"></div>
      <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full border-[1px] border-dashed border-gray-300/40"></div>
      <div className="absolute top-0 left-0 w-64 h-64 rounded-full border-[1px] border-dashed border-gray-300/30"></div>

      {/* Cosmetic: Wavy Bottom Shape */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[60px] opacity-10">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,120.34,192.4,111.4,235.45,105,279.16,84.93,321.39,56.44Z" fill="#49225B"></path>
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col lg:flex-row justify-between items-start gap-16 mb-20 relative z-10">
        {/* Column 1: Brand & Socials */}
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">RGSL</span>
          </Link>
          <p className="text-gray-600 text-sm leading-relaxed mb-8">
            The next-generation lending infrastructure platform designed for scale, speed, and security. Bringing modern artistry to financial workflows.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-600 hover:text-brand-700 hover:border-brand-200 transition-colors shadow-sm">
              <Globe className="w-4 h-4" />
            </Link>
            <Link href="#" className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 text-gray-600 hover:text-brand-700 hover:border-brand-200 transition-colors shadow-sm">
              <Mail className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-12 w-full lg:w-auto flex-grow">
          {/* Column 2: Company */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6 text-lg">Company</h4>
            <ul className="space-y-4 text-sm text-gray-600 font-medium">
              <li><Link href="/about" className="hover:text-brand-700 transition-colors">About Us</Link></li>
              <li><Link href="/disclaimer" className="hover:text-brand-700 transition-colors">Disclaimer</Link></li>
              <li><Link href="/declarations" className="hover:text-brand-700 transition-colors">Declarations</Link></li>
            </ul>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-gray-900 font-bold mb-6 text-lg">Support</h4>
            <ul className="space-y-4 text-sm text-gray-600 font-medium">
              <li><Link href="/sla" className="hover:text-brand-700 transition-colors">SLA</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-brand-700 transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-brand-700 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-brand-700 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>

          {/* Column 4: Stay Connected */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="text-gray-900 font-bold mb-6 text-lg">Stay Connected</h4>
            <p className="text-gray-600 text-sm mb-4">Subscribe for updates and exclusive platform insights.</p>

            <div className="relative mb-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full bg-white border border-gray-200 rounded-lg py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
              <button className="absolute right-1 top-1 bottom-1 bg-brand-900 hover:bg-brand-700 text-white rounded-md px-3 flex items-center justify-center transition-colors shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Mail className="w-3 h-3" />
              <span>No spam, unsubscribe anytime.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 font-medium">
        <p>© {new Date().getFullYear()} RGSL Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
          <Link href="/terms-and-conditions" className="hover:text-gray-900 transition-colors">Terms & Conditions</Link>
          <Link href="/cookie-policy" className="hover:text-gray-900 transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
}
