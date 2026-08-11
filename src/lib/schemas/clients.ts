import { z } from "zod";

// Matches the columns of the public.clients Supabase table (0006_clients_supabase.sql)
export const clientFormSchema = z.object({
  // Core Identity
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().optional(),
  dob: z.string().min(1, "Date of birth is required"), // ISO date string
  gender: z.enum(["Male", "Female", "Other", "Unknown"], { message: "Gender is required" }),

  // Contact
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile must be exactly 10 digits"),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),

  // Government IDs
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format (e.g., ABCDE1234F)"),
  aadhaar: z.string().regex(/^[0-9]{12}$/, "Aadhaar must be exactly 12 digits"),

  // Address
  address_json: z.object({
    permanent_address: z.string().optional(),
    current_address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().regex(/^[0-9]{6}$/, "Invalid pincode").optional(),
  }).optional(),

  // Office / Branch
  office_id: z.string().min(1, "Office/Branch is required"),

  // Consent (required before saving)
  dpdp_consent: z.boolean().refine((val) => val === true, {
    message: "You must collect DPDP consent before proceeding",
  }),
});

// Convenience type for use in React components and server actions
export type ClientFormValues = z.infer<typeof clientFormSchema>;

// Type for reading a client row from Supabase (includes server-generated fields)
export type ClientRow = ClientFormValues & {
  id: string;
  company_id: string;
  full_name: string;
  kyc_status: "pending" | "in_progress" | "verified" | "rejected";
  pan_verified: boolean;
  digilocker_verified: boolean;
  fineract_client_id: number | null;
  created_at: string;
  updated_at: string;
};

