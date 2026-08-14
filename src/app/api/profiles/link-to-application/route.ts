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

    const { applicationId, profileId, role } = await request.json();

    if (!applicationId || !profileId || !role) {
      return NextResponse.json(
        { success: false, error: "Application ID, profile ID, and role are required" },
        { status: 400 }
      );
    }

    // Get user's company
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", user.id)
      .single();

    // Verify user has access to application and profile
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
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
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

    return NextResponse.json({
      success: true,
      data: linkData,
      message: "Profile linked to application"
    });
  } catch (error: any) {
    console.error("Link profile API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to link profile" },
      { status: 500 }
    );
  }
}
