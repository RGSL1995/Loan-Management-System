"use server";

import { createClient } from "@/lib/supabase/server";

export interface ProfileData {
  profileType: "individual" | "corporate";
  panNumber: string;

  // Individual fields
  individualName?: string;
  fatherHusbandName?: string;
  dob?: string;
  gender?: string;
  maritalStatus?: string;
  qualification?: string;
  occupation?: string;
  aadhaar?: string;
  passport?: string;
  mobile?: string;
  email?: string;
  currentAddress?: any;
  permanentAddress?: any;

  // Corporate fields
  entityName?: string;
  cinLlpin?: string;
  dol?: string;
  companyType?: string;
  gstin?: string;
  registeredAddress?: any;
  contactNo?: string;
  contactEmail?: string;
}

export async function searchProfileByPan(panNumber: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Get user's company
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (userError || !userProfile) throw new Error("Company not found");

    // Search for profile by PAN
    const { data: profile, error: searchError } = await supabase
      .from("profiles_master")
      .select("*")
      .eq("company_id", userProfile.company_id)
      .eq("pan_number", panNumber.toUpperCase())
      .single();

    if (searchError && searchError.code !== "PGRST116") {
      throw searchError;
    }

    if (profile) {
      return {
        success: true,
        found: true,
        data: profile,
        message: "Profile found"
      };
    }

    return {
      success: true,
      found: false,
      data: null,
      message: "Profile not found"
    };
  } catch (error: any) {
    console.error("Profile search error:", error);
    return {
      success: false,
      found: false,
      data: null,
      error: error?.message || "Failed to search profile"
    };
  }
}

export async function createProfile(profileData: ProfileData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Get user's company
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (userError || !userProfile) throw new Error("Company not found");

    // Check if PAN already exists
    const { data: existingProfile } = await supabase
      .from("profiles_master")
      .select("id")
      .eq("company_id", userProfile.company_id)
      .eq("pan_number", profileData.panNumber.toUpperCase())
      .single();

    if (existingProfile) {
      return {
        success: false,
        error: "Profile with this PAN already exists"
      };
    }

    // Create new profile
    const profilePayload: any = {
      company_id: userProfile.company_id,
      pan_number: profileData.panNumber.toUpperCase(),
      profile_type: profileData.profileType,
      created_by: user.id,
      status: "incomplete"
    };

    // Add individual fields
    if (profileData.profileType === "individual") {
      profilePayload.individual_name = profileData.individualName || null;
      profilePayload.father_husband_name = profileData.fatherHusbandName || null;
      profilePayload.dob = profileData.dob || null;
      profilePayload.gender = profileData.gender || null;
      profilePayload.marital_status = profileData.maritalStatus || null;
      profilePayload.qualification = profileData.qualification || null;
      profilePayload.occupation = profileData.occupation || null;
      profilePayload.aadhaar = profileData.aadhaar || null;
      profilePayload.passport = profileData.passport || null;
      profilePayload.mobile = profileData.mobile || null;
      profilePayload.email = profileData.email || null;
      profilePayload.current_address = profileData.currentAddress || null;
      profilePayload.permanent_address = profileData.permanentAddress || null;
    }

    // Add corporate fields
    if (profileData.profileType === "corporate") {
      profilePayload.entity_name = profileData.entityName || null;
      profilePayload.cin_llpin = profileData.cinLlpin || null;
      profilePayload.dol = profileData.dol || null;
      profilePayload.company_type = profileData.companyType || null;
      profilePayload.gstin = profileData.gstin || null;
      profilePayload.registered_address = profileData.registeredAddress || null;
      profilePayload.contact_no = profileData.contactNo || null;
      profilePayload.contact_email = profileData.contactEmail || null;
    }

    const { data: newProfile, error: createError } = await supabase
      .from("profiles_master")
      .insert([profilePayload])
      .select()
      .single();

    if (createError) throw createError;

    return {
      success: true,
      data: newProfile,
      message: "Profile created successfully"
    };
  } catch (error: any) {
    console.error("Profile creation error:", error);
    return {
      success: false,
      error: error?.message || "Failed to create profile"
    };
  }
}

export async function updateProfile(profileId: string, profileData: Partial<ProfileData>) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Verify profile belongs to user's company
    const { data: profile, error: fetchError } = await supabase
      .from("profiles_master")
      .select("company_id")
      .eq("id", profileId)
      .single();

    if (fetchError || !profile) throw new Error("Profile not found");

    const { data: userProfile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (profile.company_id !== userProfile?.company_id) {
      throw new Error("Unauthorized");
    }

    // Build update payload
    const updatePayload: any = {
      updated_by: user.id
    };

    if (profileData.individualName) updatePayload.individual_name = profileData.individualName;
    if (profileData.fatherHusbandName) updatePayload.father_husband_name = profileData.fatherHusbandName;
    if (profileData.dob) updatePayload.dob = profileData.dob;
    if (profileData.gender) updatePayload.gender = profileData.gender;
    if (profileData.maritalStatus) updatePayload.marital_status = profileData.maritalStatus;
    if (profileData.qualification) updatePayload.qualification = profileData.qualification;
    if (profileData.occupation) updatePayload.occupation = profileData.occupation;
    if (profileData.aadhaar) updatePayload.aadhaar = profileData.aadhaar;
    if (profileData.passport) updatePayload.passport = profileData.passport;
    if (profileData.mobile) updatePayload.mobile = profileData.mobile;
    if (profileData.email) updatePayload.email = profileData.email;
    if (profileData.currentAddress) updatePayload.current_address = profileData.currentAddress;
    if (profileData.permanentAddress) updatePayload.permanent_address = profileData.permanentAddress;

    if (profileData.entityName) updatePayload.entity_name = profileData.entityName;
    if (profileData.cinLlpin) updatePayload.cin_llpin = profileData.cinLlpin;
    if (profileData.dol) updatePayload.dol = profileData.dol;
    if (profileData.companyType) updatePayload.company_type = profileData.companyType;
    if (profileData.gstin) updatePayload.gstin = profileData.gstin;
    if (profileData.registeredAddress) updatePayload.registered_address = profileData.registeredAddress;
    if (profileData.contactNo) updatePayload.contact_no = profileData.contactNo;
    if (profileData.contactEmail) updatePayload.contact_email = profileData.contactEmail;

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles_master")
      .update(updatePayload)
      .eq("id", profileId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully"
    };
  } catch (error: any) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: error?.message || "Failed to update profile"
    };
  }
}

export async function linkProfileToApplication(
  applicationId: string,
  profileId: string,
  role: "primary_applicant" | "co_applicant" | "guarantor"
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    // Verify user has access to both application and profile
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    const { data: application } = await supabase
      .from("loan_applications")
      .select("company_id")
      .eq("id", applicationId)
      .single();

    const { data: profile } = await supabase
      .from("profiles_master")
      .select("company_id")
      .eq("id", profileId)
      .single();

    if (application?.company_id !== userProfile?.company_id ||
        profile?.company_id !== userProfile?.company_id) {
      throw new Error("Unauthorized");
    }

    // Link profile to application
    const { data: linkData, error: linkError } = await supabase
      .from("loan_application_profiles")
      .upsert({
        loan_application_id: applicationId,
        profile_id: profileId,
        role
      }, {
        onConflict: "loan_application_id,profile_id,role"
      })
      .select()
      .single();

    if (linkError) throw linkError;

    return {
      success: true,
      data: linkData,
      message: "Profile linked to application"
    };
  } catch (error: any) {
    console.error("Link profile error:", error);
    return {
      success: false,
      error: error?.message || "Failed to link profile"
    };
  }
}

export async function getProfilesByApplication(applicationId: string) {
  try {
    const supabase = await createClient();

    const { data: profiles, error } = await supabase
      .from("loan_application_profiles")
      .select(`
        id,
        role,
        profiles_master (*)
      `)
      .eq("loan_application_id", applicationId);

    if (error) throw error;

    return {
      success: true,
      data: profiles,
      message: "Profiles retrieved"
    };
  } catch (error: any) {
    console.error("Get profiles error:", error);
    return {
      success: false,
      data: null,
      error: error?.message || "Failed to get profiles"
    };
  }
}
