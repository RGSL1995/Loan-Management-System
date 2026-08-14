import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      profileType,
      panNumber,
      individualName,
      fatherHusbandName,
      dob,
      gender,
      maritalStatus,
      qualification,
      occupation,
      aadhaar,
      passport,
      mobile,
      email,
      currentAddress,
      permanentAddress,
      entityName,
      cinLlpin,
      dol,
      companyType,
      gstin,
      registeredAddress,
      contactNo,
      contactEmail
    } = body;

    if (!profileType || !panNumber) {
      return NextResponse.json(
        { success: false, error: "Profile type and PAN number are required" },
        { status: 400 }
      );
    }

    // Get user's company
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json(
        { success: false, error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if PAN already exists
    const { data: existingProfile } = await supabase
      .from("profiles_master")
      .select("id")
      .eq("company_id", userProfile.company_id)
      .eq("pan_number", panNumber.toUpperCase())
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: "Profile with this PAN already exists" },
        { status: 409 }
      );
    }

    // Build profile payload
    const profilePayload: any = {
      company_id: userProfile.company_id,
      pan_number: panNumber.toUpperCase(),
      profile_type: profileType,
      created_by: user.id,
      status: "incomplete"
    };

    // Add individual fields
    if (profileType === "individual") {
      profilePayload.individual_name = individualName || null;
      profilePayload.father_husband_name = fatherHusbandName || null;
      profilePayload.dob = dob || null;
      profilePayload.gender = gender || null;
      profilePayload.marital_status = maritalStatus || null;
      profilePayload.qualification = qualification || null;
      profilePayload.occupation = occupation || null;
      profilePayload.aadhaar = aadhaar || null;
      profilePayload.passport = passport || null;
      profilePayload.mobile = mobile || null;
      profilePayload.email = email || null;
      profilePayload.current_address = currentAddress || null;
      profilePayload.permanent_address = permanentAddress || null;
    }

    // Add corporate fields
    if (profileType === "corporate") {
      profilePayload.entity_name = entityName || null;
      profilePayload.cin_llpin = cinLlpin || null;
      profilePayload.dol = dol || null;
      profilePayload.company_type = companyType || null;
      profilePayload.gstin = gstin || null;
      profilePayload.registered_address = registeredAddress || null;
      profilePayload.contact_no = contactNo || null;
      profilePayload.contact_email = contactEmail || null;
    }

    const { data: newProfile, error: createError } = await supabase
      .from("profiles_master")
      .insert([profilePayload])
      .select()
      .single();

    if (createError) throw createError;

    return NextResponse.json({
      success: true,
      data: newProfile,
      message: "Profile created successfully"
    });
  } catch (error: any) {
    console.error("Profile creation API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create profile" },
      { status: 500 }
    );
  }
}
