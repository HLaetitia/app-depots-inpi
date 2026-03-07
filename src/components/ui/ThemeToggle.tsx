"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg
        bg-uf-card dark:bg-uf-card-dark
        border border-uf-border dark:border-uf-border-dark
        hover:bg-uf-button-hover hover:text-white
        transition-all duration-200 cursor-pointer"
      aria-label="Basculer le thème"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-uf-title-dark" />
      ) : (
        <Moon className="w-4 h-4 text-uf-title" />
      )}
    </button>
  );
}
