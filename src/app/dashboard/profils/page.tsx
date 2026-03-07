"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  ShieldAlert,
  Mail,
  Phone,
  KeyRound,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { mockUsers } from "@/lib/mock-data";
import type { User, Role } from "@/types";

// ─── Formulaire vierge ───
const emptyForm = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  identifiant: "",
  role: "formaliste" as Role,
  password: "",
};

export default function ProfilsPage() {
  // Utilisateur connecté
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  // Liste des profils
  const [users, setUsers] = useState<User[]>(mockUsers);
  // Modales
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  // Formulaire
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("uf-user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
  }, []);

  // ─── Garde admin ───
  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <ShieldAlert className="w-16 h-16 text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-uf-text dark:text-uf-text-dark mb-2">
          Accès réservé aux administrateurs
        </h2>
        <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark">
          Vous n&apos;avez pas les droits nécessaires pour accéder à cette page.
        </p>
      </div>
    );
  }

  // ─── Ouvrir la modale en mode "création" ───
  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setFormError("");
    setShowFormModal(true);
  };

  // ─── Ouvrir la modale en mode "modification" ───
  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({
      prenom: user.prenom,
      nom: user.nom,
      email: user.email,
      telephone: user.telephone || "",
      identifiant: user.identifiant || "",
      role: user.role,
      password: "",
    });
    setFormError("");
    setShowFormModal(true);
  };

  // ─── Sauvegarder (création ou modification) ───
  const handleSave = () => {
    // Validation
    if (!form.prenom.trim() || !form.nom.trim() || !form.email.trim()) {
      setFormError("Les champs Prénom, Nom et Email sont obligatoires.");
      return;
    }
    if (!editingUser && !form.identifiant.trim()) {
      setFormError("L'identifiant est obligatoire pour un nouveau profil.");
      return;
    }
    if (!editingUser && !form.password.trim()) {
      setFormError("Le mot de passe est obligatoire pour un nouveau profil.");
      return;
    }
    // Vérifier doublon email
    const emailExists = users.some(
      (u) =>
        u.email.toLowerCase() === form.email.trim().toLowerCase() &&
        u.id !== editingUser?.id
    );
    if (emailExists) {
      setFormError("Un profil avec cette adresse email existe déjà.");
      return;
    }
    // Vérifier doublon identifiant
    if (form.identifiant.trim()) {
      const identifiantExists = users.some(
        (u) =>
          u.identifiant?.toLowerCase() === form.identifiant.trim().toLowerCase() &&
          u.id !== editingUser?.id
      );
      if (identifiantExists) {
        setFormError("Un profil avec cet identifiant existe déjà.");
        return;
      }
    }

    if (editingUser) {
      // Modification
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                prenom: form.prenom.trim(),
                nom: form.nom.trim(),
                email: form.email.trim(),
                telephone: form.telephone.trim() || undefined,
                identifiant: form.identifiant.trim() || u.identifiant,
                role: form.role,
                // Si un nouveau mot de passe est renseigné, on le met à jour (simulation)
                ...(form.password.trim() ? {} : {}),
              }
            : u
        )
      );
      // Simulation : si un mot de passe est renseigné, on le "met à jour"
      if (form.password.trim()) {
        console.log(`[Simulation] Mot de passe modifié pour ${editingUser.prenom} ${editingUser.nom}`);
      }
    } else {
      // Création
      const newUser: User = {
        id: `u-${Date.now()}`,
        prenom: form.prenom.trim(),
        nom: form.nom.trim(),
        email: form.email.trim(),
        telephone: form.telephone.trim() || undefined,
        identifiant: form.identifiant.trim(),
        role: form.role,
      };
      setUsers((prev) => [...prev, newUser]);
    }

    setShowFormModal(false);
    setEditingUser(null);
    setForm(emptyForm);
  };

  // ─── Supprimer ───
  const handleDelete = () => {
    if (!deleteTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  // ─── Stats ───
  const adminsCount = users.filter((u) => u.role === "admin").length;
  const formalistesCount = users.filter((u) => u.role === "formaliste").length;

  const roleOptions = [
    { value: "formaliste", label: "Formaliste" },
    { value: "admin", label: "Administrateur" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-uf-title dark:text-uf-title-dark">
            Gestion des profils
          </h1>
          <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
            {users.length} profil(s) — {adminsCount} admin(s), {formalistesCount}{" "}
            formaliste(s)
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Créer un profil
        </Button>
      </div>

      {/* Tableau des profils */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-uf-border dark:border-uf-border-dark text-left">
                <th className="px-6 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                  Utilisateur
                </th>
                <th className="px-6 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                  Identifiant
                </th>
                <th className="px-6 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                  Email
                </th>
                <th className="px-6 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                  Téléphone
                </th>
                <th className="px-6 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark">
                  Rôle
                </th>
                <th className="px-6 py-3 font-semibold text-uf-text-muted dark:text-uf-text-muted-dark text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-uf-border dark:divide-uf-border-dark">
              {users.map((user) => {
                const isAdmin = user.role === "admin";
                const isSelf = user.id === currentUser?.id;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    {/* Nom + avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${
                            isAdmin
                              ? "bg-uf-button-hover"
                              : "bg-gray-400 dark:bg-gray-600"
                          }`}
                        >
                          {user.prenom[0]}
                          {user.nom[0]}
                        </div>
                        <div>
                          <p className="font-medium text-uf-text dark:text-uf-text-dark">
                            {user.prenom} {user.nom}
                          </p>
                          {isSelf && (
                            <span className="text-xs text-uf-button-hover">
                              (vous)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Identifiant */}
                    <td className="px-6 py-4">
                      {user.identifiant ? (
                        <div className="flex items-center gap-1.5 text-uf-text dark:text-uf-text-dark">
                          <KeyRound className="w-3.5 h-3.5 text-uf-text-muted dark:text-uf-text-muted-dark" />
                          <span className="font-mono text-xs">{user.identifiant}</span>
                        </div>
                      ) : (
                        <span className="text-uf-text-muted dark:text-uf-text-muted-dark">
                          —
                        </span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-uf-text dark:text-uf-text-dark">
                        <Mail className="w-3.5 h-3.5 text-uf-text-muted dark:text-uf-text-muted-dark" />
                        {user.email}
                      </div>
                    </td>

                    {/* Téléphone */}
                    <td className="px-6 py-4">
                      {user.telephone ? (
                        <div className="flex items-center gap-1.5 text-uf-text dark:text-uf-text-dark">
                          <Phone className="w-3.5 h-3.5 text-uf-text-muted dark:text-uf-text-muted-dark" />
                          {user.telephone}
                        </div>
                      ) : (
                        <span className="text-uf-text-muted dark:text-uf-text-muted-dark">
                          —
                        </span>
                      )}
                    </td>

                    {/* Rôle badge */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          isAdmin
                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {isAdmin ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <UserIcon className="w-3 h-3" />
                        )}
                        {isAdmin ? "Admin" : "Formaliste"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(user)}
                          className="p-2 rounded-lg text-uf-text-muted dark:text-uf-text-muted-dark hover:text-uf-button-hover hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                          title="Modifier le profil"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => !isSelf && setDeleteTarget(user)}
                          disabled={isSelf}
                          className={`p-2 rounded-lg transition-colors ${
                            isSelf
                              ? "text-gray-300 dark:text-gray-700 cursor-not-allowed"
                              : "text-uf-text-muted dark:text-uf-text-muted-dark hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                          }`}
                          title={
                            isSelf
                              ? "Vous ne pouvez pas supprimer votre propre profil"
                              : "Supprimer le profil"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-uf-text-muted dark:text-uf-text-muted-dark mb-3" />
            <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
              Aucun profil enregistré
            </p>
          </div>
        )}
      </Card>

      {/* ─── Modale Création / Modification ─── */}
      <Modal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingUser(null);
        }}
        title={editingUser ? "Modifier le profil" : "Créer un profil"}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowFormModal(false);
                setEditingUser(null);
              }}
            >
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingUser ? "Enregistrer" : "Créer le profil"}
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

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prénom *"
              placeholder="Ex : Sophie"
              value={form.prenom}
              onChange={(e) =>
                setForm({ ...form, prenom: e.target.value })
              }
            />
            <Input
              label="Nom *"
              placeholder="Ex : Martin"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
          </div>

          <Input
            label="Adresse email *"
            type="email"
            placeholder="prenom.nom@urgencesformalites.fr"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            label="Téléphone"
            type="tel"
            placeholder="06 00 00 00 00"
            value={form.telephone}
            onChange={(e) =>
              setForm({ ...form, telephone: e.target.value })
            }
          />

          <Select
            label="Rôle *"
            options={roleOptions}
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value as Role })
            }
          />

          {/* Séparateur visuel */}
          <div className="border-t border-uf-border dark:border-uf-border-dark pt-4">
            <h3 className="text-sm font-semibold text-uf-title dark:text-uf-title-dark mb-3 flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              Identifiants de connexion
            </h3>

            <div className="space-y-4">
              <Input
                label={editingUser ? "Identifiant" : "Identifiant *"}
                placeholder="Ex : s.martin"
                value={form.identifiant}
                onChange={(e) =>
                  setForm({ ...form, identifiant: e.target.value })
                }
              />

              <div>
                <Input
                  label={editingUser ? "Nouveau mot de passe" : "Mot de passe *"}
                  type="password"
                  placeholder={
                    editingUser
                      ? "Laisser vide pour ne pas modifier"
                      : "Mot de passe initial"
                  }
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
                {editingUser && (
                  <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
                    Renseignez un nouveau mot de passe uniquement si vous souhaitez le modifier.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ─── Modale Suppression ─── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Supprimer le profil"
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
              Êtes-vous sûr de vouloir supprimer ce profil ?
            </p>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-uf-border dark:border-uf-border-dark">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs shrink-0 ${
                  deleteTarget.role === "admin"
                    ? "bg-uf-button-hover"
                    : "bg-gray-400 dark:bg-gray-600"
                }`}
              >
                {deleteTarget.prenom[0]}
                {deleteTarget.nom[0]}
              </div>
              <div>
                <p className="font-medium text-uf-text dark:text-uf-text-dark">
                  {deleteTarget.prenom} {deleteTarget.nom}
                </p>
                <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
                  {deleteTarget.email} ·{" "}
                  {deleteTarget.role === "admin" ? "Admin" : "Formaliste"}
                </p>
              </div>
            </div>
            <p className="text-xs text-red-500">
              Cette action est irréversible. L&apos;utilisateur ne pourra plus
              se connecter.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
