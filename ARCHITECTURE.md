# Finbyx Architecture & Tech Stack

This document outlines the core architecture of the Finbyx platform. All development must strictly adhere to these architectural boundaries.

## 1. Core Architecture Strategy: "Headless Core Banking"

Finbyx operates using a separation of concerns between the **Frontend/Middleware** and the **Core Banking Engine**. 

**CRITICAL RULE: DO NOT BUILD CORE BANKING LOGIC.**
We do not build custom calculation engines, rule of 78 scripts, daily accrual jobs, or double-entry accounting ledgers. All core financial mathematics and ledger management are offloaded to **Apache Fineract**.

### The Three Pillars

| Layer | Technology | Responsibility |
| :--- | :--- | :--- |
| **UI & Middleware** | **Next.js (React 19)** | High-density dashboards, API proxying, NBFC-specific business rule validation, data transformation, and form rendering. |
| **Auth & Multi-Tenancy** | **Supabase** | User authentication, RBAC (Platform Admin vs Super Admin), and Tenant (Company) routing mapping. |
| **Core Banking Ledger** | **Apache Fineract** | Loan origination, scheduling, EMI calculations, penalties, General Ledger accounting, and state machines. |

## 2. Apache Fineract Integration

- **Multi-Tenancy:** Fineract supports multi-tenancy natively. When a user logs in, Next.js Middleware reads their `company_id` from Supabase and passes it to Fineract via the `Fineract-Platform-TenantId` HTTP header.
- **Data Mapping:** Fineract APIs will be called server-side from Next.js API Routes or Server Actions. Next.js will transform Fineract's generic JSON into the specific payload structures required by the Finbyx frontend.

## 3. Discarded Components (From Original Specs)

During the initial planning phases, a custom `LMS_Developer_Bundle` was provided containing a Python reference engine (`lms_calc.py`) and a 39-table SQL schema.
**These components have been explicitly discarded in favor of Apache Fineract.**
- Do not attempt to run or port `lms_calc.py`.
- Do not attempt to migrate the 39-table SQL schema into Supabase. Supabase should only hold lightweight tables for UI state, companies, and user profiles.

## 4. UI Development Phase

The frontend is based on high-density HTML prototypes (e.g., `las_application.html`, `collections.html`).
When building UI components:
- Prioritize edge-to-edge layouts (`w-full min-h-screen`).
- Use micro-typography (`text-xs` and `text-sm`) and tight spacing (`p-2`, `gap-2`).
- Build strictly using Next.js App Router, Tailwind CSS, and Lucide React icons.
