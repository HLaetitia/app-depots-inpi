"use client";

import { useState, useEffect } from "react";
import { LogOut, User as UserIcon, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useRouter } from "next/navigation";
import type { User } from "@/types";

export function Header() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("uf-user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("uf-user");
    router.push("/login");
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <header className="h-16 bg-uf-card dark:bg-uf-card-dark border-b border-uf-border dark:border-uf-border-dark flex items-center justify-between px-6">
      <div />

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-uf-text dark:text-uf-text-dark">
          {isAdmin ? (
            <ShieldCheck className="w-4 h-4 text-uf-button-hover" />
          ) : (
            <UserIcon className="w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark" />
          )}
          <span className="hidden sm:inline">
            {currentUser
              ? `${currentUser.prenom} ${currentUser.nom}`
              : "Utilisateur"}
          </span>
          {currentUser && (
            <span
              className={`hidden md:inline-flex text-xs px-1.5 py-0.5 rounded-full font-medium ${
                isAdmin
                  ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              }`}
            >
              {isAdmin ? "Admin" : "Formaliste"}
            </span>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-uf-text-muted dark:text-uf-text-muted-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
