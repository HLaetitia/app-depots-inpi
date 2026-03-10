export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

import type { TypeDocument } from "@/types";

export function detectTypeDocument(filename: string): TypeDocument {
  const lower = filename.toLowerCase();
  if (lower.includes("kbis") || lower.includes("k-bis")) return "kbis";
  if (lower.includes("statut")) return "statuts";
  if (lower.includes("mandat") || lower.includes("pouvoir")) return "mandat";
  return "autre";
}
