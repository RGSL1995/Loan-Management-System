"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, X, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface LoginModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function LoginModal({ isOpen = true, onClose }: LoginModalProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = await createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sign in.");
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white shadow-2xl rounded-2xl dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-slate-100">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">
            Please sign in to your account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-2.5 text-red-700 dark:text-red-300 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isLoading}
                className="relative block w-full px-3 py-2 mt-1 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 border border-gray-300 dark:border-slate-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-slate-800 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="relative block w-full px-3 py-2 pr-10 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400 border border-gray-300 dark:border-slate-700 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent bg-white dark:bg-slate-800 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-black border border-transparent rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-xs text-center text-gray-500 dark:text-slate-400">
          Finbyx LMS • Loan Management System
        </p>
      </div>
    </div>
  );
}
