"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { getUsers } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Mot de passe oublié
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Récupérer les utilisateurs depuis le store (admin uniquement)
    const users = getUsers();
    const admins = users.filter((u) => u.role === "admin");

    // Chercher par email OU par identifiant
    const user = admins.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() ||
        u.identifiant?.toLowerCase() === email.trim().toLowerCase()
    );

    if (!user) {
      setError("Identifiant ou email introuvable");
      return;
    }

    // Vérification du mot de passe (pour l'instant accepte "admin" comme MDP par défaut)
    if (password === "admin") {
      localStorage.setItem("uf-user", JSON.stringify(user));
      router.push("/dashboard");
    } else {
      setError("Mot de passe incorrect");
    }
  };

  const handleForgotPassword = () => {
    if (!forgotEmail.trim()) return;
    // Simulation envoi email
    setForgotSent(true);
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotEmail("");
    setForgotSent(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-uf-bg dark:bg-uf-bg-dark px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-uf-button-hover mb-4">
            <span className="text-white font-bold text-2xl">UF</span>
          </div>
          <h1 className="text-2xl font-bold text-uf-title dark:text-uf-title-dark">
            Urgences Formalités
          </h1>
          <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
            Application de dépôt INPI
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Identifiant ou email"
              type="text"
              placeholder="Ex : l.hacene ou contact@urgencesformalites.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              placeholder="Entrez votre mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            <Button type="submit" className="w-full">
              Se connecter
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setShowForgotModal(true)}
              className="text-sm text-uf-button-hover hover:underline cursor-pointer"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </Card>

        <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark text-center mt-6">
          Accès réservé aux administrateurs Urgences Formalités
        </p>
      </div>

      {/* Modale Mot de passe oublié */}
      <Modal
        isOpen={showForgotModal}
        onClose={closeForgotModal}
        title="Mot de passe oublié"
        actions={
          forgotSent ? (
            <Button onClick={closeForgotModal}>Fermer</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={closeForgotModal}>
                Annuler
              </Button>
              <Button onClick={handleForgotPassword}>
                Envoyer le lien
              </Button>
            </>
          )
        }
      >
        {forgotSent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-sm text-uf-text dark:text-uf-text-dark font-medium">
              Email envoyé !
            </p>
            <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
              Un lien de réinitialisation a été envoyé à{" "}
              <strong>{forgotEmail}</strong>. Vérifiez votre boîte de réception.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-uf-text dark:text-uf-text-dark">
              Entrez votre adresse email. Vous recevrez un lien pour
              réinitialiser votre mot de passe.
            </p>
            <Input
              label="Adresse email"
              type="email"
              placeholder="contact@urgencesformalites.fr"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
