/**
 * Shared field-level validation utility for loan application form steps.
 *
 * Usage:
 *   import { validateField, useFormErrors, FieldError } from "@/lib/utils/field-validator";
 *
 * - validateField(schema, value) → string | null
 * - useFormErrors() → { errors, validateWith }
 * - <FieldError message={errors.ifsc} /> — renders below a field
 */

import { useState } from "react";
import type { ZodTypeAny } from "zod";

/**
 * Validate a single value against a Zod schema.
 * Returns the first human-readable error message, or null if valid.
 */
export function validateField(schema: ZodTypeAny, value: unknown): string | null {
  const result = schema.safeParse(value);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "Invalid value";
}

/**
 * React hook: manages a flat map of { fieldName -> errorMessage }.
 * Designed for onBlur validation — call validateWith() in the onBlur handler.
 *
 * Example:
 *   const { errors, validateWith } = useFormErrors();
 *   <input onBlur={() => validateWith("ifsc", BankAccountSchema.shape.ifsc, value)} />
 *   <FieldError message={errors.ifsc} />
 */
export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setError = (field: string, message: string | null) => {
    setErrors((prev) => ({ ...prev, [field]: message ?? "" }));
  };

  const validateWith = (field: string, schema: ZodTypeAny, value: unknown) => {
    setError(field, validateField(schema, value));
  };

  return { errors, setError, validateWith };
}

/**
 * Inline error message rendered directly below a form field.
 * Renders nothing when the message is empty or undefined.
 */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1 leading-tight">
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}
