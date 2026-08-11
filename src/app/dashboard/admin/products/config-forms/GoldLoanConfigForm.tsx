import { GoldLoanConfig } from "@/lib/schemas/products";

interface GoldLoanConfigFormProps {
  config: any;
  onChange: (config: GoldLoanConfig) => void;
  disabled?: boolean;
}

export default function GoldLoanConfigForm({
  config,
  onChange,
  disabled,
}: GoldLoanConfigFormProps) {
  return (
    <div className="space-y-4">
      {/* Gold Purity Min */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Minimum Gold Purity
        </label>
        <select
          value={config.gold_purity_min || "916"}
          onChange={(e) =>
            onChange({ ...config, gold_purity_min: parseInt(e.target.value) })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          disabled={disabled}
        >
          <option value="750">750 (18K)</option>
          <option value="875">875 (21K)</option>
          <option value="916">916 (22K)</option>
          <option value="999">999 (24K)</option>
        </select>
      </div>

      {/* Rate Source */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Gold Rate Source
        </label>
        <select
          value={config.rate_source || "MCX"}
          onChange={(e) =>
            onChange({
              ...config,
              rate_source: e.target.value as "MCX" | "IBJA" | "MANUAL",
            })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          disabled={disabled}
        >
          <option value="MCX">MCX (Multi Commodity Exchange)</option>
          <option value="IBJA">IBJA (Indian Bullion & Jewellers Association)</option>
          <option value="MANUAL">Manual Entry</option>
        </select>
      </div>

      {/* Melting Charges */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Melting Charges (%)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="10"
          placeholder="5"
          value={config.melting_charges_percent || ""}
          onChange={(e) =>
            onChange({
              ...config,
              melting_charges_percent: parseFloat(e.target.value),
            })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          disabled={disabled}
        />
      </div>

      {/* Storage Charges */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Annual Storage Charges (%)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          placeholder="2"
          value={config.storage_charges_annual_percent || ""}
          onChange={(e) =>
            onChange({
              ...config,
              storage_charges_annual_percent: parseFloat(e.target.value),
            })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          disabled={disabled}
        />
      </div>

      {/* Making Charges (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Making Charges (%) (Optional)
        </label>
        <input
          type="number"
          step="0.1"
          min="0"
          max="5"
          placeholder="0"
          value={config.making_charges_percent || ""}
          onChange={(e) =>
            onChange({
              ...config,
              making_charges_percent: e.target.value
                ? parseFloat(e.target.value)
                : undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          disabled={disabled}
        />
      </div>

      {/* Insurance Required */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.require_insurance || false}
          onChange={(e) =>
            onChange({ ...config, require_insurance: e.target.checked })
          }
          disabled={disabled}
          className="w-4 h-4 border border-gray-300 dark:border-slate-600 rounded"
        />
        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
          Require Vault Insurance
        </span>
      </label>
    </div>
  );
}
