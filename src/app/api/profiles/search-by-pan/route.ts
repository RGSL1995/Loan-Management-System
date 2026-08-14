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

    const { panNumber } = await request.json();

    if (!panNumber || !panNumber.trim()) {
      return NextResponse.json(
        { success: false, error: "PAN number is required" },
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

    // Search for profile
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
      return NextResponse.json({
        success: true,
        found: true,
        data: profile
      });
    }

    return NextResponse.json({
      success: true,
      found: false,
      data: null,
      message: "Profile not found"
    });
  } catch (error: any) {
    console.error("Profile search API error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to search profile" },
      { status: 500 }
    );
  }
}
