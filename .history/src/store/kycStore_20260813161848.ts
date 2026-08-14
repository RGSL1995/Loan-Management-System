import { create } from 'zustand';
import { verifyPanWithSurepass, generateDigilockerLink, fetchDigilockerResult } from '@/app/actions/kyc';

interface KycVerificationState {
  // PAN State
  isVerifyingPan: boolean;
  verifiedPanDetails: any | null;
  panError: string | null;

  // Aadhaar State
  isVerifyingAadhaar: boolean;
  verifiedAadhaarDetails: any | null;
  aadhaarError: string | null;

  // DigiLocker State
  isDigiLockerConnecting: boolean;
  digiLockerSessionId: string | null;
  digiLockerError: string | null;
  
  // Actions
  verifyPan: (panNumber: string) => Promise<boolean>;
  verifyAadhaar: (aadhaarNumber: string) => Promise<boolean>;
  connectDigiLocker: () => Promise<void>;
  resetKycState: () => void;
}

export const useKycStore = create<KycVerificationState>((set, get) => ({
  isVerifyingPan: false,
  verifiedPanDetails: null,
  panError: null,

  isVerifyingAadhaar: false,
  verifiedAadhaarDetails: null,
  aadhaarError: null,

  isDigiLockerConnecting: false,
  digiLockerSessionId: null,
  digiLockerError: null,

  verifyPan: async (panNumber: string) => {
    // Basic deduplication / caching to save API costs
    if (get().verifiedPanDetails?.panNumber === panNumber) {
      return true; // Already verified this PAN in this session
    }

    set({ isVerifyingPan: true, panError: null });
    
    try {
      const result = await verifyPanWithSurepass(panNumber);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      set({ 
        isVerifyingPan: false, 
        verifiedPanDetails: { 
          panNumber, 
          status: result.data?.status || "VALID", 
          name: result.data?.full_name || "Verified User" 
        } 
      });
      return true;
    } catch (error) {
      set({ 
        isVerifyingPan: false, 
        panError: error instanceof Error ? error.message : "Failed to verify PAN" 
      });
      return false;
    }
  },

  verifyAadhaar: async (aadhaarNumber: string) => {
    // Aadhaar is verified via the DigiLocker redirect flow, not a direct OTP API.
    // This function checks if a DigiLocker result has already been received for
    // the current session. If digiLockerSessionId exists in state, we poll Supabase
    // via fetchDigilockerResult to confirm verification.
    const sessionId = get().digiLockerSessionId;

    if (get().verifiedAadhaarDetails?.aadhaarNumber === aadhaarNumber) {
      return true; // Already verified this Aadhaar in this session
    }

    if (!sessionId) {
      set({ aadhaarError: "Please complete DigiLocker verification first." });
      return false;
    }

    set({ isVerifyingAadhaar: true, aadhaarError: null });

    try {
      // Check if the Surepass webhook has already written the DigiLocker result
      const result = await fetchDigilockerResult(sessionId);

      if (!result.success || !result.data?.full_name) {
        throw new Error("DigiLocker result not yet available. Please wait for verification to complete.");
      }

      set({
        isVerifyingAadhaar: false,
        verifiedAadhaarDetails: {
          aadhaarNumber,
          status: "VALID",
          name: result.data.full_name,
          address: result.data.address,
        }
      });
      return true;
    } catch (error) {
      set({
        isVerifyingAadhaar: false,
        aadhaarError: error instanceof Error ? error.message : "Failed to verify Aadhaar"
      });
      return false;
    }
  },

  connectDigiLocker: async () => {
    set({ isDigiLockerConnecting: true, digiLockerError: null });

    try {
      // Build the redirect URL from the current origin so it works in all environments
      const redirectUrl = typeof window !== "undefined"
        ? `${window.location.origin}/dashboard/kyc/digilocker-success`
        : `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/kyc/digilocker-success`;

      const result = await generateDigilockerLink({
        redirect_url: redirectUrl,
        expiry_minutes: 30,
        skip_main_screen: false,
        signup_flow: false,
      });

      if (!result.success || !result.data?.url) {
        throw new Error(result.error || "Failed to generate DigiLocker link");
      }

      // Store the session ID for later polling in verifyAadhaar
      set({
        isDigiLockerConnecting: false,
        digiLockerSessionId: result.data.session_id,
      });

      // Open DigiLocker in a popup window (matches digilocker-success page flow)
      const popup = window.open(
        result.data.url,
        "digilocker_auth",
        "width=600,height=700,left=200,top=100"
      );

      // Listen for postMessage from the success page when the popup closes
      const onMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type === "digilocker_success") {
          window.removeEventListener("message", onMessage);
          // Session result can now be fetched via verifyAadhaar
        }
      };
      window.addEventListener("message", onMessage);

    } catch (error) {
      set({
        isDigiLockerConnecting: false,
        digiLockerError: error instanceof Error ? error.message : "Failed to connect DigiLocker"
      });
    }
  },

  resetKycState: () => {
    set({
      isVerifyingPan: false,
      verifiedPanDetails: null,
      panError: null,
      isVerifyingAadhaar: false,
      verifiedAadhaarDetails: null,
      aadhaarError: null,
      isDigiLockerConnecting: false,
      digiLockerSessionId: null,
      digiLockerError: null,
    });
  }
}));
