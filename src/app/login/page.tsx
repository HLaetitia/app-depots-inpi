"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { mockUsers } from "@/lib/mock-data";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = mockUsers.find((u) => u.email === email);
    if (user && password === "demo") {
      localStorage.setItem("uf-user", JSON.stringify(user));
      router.push("/dashboard");
    } else {
      setError("Email ou mot de passe incorrect");
    }
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
              label="Adresse email"
              type="email"
              placeholder="prenom.nom@urgencesformalites.fr"
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

          <div className="mt-6 pt-4 border-t border-uf-border dark:border-uf-border-dark">
            <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark text-center mb-2">
              Comptes de démonstration (mot de passe : <strong>demo</strong>)
            </p>
            <div className="space-y-1">
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setEmail(user.email);
                    setPassword("demo");
                  }}
                  className="w-full text-left px-3 py-1.5 rounded text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <span className="font-medium text-uf-text dark:text-uf-text-dark">
                    {user.prenom} {user.nom}
                  </span>
                  <span className="text-uf-text-muted dark:text-uf-text-muted-dark">
                    {" "}
                    — {user.role} — {user.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
