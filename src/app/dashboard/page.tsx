"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Plus,
  Eye,
  Upload,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getFormalites, deleteFormalite } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { TYPE_FORMALITE_LABELS } from "@/types";
import type { Formalite } from "@/types";

export default function DashboardPage() {
  const [formalites, setFormalites] = useState<Formalite[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Formalite | null>(null);

  useEffect(() => {
    const load = () =>
      setFormalites(
        getFormalites().sort((a, b) =>
          b.dateCreation.localeCompare(a.dateCreation)
        )
      );
    load();
    window.addEventListener("focus", load);
    window.addEventListener("store-updated", load);
    return () => {
      window.removeEventListener("focus", load);
      window.removeEventListener("store-updated", load);
    };
  }, []);

  // Stats dynamiques
  const stats = [
    {
      label: "Brouillons",
      value: formalites.filter((f) => f.statut === "brouillon").length,
      icon: Clock,
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-50 dark:bg-gray-800",
    },
    {
      label: "En traitement INPI",
      value: formalites.filter((f) => f.statut === "en-traitement").length,
      icon: Send,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Validées",
      value: formalites.filter((f) => f.statut === "valide").length,
      icon: CheckCircle2,
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950",
    },
    {
      label: "Rejetées",
      value: formalites.filter((f) => f.statut === "rejete").length,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-950",
    },
  ];

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteFormalite(deleteTarget.id);
    setFormalites((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Title + Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uf-title dark:text-uf-title-dark">
            Tableau de bord
          </h1>
          <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
            Vue d&apos;ensemble de vos formalités
          </p>
        </div>
        <Link href="/dashboard/formalites/nouvelle">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle formalité
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-uf-text dark:text-uf-text-dark">
                  {stat.value}
                </p>
                <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark">
                  {stat.label}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-uf-border dark:border-uf-border-dark flex items-center justify-between">
          <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark">
            Formalités récentes
          </h2>
          <Link href="/dashboard/formalites">
            <Button variant="ghost" size="sm">
              Voir tout
            </Button>
          </Link>
        </div>

        {formalites.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-uf-text-muted dark:text-uf-text-muted-dark mb-3" />
            <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
              Aucune formalité enregistrée
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-uf-border dark:border-uf-border-dark bg-gray-50/50 dark:bg-gray-800/30">
                  <th className="text-left px-4 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                    Réf. Interne
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                    Nom du cabinet
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                    Entreprise
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                    Statut
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                    Réf. INPI
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-uf-border dark:divide-uf-border-dark">
                {formalites.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-uf-text dark:text-uf-text-dark whitespace-nowrap">
                      {f.reference}
                    </td>
                    <td className="px-4 py-3 text-uf-text dark:text-uf-text-dark whitespace-nowrap">
                      {f.cabinet}
                    </td>
                    <td className="px-4 py-3 text-uf-text dark:text-uf-text-dark whitespace-nowrap">
                      {f.entrepriseDenomination}
                    </td>
                    <td className="px-4 py-3 text-uf-text-muted dark:text-uf-text-muted-dark whitespace-nowrap">
                      {TYPE_FORMALITE_LABELS[f.type]}
                    </td>
                    <td className="px-4 py-3 text-uf-text-muted dark:text-uf-text-muted-dark whitespace-nowrap">
                      {formatDate(f.dateCreation)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge statut={f.statut} />
                    </td>
                    <td className="px-4 py-3 text-uf-text-muted dark:text-uf-text-muted-dark whitespace-nowrap">
                      {f.refINPI || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {f.statut === "brouillon" ? (
                          <Button size="sm">
                            <Upload className="w-3.5 h-3.5 mr-1.5" />
                            Soumettre
                          </Button>
                        ) : (
                          <Link href={`/dashboard/formalites/${f.id}`}>
                            <Button variant="secondary" size="sm">
                              <Eye className="w-3.5 h-3.5 mr-1.5" />
                              Consulter
                            </Button>
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(f)}
                          className="p-2 rounded-lg text-uf-text-muted dark:text-uf-text-muted-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                          title="Supprimer la formalité"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modale Suppression */}
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
            <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-uf-border dark:border-uf-border-dark space-y-1">
              <p className="font-medium text-uf-text dark:text-uf-text-dark">
                {deleteTarget.reference} — {deleteTarget.entrepriseDenomination}
              </p>
              <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                {TYPE_FORMALITE_LABELS[deleteTarget.type]} · Cabinet : {deleteTarget.cabinet}
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
