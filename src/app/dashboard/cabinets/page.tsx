"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Briefcase,
  Building2,
  FileText,
  Search,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  getCabinets,
  addCabinet as addCabinetStore,
  updateCabinet as updateCabinetStore,
  deleteCabinet as deleteCabinetStore,
  getFormalites,
  getEntreprises,
} from "@/lib/store";
import type { Cabinet, Formalite, Entreprise } from "@/types";
import {
  TYPE_FORMALITE_LABELS,
  STATUT_FORMALITE_LABELS,
} from "@/types";

// ─── Formulaire vierge ───
const emptyForm = {
  nom: "",
  telephone: "",
  email: "",
};

export default function CabinetsPage() {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [allFormalites, setAllFormalites] = useState<Formalite[]>([]);
  const [allEntreprises, setAllEntreprises] = useState<Entreprise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCabinet, setExpandedCabinet] = useState<string | null>(null);

  // Modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState<Cabinet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Cabinet | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setCabinets(getCabinets());
    setAllFormalites(getFormalites());
    setAllEntreprises(getEntreprises());
  }, []);

  // Filtrage par recherche
  const filteredCabinets = useMemo(() => {
    if (!searchQuery.trim()) return cabinets;
    const q = searchQuery.toLowerCase();
    return cabinets.filter(
      (c) =>
        c.nom.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.telephone?.includes(q)
    );
  }, [cabinets, searchQuery]);

  // Regrouper formalités et entreprises par cabinet
  const getCabinetFormalites = (cabinetNom: string) =>
    allFormalites.filter((f) => f.cabinet === cabinetNom);

  const getCabinetEntreprises = (cabinetNom: string) => {
    const entrepriseIds = new Set(
      allFormalites
        .filter((f) => f.cabinet === cabinetNom)
        .map((f) => f.entrepriseId)
    );
    return allEntreprises.filter((e) => entrepriseIds.has(e.id));
  };

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedCabinet((prev) => (prev === id ? null : id));
  };

  // ─── Modale création ───
  const openCreate = () => {
    setEditingCabinet(null);
    setForm(emptyForm);
    setFormError("");
    setShowFormModal(true);
  };

  // ─── Modale modification ───
  const openEdit = (cabinet: Cabinet) => {
    setEditingCabinet(cabinet);
    setForm({
      nom: cabinet.nom,
      telephone: cabinet.telephone || "",
      email: cabinet.email || "",
    });
    setFormError("");
    setShowFormModal(true);
  };

  // ─── Sauvegarder ───
  const handleSave = () => {
    if (!form.nom.trim()) {
      setFormError("Le nom du cabinet est obligatoire.");
      return;
    }
    // Doublon nom
    const nameExists = cabinets.some(
      (c) =>
        c.nom.toLowerCase() === form.nom.trim().toLowerCase() &&
        c.id !== editingCabinet?.id
    );
    if (nameExists) {
      setFormError("Un cabinet avec ce nom existe déjà.");
      return;
    }

    if (editingCabinet) {
      const updates = {
        nom: form.nom.trim(),
        telephone: form.telephone.trim() || undefined,
        email: form.email.trim() || undefined,
      };
      updateCabinetStore(editingCabinet.id, updates);
      setCabinets((prev) =>
        prev.map((c) =>
          c.id === editingCabinet.id ? { ...c, ...updates } : c
        )
      );
    } else {
      const newCabinet: Cabinet = {
        id: `cab-${Date.now()}`,
        nom: form.nom.trim(),
        telephone: form.telephone.trim() || undefined,
        email: form.email.trim() || undefined,
      };
      addCabinetStore(newCabinet);
      setCabinets((prev) => [...prev, newCabinet]);
    }

    setShowFormModal(false);
    setEditingCabinet(null);
    setForm(emptyForm);
  };

  // ─── Supprimer ───
  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCabinetStore(deleteTarget.id);
    setCabinets((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uf-title dark:text-uf-title-dark">
            Cabinets
          </h1>
          <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
            {cabinets.length} cabinet(s) enregistré(s)
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un cabinet
        </Button>
      </div>

      {/* Barre de recherche */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark" />
        <input
          type="text"
          placeholder="Rechercher un cabinet..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-uf-border dark:border-uf-border-dark bg-white dark:bg-gray-800 text-sm text-uf-text dark:text-uf-text-dark placeholder-uf-text-muted dark:placeholder-uf-text-muted-dark focus:outline-none focus:ring-2 focus:ring-uf-button/30 focus:border-uf-button"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-uf-text-muted hover:text-uf-text dark:hover:text-uf-text-dark cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Liste des cabinets */}
      {filteredCabinets.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Briefcase className="w-12 h-12 mx-auto text-uf-text-muted dark:text-uf-text-muted-dark mb-3" />
            <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
              {searchQuery
                ? "Aucun cabinet ne correspond à votre recherche"
                : "Aucun cabinet enregistré"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredCabinets.map((cabinet) => {
            const isExpanded = expandedCabinet === cabinet.id;
            const formalites = getCabinetFormalites(cabinet.nom);
            const entreprises = getCabinetEntreprises(cabinet.nom);

            return (
              <Card key={cabinet.id} padding={false}>
                {/* En-tête du cabinet */}
                <div
                  className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => toggleExpand(cabinet.id)}
                >
                  <div className="flex items-center gap-4">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-uf-text-muted dark:text-uf-text-muted-dark" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-uf-text-muted dark:text-uf-text-muted-dark" />
                    )}
                    <div className="w-10 h-10 rounded-lg bg-uf-button/10 dark:bg-uf-button/20 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-uf-button-hover" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-uf-text dark:text-uf-text-dark">
                        {cabinet.nom}
                      </h3>
                      <div className="flex items-center gap-4 mt-0.5 text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                        {cabinet.telephone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {cabinet.telephone}
                          </span>
                        )}
                        {cabinet.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {cabinet.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Compteurs */}
                    <div className="flex items-center gap-3 text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {entreprises.length} entreprise(s)
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {formalites.length} formalité(s)
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(cabinet);
                        }}
                        className="p-2 rounded-lg text-uf-text-muted dark:text-uf-text-muted-dark hover:text-uf-button-hover hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                        title="Modifier le cabinet"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(cabinet);
                        }}
                        className="p-2 rounded-lg text-uf-text-muted dark:text-uf-text-muted-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Supprimer le cabinet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contenu déplié */}
                {isExpanded && (
                  <div className="border-t border-uf-border dark:border-uf-border-dark px-6 py-4 space-y-5">
                    {/* Entreprises associées */}
                    <div>
                      <h4 className="text-sm font-semibold text-uf-title dark:text-uf-title-dark mb-3 flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Entreprises associées
                      </h4>
                      {entreprises.length === 0 ? (
                        <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark italic">
                          Aucune entreprise associée à ce cabinet
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {entreprises.map((ent) => (
                            <div
                              key={ent.id}
                              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-uf-border dark:border-uf-border-dark"
                            >
                              <div className="w-8 h-8 rounded-lg bg-uf-button-hover/10 dark:bg-uf-button-hover/20 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4 text-uf-button-hover" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-uf-text dark:text-uf-text-dark truncate">
                                  {ent.denomination}
                                </p>
                                <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                                  SIREN : {ent.siren} · {ent.formeJuridique}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Formalités associées */}
                    <div>
                      <h4 className="text-sm font-semibold text-uf-title dark:text-uf-title-dark mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Formalités associées
                      </h4>
                      {formalites.length === 0 ? (
                        <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark italic">
                          Aucune formalité associée à ce cabinet
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-uf-border dark:border-uf-border-dark text-left">
                                <th className="pb-2 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark text-xs">
                                  Référence
                                </th>
                                <th className="pb-2 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark text-xs">
                                  Entreprise
                                </th>
                                <th className="pb-2 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark text-xs">
                                  Type
                                </th>
                                <th className="pb-2 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark text-xs">
                                  Statut
                                </th>
                                <th className="pb-2 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark text-xs">
                                  Formaliste
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-uf-border dark:divide-uf-border-dark">
                              {formalites.map((f) => (
                                <tr key={f.id}>
                                  <td className="py-2 font-mono text-xs text-uf-button-hover">
                                    {f.reference}
                                  </td>
                                  <td className="py-2 text-uf-text dark:text-uf-text-dark">
                                    {f.entrepriseDenomination}
                                  </td>
                                  <td className="py-2 text-uf-text-muted dark:text-uf-text-muted-dark">
                                    {TYPE_FORMALITE_LABELS[f.type]}
                                  </td>
                                  <td className="py-2">
                                    <Badge statut={f.statut} />
                                  </td>
                                  <td className="py-2 text-uf-text-muted dark:text-uf-text-muted-dark">
                                    {f.formaliste}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Modale Création / Modification ─── */}
      <Modal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingCabinet(null);
        }}
        title={editingCabinet ? "Modifier le cabinet" : "Ajouter un cabinet"}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowFormModal(false);
                setEditingCabinet(null);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingCabinet ? "Enregistrer" : "Ajouter"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">
                {formError}
              </p>
            </div>
          )}

          <Input
            label="Nom du cabinet *"
            placeholder="Ex : Cabinet Moreau & Associés"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
          />

          <Input
            label="Téléphone"
            type="tel"
            placeholder="01 23 45 67 89"
            value={form.telephone}
            onChange={(e) =>
              setForm({ ...form, telephone: e.target.value })
            }
          />

          <Input
            label="Email"
            type="email"
            placeholder="contact@cabinet.fr"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </Modal>

      {/* ─── Modale Suppression ─── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le cabinet"
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
              Êtes-vous sûr de vouloir supprimer ce cabinet ?
            </p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-uf-border dark:border-uf-border-dark">
              <div className="w-10 h-10 rounded-lg bg-uf-button/10 dark:bg-uf-button/20 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-uf-button-hover" />
              </div>
              <div>
                <p className="font-medium text-uf-text dark:text-uf-text-dark">
                  {deleteTarget.nom}
                </p>
                <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                  {deleteTarget.email || "Pas d'email"} ·{" "}
                  {deleteTarget.telephone || "Pas de téléphone"}
                </p>
              </div>
            </div>
            <p className="text-xs text-red-500">
              Cette action est irréversible. Les formalités associées seront également supprimées.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
