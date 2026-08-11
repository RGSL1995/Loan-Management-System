# Surepass KYC API Integration

This document outlines the architecture and integration flow for the **Surepass Paid KYC APIs** (PAN, Aadhaar, DigiLocker, CIBIL) within the Finbyx Loan Origination System.

**Note to Developers:** The actual `fetch()` calls to the Surepass production endpoints are currently commented out. They are using `setTimeout` to return mock data so you can build the UI without incurring API costs. When ready for production, uncomment the fetch logic in `src/app/actions/kyc.ts`.

---

## 1. Environment & Keys
**Path:** `.env.local` / `.env.example`
- **Purpose:** We store the `SUREPASS_API_BASE_URL` and the massive `SUREPASS_API_BEARER_TOKEN` here. 
- **Security:** These are never exposed to the browser. They are only accessed via secure Next.js Server Actions.

## 2. Server Actions (The Secure Layer)
**Path:** `src/app/actions/kyc.ts`
- **Purpose:** This is the strictly server-side barrier. React components must call these actions instead of hitting Surepass directly. 
- **Functions:** `verifyPanWithSurepass()`, `generateDigilockerLink()`.
- **Security:** It automatically masks PII (like replacing PAN with `99******99`) before saving to the database to comply with UIDAI/DPDP regulations. 

## 3. Zod Schemas (Type Safety)
**Path:** `src/lib/schemas/kyc-responses.ts`
- **Purpose:** Strict validation schemas for the expected JSON responses coming from Surepass.
- **Why:** If Surepass changes a key in their JSON response, Zod will catch it here and fail gracefully, rather than causing a fatal frontend crash deep inside a React component.

## 4. Zustand State Store (Deduplication & Caching)
**Path:** `src/store/kycStore.ts`
- **Purpose:** Global state management for KYC verifications. 
- **Cost Saving:** It caches verified data in memory. If a user clicks "Verify" on the same PAN twice, the store skips the Server Action and immediately returns the cached result, saving API costs.
- **Usage:** Import `useKycStore` into any React component to access `verifyPan()`, `isVerifyingPan`, and `verifiedPanDetails`. 

## 5. Async Webhooks
**Path:** `src/app/api/webhooks/surepass/route.ts`
- **Purpose:** An edge-ready API route designed to listen for asynchronous callbacks from Surepass (e.g., when a user finishes the DigiLocker redirect flow).
- **Behavior:** It validates the incoming payload and logs the callback event directly into the database using the Supabase Service Role (bypassing RLS since webhooks are unauthenticated).

## 6. Database Logging
**Path:** `supabase/migrations/0005_kyc_logs.sql`
- **Purpose:** A dedicated Supabase table (`kyc_verification_logs`) that keeps a historical audit trail of every API hit (Success or Failure).
- **Why:** Essential for compliance auditing and for cross-checking our internal logs against the monthly Surepass billing invoice. 

---

### How to Pick Up Next
To continue development:
1. Open `src/components/loan-steps/ApplicantDetailsStep.tsx`.
2. Import `const { verifyPan, isVerifyingPan, verifiedPanDetails } = useKycStore();`.
3. Bind the "Verify" button to `verifyPan(inputValue)`.
4. Render a green checkmark or loading spinner based on the state!
