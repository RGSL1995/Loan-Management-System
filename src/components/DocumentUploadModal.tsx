"use client";

import { useState, useRef } from "react";
import { X, Upload, AlertCircle, CheckCircle, Loader } from "lucide-react";
import { validateExtractedData } from "@/app/actions/document-parser";

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted: (data: any) => void;
  documentType?: "loan_application" | "sanction_letter";
}

interface ExtractedField {
  field: string;
  value: string;
  confidence: number;
  type: "success" | "warning" | "error";
}

export default function DocumentUploadModal({
  isOpen,
  onClose,
  onDataExtracted,
  documentType = "loan_application",
}: DocumentUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [extractedFields, setExtractedFields] = useState<ExtractedField[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (max 20MB)
    const MAX_SIZE = 20 * 1024 * 1024;
    if (selectedFile.size > MAX_SIZE) {
      const sizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
      setError(`File size must be less than 20MB. Your file: ${sizeMB}MB`);
      return;
    }

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Please upload a PDF or image file (JPG, PNG, WebP)");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDragDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(droppedFile);
        input.files = dataTransfer.files;
        handleFileChange({ target: input } as any);
      }
    }
  };

  const handleParse = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use FormData to send file to API route
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const response = await fetch("/api/documents/parse", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Failed to parse document");
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to parse document");
        setIsLoading(false);
        return;
      }

      // Validate extracted data
      const validation = await validateExtractedData(result.data!);
      setValidationResult(validation);

      // Format extracted fields for display
      const fields: ExtractedField[] = [];

      if (result.data?.loan_amount) {
        fields.push({
          field: "Loan Amount",
          value: result.data.loan_amount,
          confidence: result.data.confidence_scores?.loan_amount || 0.9,
          type: "success",
        });
      }

      if (result.data?.loan_tenure) {
        fields.push({
          field: "Loan Tenure (Months)",
          value: result.data.loan_tenure,
          confidence: result.data.confidence_scores?.loan_tenure || 0.9,
          type: "success",
        });
      }

      if (result.data?.individual?.name) {
        fields.push({
          field: "Applicant Name",
          value: result.data.individual.name,
          confidence: result.data.confidence_scores?.applicant_name || 0.95,
          type: "success",
        });
      }

      if (result.data?.individual?.pan) {
        fields.push({
          field: "PAN",
          value: result.data.individual.pan,
          confidence: result.data.confidence_scores?.pan || 0.95,
          type: "success",
        });
      }

      if (result.data?.business?.entity_name) {
        fields.push({
          field: "Company Name",
          value: result.data.business.entity_name,
          confidence: result.data.confidence_scores?.entity_name || 0.9,
          type: "success",
        });
      }

      if (result.data?.collaterals && result.data.collaterals.length > 0) {
        result.data.collaterals.forEach((col: any, idx: number) => {
          if (col.type) {
            fields.push({
              field: `Collateral ${idx + 1} Type`,
              value: col.type,
              confidence: 0.85,
              type: "success",
            });
          }
          if (col.address) {
            fields.push({
              field: `Collateral ${idx + 1} Address`,
              value: col.address,
              confidence: 0.8,
              type: "success",
            });
          }
        });
      }

      setExtractedData(result.data);
      setExtractedFields(fields);
      setIsLoading(false);
    } catch (err: any) {
      setError(err?.message || "Failed to parse document");
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (extractedData) {
      onDataExtracted(extractedData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
              Upload Document
            </h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              {documentType === "loan_application"
                ? "Upload a loan application form to auto-fill the form"
                : "Upload a sanction letter to extract loan details"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Upload Area */}
          {!extractedData ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDragDrop}
              className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-700 dark:text-slate-300 mb-2">
                Drag and drop your document here
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                Supported formats: PDF, JPG, PNG, WebP (Max 25MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
              >
                Select File
              </button>
            </div>
          ) : null}

          {/* Selected File Info */}
          {file && !extractedData && (
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                Selected: {file.name}
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="mt-3 max-h-48 rounded border border-gray-200 dark:border-slate-700"
                />
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Extracted Data */}
          {extractedData && (
            <div className="space-y-4">
              {/* Validation Alerts */}
              {validationResult && (
                <>
                  {validationResult.errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                        ⚠️ Errors
                      </p>
                      <ul className="space-y-1">
                        {validationResult.errors.map((err: string, idx: number) => (
                          <li key={idx} className="text-xs text-red-600 dark:text-red-400">
                            • {err}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {validationResult.warnings.length > 0 && (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-2">
                        ⚠️ Warnings
                      </p>
                      <ul className="space-y-1">
                        {validationResult.warnings.map((warn: string, idx: number) => (
                          <li key={idx} className="text-xs text-amber-600 dark:text-amber-400">
                            • {warn}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              {/* Extracted Fields */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-3">
                  Extracted Information
                </h3>
                <div className="space-y-2">
                  {extractedFields.map((field, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {field.field}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                          {field.value}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-slate-400">
                          {(field.confidence * 100).toFixed(0)}%
                        </span>
                        {field.confidence >= 0.85 && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {field.confidence < 0.85 && (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                ℹ️ You can review and edit these values in the form after they are auto-filled.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-md hover:bg-gray-200 dark:hover:bg-slate-700"
          >
            Cancel
          </button>

          {!extractedData ? (
            <button
              onClick={handleParse}
              disabled={!file || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <Loader className="w-4 h-4 animate-spin" />}
              {isLoading ? "Parsing..." : "Parse Document"}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Confirm & Fill Form
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
