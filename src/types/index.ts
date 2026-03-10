export type Role = "admin" | "formaliste";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  identifiant?: string;
  password?: string;
  role: Role;
}

export type TypeFormalite =
  | "immatriculation"
  | "modification"
  | "radiation"
  | "cession"
  | "depot-comptes"
  | "beneficiaires-effectifs";

export type StatutFormalite =
  | "brouillon"
  | "en-traitement"
  | "valide"
  | "rejete";

export type FormeJuridique =
  | "SAS"
  | "SARL"
  | "SCI"
  | "EURL"
  | "SA"
  | "SNC"
  | "SASU"
  | "Auto-entrepreneur";

export interface Cabinet {
  id: string;
  nom: string;
  telephone?: string;
  email?: string;
}

export interface Entreprise {
  id: string;
  denomination: string;
  siren: string;
  formeJuridique: FormeJuridique;
  siegeSocial: string;
  capital: number;
  dirigeant: string;
  dateCreation: string;
}

export type TypeDocument = "kbis" | "statuts" | "mandat" | "autre";

export const TYPE_DOCUMENT_LABELS: Record<TypeDocument, string> = {
  kbis: "Kbis",
  statuts: "Statuts",
  mandat: "Mandat",
  autre: "Autre",
};

export interface DocumentMeta {
  id: string;
  nom: string;
  taille: number;
  mimeType: string;
  typeDocument: TypeDocument;
  dateAjout: string;
  dataUrl?: string;
}

export interface Formalite {
  id: string;
  reference: string;
  type: TypeFormalite;
  statut: StatutFormalite;
  entrepriseId: string;
  entrepriseDenomination: string;
  cabinet: string;
  description: string;
  dateCreation: string;
  dateSoumission?: string;
  dateValidation?: string;
  formaliste: string;
  refINPI?: string;
  observations?: string;
  documents?: DocumentMeta[];
}

export const TYPE_FORMALITE_LABELS: Record<TypeFormalite, string> = {
  immatriculation: "Immatriculation",
  modification: "Modification",
  radiation: "Radiation / Dissolution",
  cession: "Cession de parts",
  "depot-comptes": "Dépôt des comptes",
  "beneficiaires-effectifs": "Bénéficiaires effectifs",
};

export const STATUT_FORMALITE_LABELS: Record<StatutFormalite, string> = {
  brouillon: "Brouillon",
  "en-traitement": "En traitement INPI",
  valide: "Validé",
  rejete: "Rejeté (À corriger)",
};
