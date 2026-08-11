"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { createProduct, updateProduct } from "@/app/actions/products";
import type { Product, ProductType } from "@/lib/schemas/products";
import { ProductTypeMetadata } from "@/lib/schemas/products";
import LASConfigForm from "./config-forms/LASConfigForm";
import GoldLoanConfigForm from "./config-forms/GoldLoanConfigForm";
import LAPConfigForm from "./config-forms/LAPConfigForm";
import PersonalLoanConfigForm from "./config-forms/PersonalLoanConfigForm";

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export default function ProductFormModal({
  product,
  onClose,
  onSuccess,
  onError,
}: ProductFormModalProps) {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    product_type: (product?.product_type || "las") as ProductType,
    min_amount: product?.min_amount.toString() || "",
    max_amount: product?.max_amount.toString() || "",
    interest_rate_min: product?.interest_rate_min.toString() || "8",
    interest_rate_max: product?.interest_rate_max.toString() || "12",
    tenure_months: product?.tenure_months.join(",") || "12,24,36,60",
    processing_fee_percentage: product
      ?.processing_fee_percentage.toString() || "1",
    status: product?.status || "ACTIVE",
    config: product?.config || {},
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const tenureMonths = formData.tenure_months
        .split(",")
        .map((m) => parseInt(m.trim()));

      const payload = {
        name: formData.name,
        description: formData.description,
        product_type: formData.product_type,
        min_amount: parseInt(formData.min_amount),
        max_amount: parseInt(formData.max_amount),
        interest_rate_min: parseFloat(formData.interest_rate_min),
        interest_rate_max: parseFloat(formData.interest_rate_max),
        tenure_months: tenureMonths,
        processing_fee_percentage: parseFloat(
          formData.processing_fee_percentage
        ),
        status: formData.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
        config: formData.config,
      };

      let result;
      if (product?.id) {
        result = await updateProduct(product.id, payload);
      } else {
        result = await createProduct(payload);
      }

      if (result.error) {
        onError(result.error);
      } else {
        onSuccess();
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            {product ? "Edit Product" : "New Loan Product"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">
              Product Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                ["las", "gold_loan", "lap", "personal_loan"] as ProductType[]
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, product_type: type, config: {} })
                  }
                  disabled={loading || !!product} // Can't change type on edit
                  className={`p-3 rounded border text-xs font-medium transition-colors ${
                    formData.product_type === type
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 hover:border-gray-300 dark:hover:border-slate-600"
                  } ${loading || !!product ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div>{ProductTypeMetadata[type].icon}</div>
                  <div>{ProductTypeMetadata[type].label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Basic Fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                Product Name
              </label>
              <input
                type="text"
                placeholder="e.g., Gold Loan Premium, LAS - Stocks"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                Description
              </label>
              <textarea
                placeholder="Brief description of this product"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none"
                disabled={loading}
              />
            </div>

            {/* Amount Range */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                  Min Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="100000"
                  value={formData.min_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, min_amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                  Max Amount (₹)
                </label>
                <input
                  type="number"
                  placeholder="5000000"
                  value={formData.max_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, max_amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Interest Rates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                  Min Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="50"
                  placeholder="8"
                  value={formData.interest_rate_min}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interest_rate_min: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  required
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                  Max Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="50"
                  placeholder="15"
                  value={formData.interest_rate_max}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      interest_rate_max: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Tenure */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                Tenure Options (months)
              </label>
              <input
                type="text"
                placeholder="12, 24, 36, 60"
                value={formData.tenure_months}
                onChange={(e) =>
                  setFormData({ ...formData, tenure_months: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                Comma-separated values
              </p>
            </div>

            {/* Processing Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                Processing Fee (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                placeholder="1"
                value={formData.processing_fee_percentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    processing_fee_percentage: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                disabled={loading}
              />
            </div>

            {/* Status */}
            {product && (
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as "ACTIVE" | "INACTIVE" | "ARCHIVED" })
                  }
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                  disabled={loading}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            )}
          </div>

          {/* Type-Specific Config Forms */}
          <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 mb-4">
              {ProductTypeMetadata[formData.product_type].label} Configuration
            </h3>

            {formData.product_type === "las" && (
              <LASConfigForm
                config={formData.config}
                onChange={(config) =>
                  setFormData({ ...formData, config })
                }
                disabled={loading}
              />
            )}

            {formData.product_type === "gold_loan" && (
              <GoldLoanConfigForm
                config={formData.config}
                onChange={(config) =>
                  setFormData({ ...formData, config })
                }
                disabled={loading}
              />
            )}

            {formData.product_type === "lap" && (
              <LAPConfigForm
                config={formData.config}
                onChange={(config) =>
                  setFormData({ ...formData, config })
                }
                disabled={loading}
              />
            )}

            {formData.product_type === "personal_loan" && (
              <PersonalLoanConfigForm
                config={formData.config}
                onChange={(config) =>
                  setFormData({ ...formData, config })
                }
                disabled={loading}
              />
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-sm font-medium text-gray-900 dark:text-slate-100 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : product ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
