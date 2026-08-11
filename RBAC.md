# Role-Based Access Control (RBAC) — Software Requirements Specification (SRS)

**Project:** Finbyx — Loan Against Securities (LAS) Platform  
**Version:** 2.0  
**Last Updated:** 2026-07-21  
**Reference:** `👤 Who Can Access.pdf`, `RBAC-c.pdf` (LawDocs Compliance)

---

## 1. Overview

The Finbyx LAS platform utilizes a multi-dimensional Access Control system designed for B2B SaaS multi-tenancy. It integrates three core dimensions of access control:

1. **Role-Based Access Control (RBAC):** Hierarchical roles with predefined action permissions.
2. **Multi-Tenant Data Isolation:** Hard segregation of data using `company_id`.
3. **Route-Based Access Control:** Server-side middleware enforces which dashboard routes each role can access.

> [!NOTE]
> Unlike the LawDocs Compliance system (RBAC-c.pdf), Finbyx does **not** implement Module-Based Access Control or Sub-Admin departmental scoping. The role itself determines which features a user can see and interact with.

---

## 2. Role Definitions & Hierarchy

```
┌──────────────────────────────────────────────┐
│              PLATFORM LEVEL                  │
│                                              │
│   ┌─────────────────────────┐                │
│   │    super_admin          │ ← System-wide  │
│   │    (Platform Owner)     │   access        │
│   └───────────┬─────────────┘                │
│               │                              │
└───────────────┼──────────────────────────────┘
                │ creates & manages
┌───────────────┼──────────────────────────────┐
│               ▼                              │
│   ┌─────────────────────────┐                │
│   │    tenant_admin         │ ← Company-wide │
│   │    (NBFC Admin)         │   access        │
│   └───────────┬─────────────┘                │
│               │ creates & manages            │
│   ┌───────────┼───────────────────────┐      │
│   │           │                       │      │
│   ▼           ▼                       ▼      │
│ ┌──────┐  ┌──────────┐  ┌────────────────┐  │
│ │Loan  │  │Credit    │  │Operations      │  │
│ │Officer│  │Manager   │  │Officer         │  │
│ └──────┘  └──────────┘  └────────────────┘  │
│ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│ │Collections│ │Recovery  │ │Finance       │  │
│ │Officer   │ │Officer   │ │Officer       │  │
│ └──────────┘ └──────────┘ └──────────────┘  │
│ ┌────────────────┐  ┌─────────┐              │
│ │Compliance      │  │Auditor  │ ← Read-Only  │
│ │Officer         │  │         │               │
│ └────────────────┘  └─────────┘              │
│                                              │
│              TENANT LEVEL                    │
└──────────────────────────────────────────────┘
```

### 2.1 Super Admin (`super_admin`)

- **Scope:** System-wide
- **Description:** Highest level of access. Manages the entire Finbyx platform, all tenant companies, and all users.
- **Bypasses:** All route restrictions and company-level isolation (where applicable).
- **Capabilities:**
  - Create, suspend, and delete tenant companies
  - Provision `tenant_admin` accounts for new companies
  - View platform-wide analytics and billing
  - Access all tenant dashboards for support/debugging

### 2.2 Tenant Admin (`tenant_admin`)

- **Scope:** Company-wide (single tenant)
- **Description:** The primary account owner for a specific NBFC/company tenant. Their `company_id` is their own `_id`. They can create and manage all staff users within their company.
- **Bypasses:** Route restrictions within their own tenant (has access to all `/dashboard/*` routes).
- **Capabilities:**
  - Create, edit, deactivate staff users within their company
  - Configure LAS products (interest rates, LTV ratios, tenures)
  - Define security eligibility rules (accepted collateral types)
  - Set up approval hierarchies and GL account mappings
  - View all reports and audit trails within the company

### 2.3 Loan Officer (`loan_officer`)

- **Scope:** Tenant-level, restricted to Origination
- **Description:** The operational user responsible for client onboarding, data entry, and loan application creation. **Cannot approve or disburse loans.**
- **Capabilities:**
  - Create new clients and update client profiles
  - Create new LAS applications
  - Upload collateral documents (gold hallmark certificates, demat statements)
  - Track application status
  - View own applications only

### 2.4 Credit Manager (`credit_manager`)

- **Scope:** Tenant-level, restricted to Underwriting
- **Description:** The reviewing authority who evaluates loan applications. Pulls credit bureau reports, validates collateral, calculates LTV, and makes approval/rejection decisions.
- **Capabilities:**
  - View all pending applications in the underwriting queue
  - Pull CIBIL/Experian credit bureau reports
  - Validate collateral (cross-reference with NSE/BSE, verify hallmarks)
  - Calculate Loan-to-Value (LTV) with haircuts
  - Approve or reject loan applications (with remarks)
  - View company-wide approval statistics

### 2.5 Operations Officer (`operations_officer`)

- **Scope:** Tenant-level, restricted to Disbursement
- **Description:** Handles post-approval processes: security pledge registration, repayment schedule setup, NACH mandate configuration, and fund disbursement.
- **Capabilities:**
  - View all approved loans pending disbursement
  - Register security pledge with NSDL/CDSL
  - Configure repayment schedules (EMI, bullet, etc.)
  - Set up NACH/e-mandate for auto-debit
  - Execute fund disbursement to borrower's account
  - View disbursement statistics

### 2.6 Collections Officer (`collections_officer`)

- **Scope:** Tenant-level, restricted to Collections
- **Description:** Manages active loan accounts, tracks EMI payments, identifies overdue accounts, and performs follow-up activities.
- **Capabilities:**
  - View all active loan accounts and their payment status
  - Track payments and upcoming due dates
  - View overdue accounts by bucket (1-30, 31-60, 61-90, >90 days)
  - Log follow-up activities (calls, visits, notices)
  - Generate collection performance reports

### 2.7 Recovery Officer (`recovery_officer`)

- **Scope:** Tenant-level, restricted to Recovery
- **Description:** Handles defaulted accounts (NPA). Negotiates settlements with borrowers and executes forced liquidation of pledged securities.
- **Capabilities:**
  - View all defaulted/NPA accounts
  - Negotiate and record settlement agreements
  - Initiate liquidation of pledged securities on exchange
  - Track recovery and shortfall amounts
  - Generate recovery status reports

### 2.8 Finance Officer (`finance_officer`)

- **Scope:** Tenant-level, restricted to Finance
- **Description:** Manages the financial ledger, posts GL entries, and generates financial statements.
- **Capabilities:**
  - View all financial transactions across the company
  - Post General Ledger (GL) entries
  - Generate Trial Balance, P&L Statement, and Balance Sheet
  - Manage GL account mapping
  - Generate RBI regulatory reports

### 2.9 Compliance Officer (`compliance_officer`)

- **Scope:** Tenant-level, Read-Only + Audit
- **Description:** Monitors all decisions for regulatory compliance. Generates audit trails and RBI compliance reports.
- **Capabilities:**
  - Audit all loan decisions (approvals, rejections, disbursements)
  - Monitor RBI compliance status
  - Generate regulatory reports
  - View all transactions and audit logs
  - Export records for external audit

### 2.10 Auditor (`auditor`)

- **Scope:** Tenant-level, Strictly Read-Only
- **Description:** Internal or external auditor who views compliance responses, transactions, and generates audit reports. **Cannot modify any operational data.**
- **Capabilities:**
  - View all transactions across the company
  - Export records
  - Verify data accuracy
  - Generate audit reports

---

## 3. Granular Permission Mapping

Each role maps to a specific set of action permissions. These are enforced both on the frontend (UI visibility) and backend (Server Action authorization).

| Role | Permissions |
|:-----|:-----------|
| **super_admin** | `*` (all permissions) |
| **tenant_admin** | `manage_users`, `manage_products`, `configure_rules`, `manage_approvers`, `configure_gl`, `view_all_reports`, `audit_trail`, `view_all_applications`, `view_all_accounts`, `view_all_transactions` |
| **loan_officer** | `create_client`, `edit_client`, `create_application`, `upload_documents`, `view_own_applications`, `track_status` |
| **credit_manager** | `view_pending_applications`, `pull_credit_bureau`, `validate_collateral`, `calculate_ltv`, `approve_loan`, `reject_loan`, `view_company_reports` |
| **operations_officer** | `view_approved_loans`, `register_pledge`, `setup_repayment`, `setup_nach`, `disburse_loan`, `view_company_reports` |
| **collections_officer** | `view_active_accounts`, `track_payments`, `view_overdue`, `log_followup`, `view_company_reports` |
| **recovery_officer** | `view_defaulted_accounts`, `settle_loan`, `liquidate_pledge`, `view_company_reports` |
| **finance_officer** | `view_all_transactions`, `post_gl_entries`, `generate_trial_balance`, `generate_pnl`, `generate_rbi_reports`, `view_all_reports` |
| **compliance_officer** | `audit_decisions`, `monitor_compliance`, `generate_regulatory_reports`, `view_all_transactions`, `export_records`, `view_all_reports` |
| **auditor** | `view_all_transactions`, `export_records`, `verify_accuracy`, `generate_audit_reports` |

---

## 4. Multi-Tenant Data Isolation & ER Diagram

Every user object (except `super_admin`) is strictly tied to a `company_id`.

- **Tenant Admins:** `company_id = user._id` (the admin IS the company)
- **Staff Users:** `company_id = creator_admin._id` (stored in DB at creation time)

### Database Schema

```
┌─────────────────────────────────┐
│         companies               │
├─────────────────────────────────┤
│  id          UUID (PK)          │
│  name        TEXT (NOT NULL)     │
│  slug        TEXT (UNIQUE)       │
│  status      TEXT (Active/       │
│              Inactive/Suspended) │
│  fineract_   TEXT (tenant ID     │
│  tenant_id   for Fineract API)   │
│  created_at  TIMESTAMPTZ        │
└───────────────┬─────────────────┘
                │
                │ 1:N
                │
┌───────────────┴─────────────────┐
│         profiles                │
├─────────────────────────────────┤
│  id          UUID (PK, FK →     │
│              auth.users.id)      │
│  company_id  UUID (FK →         │
│              companies.id)       │
│  role        TEXT (CHECK         │
│              constraint)         │
│  full_name   TEXT               │
│  email       TEXT               │
│  is_active   BOOLEAN (default   │
│              true)               │
│  created_at  TIMESTAMPTZ        │
│  updated_at  TIMESTAMPTZ        │
└─────────────────────────────────┘
```

### Role CHECK Constraint

```sql
CHECK (role IN (
  'super_admin',
  'tenant_admin',
  'loan_officer',
  'credit_manager',
  'operations_officer',
  'collections_officer',
  'recovery_officer',
  'finance_officer',
  'compliance_officer',
  'auditor'
))
```

### Security Rules

- JWT tokens are validated, but the `company_id` is **always derived from the database** (not the JWT payload) to ensure stale tokens cannot exploit changed company associations.
- The `verifyCompanyAccess` middleware intercepts requests and asserts that `req.user.company_id === req.params.company_id`.

---

## 5. Row Level Security (RLS) Policies

All data access is enforced at the database level using Supabase RLS policies.

### 5.1 Profiles Table

```sql
-- Policy 1: Super Admins have full access to all profiles
CREATE POLICY "super_admins_full_access"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Policy 2: Users can view profiles within their own company
CREATE POLICY "users_view_own_company_profiles"
  ON public.profiles FOR SELECT
  USING (
    company_id = (
      SELECT company_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );

-- Policy 3: Tenant Admins can create/update profiles in their company
CREATE POLICY "tenant_admins_manage_company_profiles"
  ON public.profiles FOR ALL
  USING (
    company_id = (
      SELECT company_id FROM public.profiles
      WHERE id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'tenant_admin'
    )
  );
```

### 5.2 Companies Table

```sql
-- Super Admins control all companies
CREATE POLICY "super_admins_control_companies"
  ON public.companies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Users can only READ their own company details
CREATE POLICY "users_view_own_company"
  ON public.companies FOR SELECT
  USING (
    id = (
      SELECT company_id FROM public.profiles
      WHERE id = auth.uid()
    )
  );
```

---

## 6. Authentication & Session Management

- **Token Validation:** Standard Supabase JWT Bearer verification via `@supabase/ssr`.
- **Session Refresh:** Middleware calls `supabase.auth.getUser()` on every request to refresh the session cookie.
- **Role Fetching:** After JWT validation, the middleware queries the `profiles` table using the Service Role Key (bypassing RLS) to extract the user's `role` and `company_id`.
- **Session Invalidation:** If the user's `is_active` flag is set to `false` in the `profiles` table, the middleware should invalidate the session and redirect to `/login`.

---

## 7. Request Authorization Flow

The diagram below maps how a request traverses the layered middleware security system:

```
┌──────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌───────────────┐
│  Client  │    │ authenticateToken │    │ verifyCompanyAccess│    │ authorizeRole │
│ (Browser)│    │   (middleware.ts) │    │  (middleware.ts)  │    │ (rbac.ts)     │
└────┬─────┘    └────────┬─────────┘    └─────────┬────────┘    └──────┬────────┘
     │                   │                        │                     │
     │  API Request +    │                        │                     │
     │  JWT Cookie       │                        │                     │
     │──────────────────>│                        │                     │
     │                   │                        │                     │
     │                   │ Verify JWT Signature   │                     │
     │                   │ via supabase.auth      │                     │
     │                   │ .getUser()             │                     │
     │                   │<──────────────────┐    │                     │
     │                   │                   │    │                     │
     │                   │ Fetch User &      │    │                     │
     │                   │ Extract DB-Level  │    │                     │
     │                   │ company_id + role │    │                     │
     │                   │<──────────────────┘    │                     │
     │                   │                        │                     │
     │              ┌────┴────┐                   │                     │
     │              │ Invalid │                   │                     │
     │              │ Token?  │                   │                     │
     │              └────┬────┘                   │                     │
     │    401            │                        │                     │
     │<──────────────────│ (redirect to /login)   │                     │
     │                   │                        │                     │
     │                   │ Next() [Passes         │                     │
     │                   │ req.user]              │                     │
     │                   │───────────────────────>│                     │
     │                   │                        │                     │
     │                   │                        │ Assert route is     │
     │                   │                        │ allowed for role    │
     │                   │                        │ (roleAccess map)    │
     │                   │                        │                     │
     │              ┌────┴────────────────────────┴─┐                   │
     │              │ Route NOT in roleAccess[role]? │                   │
     │              └────┬──────────────────────────┘                   │
     │    302 redirect   │                                              │
     │<──────────────────│ (redirect to roleFallback)                   │
     │                   │                                              │
     │                   │ For Server Actions:                          │
     │                   │─────────────────────────────────────────────>│
     │                   │                                              │
     │                   │                          requireRole()       │
     │                   │                          checks role against │
     │                   │                          allowedRoles array  │
     │                   │<─────────────────────────────────────────────│
     │                   │                                              │
```

---

## 8. Route-Based Access Control

### 8.1 Role → Route Access Map

This is enforced in `src/lib/supabase/middleware.ts`:

| Role | Allowed Routes |
|:-----|:--------------|
| **super_admin** | `/platform/**`, `/dashboard/**` |
| **tenant_admin** | `/dashboard/**` |
| **loan_officer** | `/dashboard`, `/dashboard/clients/**`, `/dashboard/applications/**` |
| **credit_manager** | `/dashboard`, `/dashboard/underwriting/**`, `/dashboard/applications/**` (read-only) |
| **operations_officer** | `/dashboard`, `/dashboard/disbursement/**` |
| **collections_officer** | `/dashboard`, `/dashboard/collections/**` |
| **recovery_officer** | `/dashboard`, `/dashboard/recovery/**` |
| **finance_officer** | `/dashboard`, `/dashboard/finance/**` |
| **compliance_officer** | `/dashboard`, `/dashboard/reports/**`, `/dashboard/finance/compliance/**` |
| **auditor** | `/dashboard`, `/dashboard/reports/**`, `/dashboard/accounting/**` |

### 8.2 Role → Default Landing Page (Fallback)

When a user logs in or is redirected due to unauthorized access, they land on their role-specific default page:

| Role | Default Landing |
|:-----|:---------------|
| `super_admin` | `/platform/companies` |
| `tenant_admin` | `/dashboard` |
| `loan_officer` | `/dashboard/applications` |
| `credit_manager` | `/dashboard/underwriting` |
| `operations_officer` | `/dashboard/disbursement` |
| `collections_officer` | `/dashboard/collections` |
| `recovery_officer` | `/dashboard/recovery` |
| `finance_officer` | `/dashboard/finance` |
| `compliance_officer` | `/dashboard/reports` |
| `auditor` | `/dashboard/reports` |

---

## 9. UI Navigation Paths (Per Role)

### 9.1 Tenant Admin
```
/dashboard/admin/las
├── /dashboard/admin/las/products        → Create, Edit, Delete LAS Products
├── /dashboard/admin/las/settings        → Configure Company Rules
├── /dashboard/admin/las/security-eligibility → Define Accepted Securities
├── /dashboard/admin/las/approvers       → Manage Approval Hierarchy
└── /dashboard/admin/las/gl-mapping      → Configure GL Accounts
```

### 9.2 Loan Officer
```
/dashboard/applications
├── /dashboard/applications/new          → Create new LAS application
├── /dashboard/applications              → View own applications
├── /dashboard/applications/:id/status   → Track application progress
└── /dashboard/applications/:id/documents → Upload collateral documents
```

### 9.3 Credit Manager
```
/dashboard/underwriting
├── /dashboard/underwriting              → Pending applications queue
├── /dashboard/underwriting/:id          → Full application details
│   ├── Credit bureau report
│   ├── Collateral validation
│   └── Approval/Rejection decision
└── /dashboard/underwriting/reports      → Approval statistics
```

### 9.4 Operations Officer
```
/dashboard/disbursement
├── /dashboard/disbursement              → Pending disbursements
├── /dashboard/disbursement/:id/pledge   → Register security pledge (NSDL/CDSL)
├── /dashboard/disbursement/:id/schedule → Setup repayment schedule
├── /dashboard/disbursement/:id/nach     → Configure NACH mandate
└── /dashboard/disbursement/reports      → Disbursement statistics
```

### 9.5 Collections Officer
```
/dashboard/collections
├── /dashboard/collections               → Active accounts & overdue buckets
├── /dashboard/collections/:id/track     → Track payments & due dates
├── /dashboard/collections/:id/follow-up → Log follow-up activities
└── /dashboard/collections/reports       → Collection rate & performance
```

### 9.6 Recovery Officer
```
/dashboard/recovery
├── /dashboard/recovery                  → Defaulted / NPA accounts
├── /dashboard/recovery/:id/settle       → Settle with borrower
├── /dashboard/recovery/:id/liquidate    → Liquidate pledged securities
└── /dashboard/recovery/reports          → Recovery & liquidation status
```

### 9.7 Finance Officer
```
/dashboard/finance
├── /dashboard/finance                   → All transactions & accounting dashboard
├── /dashboard/finance/gl               → Post GL entries
├── /dashboard/finance/reports          → Trial Balance, P&L, Financial Reports
└── /dashboard/finance/compliance       → RBI & regulatory reporting
```

### 9.8 Compliance Officer & Auditor
```
/dashboard/reports
├── /dashboard/reports                   → All available reports
├── /dashboard/reports/audit-trail       → Decision audit log
└── /dashboard/reports/rbi              → RBI compliance reports
```

---

## 10. Access Control Matrix

| Feature | Tenant Admin | Loan Officer | Credit Manager | Ops Officer | Collections | Recovery | Finance | Compliance | Auditor |
|:--------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Admin Panel** | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create LAS Product** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Configure Rules** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Manage Approvers** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Applications** | 👁️ View | ✅ Create | 👁️ Review | 👁️ View | 👁️ View | 👁️ View | 👁️ View | 👁️ View | 👁️ View |
| **Create Application** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Submit Collateral** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Pull Credit Bureau** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Approve Loan** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Disbursement** | 👁️ View | ❌ | ❌ | ✅ Full | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Register Pledge** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Setup Repayment** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Disburse Loan** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Collections** | 👁️ View | ❌ | ❌ | ❌ | ✅ Full | 👁️ View | 👁️ View | 👁️ View | 👁️ View |
| **Track Payments** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Follow-up Overdue** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Recovery** | 👁️ View | ❌ | ✅ Approve | ❌ | ❌ | ✅ Full | 👁️ View | 👁️ View | 👁️ View |
| **Settle Loan** | ❌ | ❌ | ✅ (limited) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Liquidate Pledge** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Finance** | 👁️ View | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Full | 👁️ View | 👁️ View |
| **Post GL Entries** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Reports** | ✅ All | 👁️ Own | 📊 Company | 📊 Company | 📊 Company | 📊 Company | ✅ All | ✅ All | ✅ All |
| **Audit Trail** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| **RBI Reporting** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |

---

## 11. Middleware Implementation Guide

To enforce this RBAC on any route, the following layered middleware chain is applied:

### 11.1 Route-Level (Middleware — `src/lib/supabase/middleware.ts`)

1. **`authenticateToken`**: Validates JWT via `supabase.auth.getUser()`, fetches the user's `role` and `company_id` from the `profiles` table using the Service Role Key (bypasses RLS).
2. **`roleAccess` Map**: A dictionary mapping each role to an array of allowed route regex patterns. If the current path doesn't match any allowed pattern for the user's role, they are redirected to their `roleFallback` page.

### 11.2 Action-Level (Server Actions — `src/lib/supabase/rbac.ts`)

3. **`requireRole(['role1', 'role2'])`**: Verifies the user's role is in the allowed list. `super_admin` and `tenant_admin` implicitly pass this check.

### Example Route Implementation (Next.js Server Action):

```typescript
// src/app/actions/underwriting.ts
"use server";

import { requireRole } from "@/lib/supabase/rbac";

export async function approve_loan(application_id: string, remarks: string) {
  // Only Credit Managers can approve loans
  await requireRole(['credit_manager']);

  // Proceed with calling Fineract API to approve...
  // POST /api/fineract/loans/{id}?command=approve
}
```

---

## 12. Loan Lifecycle Status Changes

Each role's action transitions the loan through a defined status lifecycle:

| Phase | Role | Action | Status Change |
|:------|:-----|:-------|:-------------|
| Origination (Week 1) | Loan Officer | Submit Application | → `SUBMITTED` |
| Underwriting (Week 2) | Credit Manager | Review & Appraise | → `UNDER_REVIEW` |
| Approval (Week 3) | Credit Manager | Approve/Reject | → `APPROVED` / `REJECTED` |
| Disbursement (Day 1) | Operations Officer | Pledge & Disburse | → `ACTIVE` |
| Collection (Months 1-60) | Collections Officer | Track Payments | → `CURRENT` / `OVERDUE` |
| Default (Month 61+) | Recovery Officer | Settle or Liquidate | → `CLOSED_PAID_OFF` / `CLOSED_WRITTEN_OFF` |
| Compliance (Ongoing) | Compliance Officer | Audit & Report | → RBI Report Generated |

---

## 13. Summary Table — Who Does What

| Role | Creates Data | Reviews/Approves | Views | Cannot |
|:-----|:------------|:----------------|:------|:-------|
| **Tenant Admin** | Products, Rules, Users | — | Everything in company | Create applications |
| **Loan Officer** | Clients, Applications, Documents | — | Own applications | Approve, Disburse |
| **Credit Manager** | — | Applications (approve/reject) | Pending queue, Company reports | Create apps, Disburse |
| **Operations Officer** | Pledges, Schedules, NACH | — | Approved loans | Create apps, Approve |
| **Collections Officer** | Follow-up logs | — | Active & overdue accounts | Approve, Disburse, Recover |
| **Recovery Officer** | Settlements, Liquidations | — | Defaulted accounts | Create apps, Approve |
| **Finance Officer** | GL Entries | — | All transactions | Create apps, Approve |
| **Compliance Officer** | Regulatory reports | — | All decisions, audit trails | Modify any data |
| **Auditor** | — | — | All transactions (read-only) | Modify anything |

---

*End of Document*

This document provides a complete view of:
- All 10 user roles and their access levels
- Step-by-step permission mapping for each role
- Multi-tenant data isolation strategy
- Supabase database schema with RLS policies
- Middleware authorization flow
- Route-based access control matrix
- UI navigation paths for each role
- Status changes at each lifecycle phase
