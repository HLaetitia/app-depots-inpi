import { cn } from "@/lib/utils";
import type { StatutFormalite } from "@/types";
import { STATUT_FORMALITE_LABELS } from "@/types";

interface BadgeProps {
  statut: StatutFormalite;
  className?: string;
}

export function Badge({ statut, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        `badge-${statut}`,
        className
      )}
    >
      {STATUT_FORMALITE_LABELS[statut]}
    </span>
  );
}
