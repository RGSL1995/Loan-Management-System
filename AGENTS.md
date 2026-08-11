<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:finbyx-ui-rules -->
# Finbyx UI/UX Design Standards (High-Density Enterprise Dashboard)

When building UI components and layouts for this project, adhere strictly to the following high-density, data-heavy design principles (inspired by enterprise LOS systems):

1. **Edge-to-Edge Layouts (No Wasted Space)**
   - Never use constrained containers (e.g., `container mx-auto` or `max-w-7xl`) for dashboard views.
   - Dashboards must be full-width and full-height (`w-full min-h-screen`).
   - Utilize a multi-panel architecture: A narrow left navigation sidebar (`w-20`), a fluid center data pane, and a fixed right sidebar for filters/forms (`w-72` to `w-80`).

2. **Micro-Typography (Dense Text)**
   - Default to smaller font sizes to maximize data visibility.
   - Use `text-[11px]` or `text-xs` (12px) for secondary data, labels, table cells, and status badges.
   - Use `text-sm` (14px) for primary data and standard text.
   - Apply `leading-tight` or `leading-none` to compress line heights and save vertical space.

3. **Compact Spacing (Tight Padding/Margins)**
   - Drastically reduce whitespace. Avoid large paddings like `p-6` or `p-8`.
   - Use tight padding for inputs, buttons, and table cells (e.g., `px-3 py-1.5`, `p-2`).
   - Use small gaps in flex/grid containers (e.g., `gap-2` or `gap-3`).

4. **Data Tables (The Core Focus)**
   - Tables must be incredibly dense. Strip out unnecessary padding in `<td>` and `<th>` elements (`py-2 px-3` maximum).
   - Use thin, subtle borders (`border-gray-200` or `border-border`) to separate rows.
   - Keep status badges (e.g., "Pending", "Active") extremely small and pill-shaped (e.g., `px-2 py-0.5 text-[10px] rounded-full`).

5. **Subtle Delineation**
   - Separate visual sections using thin borders (`border-r`, `border-b`) rather than heavy drop shadows or massive margins.
   - Keep header banners compact (e.g., the top statistics bar should not exceed `h-16` or `h-20`).

6. **Mobile & Cross-Screen Responsiveness**
   - EVERY component and layout must be built with mobile-first and responsive principles in mind.
   - High-density data tables and sidebars must gracefully stack or become scrollable on smaller screens (e.g., using Tailwind's `sm:`, `md:`, `lg:` prefixes).
<!-- END:finbyx-ui-rules -->

<!-- BEGIN:finbyx-compliance-rules -->
# STRICT COMPLIANCE & CONFIDENTIALITY RULES

When analyzing provided screenshots or references (e.g., from Graviton or other systems), you MUST strictly adhere to the following rules at all times:

1. **NO DATA LEAKAGE:** You must treat all provided screenshots as highly confidential. Do NOT copy, extract, output, or use any real user names, client data, financial figures, or proprietary data visible in the screenshots. Use dummy data (e.g., "John Doe", "Acme Corp") for all placeholders.
2. **NO DIRECT CLONING (COPYRIGHT SAFE):** Finbyx is *inspired* by the provided references, not a direct clone. You MUST make deliberate adjustments to layouts, component arrangements, naming conventions, and color schemes to ensure Finbyx remains a distinct, original product and does not infringe on copyrights.
3. **INSPIRED, NOT COPIED:** Retain the high-density UX philosophy and structural workflow, but change the specific visual execution.
<!-- END:finbyx-compliance-rules -->

<!-- BEGIN:finbyx-architecture-rules -->
# FINBYX ARCHITECTURE: APACHE FINERACT CORE

**CRITICAL - READ BEFORE WRITING ANY BACKEND CODE:**
1. **NO CUSTOM CORE LOGIC:** Do NOT attempt to build a custom loan calculation engine (EMI, IRAC, ECL) or double-entry accounting database. 
2. **APACHE FINERACT:** All core banking and loan management operations MUST use **Apache Fineract** as the headless backend.
3. **SUPABASE SCOPE:** Supabase is ONLY used for Authentication, Tenant mapping (Companies table), user profiles (RBAC), and lightweight UI configurations. It is NOT the financial ledger.
4. Always reference the `ARCHITECTURE.md` file in the project root for integration details and boundaries.
<!-- END:finbyx-architecture-rules -->

<!-- BEGIN:finbyx-pre-integration-rules -->
# FINBYX PRE-INTEGRATION STUBBING RULES
While building without a live Fineract instance:
1. **Mock Data Isolation:** Do not hardcode mock data directly inside UI components. All mock data MUST be returned from Next.js API routes (`/api/fineract/...`) so the UI behaves exactly as it will in production.
2. **Schema Accuracy:** When mocking Fineract responses, refer to Fineract OpenAPI standards (or `LMS_Postman_Collection.json`).
3. **Zod First:** All forms must be strictly typed and validated using Zod before any payload is sent to the mock API layer.
<!-- END:finbyx-pre-integration-rules -->

<!-- BEGIN:finbyx-dark-theme-rules -->
# FINBYX DARK THEME STANDARDS
When building UI components, you MUST implement support for Dark Mode using Tailwind's `dark:` variant class names.
1. **Dark is NOT Pure Black:** Do NOT use pure black (`#000000` or `bg-black`) for dark mode backgrounds.
2. **Elevated Surfaces:** Use sophisticated dark grays, slate, or zinc colors (e.g., `dark:bg-slate-900` for main background, `dark:bg-slate-800` for cards/surfaces, and `dark:bg-slate-700` for hovered elements).
3. **Contrast:** Ensure text maintains high legibility and contrast against dark surfaces using muted grays for secondary text (`dark:text-slate-400`) and bright whites/grays for primary text (`dark:text-slate-100`).
<!-- END:finbyx-dark-theme-rules -->

<!-- BEGIN:finbyx-landing-page-rules -->
# FINBYX LANDING PAGE, NAV & FOOTER DESIGN RULES

When designing or modifying the landing page (`/`), navigation bar, and footer, you MUST adhere to a CLEAN, WHITE-BASED aesthetic. The purple colors provided should only be used for accents, buttons, glowing elements, or subtle gradients on a white background.

1. **Theme & Colors (White Base + Purple Accents):**
   - Base Background: Pure White (`#FFFFFF`) or very light gray (`#FAFAFA`).
   - Primary Text: Near Black (`#111827`) or very dark purple.
   - Secondary Text: Dark Gray (`#4B5563`).
   - Accents/Buttons/Highlights: Use the purple palette (`#49225B`, `#6E3482`, `#A56ABD`) for gradients, text highlights, and interactive elements.

2. **The "Journey" Narrative Flow:**
   - The sections of the landing page must feel interconnected, telling a story of modern lending infrastructure.
   - Use soft, subtle purple radial background gradients on the white background to transition between sections.
   - Use a continuous SVG line/path spanning down the page to connect the narrative (e.g., using `#A56ABD` or a soft gray).

3. **Subtle 3D & Micro-Animations:**
   - Implement `framer-motion` for scroll-triggered appearing text (`y: 20 -> 0`, `opacity: 0 -> 1`).
   - Use floating, overlapping 3D objects (e.g., translucent glass credit cards or dashboard panels) in the Hero section that subtly animate up/down. Make them fit the light theme (e.g., light glass or solid purple cards against the white background).

4. **Glassmorphism:**
   - Feature cards and navigation must use light glassmorphic effects (`bg-white/70` with `backdrop-blur-md`).
   - Card borders should have a 1px solid stroke (e.g., `border-gray-200` or a very faint purple).

5. **Navigation & Footer:**
   - Nav: Sticky, light glassmorphic pill or full-width floating bar with dark text.
   - Footer: Can be a clean white footer or a solid dark purple (`#49225B`) block at the bottom to ground the page.

6. **CTA Sections & Large Blocks (CRITICAL):**
   - NEVER make sections which feature a centered large single-color card (e.g., a massive purple block) on a white background.
   - Keep CTA sections minimal, clean, and integrated into the white background flow rather than using heavy, massive blocks of solid color.
<!-- END:finbyx-landing-page-rules -->

<!-- BEGIN:finbyx-kyc-production-lock -->
# ⛔ KYC & PAID API PRODUCTION LOCK — DO NOT REMOVE

**This is a permanent rule for all developers working on Finbyx.**

All KYC and document verification API integrations (Surepass, DigiLocker, NSDL, UIDAI, CIBIL, etc.) are currently in **MOCK/STUB MODE** and **MUST REMAIN SO** until the project owner (Mohit) explicitly states "We are ready for production. Activate the KYC APIs."

### Rule Details

1. **NEVER uncomment or activate real `fetch()` calls** to any paid KYC/verification endpoint.
2. **All verification functions** in `src/app/actions/kyc.ts` and `src/store/kycStore.ts` MUST return simulated/mock data using `setTimeout`.
3. **The mock responses must mimic the exact schema** of the real API (Zod-validated) so the UI works identically in production when switched on.
4. **Any new KYC verification endpoint** you build (Aadhaar OTP, GST, CIBIL, etc.) must also start in mock mode with a `// PRODUCTION: uncomment the fetch() call below` comment.
5. **No billing is incurred** while in mock mode. Activating even a single real call generates a paid API hit.

### Files Covered by This Rule
- `src/app/actions/kyc.ts` — PAN, DigiLocker verifications
- `src/store/kycStore.ts` — Zustand store for KYC state
- `src/app/api/webhooks/surepass/route.ts` — Surepass webhook handler
- Any future file that imports `SUREPASS_API_BEARER_TOKEN` or any KYC env variable

### How to Activate (Production Only — Owner Permission Required)
When Mohit gives the go-ahead:
1. Open `src/app/actions/kyc.ts`
2. Replace each `setTimeout` mock block with the commented-out `fetch()` call
3. Remove the `// PRODUCTION:` comment markers
4. Deploy and test in staging before going live
<!-- END:finbyx-kyc-production-lock -->
