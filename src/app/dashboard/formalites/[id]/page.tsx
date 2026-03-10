"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Building2,
  Calendar,
  User,
  Send,
  AlertCircle,
  Briefcase,
  Hash,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Download,
  ExternalLink,
  Paperclip,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getFormalites, getEntreprises } from "@/lib/store";
import { formatDate, formatFileSize } from "@/lib/utils";
import { TYPE_FORMALITE_LABELS, TYPE_DOCUMENT_LABELS } from "@/types";
import type { Formalite, Entreprise } from "@/types";
import { INPI_STATUT_LABELS, type InpiStatutFormalite } from "@/types/inpi";

export default function FormaliteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [formalite, setFormalite] = useState<Formalite | null>(null);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  useEffect(() => {
    const load = () => {
      const f = getFormalites().find((f) => f.id === id) ?? null;
      setFormalite(f);
      if (f) {
        setEntreprise(getEntreprises().find((e) => e.id === f.entrepriseId) ?? null);
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

  if (!formalite) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="w-16 h-16 text-uf-text-muted dark:text-uf-text-muted-dark mb-4" />
        <h2 className="text-xl font-semibold text-uf-text dark:text-uf-text-dark mb-2">
          Formalité introuvable
        </h2>
        <Link href="/dashboard/formalites">
          <Button variant="secondary">Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  // Simuler un statut INPI détaillé pour les formalités non-brouillon
  const inpiStatut: InpiStatutFormalite | null =
    formalite.statut === "en-traitement"
      ? "VALIDATION_PENDING"
      : formalite.statut === "valide"
        ? "VALIDATED"
        : formalite.statut === "rejete"
          ? "REJECTED"
          : null;

  const timeline = [
    {
      label: "Création",
      date: formalite.dateCreation,
      done: true,
      icon: FileText,
    },
    {
      label: "Soumission INPI",
      date: formalite.dateSoumission,
      done: !!formalite.dateSoumission,
      icon: Send,
    },
    {
      label: "Signature",
      date: formalite.dateSoumission,
      done: !!formalite.dateSoumission,
      icon: CheckCircle2,
    },
    {
      label: "Paiement",
      date: formalite.dateSoumission,
      done:
        formalite.statut === "en-traitement" || formalite.statut === "valide",
      icon: Clock,
    },
    {
      label: "Validation",
      date: formalite.dateValidation,
      done: !!formalite.dateValidation,
      icon: formalite.statut === "rejete" ? XCircle : CheckCircle2,
    },
  ];

  const handleSubmitINPI = async () => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/formalites">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-uf-title dark:text-uf-title-dark">
                {formalite.reference}
              </h1>
              <Badge statut={formalite.statut} />
            </div>
            <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
              {TYPE_FORMALITE_LABELS[formalite.type]}
            </p>
          </div>
        </div>

        {formalite.statut === "brouillon" && (
          <Button onClick={handleSubmitINPI} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? "Soumission..." : "Soumettre à l'INPI"}
          </Button>
        )}
      </div>

      {/* Notification de succès/erreur */}
      {submitStatus === "success" && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              Formalité soumise avec succès (simulation)
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              En production, la formalité sera envoyée au Guichet Unique INPI
              pour traitement.
            </p>
          </div>
        </div>
      )}
      {submitStatus === "error" && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Erreur lors de la soumission
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              Vérifiez votre connexion et vos paramètres API INPI.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark mb-4">
              Détails de la formalité
            </h2>
            <dl className="space-y-3">
              <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5" />
                <div>
                  <dt className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                    Description
                  </dt>
                  <dd className="text-sm text-uf-text dark:text-uf-text-dark">
                    {formalite.description}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Briefcase className="w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5" />
                <div>
                  <dt className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                    Cabinet
                  </dt>
                  <dd className="text-sm text-uf-text dark:text-uf-text-dark">
                    {formalite.cabinet}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5" />
                <div>
                  <dt className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                    Entreprise
                  </dt>
                  <dd className="text-sm text-uf-text dark:text-uf-text-dark">
                    {entreprise ? (
                      <Link
                        href={`/dashboard/entreprises/${entreprise.id}`}
                        className="text-uf-button-hover hover:underline"
                      >
                        {entreprise.denomination}
                      </Link>
                    ) : (
                      formalite.entrepriseDenomination
                    )}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5" />
                <div>
                  <dt className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                    Formaliste
                  </dt>
                  <dd className="text-sm text-uf-text dark:text-uf-text-dark">
                    {formalite.formaliste}
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
                    {formatDate(formalite.dateCreation)}
                  </dd>
                </div>
              </div>
              {formalite.refINPI && (
                <div className="flex items-start gap-3">
                  <Hash className="w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5" />
                  <div>
                    <dt className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                      Réf. INPI
                    </dt>
                    <dd className="text-sm font-medium text-uf-title dark:text-uf-title-dark">
                      {formalite.refINPI}
                    </dd>
                  </div>
                </div>
              )}
            </dl>
          </Card>

          {/* Statut INPI détaillé */}
          {inpiStatut && (
            <Card>
              <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark mb-4">
                Statut INPI détaillé
              </h2>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    inpiStatut === "VALIDATED"
                      ? "bg-green-500"
                      : inpiStatut === "REJECTED"
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                />
                <span className="text-sm font-medium text-uf-text dark:text-uf-text-dark">
                  {INPI_STATUT_LABELS[inpiStatut]}
                </span>
              </div>
              <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                {inpiStatut === "VALIDATION_PENDING" &&
                  "La formalité est en cours de traitement par les partenaires valideurs du Guichet Unique."}
                {inpiStatut === "VALIDATED" &&
                  "La formalité a été validée par l'ensemble des partenaires. Le numéro national a été attribué."}
                {inpiStatut === "REJECTED" &&
                  "La formalité a été rejetée par le valideur. Veuillez corriger les erreurs et resoumettre."}
              </p>

              {/* Actions selon le statut */}
              <div className="mt-4 flex gap-2">
                {formalite.refINPI && (
                  <Button variant="secondary" size="sm">
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Synthèse PDF
                  </Button>
                )}
                <Button variant="secondary" size="sm">
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  Voir sur le Guichet Unique
                </Button>
              </div>
            </Card>
          )}

          {/* Documents justificatifs */}
          <Card>
            <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark mb-4 flex items-center gap-2">
              <Paperclip className="w-5 h-5" />
              Documents justificatifs
              {(formalite.documents?.length ?? 0) > 0 && (
                <span className="text-sm font-normal text-uf-text-muted dark:text-uf-text-muted-dark">
                  ({formalite.documents!.length})
                </span>
              )}
            </h2>

            {!formalite.documents || formalite.documents.length === 0 ? (
              <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark italic">
                Aucun document associé à cette formalité
              </p>
            ) : (
              <div className="space-y-2">
                {formalite.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-uf-border dark:border-uf-border-dark"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-uf-button-hover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-uf-text dark:text-uf-text-dark truncate">
                          {doc.nom}
                        </p>
                        <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                          {TYPE_DOCUMENT_LABELS[doc.typeDocument]} · {formatFileSize(doc.taille)} · Ajouté le {formatDate(doc.dateAjout)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Observations */}
          {formalite.observations && (
            <Card>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-600 dark:text-red-400 mb-1">
                    Observations / Demande de régularisation
                  </h3>
                  <p className="text-sm text-uf-text dark:text-uf-text-dark">
                    {formalite.observations}
                  </p>
                  {formalite.statut === "rejete" && (
                    <Button size="sm" className="mt-3">
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      Régulariser la formalité
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Timeline */}
        <div>
          <Card>
            <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark mb-4">
              Suivi du dépôt
            </h2>
            <div className="space-y-4">
              {timeline.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        step.done
                          ? step.label === "Validation" &&
                            formalite.statut === "rejete"
                            ? "bg-red-500"
                            : "bg-uf-button-hover"
                          : "bg-uf-border dark:bg-uf-border-dark"
                      }`}
                    />
                    {i < timeline.length - 1 && (
                      <div
                        className={`w-0.5 flex-1 mt-1 ${
                          step.done
                            ? "bg-uf-button-hover"
                            : "bg-uf-border dark:bg-uf-border-dark"
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-4">
                    <p
                      className={`text-sm font-medium ${
                        step.done
                          ? step.label === "Validation" &&
                            formalite.statut === "rejete"
                            ? "text-red-600 dark:text-red-400"
                            : "text-uf-text dark:text-uf-text-dark"
                          : "text-uf-text-muted dark:text-uf-text-muted-dark"
                      }`}
                    >
                      {step.label}
                      {step.label === "Validation" &&
                        formalite.statut === "rejete" &&
                        " (rejetée)"}
                    </p>
                    {step.date && (
                      <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                        {formatDate(step.date)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
