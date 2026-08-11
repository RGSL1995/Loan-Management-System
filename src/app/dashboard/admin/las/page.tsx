"use client";

import Link from "next/link";
import { Settings, Package, Users, BarChart3 } from "lucide-react";

export default function LASAdminDashboard() {

  const stats = [
    {
      label: "Loan Products",
      value: "4",
      icon: Package,
      color: "bg-blue-500",
      href: "/dashboard/admin/products",
    },
    {
      label: "Active Approvers",
      value: "5",
      icon: Users,
      color: "bg-green-500",
      href: "/dashboard/admin/approvers",
    },
    {
      label: "Config Status",
      value: "Active",
      icon: Settings,
      color: "bg-purple-500",
      href: "/dashboard/admin/settings",
    },
    {
      label: "Active Loans",
      value: "12",
      icon: BarChart3,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="w-full h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
              LAS Admin Panel
            </h1>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              Configure Loan Against Securities products and rules
            </p>
          </div>
          <Link
            href="/dashboard/admin/products"
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            New Product
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href || "#"}
              className="p-4 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 dark:text-slate-400 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-slate-100 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl">
          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/admin/products"
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                  Manage Products
                </h3>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                  Create LAS, Gold, LAP, Personal Loan and more products
                </p>
              </Link>

              <Link
                href="/dashboard/admin/settings"
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                  Configure Settings
                </h3>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                  Set approval limits, KYC requirements, auto-approval rules
                </p>
              </Link>

              <Link
                href="/dashboard/admin/approvers"
                className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                <h3 className="font-semibold text-gray-900 dark:text-slate-100">
                  Manage Approvers
                </h3>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
                  Set up approval hierarchy and authority limits
                </p>
              </Link>
            </div>
          </div>

          {/* Documentation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">
              Getting Started
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-300 space-y-2 list-decimal list-inside">
              <li>
                <strong>Create LAS Products:</strong> Define products your company offers (e.g., Gold LAS with 75% LTV)
              </li>
              <li>
                <strong>Configure Settings:</strong> Set approval limits, CIBIL check requirements, auto-approval thresholds
              </li>
              <li>
                <strong>Add Approvers:</strong> Assign team members with specific approval authority limits
              </li>
              <li>
                <strong>Ready to Go:</strong> Loan officers can now create applications using your configured products
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
