"use client";

import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        variant === "primary" &&
          "bg-uf-button text-uf-button-text hover:bg-uf-button-hover active:bg-uf-button-hover",
        variant === "secondary" &&
          "bg-uf-card dark:bg-uf-card-dark text-uf-text dark:text-uf-text-dark border border-uf-border dark:border-uf-border-dark hover:bg-gray-50 dark:hover:bg-gray-700",
        variant === "danger" &&
          "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
        variant === "ghost" &&
          "text-uf-text dark:text-uf-text-dark hover:bg-gray-100 dark:hover:bg-gray-800",
        props.disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
