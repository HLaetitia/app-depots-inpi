"use client";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-uf-text dark:text-uf-text-dark"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-3 py-2 rounded-lg border transition-colors duration-200",
          "bg-uf-input-bg dark:bg-uf-input-bg-dark",
          "text-uf-text dark:text-uf-text-dark",
          "border-uf-border dark:border-uf-border-dark",
          "focus:outline-none focus:ring-2 focus:ring-uf-button-hover focus:border-transparent",
          "placeholder:text-uf-text-muted dark:placeholder:text-uf-text-muted-dark",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
