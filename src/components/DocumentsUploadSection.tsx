"use client";

import { useState, useEffect } from "react";
import { Upload, Download, Trash2, FileText, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Document {
  id: string;
  document_name: string;
  storage_path: string;
  document_type: string;
  created_at: string;
}

interface DocumentsUploadSectionProps {
  applicationId: string;
}

export default function DocumentsUploadSection({ applicationId }: DocumentsUploadSectionProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing documents
  useEffect(() => {
    loadDocuments();
  }, [applicationId]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const supabase = await createClient();
      const { data, error: fetchError } = await supabase
        .from("loan_application_documents")
        .select("*")
        .eq("application_id", applicationId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setDocuments(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      setError("Please upload a ZIP file");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("applicationId", applicationId);

      const response = await fetch("/api/documents/extract-zip", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to extract ZIP");
      }

      // Reload documents after successful upload
      await loadDocuments();
      alert(`Successfully uploaded ${result.files.length} documents`);
    } catch (err: any) {
      setError(err.message || "Failed to upload documents");
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleDownload = async (storagePath: string, fileName: string) => {
    try {
      const supabase = await createClient();
      const { data, error: downloadError } = await supabase.storage
        .from("documents")
        .download(storagePath);

      if (downloadError) throw downloadError;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Failed to download: " + err.message);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm("Delete this document?")) return;

    try {
      const supabase = await createClient();
      const doc = documents.find(d => d.id === docId);

      if (doc) {
        // Delete from storage
        await supabase.storage.from("documents").remove([doc.storage_path]);

        // Delete from database
        await supabase.from("loan_application_documents").delete().eq("id", docId);

        // Reload
        await loadDocuments();
      }
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  const getDocumentIcon = (type: string) => {
    const icons: Record<string, string> = {
      aadhaar: "🆔",
      pan: "📋",
      ckyc: "✅",
      gstin: "📊",
      other: "📄",
    };
    return icons[type] || "📄";
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-3">
          📁 CKYC Documents
        </h3>

        {/* Upload Section */}
        <label className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer transition">
          <input
            type="file"
            accept=".zip"
            onChange={handleZipUpload}
            disabled={isUploading}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-xs text-gray-600 dark:text-slate-400">Extracting...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                  Upload CKYC ZIP
                </span>
                <span className="text-[10px] text-gray-500 dark:text-slate-500">
                  Click to select file
                </span>
              </>
            )}
          </div>
        </label>

        {error && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      ) : documents.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg">{getDocumentIcon(doc.document_type)}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 dark:text-slate-100 truncate">
                    {doc.document_name}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-slate-400">
                    {doc.document_type.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleDownload(doc.storage_path, doc.document_name)}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded text-center text-xs text-gray-500 dark:text-slate-400">
          No documents uploaded yet
        </div>
      )}
    </div>
  );
}
