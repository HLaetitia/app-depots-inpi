"use client";

import { use, useState, useEffect, useRef, useCallback } from "react";
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
  Pencil,
  Trash2,
  Upload,
  Plus,
  X,
  Eye,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DocumentViewer } from "@/components/ui/DocumentViewer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  getFormalites,
  getEntreprises,
  getCabinets,
  updateFormalite,
} from "@/lib/store";
import { formatDate, formatFileSize, detectTypeDocument } from "@/lib/utils";
import {
  TYPE_FORMALITE_LABELS,
  TYPE_DOCUMENT_LABELS,
  STATUT_FORMALITE_LABELS,
} from "@/types";
import type {
  Formalite,
  Entreprise,
  Cabinet,
  TypeFormalite,
  StatutFormalite,
  TypeDocument,
  DocumentMeta,
} from "@/types";
import { INPI_STATUT_LABELS, type InpiStatutFormalite } from "@/types/inpi";

// ─── Options pour les selects ───
const typeFormaliteOptions = [
  { value: "immatriculation", label: "Immatriculation" },
  { value: "modification", label: "Modification" },
  { value: "radiation", label: "Radiation / Dissolution" },
  { value: "cession", label: "Cession de parts" },
  { value: "depot-comptes", label: "Dépôt des comptes" },
  { value: "beneficiaires-effectifs", label: "Bénéficiaires effectifs" },
];

const statutOptions = [
  { value: "brouillon", label: "Brouillon" },
  { value: "en-traitement", label: "En traitement INPI" },
  { value: "valide", label: "Validé" },
  { value: "rejete", label: "Rejeté (À corriger)" },
];

// ─── Interface fichier uploadé ───
interface UploadedFile {
  name: string;
  size: number;
  type: string;
  typeDocument: TypeDocument;
  dataUrl?: string;
}

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

  // ─── Modale d'édition ───
  const [showEditModal, setShowEditModal] = useState(false);
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [editForm, setEditForm] = useState({
    description: "",
    type: "",
    cabinet: "",
    formaliste: "",
    statut: "",
    observations: "",
  });

  // ─── Upload de documents ───
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Suppression de document ───
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  // ─── Visionneuse de document ───
  const [viewerDoc, setViewerDoc] = useState<DocumentMeta | null>(null);

  useEffect(() => {
    const load = () => {
      const f = getFormalites().find((f) => f.id === id) ?? null;
      setFormalite(f);
      if (f) {
        setEntreprise(
          getEntreprises().find((e) => e.id === f.entrepriseId) ?? null
        );
      }
      setCabinets(getCabinets());
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

  // ─── Ouvrir la modale d'édition ───
  const openEditModal = () => {
    if (!formalite) return;
    setEditForm({
      description: formalite.description,
      type: formalite.type,
      cabinet: formalite.cabinet,
      formaliste: formalite.formaliste,
      statut: formalite.statut,
      observations: formalite.observations || "",
    });
    setShowEditModal(true);
  };

  // ─── Sauvegarder les modifications ───
  const handleSaveEdit = () => {
    if (!formalite) return;
    const updates: Partial<Formalite> = {
      description: editForm.description.trim(),
      type: editForm.type as TypeFormalite,
      cabinet: editForm.cabinet,
      formaliste: editForm.formaliste.trim(),
      statut: editForm.statut as StatutFormalite,
      observations: editForm.observations.trim() || undefined,
    };
    updateFormalite(formalite.id, updates);
    setShowEditModal(false);
  };

  // ─── Upload de fichiers ───
  const handleFileAdd = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const accepted = Array.from(newFiles).filter((f) =>
      ["application/pdf", "image/jpeg", "image/png"].includes(f.type)
    );
    accepted.forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        setPendingFiles((prev) => [
          ...prev,
          {
            name: f.name,
            size: f.size,
            type: f.type,
            typeDocument: detectTypeDocument(f.name),
            dataUrl: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(f);
    });
  }, []);

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileAdd(e.dataTransfer.files);
  };

  // ─── Valider l'ajout des documents ───
  const handleConfirmUpload = () => {
    if (!formalite || pendingFiles.length === 0) return;
    const now = new Date().toISOString().slice(0, 10);
    const newDocs: DocumentMeta[] = pendingFiles.map((f, i) => ({
      id: `doc-${Date.now()}-${i}`,
      nom: f.name,
      taille: f.size,
      mimeType: f.type,
      typeDocument: f.typeDocument,
      dateAjout: now,
      dataUrl: f.dataUrl,
    }));
    const existingDocs = formalite.documents ?? [];
    updateFormalite(formalite.id, {
      documents: [...existingDocs, ...newDocs],
    });
    setPendingFiles([]);
    setShowUploadZone(false);
  };

  // ─── Supprimer un document ───
  const handleDeleteDocument = () => {
    if (!formalite || !deleteDocId) return;
    const updatedDocs = (formalite.documents ?? []).filter(
      (d) => d.id !== deleteDocId
    );
    updateFormalite(formalite.id, {
      documents: updatedDocs.length > 0 ? updatedDocs : undefined,
    });
    setDeleteDocId(null);
  };

  // ─── Télécharger un document ───
  const handleDownloadDocument = (doc: DocumentMeta) => {
    if (!doc.dataUrl) return;
    const a = document.createElement("a");
    a.href = doc.dataUrl;
    a.download = doc.nom;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // ─── Sauvegarder le contenu éditeur d'un document ───
  const handleSaveDocumentContent = (contenu: string, texteDocument: string) => {
    if (!formalite || !viewerDoc) return;
    const updatedDocs = (formalite.documents ?? []).map((d) =>
      d.id === viewerDoc.id ? { ...d, contenu, texteDocument } : d
    );
    updateFormalite(formalite.id, { documents: updatedDocs });
    setViewerDoc((prev) => (prev ? { ...prev, contenu, texteDocument } : null));
  };

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
    if (!formalite) return;
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Simulation d'un appel API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const now = new Date().toISOString();
      updateFormalite(formalite.id, {
        statut: "en-traitement",
        dateSoumission: now,
      });
      setFormalite((prev) =>
        prev ? { ...prev, statut: "en-traitement", dateSoumission: now } : prev
      );
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options cabinets pour le select
  const cabinetOptions = [
    { value: "", label: "Sélectionner un cabinet" },
    ...cabinets.map((c) => ({ value: c.nom, label: c.nom })),
  ];

  // Document en cours de suppression
  const deleteDocMeta = deleteDocId
    ? formalite.documents?.find((d) => d.id === deleteDocId)
    : null;

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
          {/* Détails de la formalité */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark">
                Détails de la formalité
              </h2>
              <button
                type="button"
                onClick={openEditModal}
                className="p-2 rounded-lg text-uf-text-muted dark:text-uf-text-muted-dark hover:text-uf-button-hover hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                title="Modifier les détails"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Documents justificatifs
                {(formalite.documents?.length ?? 0) > 0 && (
                  <span className="text-sm font-normal text-uf-text-muted dark:text-uf-text-muted-dark">
                    ({formalite.documents!.length})
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowUploadZone(!showUploadZone);
                  setPendingFiles([]);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-uf-button-hover hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            {/* Zone d'upload */}
            {showUploadZone && (
              <div className="mb-4 space-y-3">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative p-6 rounded-lg border-2 border-dashed cursor-pointer transition-colors duration-200 ${
                    isDragging
                      ? "border-uf-button-hover bg-blue-50 dark:bg-blue-950/30"
                      : "border-uf-border dark:border-uf-border-dark hover:border-uf-button-hover hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      handleFileAdd(e.target.files);
                      e.target.value = "";
                    }}
                    className="hidden"
                  />
                  <div className="text-center">
                    <Upload
                      className={`w-8 h-8 mx-auto mb-2 ${
                        isDragging
                          ? "text-uf-button-hover"
                          : "text-uf-text-muted dark:text-uf-text-muted-dark"
                      }`}
                    />
                    <p className="text-sm font-medium text-uf-text dark:text-uf-text-dark">
                      Glissez-déposez les fichiers ici
                    </p>
                    <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
                      PDF, JPG ou PNG
                    </p>
                  </div>
                </div>

                {/* Fichiers en attente */}
                {pendingFiles.length > 0 && (
                  <div className="space-y-2">
                    {pendingFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <FileText className="w-4 h-4 text-uf-button-hover shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-uf-text dark:text-uf-text-dark truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <select
                          value={file.typeDocument}
                          onChange={(e) => {
                            setPendingFiles((prev) =>
                              prev.map((f, i) =>
                                i === index
                                  ? {
                                      ...f,
                                      typeDocument: e.target
                                        .value as TypeDocument,
                                    }
                                  : f
                              )
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs border border-uf-border dark:border-uf-border-dark rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-uf-text dark:text-uf-text-dark shrink-0 mx-2"
                        >
                          <option value="kbis">Kbis</option>
                          <option value="statuts">Statuts</option>
                          <option value="mandat">Mandat</option>
                          <option value="autre">Autre</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removePendingFile(index)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 text-uf-text-muted hover:text-red-500 transition-colors cursor-pointer shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setPendingFiles([]);
                          setShowUploadZone(false);
                        }}
                      >
                        Annuler
                      </Button>
                      <Button size="sm" onClick={handleConfirmUpload}>
                        <Upload className="w-3.5 h-3.5 mr-1.5" />
                        Ajouter {pendingFiles.length} document
                        {pendingFiles.length > 1 ? "s" : ""}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Liste des documents existants */}
            {!formalite.documents || formalite.documents.length === 0 ? (
              !showUploadZone && (
                <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark italic">
                  Aucun document associé à cette formalité
                </p>
              )
            ) : (
              <div className="space-y-2">
                {formalite.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-uf-border dark:border-uf-border-dark hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => setViewerDoc(doc)}
                      title="Ouvrir la visionneuse"
                    >
                      <FileText className="w-4 h-4 text-uf-button-hover shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-uf-text dark:text-uf-text-dark truncate">
                          {doc.nom}
                        </p>
                        <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                          {TYPE_DOCUMENT_LABELS[doc.typeDocument]} ·{" "}
                          {formatFileSize(doc.taille)} · Ajouté le{" "}
                          {formatDate(doc.dateAjout)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button
                        type="button"
                        onClick={() => setViewerDoc(doc)}
                        className="p-1.5 rounded-lg text-uf-text-muted dark:text-uf-text-muted-dark hover:text-uf-button-hover hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                        title="Visualiser"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {doc.dataUrl && (
                        <button
                          type="button"
                          onClick={() => handleDownloadDocument(doc)}
                          className="p-1.5 rounded-lg text-uf-text-muted dark:text-uf-text-muted-dark hover:text-uf-button-hover hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                          title="Télécharger"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteDocId(doc.id)}
                        className="p-1.5 rounded-lg text-uf-text-muted dark:text-uf-text-muted-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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

      {/* ─── Modale d'édition des détails ─── */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier la formalité"
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowEditModal(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveEdit}>Enregistrer</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Description"
            value={editForm.description}
            onChange={(e) =>
              setEditForm({ ...editForm, description: e.target.value })
            }
          />

          <Select
            label="Type de formalité"
            options={typeFormaliteOptions}
            value={editForm.type}
            onChange={(e) =>
              setEditForm({ ...editForm, type: e.target.value })
            }
          />

          <Select
            label="Cabinet"
            options={cabinetOptions}
            value={editForm.cabinet}
            onChange={(e) =>
              setEditForm({ ...editForm, cabinet: e.target.value })
            }
          />

          <Input
            label="Formaliste"
            value={editForm.formaliste}
            onChange={(e) =>
              setEditForm({ ...editForm, formaliste: e.target.value })
            }
          />

          <Select
            label="Statut"
            options={statutOptions}
            value={editForm.statut}
            onChange={(e) =>
              setEditForm({ ...editForm, statut: e.target.value })
            }
          />

          <div>
            <label className="block text-sm font-medium text-uf-text dark:text-uf-text-dark mb-1.5">
              Observations
            </label>
            <textarea
              value={editForm.observations}
              onChange={(e) =>
                setEditForm({ ...editForm, observations: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-uf-border dark:border-uf-border-dark bg-white dark:bg-gray-800 text-sm text-uf-text dark:text-uf-text-dark placeholder-uf-text-muted dark:placeholder-uf-text-muted-dark focus:outline-none focus:ring-2 focus:ring-uf-button/30 focus:border-uf-button resize-none"
              placeholder="Observations, commentaires..."
            />
          </div>
        </div>
      </Modal>

      {/* ─── Modale de confirmation de suppression de document ─── */}
      <Modal
        isOpen={!!deleteDocId}
        onClose={() => setDeleteDocId(null)}
        title="Supprimer le document"
        actions={
          <>
            <Button variant="secondary" onClick={() => setDeleteDocId(null)}>
              Annuler
            </Button>
            <button
              type="button"
              onClick={handleDeleteDocument}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
            >
              Supprimer
            </button>
          </>
        }
      >
        {deleteDocMeta && (
          <div className="space-y-3">
            <p className="text-sm text-uf-text dark:text-uf-text-dark">
              Êtes-vous sûr de vouloir supprimer ce document ?
            </p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-uf-border dark:border-uf-border-dark">
              <FileText className="w-5 h-5 text-uf-button-hover shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-uf-text dark:text-uf-text-dark truncate">
                  {deleteDocMeta.nom}
                </p>
                <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                  {TYPE_DOCUMENT_LABELS[deleteDocMeta.typeDocument]} ·{" "}
                  {formatFileSize(deleteDocMeta.taille)}
                </p>
              </div>
            </div>
            <p className="text-xs text-red-500">
              Cette action est irréversible.
            </p>
          </div>
        )}
      </Modal>

      {/* ─── Visionneuse de document ─── */}
      {viewerDoc && (
        <DocumentViewer
          document={viewerDoc}
          isOpen={!!viewerDoc}
          onClose={() => setViewerDoc(null)}
          onSave={handleSaveDocumentContent}
          onDownload={() => handleDownloadDocument(viewerDoc)}
        />
      )}
    </div>
  );
}
