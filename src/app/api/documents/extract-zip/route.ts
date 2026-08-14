import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const formData = await request.formData();
    const zipFile = formData.get("file") as File;
    const applicationId = formData.get("applicationId") as string;

    if (!zipFile || !applicationId) {
      return NextResponse.json(
        { success: false, error: "File and applicationId required" },
        { status: 400 }
      );
    }

    if (!zipFile.name.endsWith(".zip")) {
      return NextResponse.json(
        { success: false, error: "Only ZIP files allowed" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await zipFile.arrayBuffer();

    // Extract files from zip using JSZip
    const zip = new JSZip();
    await zip.loadAsync(buffer);

    const extractedFiles: { name: string; path: string }[] = [];
    let fileCount = 0;

    // Process each file in the zip
    for (const [fileName, file] of Object.entries(zip.files)) {
      if (!file.dir && fileCount < 10) {
        try {
          const fileBuffer = await file.async("arraybuffer");

          // Upload to Supabase Storage
          const storagePath = `applications/${applicationId}/ckyc/${Date.now()}_${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from("documents")
            .upload(storagePath, Buffer.from(fileBuffer), {
              contentType: getContentType(fileName),
              upsert: false,
            });

          if (!uploadError) {
            extractedFiles.push({
              name: fileName,
              path: storagePath,
            });
            fileCount++;
          } else {
            console.error(`Error uploading ${fileName}:`, uploadError);
          }
        } catch (err) {
          console.error(`Error processing file ${fileName}:`, err);
        }
      }
    }

    if (extractedFiles.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files extracted from ZIP" },
        { status: 400 }
      );
    }

    // Save document metadata to database
    const { error: dbError } = await supabase
      .from("loan_application_documents")
      .insert(
        extractedFiles.map((file) => ({
          application_id: applicationId,
          document_name: file.name,
          storage_path: file.path,
          document_type: getDocumentType(file.name),
          uploaded_by: user.id,
          created_at: new Date().toISOString(),
        }))
      );

    if (dbError) {
      console.error("Error saving document metadata:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save document metadata" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Extracted and uploaded ${extractedFiles.length} files`,
      files: extractedFiles,
    });
  } catch (error: any) {
    console.error("Extract ZIP error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process ZIP" },
      { status: 500 }
    );
  }
}

function getContentType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    txt: "text/plain",
  };
  return types[ext || ""] || "application/octet-stream";
}

function getDocumentType(fileName: string): string {
  const name = fileName.toLowerCase();
  if (name.includes("aadhaar") || name.includes("aadhar")) return "aadhaar";
  if (name.includes("pan")) return "pan";
  if (name.includes("ckyc")) return "ckyc";
  if (name.includes("gst") || name.includes("gstin")) return "gstin";
  return "other";
}
