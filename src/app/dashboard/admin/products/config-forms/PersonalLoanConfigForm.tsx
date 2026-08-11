import { PersonalLoanConfig } from "@/lib/schemas/products";

interface PersonalLoanConfigFormProps {
  config: any;
  onChange: (config: PersonalLoanConfig) => void;
  disabled?: boolean;
}

export default function PersonalLoanConfigForm({
  config,
  onChange,
  disabled,
}: PersonalLoanConfigFormProps) {
  const bureauChecks = config.bureau_checks_required || ["cibil"];

  const toggleBureauCheck = (check: string) => {
    const updated = bureauChecks.includes(check)
      ? bureauChecks.filter((b: string) => b !== check)
      : [...bureauChecks, check];
    onChange({ ...config, bureau_checks_required: updated });
  };

  return (
    <div className="space-y-4">
      {/* Credit Score Min */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Minimum Credit Score (CIBIL)
        </label>
        <input
          type="number"
          min="300"
          max="900"
          placeholder="600"
          value={config.credit_score_min || ""}
          onChange={(e) =>
            onChange({ ...config, credit_score_min: parseInt(e.target.value) })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          required
          disabled={disabled}
        />
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
          Minimum CIBIL score to qualify for this product
        </p>
      </div>

      {/* Max Leverage Ratio */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Maximum Leverage Ratio
        </label>
        <input
          type="number"
          step="0.5"
          min="1"
          max="20"
          placeholder="10"
          value={config.max_leverage_ratio || ""}
          onChange={(e) =>
            onChange({
              ...config,
              max_leverage_ratio: parseFloat(e.target.value),
            })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          required
          disabled={disabled}
        />
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
          Maximum loan amount as multiple of annual income (e.g., 10x salary)
        </p>
      </div>

      {/* Quick Approval Below (optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-1">
          Quick Approval Below Amount (₹) (Optional)
        </label>
        <input
          type="number"
          placeholder="500000"
          value={config.quick_approval_below || ""}
          onChange={(e) =>
            onChange({
              ...config,
              quick_approval_below: e.target.value
                ? parseInt(e.target.value)
                : undefined,
            })
          }
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
          disabled={disabled}
        />
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">
          Auto-approve loans below this amount without manual review
        </p>
      </div>

      {/* Income Proof */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.require_income_proof !== false}
          onChange={(e) =>
            onChange({ ...config, require_income_proof: e.target.checked })
          }
          disabled={disabled}
          className="w-4 h-4 border border-gray-300 dark:border-slate-600 rounded"
        />
        <span className="text-sm font-medium text-gray-900 dark:text-slate-100">
          Require Income Proof
        </span>
      </label>
      <p className="text-xs text-gray-600 dark:text-slate-400">
        Require recent payslips or income documents
      </p>

      {/* Bureau Checks */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-slate-100 mb-2">
          Bureau Checks Required
        </label>
        <div className="space-y-2">
          {["cibil", "experian", "equifax"].map((check) => (
            <label key={check} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={bureauChecks.includes(check)}
                onChange={() => toggleBureauCheck(check)}
                disabled={disabled}
                className="w-4 h-4 border border-gray-300 dark:border-slate-600 rounded"
              />
              <span className="text-sm font-medium text-gray-900 dark:text-slate-100 capitalize">
                {check}
              </span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-600 dark:text-slate-400 mt-2">
          Select at least one bureau for credit checks
        </p>
      </div>
    </div>
  );
}
