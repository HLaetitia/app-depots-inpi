/**
 * Store persistant avec localStorage
 * Toutes les données CRUD sont sauvegardées dans le navigateur.
 * Au premier chargement, les données mock sont utilisées comme seed.
 */

import {
  mockFormalites,
  mockEntreprises,
  mockCabinets,
  mockUsers,
} from "@/lib/mock-data";
import type { Formalite, Entreprise, Cabinet, User } from "@/types";

// ─── Clés localStorage ───
const KEYS = {
  formalites: "uf-formalites",
  entreprises: "uf-entreprises",
  cabinets: "uf-cabinets",
  users: "uf-users",
  initialized: "uf-store-initialized",
} as const;

// ─── Helper lecture/écriture ───
function readStore<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStore<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    console.error(`[Store] Erreur écriture localStorage pour ${key}`);
  }
}

// ─── Initialisation (seed avec mock data si première visite) ───
function ensureInitialized(): void {
  if (typeof window === "undefined") return;
  const alreadyInit = localStorage.getItem(KEYS.initialized);
  if (!alreadyInit) {
    writeStore(KEYS.formalites, mockFormalites);
    writeStore(KEYS.entreprises, mockEntreprises);
    writeStore(KEYS.cabinets, mockCabinets);
    writeStore(KEYS.users, mockUsers);
    localStorage.setItem(KEYS.initialized, "true");
  }
  // Migration : ajouter les mots de passe aux utilisateurs existants
  migratePasswords();
}

function migratePasswords(): void {
  const users = readStore<User[]>(KEYS.users);
  if (!users) return;
  let changed = false;
  const updated = users.map((u) => {
    if (!u.password) {
      // Chercher par id OU par email pour robustesse
      const mockUser = mockUsers.find(
        (m) => m.id === u.id || m.email.toLowerCase() === u.email.toLowerCase()
      );
      if (mockUser?.password) {
        changed = true;
        return { ...u, password: mockUser.password };
      }
    }
    return u;
  });
  if (changed) writeStore(KEYS.users, updated);
}

// ════════════════════════════════════════════════════
//  FORMALITÉS
// ════════════════════════════════════════════════════

export function getFormalites(): Formalite[] {
  ensureInitialized();
  return readStore<Formalite[]>(KEYS.formalites) ?? mockFormalites;
}

export function addFormalite(formalite: Formalite): void {
  const list = getFormalites();
  list.push(formalite);
  writeStore(KEYS.formalites, list);
}

export function updateFormalite(id: string, updates: Partial<Formalite>): void {
  const list = getFormalites().map((f) =>
    f.id === id ? { ...f, ...updates } : f
  );
  writeStore(KEYS.formalites, list);
}

export function deleteFormalite(id: string): void {
  const list = getFormalites().filter((f) => f.id !== id);
  writeStore(KEYS.formalites, list);
}

// ════════════════════════════════════════════════════
//  ENTREPRISES
// ════════════════════════════════════════════════════

export function getEntreprises(): Entreprise[] {
  ensureInitialized();
  return readStore<Entreprise[]>(KEYS.entreprises) ?? mockEntreprises;
}

export function addEntreprise(entreprise: Entreprise): void {
  const list = getEntreprises();
  list.push(entreprise);
  writeStore(KEYS.entreprises, list);
}

export function updateEntreprise(
  id: string,
  updates: Partial<Entreprise>
): void {
  const list = getEntreprises().map((e) =>
    e.id === id ? { ...e, ...updates } : e
  );
  writeStore(KEYS.entreprises, list);
}

export function deleteEntreprise(id: string): void {
  const list = getEntreprises().filter((e) => e.id !== id);
  writeStore(KEYS.entreprises, list);
}

// ════════════════════════════════════════════════════
//  CABINETS
// ════════════════════════════════════════════════════

export function getCabinets(): Cabinet[] {
  ensureInitialized();
  return readStore<Cabinet[]>(KEYS.cabinets) ?? mockCabinets;
}

export function addCabinet(cabinet: Cabinet): void {
  const list = getCabinets();
  list.push(cabinet);
  writeStore(KEYS.cabinets, list);
}

export function updateCabinet(id: string, updates: Partial<Cabinet>): void {
  const list = getCabinets().map((c) =>
    c.id === id ? { ...c, ...updates } : c
  );
  writeStore(KEYS.cabinets, list);
}

export function deleteCabinet(id: string): void {
  const list = getCabinets().filter((c) => c.id !== id);
  writeStore(KEYS.cabinets, list);
}

// ════════════════════════════════════════════════════
//  UTILISATEURS / PROFILS
// ════════════════════════════════════════════════════

export function getUsers(): User[] {
  ensureInitialized();
  return readStore<User[]>(KEYS.users) ?? mockUsers;
}

export function addUser(user: User): void {
  const list = getUsers();
  list.push(user);
  writeStore(KEYS.users, list);
}

export function updateUser(id: string, updates: Partial<User>): void {
  const list = getUsers().map((u) =>
    u.id === id ? { ...u, ...updates } : u
  );
  writeStore(KEYS.users, list);
}

export function deleteUser(id: string): void {
  const list = getUsers().filter((u) => u.id !== id);
  writeStore(KEYS.users, list);
}

// ════════════════════════════════════════════════════
//  UTILITAIRE : Réinitialiser toutes les données
// ════════════════════════════════════════════════════

export function resetStore(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEYS.initialized);
  localStorage.removeItem(KEYS.formalites);
  localStorage.removeItem(KEYS.entreprises);
  localStorage.removeItem(KEYS.cabinets);
  localStorage.removeItem(KEYS.users);
  ensureInitialized();
}
