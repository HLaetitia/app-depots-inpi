"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { mockEntreprises, mockFormalites } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function EntreprisesPage() {
  const [search, setSearch] = useState("");

  const filtered = mockEntreprises.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.denomination.toLowerCase().includes(q) ||
      e.siren.includes(q) ||
      e.dirigeant.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-uf-title dark:text-uf-title-dark">
          Entreprises
        </h1>
        <p className="text-sm text-uf-text-muted dark:text-uf-text-muted-dark mt-1">
          {mockEntreprises.length} entreprise(s) cliente(s)
        </p>
      </div>

      {/* Search */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-uf-text-muted dark:text-uf-text-muted-dark" />
          <input
            type="text"
            placeholder="Rechercher par dénomination, SIREN, dirigeant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg border bg-uf-input-bg dark:bg-uf-input-bg-dark text-uf-text dark:text-uf-text-dark border-uf-border dark:border-uf-border-dark focus:outline-none focus:ring-2 focus:ring-uf-button-hover focus:border-transparent placeholder:text-uf-text-muted dark:placeholder:text-uf-text-muted-dark text-sm"
          />
        </div>
      </Card>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Building2 className="w-12 h-12 mx-auto text-uf-text-muted dark:text-uf-text-muted-dark mb-3" />
            <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
              Aucune entreprise trouvée
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((entreprise) => {
            const formaliteCount = mockFormalites.filter(
              (f) => f.entrepriseId === entreprise.id
            ).length;

            return (
              <Link
                key={entreprise.id}
                href={`/dashboard/entreprises/${entreprise.id}`}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 shrink-0">
                      <Building2 className="w-5 h-5 text-uf-title dark:text-uf-title-dark" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-uf-text dark:text-uf-text-dark text-sm truncate">
                        {entreprise.denomination}
                      </h3>
                      <p className="text-xs text-uf-text-muted dark:text-uf-text-muted-dark mt-0.5">
                        SIREN : {entreprise.siren}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-uf-border dark:border-uf-border-dark grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
                        Forme
                      </p>
                      <p className="font-medium text-uf-text dark:text-uf-text-dark">
                        {entreprise.formeJuridique}
                      </p>
                    </div>
                    <div>
                      <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
                        Capital
                      </p>
                      <p className="font-medium text-uf-text dark:text-uf-text-dark">
                        {formatCurrency(entreprise.capital)}
                      </p>
                    </div>
                    <div>
                      <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
                        Dirigeant
                      </p>
                      <p className="font-medium text-uf-text dark:text-uf-text-dark">
                        {entreprise.dirigeant}
                      </p>
                    </div>
                    <div>
                      <p className="text-uf-text-muted dark:text-uf-text-muted-dark">
                        Formalités
                      </p>
                      <p className="font-medium text-uf-text dark:text-uf-text-dark">
                        {formaliteCount}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
