"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Building2,
  Settings,
  Users,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

const baseNavigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Formalités", href: "/dashboard/formalites", icon: FileText },
  { name: "Entreprises", href: "/dashboard/entreprises", icon: Building2 },
  { name: "Cabinets", href: "/dashboard/cabinets", icon: Briefcase },
];

const adminNavigation = [
  { name: "Profils", href: "/dashboard/profils", icon: Users },
];

const bottomNavigation = [
  { name: "Paramètres", href: "/dashboard/parametres", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
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

  const isAdmin = currentUser?.role === "admin";

  const navigation = [
    ...baseNavigation,
    ...(isAdmin ? adminNavigation : []),
    ...bottomNavigation,
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-uf-sidebar dark:bg-uf-sidebar-dark border-r border-uf-border dark:border-uf-border-dark flex flex-col z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-uf-border dark:border-uf-border-dark">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-uf-button-hover flex items-center justify-center">
            <span className="text-white font-bold text-sm">UF</span>
          </div>
          <div>
            <h1 className="text-sm font-bold text-uf-title dark:text-uf-title-dark leading-tight">
              Urgences
            </h1>
            <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark leading-tight">
              Formalités
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-uf-button-hover text-white"
                  : "text-uf-text-muted dark:text-uf-text-muted-dark hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-uf-text dark:hover:text-uf-text-dark"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-uf-border dark:border-uf-border-dark">
        <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark text-center">
          Dépôts INPI v0.1
        </p>
      </div>
    </aside>
  );
}
