import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export function Card({ children, className, padding = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-uf-card dark:bg-uf-card-dark rounded-xl border border-uf-border dark:border-uf-border-dark shadow-sm",
        padding && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
