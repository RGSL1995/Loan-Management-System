import { CheckCircle, Layers, Scale, Users, FileText, BarChart3 } from "lucide-react";
import { MarketingNavbar } from "@/components/MarketingNavbar";
import { MarketingFooter } from "@/components/MarketingFooter";

/* ── Static data ───────────────────────────────────────────────────── */


const LIFECYCLE = [
  {
    icon: Users,
    step: "01",
    title: "Borrower Onboarding",
    detail: "Digital KYC, e-KYC, video-KYC and bureau pulls — completed in under 3 minutes.",
  },
  {
    icon: FileText,
    step: "02",
    title: "Origination & Underwriting",
    detail: "Rule-based decisioning with CIC integration across CIBIL, Experian, and Equifax.",
  },
  {
    icon: CheckCircle,
    step: "03",
    title: "Sanction & Disbursement",
    detail: "Configurable approval workflows with digital sanction letters and auto-disbursement triggers.",
  },
  {
    icon: BarChart3,
    step: "04",
    title: "Servicing & Collections",
    detail: "EMI tracking, IRAC classification, demand notices, and a field collections app.",
  },
  {
    icon: Scale,
    step: "05",
    title: "Regulatory Reporting",
    detail: "Automated SBR, NPA, and CIC submission reports. Audit-ready on day one.",
  },
];

const PRINCIPLES = [
  {
    title: "No custom logic for compliance",
    body: "Every RBI regulation — from SBR to PMLA/AML to DPDP — is handled natively. You inherit compliance, you don't build it.",
  },
  {
    title: "Configuration is the product",
    body: "Products, fields, workflows, and pricing rules are defined as data. Business teams move without waiting for developers.",
  },
  {
    title: "Beautiful is not a bonus",
    body: "Dense data tables and terse CLI interfaces had their era. Modern credit teams deserve modern tooling.",
  },
  {
    title: "Multi-tenant from the ground up",
    body: "One installation. Infinite NBFC tenants. Complete data isolation and role-based access — out of the box.",
  },
];

/* ── Page ──────────────────────────────────────────────────────────── */
export default function About() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <MarketingNavbar />

      {/* ── PAGE BANNER ─────────────────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-3">About RGSL</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight max-w-xl">
              Building the infrastructure layer<br className="hidden md:block" /> for modern lenders.
            </h1>
          </div>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm md:text-right">
            We saw NBFCs forced to choose between speed and compliance.
            RGSL was built so you never have to make that trade-off again.
          </p>
        </div>
      </section>

      {/* ── LIFECYCLE ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-3">The platform</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 max-w-xl">
            Every step of the lending lifecycle. In one place.
          </h2>
        </div>

        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-5 top-4 bottom-4 w-px bg-gradient-to-b from-brand-200 via-brand-400 to-brand-100 hidden md:block" />

          <div className="space-y-6">
            {LIFECYCLE.map(({ icon: Icon, step, title, detail }) => (
              <div key={step} className="flex gap-8 group">
                <div className="flex-shrink-0 relative z-10">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-brand-200 group-hover:border-brand-900 group-hover:bg-brand-900 transition-all flex items-center justify-center shadow-sm">
                    <Icon className="w-4 h-4 text-brand-700 group-hover:text-white transition-colors" />
                  </div>
                </div>
                <div className="flex-grow pb-6 border-b border-gray-100 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-brand-400 tracking-widest">{step}</span>
                    <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                  </div>
                  <p className="text-gray-500 text-[15px] leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRINCIPLES ─────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
          <div className="mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700 mb-3">How we think</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 max-w-xl">
              Principles that drive every decision.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-gray-200 rounded-2xl overflow-hidden border border-gray-200">
            {PRINCIPLES.map(({ title, body }) => (
              <div key={title} className="bg-white p-8 hover:bg-gray-50 transition-colors group">
                <div className="w-2 h-2 rounded-full bg-brand-900 mb-5 group-hover:scale-150 transition-transform" />
                <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed text-[15px]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ARCHITECTURE CALLOUT ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-24">
        <div className="bg-brand-900 rounded-3xl px-10 py-16 grid lg:grid-cols-2 gap-12 items-center text-white">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-6 h-6 text-brand-300" />
              <span className="text-xs font-bold uppercase tracking-widest text-brand-300">Architecture</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-4">Powered by Apache Fineract. Fronted by RGSL.</h2>
            <p className="text-brand-200 leading-relaxed">
              Our core banking engine is Apache Fineract — battle-tested at global MFIs and NBFCs. RGSL wraps it with a modern multi-tenant UI, workflow layer, and compliance intelligence that Fineract alone cannot provide.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { label: "Loan Lifecycle Engine", note: "Apache Fineract" },
              { label: "Auth, RBAC & Tenancy", note: "Supabase + RGSL layer" },
              { label: "Compliance Intelligence", note: "Native RBI/CIC modules" },
              { label: "UI & Workflow", note: "RGSL proprietary layer" },
            ].map(({ label, note }) => (
              <div key={label} className="flex items-center justify-between border border-brand-700 rounded-xl px-5 py-4">
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs text-brand-300 bg-brand-800 px-3 py-1 rounded-full font-mono">{note}</span>
              </div>
            ))}
          </div>
        </div>
      </section>



      <MarketingFooter />
    </div>
  );
}
