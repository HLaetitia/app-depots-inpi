// ============================================================
// Types pour l'API INPI Guichet Unique
// Basé sur le Contrat d'interface juin 2025
// ============================================================

// --- Environnements ---

export type InpiEnvironment = "demo" | "production";

export const INPI_BASE_URLS: Record<InpiEnvironment, string> = {
  demo: "https://guichet-unique-demo.inpi.fr",
  production: "https://guichet-unique.inpi.fr",
};

// --- Authentification ---

export interface InpiLoginRequest {
  token: string; // JWT token SSO
}

export interface InpiLoginResponse {
  token: string;
  // Session info from INPI
}

export interface InpiAuthConfig {
  environment: InpiEnvironment;
  jwtToken?: string;
  sessionToken?: string;
  // Compte client INPI (pour paiement, différent du login)
  cclLogin?: string;
  cclPassword?: string;
}

// --- Statuts des formalités INPI ---

export type InpiStatutFormalite =
  | "RECEIVED"
  | "ERROR"
  | "SIGNATURE_PENDING"
  | "SIGNED"
  | "PAYMENT_PENDING"
  | "PAYMENT_VALIDATION_PENDING"
  | "PAID"
  | "VALIDATION_PENDING"
  | "AMENDMENT_PENDING"
  | "AMENDED"
  | "EXPIRED"
  | "REJECTED"
  | "VALIDATED";

export const INPI_STATUT_LABELS: Record<InpiStatutFormalite, string> = {
  RECEIVED: "Reçue par le Guichet Unique",
  ERROR: "Erreur (contrôles échoués)",
  SIGNATURE_PENDING: "En attente de signature",
  SIGNED: "Signée",
  PAYMENT_PENDING: "En attente de paiement",
  PAYMENT_VALIDATION_PENDING: "Paiement en cours de validation",
  PAID: "Payée",
  VALIDATION_PENDING: "En attente de validation partenaire",
  AMENDMENT_PENDING: "Régularisation demandée",
  AMENDED: "Régularisée (en attente de validation)",
  EXPIRED: "Délai de régularisation expiré",
  REJECTED: "Rejetée",
  VALIDATED: "Validée",
};

// Mapping entre nos statuts internes et les statuts INPI
export const INPI_TO_LOCAL_STATUT: Record<InpiStatutFormalite, string> = {
  RECEIVED: "en-traitement",
  ERROR: "rejete",
  SIGNATURE_PENDING: "en-traitement",
  SIGNED: "en-traitement",
  PAYMENT_PENDING: "en-traitement",
  PAYMENT_VALIDATION_PENDING: "en-traitement",
  PAID: "en-traitement",
  VALIDATION_PENDING: "en-traitement",
  AMENDMENT_PENDING: "rejete",
  AMENDED: "en-traitement",
  EXPIRED: "rejete",
  REJECTED: "rejete",
  VALIDATED: "valide",
};

// --- Type de formalité INPI ---

export type InpiTypeFormalite = "C" | "M" | "S"; // Création, Modification, cesSation

// --- Pièces jointes ---

export interface InpiAttachment {
  id: number;
  size?: number;
  status?: string;
  nomDocument: string;
  typeDocument: string; // "PJ_01", "PJ_99" (synthèse), "PJ_115" (synthèse signée), etc.
  numeroPiece?: string;
  documentBase64?: string;
  documentExtension: string;
  sousTypeDocument?: string;
  path?: string;
  confidentiel?: boolean;
  created?: string;
  updated?: string;
  // Champs spécifiques
  autoriteDelivrance?: string;
  paysLieuDelivrance?: string;
  communeLieuDelivrance?: string;
  observations?: string;
  codeInseeCommuneLieuDelivrance?: string;
  codePostalLieuDelivrance?: string;
}

export interface InpiAttachmentUpload {
  nomDocument: string;
  typeDocument: string;
  langueDocument?: string; // "fr"
  documentBase64: string;
  documentExtension: string;
  sousTypeDocument?: string;
}

// --- Adresse INPI ---

export interface InpiAdresse {
  codePays?: string;
  codePostal?: string;
  commune?: string;
  codeInseeCommune?: string;
  typeVoie?: string;
  voie?: string;
  numVoie?: string;
  indiceRepetition?: string;
  distributionSpeciale?: string;
  complementLocalisation?: string;
  pays?: string;
  roleAdresse?: string;
}

// --- Formalité INPI ---

export interface InpiFormaliteContent {
  personnePhysique?: Record<string, unknown>;
  personneMorale?: {
    identite?: {
      entreprise?: {
        siren?: string;
        denomination?: string;
        formeJuridique?: string;
        dateImmatriculation?: string;
        dateClotureExerciceSocial?: string;
        duree?: number;
        capital?: {
          montant?: number;
          devise?: string;
        };
      };
      description?: {
        objetSocial?: string;
        dateClotureExerciceSocial?: string;
      };
      adresseEntreprise?: {
        adresse?: InpiAdresse;
      };
    };
    composition?: Record<string, unknown>;
    etablissementPrincipal?: Record<string, unknown>;
  };
  declarant?: {
    typePersonne?: string;
    nom?: string;
    prenoms?: string;
    qualite?: string;
  };
  natureCreation?: {
    societeExistante?: boolean;
    dateCreation?: string;
    formeExercice?: string;
    microEntreprise?: boolean;
    relieeEIRL?: boolean;
    etablissementFrance?: boolean;
  };
  piecesJointes?: InpiAttachment[];
}

export interface InpiFormalite {
  id?: number;
  content: InpiFormaliteContent;
  diffusionINSEE?: boolean;
  typeFormalite?: InpiTypeFormalite;
  typePersonne?: "P" | "PM"; // Physique ou Personne Morale
  // Champs en retour
  created?: string;
  updated?: string;
  status?: InpiStatutFormalite;
  liasseNumber?: string;
  numNat?: string;
  siren?: string;
  companyName?: string;
  referenceClientMandataire?: string;
  nomDossier?: string;
}

// --- Comptes annuels ---

export interface InpiComptesAnnuels {
  content: {
    personnePhysique?: Record<string, unknown>;
    personneMorale?: Record<string, unknown>;
    declarant?: Record<string, unknown>;
    comptesAnnuels: {
      comptesConsolides?: boolean;
      dateCloture?: string;
      dateDebutExerciceComptable?: string;
      dateFinExerciceComptable?: string;
      dispenseDepotAnnexes?: boolean;
      depotSimplifie?: boolean;
      modeExpert?: Record<string, unknown>;
      compteBilan?: {
        pagination?: Record<string, unknown>;
        confidentiel?: boolean;
      };
      compteResultat?: {
        pagination?: Record<string, unknown>;
        confidentiel?: boolean;
      };
    };
  };
  typePersonne?: "P" | "PM";
  // Champs en retour
  id?: number;
  liasseNumber?: string;
  siren?: string;
  status?: string;
  updated?: string;
  referenceClientMandataire?: string;
  nomDossier?: string;
  signedDate?: string;
  statusDate?: string;
  formeJuridique?: string;
}

// --- Signature ---

export interface InpiSignatureRequest {
  formality?: string; // "/api/formalities/{id}"
  annualAccount?: string; // "/api/annual_accounts/{id}"
  signedDocument?: string; // "/api/attachments/{id}" (pour signature avancée)
}

export interface InpiSignatureResponse {
  id: number;
  formality?: string;
  annualAccount?: string;
  user?: string;
  userName?: string;
  userFirstName?: string;
  companyName?: string;
  signedDocument?: string;
  created: string;
}

// --- Paiement ---

export interface InpiPaymentRequest {
  login: string; // Compte client INPI login
  password: string; // Compte client INPI password
  paymentType: "CCL"; // Toujours CCL pour l'API
  formality?: string; // "/api/formalities/{id}"
  annualAccount?: string; // "/api/annual_accounts/{id}"
  acteDeposit?: string; // "/api/acte_deposits/{id}"
  payer?: {
    adresse?: InpiAdresse;
  };
}

export interface InpiPaymentResponse {
  code: number;
  detail?: string;
  orderNum?: string;
  numnat?: string;
  idTransaction?: string;
  idPayment?: string;
  status?: string;
  formality?: {
    id: number;
    attachments?: InpiAttachment[];
    numNat?: string;
  };
}

export interface InpiCustomerBalance {
  login: string;
  customerBalance: number; // En centimes
}

// --- Délégation de paiement ---

export interface InpiDelegationPayment {
  id: number;
  status: string;
  cart: {
    id: number;
    total?: number;
    paymentDate?: string;
    status?: string;
    created?: string;
  };
  payerMail?: string;
  designation?: string;
  organisationMandataire?: string;
  contributorId?: number;
  contributorDesignation?: string;
  activated: boolean;
  created: string;
}

export interface InpiDelegationPaymentCreate {
  cart: string; // "/api/carts/{id}"
  payerMail: string;
}

// --- Régularisation ---

export interface InpiRegularizationRequest {
  id: number;
  // Détails de la demande de régularisation
  annualAccountValidationRequest?: {
    annualAccount?: {
      id: number;
    };
  };
}

// --- Transfert ---

export interface InpiTransferRequest {
  newOwnerId: number;
}

// --- Accès aux dépôts ---

export interface InpiAccessDepositRequest {
  owner: string; // "/api/users/{id}"
  users: string[]; // ["/api/users/{id}", ...]
}

// --- Paramètres de requête ---

export interface InpiFormalitesListParams {
  status?: InpiStatutFormalite | InpiStatutFormalite[];
  "order[updated]"?: "asc" | "desc";
  "order[created]"?: "asc" | "desc";
  page?: number;
  itemsPerPage?: number;
  referenceClientMandataire?: string;
}

export interface InpiAnnualAccountsListParams {
  status?: string | string[];
  "order[updated]"?: "asc" | "desc";
  "order[created]"?: "asc" | "desc";
  page?: number;
  itemsPerPage?: number;
  referenceClientMandataire?: string;
}

// --- Erreurs INPI ---

export interface InpiError {
  webservice_code: string;
  error_id: string;
  http_code: number;
  message: string;
  code: number;
}

export interface InpiValidationError {
  title: string;
  detail: string;
  violations?: Array<{
    propertyPath: string;
    message: string;
    code: string;
  }>;
}

// Codes d'erreur connus
export const INPI_ERROR_CODES = {
  // Utilisateur (1XXX)
  INVALID_TOKEN: "1001",
  NOT_INPI_ADMIN: "1002",
  MUST_BE_USER: "1003",
  FAILED_LOGIN: "1004",
  AUTH_FAILURE: "1005",
  NOT_MANDATAIRE: "1007",
  USER_NOT_FOUND: "1010",
  NOT_ALLOWED: "1011",
  SSO_FAILED: "1014",
  USER_INACTIVE: "1015",
  // Formalité (2XXX)
  FORMALITY_NOT_FOUND: "2000",
  ALREADY_SIGNED: "2002",
  SIGNATURE_VALIDATION_FAILED: "2006",
  SIGNATURE_NOT_VALID: "2007",
  POST_FORMALITY_ERROR: "2009",
  POST_FORMALITY_UPDATE_ERROR: "2010",
  SYNTHESIS_NOT_FOUND: "2012",
  SUBMIT_FORMALITY_FAILED: "2022",
  FORMALITY_ACCESS_DENIED: "2024",
  FORMALITY_BLOCKED: "2025",
  FORMALITY_DELETE_SIGNED: "2026",
  // Paiement (4XXX)
  PAYMENT_ERROR: "4000",
  PAYMENT_PENDING: "4002",
  DEPOSIT_NOT_FOUND: "4005",
  NOT_SIGNED: "4007",
  // Pièces jointes (5XXX)
  ATTACHMENT_ERROR: "5000",
  ATTACHMENT_FILE_REQUIRED: "5001",
  ATTACHMENT_NOT_FOUND_DB: "5004",
  ATTACHMENT_NOT_FOUND_SERVER: "5005",
  ATTACHMENT_DUPLICATE: "5009",
  ATTACHMENT_VIRUS: "5010",
  // Comptes annuels (9XXX)
  ANNUAL_ACCOUNT_ERROR: "9000",
  ANNUAL_ACCOUNT_ACCESS_DENIED: "9004",
  ANNUAL_ACCOUNT_BLOCKED: "9005",
} as const;
