import { NextRequest, NextResponse } from "next/server";
import { proxyToFineract } from "@/lib/fineract/proxy";
import { createClient } from "@/lib/supabase/server";

async function getTenantId(req: NextRequest): Promise<string | undefined> {
  // For testing without Supabase, return default tenant
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log("Supabase not configured, using default tenant ID");
    return "default";
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      return profile?.company_id;
    }
  } catch (error) {
    console.error("Failed to get tenant ID:", error);
    return "default";
  }
}

async function getRequestBody(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  try {
    const p = await params;
    const pathStr = p.path ? p.path.join("/") : "";
    const tenantId = await getTenantId(req);

    const result = await proxyToFineract(pathStr, "GET", undefined, { tenantId });

    if (result.error) {
      console.error(`[Fineract API] Error: ${result.error.defaultUserMessage}`);
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data, {
      status: result.status,
      headers: result.headers,
    });
  } catch (error) {
    console.error("[Fineract API] Unexpected error:", error);
    return NextResponse.json(
      { error: { defaultUserMessage: error instanceof Error ? error.message : "Unknown error" } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const p = await params;
  const pathStr = p.path ? p.path.join("/") : "";
  const tenantId = await getTenantId(req);
  const body = await getRequestBody(req);

  const result = await proxyToFineract(pathStr, "POST", body, { tenantId });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, {
    status: result.status,
    headers: result.headers,
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const p = await params;
  const pathStr = p.path ? p.path.join("/") : "";
  const tenantId = await getTenantId(req);
  const body = await getRequestBody(req);

  const result = await proxyToFineract(pathStr, "PUT", body, { tenantId });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, {
    status: result.status,
    headers: result.headers,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const p = await params;
  const pathStr = p.path ? p.path.join("/") : "";
  const tenantId = await getTenantId(req);
  const body = await getRequestBody(req);

  const result = await proxyToFineract(pathStr, "PATCH", body, { tenantId });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, {
    status: result.status,
    headers: result.headers,
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const p = await params;
  const pathStr = p.path ? p.path.join("/") : "";
  const tenantId = await getTenantId(req);

  const result = await proxyToFineract(pathStr, "DELETE", undefined, { tenantId });

  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data, {
    status: result.status,
    headers: result.headers,
  });
}
