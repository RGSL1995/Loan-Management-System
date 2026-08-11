import { LAPConfig } from "@/lib/schemas/products";

interface LAPConfigFormProps {
  config: any;
  onChange: (config: LAPConfig) => void;
  disabled?: boolean;
}

export default function LAPConfigForm({
  config,
  onChange,
  disabled,
}: LAPConfigFormProps) {
  const propertyTypes = config.property_types || [];

  const togglePropertyType = (type: string) => {
    const updated = propertyTypes.includes(type)
      ? propertyTypes.filter((t: string) => t !== type)
      : [...propertyTypes, type];
    onChange({ ...config, property_types: updated });
  };

  return (
    <div className="space-y-4">
      {/* Property Types */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">
          Accepted Property Types
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["residential", "commercial", "land", "multi_unit"].map((type) => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={propertyTypes.includes(type)}
                onChange={() => togglePropertyType(type)}
                disabled={disabled}
                className="w-4 h-4 border border-gray-300 dark:border-slate-600 rounded"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-slate-100 capitalize">
                {type.replace("_", " ")}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* LTV Percentage */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          LTV Percentage (%)
        </label>
        <input
          type="number"
          min="10"
          max="80"
          placeholder="60"
          value={config.ltv_percentage || ""}
          onChange={(e) =>
            onChange({ ...config, ltv_percentage: parseInt(e.target.value) })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          required
          disabled={disabled}
        />
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
          Loan amount = Property value × LTV%
        </p>
      </div>

      {/* Min Property Value */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Minimum Property Value (₹)
        </label>
        <input
          type="number"
          placeholder="1000000"
          value={config.min_property_value || ""}
          onChange={(e) =>
            onChange({
              ...config,
              min_property_value: parseInt(e.target.value),
            })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          required
          disabled={disabled}
        />
      </div>

      {/* Max Property Value (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Maximum Property Value (₹) (Optional)
        </label>
        <input
          type="number"
          placeholder="Leave empty for no limit"
          value={config.max_property_value || ""}
          onChange={(e) =>
            onChange({
              ...config,
              max_property_value: e.target.value
                ? parseInt(e.target.value)
                : undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          disabled={disabled}
        />
      </div>

      {/* Legal Verification */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.require_legal_verification !== false}
          onChange={(e) =>
            onChange({
              ...config,
              require_legal_verification: e.target.checked,
            })
          }
          disabled={disabled}
          className="w-4 h-4 border border-gray-300 dark:border-slate-600 rounded"
        />
        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
          Require Legal Verification
        </span>
      </label>

      {/* Property Appraisal */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.require_property_appraisal !== false}
          onChange={(e) =>
            onChange({
              ...config,
              require_property_appraisal: e.target.checked,
            })
          }
          disabled={disabled}
          className="w-4 h-4 border border-gray-300 dark:border-slate-600 rounded"
        />
        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
          Require Property Appraisal
        </span>
      </label>

      {/* Insurance */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.require_insurance !== false}
          onChange={(e) =>
            onChange({ ...config, require_insurance: e.target.checked })
          }
          disabled={disabled}
          className="w-4 h-4 border border-gray-300 dark:border-slate-600 rounded"
        />
        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
          Require Property Insurance
        </span>
      </label>
    </div>
  );
}
