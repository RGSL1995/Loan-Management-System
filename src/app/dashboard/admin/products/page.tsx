"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Copy, AlertCircle, CheckCircle2 } from "lucide-react";
import { getProducts, deleteProduct, duplicateProduct } from "@/app/actions/products";
import type { Product, ProductType } from "@/lib/schemas/products";
import { ProductTypeMetadata } from "@/lib/schemas/products";
import ProductFormModal from "./ProductFormModal";

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [filterType, setFilterType] = useState<ProductType | "all">("all");

  useEffect(() => {
    fetchProducts();
  }, [filterType]);

  async function fetchProducts() {
    try {
      setLoading(true);
      const result = await getProducts(
        filterType === "all" ? undefined : (filterType as ProductType)
      );
      if (result.error) {
        setError(result.error);
      } else {
        setProducts(result.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return;

    try {
      const result = await deleteProduct(id);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Product deleted successfully");
        setProducts(products.filter((p) => p.id !== id));
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  }

  async function handleDuplicateProduct(id: string) {
    try {
      const result = await duplicateProduct(id);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Product duplicated successfully");
        await fetchProducts();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to duplicate product");
    }
  }

  const filteredProducts = filterType === "all"
    ? products
    : products.filter((p) => p.product_type === filterType);

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              Loan Products
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              Create and manage all loan product types
            </p>
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Product
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {["all", "las", "gold_loan", "lap", "personal_loan"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                filterType === type
                  ? "bg-black dark:bg-white text-white dark:text-black"
                  : "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
              }`}
            >
              {type === "all"
                ? "All Products"
                : ProductTypeMetadata[type as ProductType].label}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 m-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        </div>
      )}

      {success && (
        <div className="p-4 m-6 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-green-600 dark:text-green-400">{success}</div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
              <p className="mt-4 text-gray-600 dark:text-slate-400">
                Loading products...
              </p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-600 dark:text-slate-400 mb-4">
                No products found
              </p>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-100"
              >
                Create First Product
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="p-5 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-gray-900 dark:text-slate-100">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                      {ProductTypeMetadata[product.product_type].label}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ml-2 ${
                      product.status === "ACTIVE"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {product.status}
                  </span>
                </div>

                {/* Basic Info */}
                <div className="space-y-2 mb-4 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">
                      Amount:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      ₹{(product.min_amount / 100000).toFixed(1)}L - ₹
                      {(product.max_amount / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">
                      Interest:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      {product.interest_rate_min}% - {product.interest_rate_max}% p.a.
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">
                      Fee:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      {product.processing_fee_percentage}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-slate-400">
                      Tenure:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-slate-100">
                      {product.tenure_months.join(", ")} mo
                    </span>
                  </div>
                </div>

                {/* Config Preview */}
                {product.config && (
                  <div className="mb-4 p-2 bg-white dark:bg-slate-800 rounded text-[10px] text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                    {product.product_type === "las" && (
                      <div>
                        <div>Security: {(product.config as any).security_type}</div>
                        <div>LTV: {(product.config as any).ltv_percentage}%</div>
                      </div>
                    )}
                    {product.product_type === "gold_loan" && (
                      <div>
                        <div>
                          Purity: {(product.config as any).gold_purity_min}
                        </div>
                        <div>
                          Source: {(product.config as any).rate_source}
                        </div>
                      </div>
                    )}
                    {product.product_type === "lap" && (
                      <div>
                        <div>
                          Property:{" "}
                          {(product.config as any).property_types?.join(", ")}
                        </div>
                        <div>LTV: {(product.config as any).ltv_percentage}%</div>
                      </div>
                    )}
                    {product.product_type === "personal_loan" && (
                      <div>
                        <div>
                          Min CIBIL: {(product.config as any).credit_score_min}
                        </div>
                        <div>
                          Leverage:{" "}
                          {(product.config as any).max_leverage_ratio}x
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setShowModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-[10px] font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() =>
                      product.id && handleDuplicateProduct(product.id)
                    }
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900 rounded text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                  <button
                    onClick={() =>
                      product.id && handleDeleteProduct(product.id)
                    }
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900 rounded text-[10px] font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowModal(false);
            setEditingProduct(null);
          }}
          onSuccess={() => {
            setShowModal(false);
            setEditingProduct(null);
            setSuccess(
              `Product ${editingProduct ? "updated" : "created"} successfully`
            );
            fetchProducts();
            setTimeout(() => setSuccess(null), 3000);
          }}
          onError={(err) => {
            setError(err);
          }}
        />
      )}
    </div>
  );
}
