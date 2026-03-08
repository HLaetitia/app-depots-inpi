"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, FileText, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { getFormalites, deleteFormalite as deleteFormaliteStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import {
  TYPE_FORMALITE_LABELS,
  STATUT_FORMALITE_LABELS,
  type Formalite,
  type TypeFormalite,
  type StatutFormalite,
} from "@/types";

export default function FormalitesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statutFilter, setStatutFilter] = useState("");
  const [formalites, setFormalites] = useState<Formalite[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Formalite | null>(null);

  useEffect(() => {
    setFormalites(getFormalites());
  }, []);

  const filtered = formalites.filter((f) => {
    const matchSearch =
      !search ||
      f.reference.toLowerCase().includes(search.toLowerCase()) ||
      f.entrepriseDenomination.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase());
    const matchType = !typeFilter || f.type === typeFilter;
    const matchStatut = !statutFilter || f.statut === statutFilter;
    return matchSearch && matchType && matchStatut;
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteFormaliteStore(deleteTarget.id);
    setFormalites((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const typeOptions = [
    { value: "", label: "Tous les types" },
    ...Object.entries(TYPE_FORMALITE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  const statutOptions = [
    { value: "", label: "Tous les statuts" },
    ...Object.entries(STATUT_FORMALITE_LABELS).map(([value, label]) => ({
      value,
      label,
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uf-title dark:text-uf-title-dark">
            Formalités
          </h1>
          <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
            {formalites.length} formalité(s) au total
          </p>
        </div>
        <Link href="/dashboard/formalites/nouvelle">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle formalité
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark" />
            <input
              type="text"
              placeholder="Rechercher par référence, entreprise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-lg border bg-uf-input-bg dark:bg-uf-input-bg-dark text-uf-text dark:text-uf-text-dark border-uf-border dark:border-uf-border-dark focus:outline-none focus:ring-2 focus:ring-uf-button-hover focus:border-transparent placeholder:text-uf-text-muted dark:placeholder:text-uf-text-muted-dark text-sm"
            />
          </div>
          <Select
            options={typeOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFormalite | "")}
          />
          <Select
            options={statutOptions}
            value={statutFilter}
            onChange={(e) =>
              setStatutFilter(e.target.value as StatutFormalite | "")
            }
          />
        </div>
      </Card>

      {/* List */}
      <Card padding={false}>
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-uf-text-muted dark:text-uf-text-muted-dark mb-3" />
            <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
              Aucune formalité trouvée
            </p>
          </div>
        ) : (
          <div className="divide-y divide-uf-border dark:divide-uf-border-dark">
            {filtered.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <Link
                  href={`/dashboard/formalites/${f.id}`}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
                    <FileText className="w-5 h-5 text-uf-title dark:text-uf-title-dark" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-uf-text dark:text-uf-text-dark">
                        {f.reference}
                      </p>
                      <span className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                        {TYPE_FORMALITE_LABELS[f.type]}
                      </span>
                    </div>
                    <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark truncate">
                      {f.entrepriseDenomination} — {f.description}
                    </p>
                    <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5">
                      {f.formaliste} · {formatDate(f.dateCreation)}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <Badge statut={f.statut} />
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(f)}
                    className="p-2 rounded-lg text-uf-text-muted dark:text-uf-text-muted-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Supprimer la formalité"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer la formalité"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
            >
              Supprimer
            </button>
          </>
        }
      >
        {deleteTarget && (
          <div className="space-y-3">
            <p className="text-sm text-uf-text dark:text-uf-text-dark">
              Êtes-vous sûr de vouloir supprimer cette formalité ?
            </p>
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-uf-border dark:border-uf-border-dark">
              <p className="font-medium text-uf-text dark:text-uf-text-dark">
                {deleteTarget.reference}
              </p>
              <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark">
                {deleteTarget.entrepriseDenomination} —{" "}
                {deleteTarget.description}
              </p>
            </div>
            <p className="text-xs text-red-500">
              Cette action est irréversible.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
