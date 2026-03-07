"use client";

import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Plus,
  Eye,
  Upload,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { mockFormalites } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { TYPE_FORMALITE_LABELS } from "@/types";

const stats = [
  {
    label: "Brouillons",
    value: mockFormalites.filter((f) => f.statut === "brouillon").length,
    icon: Clock,
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-800",
  },
  {
    label: "En traitement INPI",
    value: mockFormalites.filter((f) => f.statut === "en-traitement").length,
    icon: Send,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
  },
  {
    label: "Validées",
    value: mockFormalites.filter((f) => f.statut === "valide").length,
    icon: CheckCircle2,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-50 dark:bg-green-950",
  },
  {
    label: "Rejetées",
    value: mockFormalites.filter((f) => f.statut === "rejete").length,
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950",
  },
];

export default function DashboardPage() {
  const formalites = [...mockFormalites].sort((a, b) =>
    b.dateCreation.localeCompare(a.dateCreation)
  );

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
                    {f.statut === "brouillon" ? (
                      <Button size="sm">
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Soumettre INPI
                      </Button>
                    ) : (
                      <Link href={`/dashboard/formalites/${f.id}`}>
                        <Button variant="secondary" size="sm">
                          <Eye className="w-3.5 h-3.5 mr-1.5" />
                          Consulter
                        </Button>
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
