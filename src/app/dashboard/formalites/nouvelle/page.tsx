"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, FileText, Save, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import {
  addFormalite,
  getFormalites,
  getEntreprises,
  getCabinets,
  addEntreprise,
  addCabinet,
} from "@/lib/store";
import type {
  Formalite,
  TypeFormalite,
  StatutFormalite,
  Entreprise,
  Cabinet,
} from "@/types";
import Link from "next/link";

const typeFormaliteOptions = [
  { value: "immatriculation", label: "Immatriculation (création)" },
  { value: "modification", label: "Modification (Transfert, Dirigeants...)" },
  { value: "radiation", label: "Radiation (Fermeture)" },
  { value: "depot-comptes", label: "Dépôt des comptes annuels" },
  {
    value: "beneficiaires-effectifs",
    label: "Déclaration des bénéficiaires effectifs (RBE)",
  },
];

const formeJuridiqueOptions = [
  { value: "", label: "Sélectionner une forme juridique" },
  { value: "SAS/SASU", label: "SAS / SASU" },
  { value: "SARL/EURL", label: "SARL / EURL" },
  { value: "SCI", label: "SCI" },
  { value: "EI", label: "Entreprise Individuelle (EI)" },
  { value: "Association", label: "Association" },
];

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

export default function NouvelleFormalitePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Données existantes
  const [existingEntreprises, setExistingEntreprises] = useState<Entreprise[]>([]);
  const [existingCabinets, setExistingCabinets] = useState<Cabinet[]>([]);

  useEffect(() => {
    setExistingEntreprises(getEntreprises());
    setExistingCabinets(getCabinets());
  }, []);

  const [formData, setFormData] = useState({
    type: "immatriculation",
    formeJuridique: "",
    entrepriseId: "",        // ID entreprise existante ou "__new__"
    cabinetId: "",           // ID cabinet existant ou "__new__"
    cabinetNom: "",
    cabinetTelephone: "",
    cabinetEmail: "",
    denomination: "",
    siren: "",
    greffe: "",
  });

  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleFileAdd = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;
    const accepted = Array.from(newFiles).filter((f) =>
      ["application/pdf", "image/jpeg", "image/png"].includes(f.type)
    );
    setFiles((prev) => [
      ...prev,
      ...accepted.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    ]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  const createFormaliteFromForm = (statut: StatutFormalite): void => {
    const existing = getFormalites();
    const nextNum = String(existing.length + 1).padStart(3, "0");
    const now = new Date().toISOString().slice(0, 10);

    // ─── Résoudre l'entreprise ───
    let entrepriseId = "";
    let entrepriseDenomination = "Nouvelle entreprise";

    if (formData.entrepriseId && formData.entrepriseId !== "__new__") {
      // Entreprise existante sélectionnée
      const ent = existingEntreprises.find((e) => e.id === formData.entrepriseId);
      if (ent) {
        entrepriseId = ent.id;
        entrepriseDenomination = ent.denomination;
      }
    } else if (formData.denomination.trim()) {
      // Nouvelle entreprise → la créer dans le store
      const newEnt: Entreprise = {
        id: `e-${Date.now()}`,
        denomination: formData.denomination.trim(),
        siren: formData.siren.trim() || "000 000 000",
        formeJuridique: (formData.formeJuridique || "SAS") as Entreprise["formeJuridique"],
        siegeSocial: "",
        dirigeant: "",
        capital: 0,
        dateCreation: now,
      };
      addEntreprise(newEnt);
      entrepriseId = newEnt.id;
      entrepriseDenomination = newEnt.denomination;
    }

    // ─── Résoudre le cabinet ───
    let cabinetNom = "Non renseigné";

    if (formData.cabinetId && formData.cabinetId !== "__new__") {
      // Cabinet existant
      const cab = existingCabinets.find((c) => c.id === formData.cabinetId);
      if (cab) {
        cabinetNom = cab.nom;
      }
    } else if (formData.cabinetNom.trim()) {
      // Nouveau cabinet → le créer dans le store
      const newCab: Cabinet = {
        id: `cab-${Date.now()}`,
        nom: formData.cabinetNom.trim(),
        telephone: formData.cabinetTelephone.trim() || undefined,
        email: formData.cabinetEmail.trim() || undefined,
      };
      addCabinet(newCab);
      cabinetNom = newCab.nom;
    }

    const newFormalite: Formalite = {
      id: `f-${Date.now()}`,
      reference: `UF-${new Date().getFullYear()}-${nextNum}`,
      type: formData.type as TypeFormalite,
      statut,
      entrepriseId,
      entrepriseDenomination,
      cabinet: cabinetNom,
      description: `${formData.type} — ${entrepriseDenomination}`,
      dateCreation: now,
      dateSoumission: statut === "en-traitement" ? now : undefined,
      formaliste: "Laëtitia Hacene",
    };

    addFormalite(newFormalite);
  };

  const handleSaveDraft = () => {
    createFormaliteFromForm("brouillon");
    router.push("/dashboard/formalites");
  };

  const handleSubmitINPI = (e: React.FormEvent) => {
    e.preventDefault();
    createFormaliteFromForm("en-traitement");
    router.push("/dashboard/formalites");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/formalites">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-uf-title dark:text-uf-title-dark">
            Nouvelle formalité
          </h1>
          <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
            Créer une nouvelle formalité à déposer sur l&apos;INPI
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmitINPI} className="space-y-6">
        {/* Type & Forme juridique */}
        <Card>
          <h2 className="text-base font-semibold text-uf-title dark:text-uf-title-dark mb-4">
            Informations de la formalité
          </h2>
          <div className="space-y-4">
            <Select
              label="Type de formalité *"
              options={typeFormaliteOptions}
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              required
            />

            <Select
              label="Forme juridique"
              options={formeJuridiqueOptions}
              value={formData.formeJuridique}
              onChange={(e) =>
                setFormData({ ...formData, formeJuridique: e.target.value })
              }
            />
          </div>
        </Card>

        {/* Information du cabinet */}
        <Card>
          <h2 className="text-base font-semibold text-uf-title dark:text-uf-title-dark mb-4">
            Information du cabinet
          </h2>
          <div className="space-y-4">
            <Select
              label="Cabinet *"
              options={[
                { value: "", label: "Sélectionner un cabinet" },
                ...existingCabinets.map((c) => ({
                  value: c.id,
                  label: c.nom,
                })),
                { value: "__new__", label: "+ Nouveau cabinet" },
              ]}
              value={formData.cabinetId}
              onChange={(e) =>
                setFormData({ ...formData, cabinetId: e.target.value, cabinetNom: "" })
              }
              required
            />

            {formData.cabinetId === "__new__" && (
              <>
                <Input
                  label="Nom du nouveau cabinet *"
                  placeholder="Ex : Cabinet Moreau & Associés"
                  value={formData.cabinetNom}
                  onChange={(e) =>
                    setFormData({ ...formData, cabinetNom: e.target.value })
                  }
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Téléphone"
                    type="tel"
                    placeholder="01 23 45 67 89"
                    value={formData.cabinetTelephone}
                    onChange={(e) =>
                      setFormData({ ...formData, cabinetTelephone: e.target.value })
                    }
                  />

                  <Input
                    label="Email"
                    type="email"
                    placeholder="contact@cabinet.fr"
                    value={formData.cabinetEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, cabinetEmail: e.target.value })
                    }
                  />
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Identification entreprise */}
        <Card>
          <h2 className="text-base font-semibold text-uf-title dark:text-uf-title-dark mb-4">
            Identification de l&apos;entreprise
          </h2>
          <div className="space-y-4">
            <Select
              label="Entreprise *"
              options={[
                { value: "", label: "Sélectionner une entreprise" },
                ...existingEntreprises.map((e) => ({
                  value: e.id,
                  label: `${e.denomination} (${e.siren})`,
                })),
                { value: "__new__", label: "+ Nouvelle entreprise" },
              ]}
              value={formData.entrepriseId}
              onChange={(e) =>
                setFormData({ ...formData, entrepriseId: e.target.value, denomination: "", siren: "" })
              }
              required
            />

            {formData.entrepriseId === "__new__" && (
              <>
                <Input
                  label="Dénomination sociale *"
                  placeholder="Ex : Ma Société SAS"
                  value={formData.denomination}
                  onChange={(e) =>
                    setFormData({ ...formData, denomination: e.target.value })
                  }
                  required
                />

                <Input
                  label="Numéro SIREN (si existant)"
                  placeholder="Ex : 123 456 789"
                  value={formData.siren}
                  onChange={(e) =>
                    setFormData({ ...formData, siren: e.target.value })
                  }
                />

                <Input
                  label="Greffe compétent"
                  placeholder="Ex : Tribunal de commerce de Paris"
                  value={formData.greffe}
                  onChange={(e) =>
                    setFormData({ ...formData, greffe: e.target.value })
                  }
                />
              </>
            )}
          </div>
        </Card>

        {/* Documents */}
        <Card>
          <h2 className="text-base font-semibold text-uf-title dark:text-uf-title-dark mb-4">
            Documents justificatifs
          </h2>

          {/* Drop zone */}
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
              onChange={(e) => handleFileAdd(e.target.files)}
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
                Glissez-déposez les statuts, Kbis, ou mandats ici
              </p>
              <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
                PDF, JPG ou PNG
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Parcourir les fichiers
              </Button>
            </div>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-uf-border dark:border-uf-border-dark"
                >
                  <div className="flex items-center gap-3 min-w-0">
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
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950 text-uf-text-muted hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={handleSaveDraft}>
            <Save className="w-4 h-4 mr-2" />
            Enregistrer le brouillon
          </Button>
          <Button type="submit">
            <Send className="w-4 h-4 mr-2" />
            Préparer le dossier INPI
          </Button>
        </div>
      </form>
    </div>
  );
}
