"use client";

import { useState, useEffect } from "react";
import {
  Settings,
  Globe,
  Key,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { InpiEnvironment } from "@/types/inpi";

interface InpiSettings {
  environment: InpiEnvironment;
  jwtToken: string;
  cclLogin: string;
  cclPassword: string;
}

const DEFAULT_SETTINGS: InpiSettings = {
  environment: "demo",
  jwtToken: "",
  cclLogin: "",
  cclPassword: "",
};

export default function ParametresPage() {
  const [settings, setSettings] = useState<InpiSettings>(DEFAULT_SETTINGS);
  const [showToken, setShowToken] = useState(false);
  const [showCclPassword, setShowCclPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [balanceStatus, setBalanceStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [balance, setBalance] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  // Charger les paramètres depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem("inpi-settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        // Ignorer les erreurs de parsing
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("inpi-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setConnectionStatus("testing");
    try {
      // Simuler un test de connexion (sera remplacé par le vrai appel API)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (settings.jwtToken.length > 10) {
        setConnectionStatus("success");
      } else {
        setConnectionStatus("error");
      }
    } catch {
      setConnectionStatus("error");
    }
    setTimeout(() => setConnectionStatus("idle"), 5000);
  };

  const handleCheckBalance = async () => {
    setBalanceStatus("testing");
    try {
      // Simuler une vérification de solde (sera remplacé par le vrai appel API)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (settings.cclLogin && settings.cclPassword) {
        setBalance(245000); // Simulé: 2450,00 EUR (en centimes)
        setBalanceStatus("success");
      } else {
        setBalanceStatus("error");
      }
    } catch {
      setBalanceStatus("error");
    }
    setTimeout(() => setBalanceStatus("idle"), 10000);
  };

  const envOptions = [
    { value: "demo", label: "Environnement de démonstration (test)" },
    { value: "production", label: "Production (dépôts réels)" },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-uf-title dark:text-uf-title-dark">
          Paramètres
        </h1>
        <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
          Configuration de l&apos;application et intégration API INPI
        </p>
      </div>

      {/* Section : Environnement INPI */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark">
              Environnement INPI
            </h2>
            <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
              Choisir entre l&apos;environnement de test ou de production
            </p>
          </div>
        </div>

        <Select
          options={envOptions}
          value={settings.environment}
          onChange={(e) =>
            setSettings({
              ...settings,
              environment: e.target.value as InpiEnvironment,
            })
          }
        />

        {settings.environment === "production" && (
          <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              En mode production, toutes les formalités soumises seront
              transmises réellement au Guichet Unique INPI. Utilisez
              l&apos;environnement de démonstration pour vos tests.
            </p>
          </div>
        )}

        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
            <span className="font-medium">URL :</span>{" "}
            {settings.environment === "demo"
              ? "https://guichet-unique-demo.inpi.fr"
              : "https://guichet-unique.inpi.fr"}
          </p>
        </div>
      </Card>

      {/* Section : Authentification API */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-50 dark:bg-green-950">
            <Key className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark">
              Authentification API
            </h2>
            <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
              Token JWT SSO pour l&apos;accès à l&apos;API Guichet Unique
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Input
              label="Token JWT"
              type={showToken ? "text" : "password"}
              placeholder="Collez votre token JWT ici..."
              value={settings.jwtToken}
              onChange={(e) =>
                setSettings({ ...settings, jwtToken: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-[34px] text-uf-text-muted dark:text-uf-text-muted-dark hover:text-uf-text dark:hover:text-uf-text-dark transition-colors"
            >
              {showToken ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTestConnection}
              disabled={
                !settings.jwtToken || connectionStatus === "testing"
              }
            >
              {connectionStatus === "testing" ? (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Key className="w-3.5 h-3.5 mr-1.5" />
              )}
              Tester la connexion
            </Button>

            {connectionStatus === "success" && (
              <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                Connexion réussie
              </span>
            )}
            {connectionStatus === "error" && (
              <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                Échec de la connexion
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Section : Compte Client INPI (Paiement) */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950">
            <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark">
              Compte Client INPI
            </h2>
            <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark">
              Identifiants pour le paiement via API (différents du login
              e-procédures)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Login CCL"
            type="text"
            placeholder="Identifiant compte client (chiffres uniquement)"
            value={settings.cclLogin}
            onChange={(e) =>
              setSettings({ ...settings, cclLogin: e.target.value })
            }
          />

          <div className="relative">
            <Input
              label="Mot de passe CCL"
              type={showCclPassword ? "text" : "password"}
              placeholder="Mot de passe du compte client"
              value={settings.cclPassword}
              onChange={(e) =>
                setSettings({ ...settings, cclPassword: e.target.value })
              }
            />
            <button
              type="button"
              onClick={() => setShowCclPassword(!showCclPassword)}
              className="absolute right-3 top-[34px] text-uf-text-muted dark:text-uf-text-muted-dark hover:text-uf-text dark:hover:text-uf-text-dark transition-colors"
            >
              {showCclPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCheckBalance}
              disabled={
                !settings.cclLogin ||
                !settings.cclPassword ||
                balanceStatus === "testing"
              }
            >
              {balanceStatus === "testing" ? (
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <CreditCard className="w-3.5 h-3.5 mr-1.5" />
              )}
              Vérifier le solde
            </Button>

            {balanceStatus === "success" && balance !== null && (
              <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                Solde : {(balance / 100).toFixed(2)} EUR
              </span>
            )}
            {balanceStatus === "error" && (
              <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4" />
                Identifiants invalides
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Section : Infos générales */}
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-uf-title dark:text-uf-title-dark">
              Informations
            </h2>
          </div>
        </div>

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-uf-text-muted dark:text-uf-text-muted-dark">
              Version de l&apos;application
            </dt>
            <dd className="text-uf-text dark:text-uf-text-dark font-medium">
              1.0.0-beta
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-uf-text-muted dark:text-uf-text-muted-dark">
              Contrat d&apos;interface INPI
            </dt>
            <dd className="text-uf-text dark:text-uf-text-dark font-medium">
              Juin 2025
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-uf-text-muted dark:text-uf-text-muted-dark">
              Base de données
            </dt>
            <dd className="text-uf-text dark:text-uf-text-dark font-medium">
              Données simulées (mock)
            </dd>
          </div>
        </dl>
      </Card>

      {/* Bouton Enregistrer */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave}>Enregistrer les paramètres</Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 className="w-4 h-4" />
            Paramètres enregistrés
          </span>
        )}
      </div>
    </div>
  );
}
