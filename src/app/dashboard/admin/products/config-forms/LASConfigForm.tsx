import { LASConfig } from "@/lib/schemas/products";

interface LASConfigFormProps {
  config: any;
  onChange: (config: LASConfig) => void;
  disabled?: boolean;
}

export default function LASConfigForm({
  config,
  onChange,
  disabled,
}: LASConfigFormProps) {
  return (
    <div className="space-y-4">
      {/* Security Type */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Security Type
        </label>
        <select
          value={config.security_type || "gold"}
          onChange={(e) =>
            onChange({
              ...config,
              security_type: e.target.value as "gold" | "stocks" | "mutual_funds" | "bonds",
            })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          disabled={disabled}
        >
          <option value="gold">Gold</option>
          <option value="stocks">Stocks</option>
          <option value="mutual_funds">Mutual Funds</option>
          <option value="bonds">Bonds</option>
        </select>
      </div>

      {/* LTV Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          LTV Percentage (%)
        </label>
        <input
          type="number"
          min="10"
          max="100"
          placeholder="75"
          value={config.ltv_percentage || ""}
          onChange={(e) =>
            onChange({ ...config, ltv_percentage: parseInt(e.target.value) })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          required
          disabled={disabled}
        />
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
          Loan amount = Market value × LTV%
        </p>
      </div>

      {/* Haircut Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Haircut Percentage (%)
        </label>
        <input
          type="number"
          min="0"
          max="50"
          placeholder="5"
          value={config.haircut_percentage || ""}
          onChange={(e) =>
            onChange({ ...config, haircut_percentage: parseInt(e.target.value) })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          disabled={disabled}
        />
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
          Safety margin applied to collateral value
        </p>
      </div>

      {/* NSDL Pledge */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.require_nsdl_pledge !== false}
          onChange={(e) =>
            onChange({ ...config, require_nsdl_pledge: e.target.checked })
          }
          disabled={disabled}
          className="w-4 h-4 border border-gray-300 dark:border-slate-600 rounded"
        />
        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
          Require NSDL Pledge
        </span>
      </label>
      <p className="text-xs text-gray-600 dark:text-slate-400">
        Mandate NSDL pledge for stocks and mutual funds
      </p>
    </div>
  );
}
