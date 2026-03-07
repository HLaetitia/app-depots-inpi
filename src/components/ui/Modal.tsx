"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 bg-uf-card dark:bg-uf-card-dark rounded-xl shadow-xl border border-uf-border dark:border-uf-border-dark">
        <div className="flex items-center justify-between p-4 border-b border-uf-border dark:border-uf-border-dark">
          <h3 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark">
            {title}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4">{children}</div>
        {actions && (
          <div className="flex justify-end gap-2 p-4 border-t border-uf-border dark:border-uf-border-dark">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
