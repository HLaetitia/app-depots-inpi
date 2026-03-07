"use client";

import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-uf-text dark:text-uf-text-dark"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          "w-full px-3 py-2 rounded-lg border transition-colors duration-200",
          "bg-uf-input-bg dark:bg-uf-input-bg-dark",
          "text-uf-text dark:text-uf-text-dark",
          "border-uf-border dark:border-uf-border-dark",
          "focus:outline-none focus:ring-2 focus:ring-uf-button-hover focus:border-transparent",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
