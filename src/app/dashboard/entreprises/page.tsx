"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Search, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { mockEntreprises, mockFormalites } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { Entreprise } from "@/types";

export default function EntreprisesPage() {
  const [search, setSearch] = useState("");
  const [entreprises, setEntreprises] = useState<Entreprise[]>(mockEntreprises);
  const [deleteTarget, setDeleteTarget] = useState<Entreprise | null>(null);

  const filtered = entreprises.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.denomination.toLowerCase().includes(q) ||
      e.siren.includes(q) ||
      e.dirigeant.toLowerCase().includes(q)
    );
  });

  const handleDelete = () => {
    if (!deleteTarget) return;
    setEntreprises((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-uf-title dark:text-uf-title-dark">
          Entreprises
        </h1>
        <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
          {entreprises.length} entreprise(s) cliente(s)
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark" />
        <input
          type="text"
          placeholder="Rechercher par dénomination, SIREN, dirigeant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-uf-border dark:border-uf-border-dark bg-white dark:bg-gray-800 text-sm text-uf-text dark:text-uf-text-dark placeholder-uf-text-muted dark:placeholder-uf-text-muted-dark focus:outline-none focus:ring-2 focus:ring-uf-button/30 focus:border-uf-button"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-uf-text-muted hover:text-uf-text dark:hover:text-uf-text-dark cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-uf-text-muted dark:text-uf-text-muted-dark mb-3" />
            <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
              {search
                ? "Aucune entreprise ne correspond à votre recherche"
                : "Aucune entreprise enregistrée"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entreprise) => {
            const formaliteCount = mockFormalites.filter(
              (f) => f.entrepriseId === entreprise.id
            ).length;

            return (
              <Card
                key={entreprise.id}
                className="hover:shadow-md transition-shadow h-full relative group"
              >
                {/* Bouton supprimer */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTarget(entreprise);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-uf-text-muted dark:text-uf-text-muted-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                  title="Supprimer l'entreprise"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link href={`/dashboard/entreprises/${entreprise.id}`}>
                  <div className="cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
                        <Building2 className="w-5 h-5 text-uf-title dark:text-uf-title-dark" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-uf-text dark:text-uf-text-dark text-sm truncate">
                          {entreprise.denomination}
                        </h3>
                        <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5">
                          SIREN : {entreprise.siren}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-uf-border dark:border-uf-border-dark grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
                          Forme
                        </p>
                        <p className="font-medium text-uf-text dark:text-uf-text-dark">
                          {entreprise.formeJuridique}
                        </p>
                      </div>
                      <div>
                        <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
                          Capital
                        </p>
                        <p className="font-medium text-uf-text dark:text-uf-text-dark">
                          {formatCurrency(entreprise.capital)}
                        </p>
                      </div>
                      <div>
                        <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
                          Dirigeant
                        </p>
                        <p className="font-medium text-uf-text dark:text-uf-text-dark">
                          {entreprise.dirigeant}
                        </p>
                      </div>
                      <div>
                        <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
                          Formalités
                        </p>
                        <p className="font-medium text-uf-text dark:text-uf-text-dark">
                          {formaliteCount}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modale Suppression */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer l'entreprise"
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
              Êtes-vous sûr de vouloir supprimer cette entreprise ?
            </p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-uf-border dark:border-uf-border-dark">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 shrink-0">
                <Building2 className="w-5 h-5 text-uf-title dark:text-uf-title-dark" />
              </div>
              <div>
                <p className="font-medium text-uf-text dark:text-uf-text-dark">
                  {deleteTarget.denomination}
                </p>
                <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                  SIREN : {deleteTarget.siren} · {deleteTarget.formeJuridique} · Dirigeant : {deleteTarget.dirigeant}
                </p>
              </div>
            </div>
            <p className="text-xs text-red-500">
              Cette action est irréversible. Les formalités associées ne seront pas supprimées.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
