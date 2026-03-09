"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Calendar,
  Banknote,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getEntreprises, getFormalites } from "@/lib/store";
import { formatDate, formatCurrency } from "@/lib/utils";
import { TYPE_FORMALITE_LABELS } from "@/types";
import type { Entreprise, Formalite } from "@/types";

export default function EntrepriseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [formalites, setFormalites] = useState<Formalite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      const ent = getEntreprises().find((e) => e.id === id) ?? null;
      setEntreprise(ent);
      if (ent) {
        setFormalites(getFormalites().filter((f) => f.entrepriseId === ent.id));
      }
      setLoading(false);
    };
    load();
    window.addEventListener("focus", load);
    window.addEventListener("store-updated", load);
    return () => {
      window.removeEventListener("focus", load);
      window.removeEventListener("store-updated", load);
    };
  }, [id]);

  if (loading) return null;

  if (!entreprise) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Building2 className="w-16 h-16 text-uf-text-muted dark:text-uf-text-muted-dark mb-4" />
        <h2 className="text-xl font-semibold text-uf-text dark:text-uf-text-dark mb-2">
          Entreprise introuvable
        </h2>
        <Link href="/dashboard/entreprises">
          <Button variant="secondary">Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/entreprises">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-uf-title dark:text-uf-title-dark">
            {entreprise.denomination}
          </h1>
          <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
            SIREN : {entreprise.siren} · {entreprise.formeJuridique}
          </p>
        </div>
      </div>

      {/* Info */}
      <Card>
        <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark mb-4">
          Informations
        </h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5" />
            <div>
              <dt className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                Siège social
              </dt>
              <dd className="text-sm text-uf-text dark:text-uf-text-dark">
                {entreprise.siegeSocial}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5" />
            <div>
              <dt className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                Dirigeant
              </dt>
              <dd className="text-sm text-uf-text dark:text-uf-text-dark">
                {entreprise.dirigeant}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Banknote className="w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5" />
            <div>
              <dt className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                Capital social
              </dt>
              <dd className="text-sm text-uf-text dark:text-uf-text-dark">
                {formatCurrency(entreprise.capital)}
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5" />
            <div>
              <dt className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                Date de création
              </dt>
              <dd className="text-sm text-uf-text dark:text-uf-text-dark">
                {formatDate(entreprise.dateCreation)}
              </dd>
            </div>
          </div>
        </dl>
      </Card>

      {/* Formalités */}
      <Card padding={false}>
        <div className="px-6 py-4 border-b border-uf-border dark:border-uf-border-dark">
          <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark">
            Formalités ({formalites.length})
          </h2>
        </div>
        {formalites.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark">
              Aucune formalité pour cette entreprise
            </p>
          </div>
        ) : (
          <div className="divide-y divide-uf-border dark:divide-uf-border-dark">
            {formalites.map((f) => (
              <Link
                key={f.id}
                href={`/dashboard/formalites/${f.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-uf-title dark:text-uf-title-dark" />
                  <div>
                    <p className="text-sm font-medium text-uf-text dark:text-uf-text-dark">
                      {f.reference} — {TYPE_FORMALITE_LABELS[f.type]}
                    </p>
                    <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                      {f.description} · {formatDate(f.dateCreation)}
                    </p>
                  </div>
                </div>
                <Badge statut={f.statut} />
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
