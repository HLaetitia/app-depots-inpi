// ============================================================
// Client API INPI — Guichet Unique
// Basé sur le Contrat d'interface juin 2025
// ============================================================

import {
  INPI_BASE_URLS,
  type InpiEnvironment,
  type InpiAuthConfig,
  type InpiFormalite,
  type InpiFormalitesListParams,
  type InpiAttachment,
  type InpiAttachmentUpload,
  type InpiSignatureRequest,
  type InpiSignatureResponse,
  type InpiPaymentRequest,
  type InpiPaymentResponse,
  type InpiCustomerBalance,
  type InpiComptesAnnuels,
  type InpiAnnualAccountsListParams,
  type InpiTransferRequest,
  type InpiDelegationPayment,
  type InpiDelegationPaymentCreate,
  type InpiRegularizationRequest,
  type InpiAccessDepositRequest,
  type InpiError,
} from "@/types/inpi";

// ============================================================
// Configuration
// ============================================================

const DEFAULT_CONFIG: InpiAuthConfig = {
  environment: "demo",
};

let currentConfig: InpiAuthConfig = { ...DEFAULT_CONFIG };

export function configureInpi(config: Partial<InpiAuthConfig>) {
  currentConfig = { ...currentConfig, ...config };
}

export function getInpiConfig(): InpiAuthConfig {
  return { ...currentConfig };
}

function getBaseUrl(): string {
  return INPI_BASE_URLS[currentConfig.environment];
}

// ============================================================
// HTTP Client utilitaire
// ============================================================

class InpiApiError extends Error {
  public httpCode: number;
  public errorId?: string;
  public webserviceCode?: string;

  constructor(message: string, httpCode: number, errorId?: string, webserviceCode?: string) {
    super(message);
    this.name = "InpiApiError";
    this.httpCode = httpCode;
    this.errorId = errorId;
    this.webserviceCode = webserviceCode;
  }
}

async function inpiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Ajouter le token de session si disponible
  if (currentConfig.sessionToken) {
    headers["Authorization"] = `Bearer ${currentConfig.sessionToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Gérer les réponses sans contenu
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    const error = data as InpiError;
    throw new InpiApiError(
      error.message || `Erreur HTTP ${response.status}`,
      response.status,
      error.error_id,
      error.webservice_code
    );
  }

  return data as T;
}

async function inpiRequestBlob(endpoint: string): Promise<Blob> {
  const url = `${getBaseUrl()}${endpoint}`;

  const headers: Record<string, string> = {
    Accept: "application/pdf",
  };

  if (currentConfig.sessionToken) {
    headers["Authorization"] = `Bearer ${currentConfig.sessionToken}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new InpiApiError(
      `Erreur lors du téléchargement: ${response.status}`,
      response.status
    );
  }

  return response.blob();
}

// ============================================================
// 1. AUTHENTIFICATION
// ============================================================

/**
 * Authentification SSO via JWT token
 * POST /api/user/login/sso
 */
export async function login(jwtToken: string): Promise<string> {
  const data = await inpiRequest<{ token: string }>("/api/user/login/sso", {
    method: "POST",
    body: JSON.stringify({ token: jwtToken }),
  });

  currentConfig.sessionToken = data.token;
  return data.token;
}

/**
 * Vérifie si une session est active
 */
export function isAuthenticated(): boolean {
  return !!currentConfig.sessionToken;
}

/**
 * Déconnexion (suppression du token local)
 */
export function logout(): void {
  currentConfig.sessionToken = undefined;
}

// ============================================================
// 2. FORMALITÉS
// ============================================================

/**
 * Créer une formalité
 * POST /api/formalities
 */
export async function createFormality(
  formalite: InpiFormalite
): Promise<InpiFormalite> {
  return inpiRequest<InpiFormalite>("/api/formalities", {
    method: "POST",
    body: JSON.stringify(formalite),
  });
}

/**
 * Modifier une formalité (création d'une formalité de modification)
 * POST /api/formality_updates
 */
export async function createFormalityUpdate(
  formalite: InpiFormalite
): Promise<InpiFormalite> {
  return inpiRequest<InpiFormalite>("/api/formality_updates", {
    method: "POST",
    body: JSON.stringify(formalite),
  });
}

/**
 * Lister les formalités avec filtres
 * GET /api/formalities
 */
export async function listFormalities(
  params?: InpiFormalitesListParams
): Promise<InpiFormalite[]> {
  const searchParams = new URLSearchParams();

  if (params) {
    if (params.status) {
      if (Array.isArray(params.status)) {
        params.status.forEach((s) => searchParams.append("status[]", s));
      } else {
        searchParams.set("status", params.status);
      }
    }
    if (params["order[updated]"])
      searchParams.set("order[updated]", params["order[updated]"]);
    if (params["order[created]"])
      searchParams.set("order[created]", params["order[created]"]);
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.itemsPerPage)
      searchParams.set("itemsPerPage", params.itemsPerPage.toString());
    if (params.referenceClientMandataire)
      searchParams.set(
        "referenceClientMandataire",
        params.referenceClientMandataire
      );
  }

  const query = searchParams.toString();
  const endpoint = `/api/formalities${query ? `?${query}` : ""}`;

  return inpiRequest<InpiFormalite[]>(endpoint);
}

/**
 * Récupérer le détail d'une formalité
 * GET /api/formalities/{id}
 */
export async function getFormality(id: number): Promise<InpiFormalite> {
  return inpiRequest<InpiFormalite>(`/api/formalities/${id}`);
}

/**
 * Version allégée (sans le content complet)
 * GET /api/formalities/{id}?groups[]=formality:read:no-content
 */
export async function getFormalityLight(id: number): Promise<InpiFormalite> {
  return inpiRequest<InpiFormalite>(
    `/api/formalities/${id}?groups[]=formality:read:no-content`
  );
}

/**
 * Mettre à jour une formalité (régularisation)
 * PUT /api/formalities/{id}
 */
export async function updateFormality(
  id: number,
  formalite: InpiFormalite
): Promise<InpiFormalite> {
  return inpiRequest<InpiFormalite>(`/api/formalities/${id}`, {
    method: "PUT",
    body: JSON.stringify(formalite),
  });
}

/**
 * Supprimer une formalité non payée
 * DELETE /api/formalities/{id}
 */
export async function deleteFormality(id: number): Promise<void> {
  await inpiRequest<void>(`/api/formalities/${id}`, {
    method: "DELETE",
  });
}

/**
 * Récupérer l'historique des statuts
 * GET /api/formalities/{id}/formality_status_histories
 */
export async function getFormalityStatusHistory(
  id: number
): Promise<Array<{ status: string; date: string }>> {
  return inpiRequest(`/api/formalities/${id}/formality_status_histories`);
}

/**
 * Transférer une formalité à un autre utilisateur
 * PUT /api/formalities/{id}/transfer_agent
 */
export async function transferFormality(
  id: number,
  transfer: InpiTransferRequest
): Promise<void> {
  await inpiRequest<void>(`/api/formalities/${id}/transfer_agent`, {
    method: "PUT",
    body: JSON.stringify(transfer),
  });
}

/**
 * Transférer un brouillon de formalité
 * PUT /api/formality_drafts/{id}/transfer_agent
 */
export async function transferFormalityDraft(
  id: number,
  transfer: InpiTransferRequest
): Promise<void> {
  await inpiRequest<void>(`/api/formality_drafts/${id}/transfer_agent`, {
    method: "PUT",
    body: JSON.stringify(transfer),
  });
}

// ============================================================
// 3. PIÈCES JOINTES
// ============================================================

/**
 * Upload d'une pièce jointe
 * POST /api/attachments
 */
export async function uploadAttachment(
  attachment: InpiAttachmentUpload
): Promise<InpiAttachment> {
  return inpiRequest<InpiAttachment>("/api/attachments", {
    method: "POST",
    body: JSON.stringify(attachment),
  });
}

/**
 * Upload d'une pièce jointe pour une formalité spécifique
 * POST /api/formalities/{id}/attachments
 */
export async function uploadFormalityAttachment(
  formalityId: number,
  attachment: InpiAttachmentUpload
): Promise<InpiAttachment> {
  return inpiRequest<InpiAttachment>(
    `/api/formalities/${formalityId}/attachments`,
    {
      method: "POST",
      body: JSON.stringify(attachment),
    }
  );
}

/**
 * Lister les pièces jointes d'une formalité
 * GET /api/formalities/{id}/attachments
 */
export async function listFormalityAttachments(
  formalityId: number
): Promise<InpiAttachment[]> {
  return inpiRequest<InpiAttachment[]>(
    `/api/formalities/${formalityId}/attachments`
  );
}

/**
 * Récupérer les informations d'une pièce jointe
 * GET /api/attachments/{id}
 */
export async function getAttachment(id: number): Promise<InpiAttachment> {
  return inpiRequest<InpiAttachment>(`/api/attachments/${id}`);
}

/**
 * Télécharger le fichier d'une pièce jointe
 * GET /api/attachments/{id}/file
 */
export async function downloadAttachmentFile(id: number): Promise<Blob> {
  return inpiRequestBlob(`/api/attachments/${id}/file`);
}

/**
 * Supprimer une pièce jointe
 * DELETE /api/attachments/{id}
 */
export async function deleteAttachment(id: number): Promise<void> {
  await inpiRequest<void>(`/api/attachments/${id}`, {
    method: "DELETE",
  });
}

/**
 * Télécharger toutes les PJ d'une formalité en ZIP
 * GET /api/formalities/{id}/attachments.zip
 */
export async function downloadFormalityAttachmentsZip(
  formalityId: number
): Promise<Blob> {
  return inpiRequestBlob(`/api/formalities/${formalityId}/attachments.zip`);
}

// ============================================================
// 4. SYNTHÈSE PDF
// ============================================================

/**
 * Récupérer le PDF de synthèse d'une formalité
 * GET /api/formalities/{id}/synthesis
 */
export async function getFormalitySynthesis(
  formalityId: number
): Promise<Blob> {
  return inpiRequestBlob(`/api/formalities/${formalityId}/synthesis`);
}

/**
 * Récupérer les métadonnées de la synthèse
 * GET /api/formalities/{id}/synthesis_content
 */
export async function getFormalitySynthesisContent(
  formalityId: number
): Promise<InpiAttachment> {
  return inpiRequest<InpiAttachment>(
    `/api/formalities/${formalityId}/synthesis_content`
  );
}

/**
 * Récupérer le PDF de synthèse des bénéficiaires effectifs
 * GET /api/formalities/{id}/synthesis_be
 */
export async function getFormalitySynthesisBE(
  formalityId: number
): Promise<Blob> {
  return inpiRequestBlob(`/api/formalities/${formalityId}/synthesis_be`);
}

/**
 * Récupérer les métadonnées de la synthèse BE
 * GET /api/formalities/{id}/synthesis_be_content
 */
export async function getFormalitySynthesisBEContent(
  formalityId: number
): Promise<InpiAttachment> {
  return inpiRequest<InpiAttachment>(
    `/api/formalities/${formalityId}/synthesis_be_content`
  );
}

// ============================================================
// 5. SIGNATURE
// ============================================================

/**
 * Signer une formalité (simple pour création, avancée pour modification)
 * POST /api/signatures
 *
 * Signature simple (création):
 *   { formality: "/api/formalities/{id}" }
 *
 * Signature avancée (modification/cessation):
 *   { formality: "/api/formalities/{id}", signedDocument: "/api/attachments/{id}" }
 *
 * Signature comptes annuels:
 *   { annualAccount: "/api/annual_accounts/{id}", signedDocument: "/api/attachments/{id}" }
 */
export async function signDeposit(
  signatureRequest: InpiSignatureRequest
): Promise<InpiSignatureResponse> {
  return inpiRequest<InpiSignatureResponse>("/api/signatures", {
    method: "POST",
    body: JSON.stringify(signatureRequest),
  });
}

/**
 * Signer une formalité de création (signature simple)
 */
export async function signFormalitySimple(
  formalityId: number
): Promise<InpiSignatureResponse> {
  return signDeposit({
    formality: `/api/formalities/${formalityId}`,
  });
}

/**
 * Signer une formalité de modification/cessation (signature avancée)
 * Nécessite d'avoir uploadé le PDF de synthèse signé en PJ_115
 */
export async function signFormalityAdvanced(
  formalityId: number,
  signedDocumentAttachmentId: number
): Promise<InpiSignatureResponse> {
  return signDeposit({
    formality: `/api/formalities/${formalityId}`,
    signedDocument: `/api/attachments/${signedDocumentAttachmentId}`,
  });
}

/**
 * Signer un dépôt de comptes annuels
 */
export async function signAnnualAccount(
  annualAccountId: number,
  signedDocumentAttachmentId: number
): Promise<InpiSignatureResponse> {
  return signDeposit({
    annualAccount: `/api/annual_accounts/${annualAccountId}`,
    signedDocument: `/api/attachments/${signedDocumentAttachmentId}`,
  });
}

// ============================================================
// 6. PAIEMENT
// ============================================================

/**
 * Payer une formalité via le compte client INPI
 * POST /api/payment
 */
export async function payDeposit(
  payment: InpiPaymentRequest
): Promise<InpiPaymentResponse> {
  return inpiRequest<InpiPaymentResponse>("/api/payment", {
    method: "POST",
    body: JSON.stringify(payment),
  });
}

/**
 * Payer une formalité (raccourci)
 */
export async function payFormality(
  formalityId: number,
  payerAddress?: InpiPaymentRequest["payer"]
): Promise<InpiPaymentResponse> {
  if (!currentConfig.cclLogin || !currentConfig.cclPassword) {
    throw new InpiApiError(
      "Identifiants du compte client INPI (CCL) non configurés",
      400
    );
  }

  return payDeposit({
    login: currentConfig.cclLogin,
    password: currentConfig.cclPassword,
    paymentType: "CCL",
    formality: `/api/formalities/${formalityId}`,
    payer: payerAddress,
  });
}

/**
 * Payer un dépôt de comptes annuels (raccourci)
 */
export async function payAnnualAccount(
  annualAccountId: number,
  payerAddress?: InpiPaymentRequest["payer"]
): Promise<InpiPaymentResponse> {
  if (!currentConfig.cclLogin || !currentConfig.cclPassword) {
    throw new InpiApiError(
      "Identifiants du compte client INPI (CCL) non configurés",
      400
    );
  }

  return payDeposit({
    login: currentConfig.cclLogin,
    password: currentConfig.cclPassword,
    paymentType: "CCL",
    annualAccount: `/api/annual_accounts/${annualAccountId}`,
    payer: payerAddress,
  });
}

/**
 * Consulter le solde du compte client INPI
 * POST /api/customer-balance
 */
export async function getCustomerBalance(): Promise<InpiCustomerBalance> {
  if (!currentConfig.cclLogin || !currentConfig.cclPassword) {
    throw new InpiApiError(
      "Identifiants du compte client INPI (CCL) non configurés",
      400
    );
  }

  return inpiRequest<InpiCustomerBalance>("/api/customer-balance", {
    method: "POST",
    body: JSON.stringify({
      login: currentConfig.cclLogin,
      password: currentConfig.cclPassword,
    }),
  });
}

// ============================================================
// 7. COMPTES ANNUELS
// ============================================================

/**
 * Créer un dépôt de comptes annuels
 * POST /api/annual_accounts
 */
export async function createAnnualAccount(
  account: InpiComptesAnnuels
): Promise<InpiComptesAnnuels> {
  return inpiRequest<InpiComptesAnnuels>("/api/annual_accounts", {
    method: "POST",
    body: JSON.stringify(account),
  });
}

/**
 * Lister les dépôts de comptes annuels
 * GET /api/annual_accounts
 */
export async function listAnnualAccounts(
  params?: InpiAnnualAccountsListParams
): Promise<InpiComptesAnnuels[]> {
  const searchParams = new URLSearchParams();

  if (params) {
    if (params.status) {
      if (Array.isArray(params.status)) {
        params.status.forEach((s) => searchParams.append("status[]", s));
      } else {
        searchParams.set("status", params.status);
      }
    }
    if (params["order[updated]"])
      searchParams.set("order[updated]", params["order[updated]"]);
    if (params["order[created]"])
      searchParams.set("order[created]", params["order[created]"]);
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.itemsPerPage)
      searchParams.set("itemsPerPage", params.itemsPerPage.toString());
    if (params.referenceClientMandataire)
      searchParams.set(
        "referenceClientMandataire",
        params.referenceClientMandataire
      );
  }

  const query = searchParams.toString();
  return inpiRequest<InpiComptesAnnuels[]>(
    `/api/annual_accounts${query ? `?${query}` : ""}`
  );
}

/**
 * Détail d'un dépôt de comptes annuels
 * GET /api/annual_accounts/{id}
 */
export async function getAnnualAccount(
  id: number
): Promise<InpiComptesAnnuels> {
  return inpiRequest<InpiComptesAnnuels>(`/api/annual_accounts/${id}`);
}

/**
 * Version allégée
 * GET /api/annual_accounts/{id}?groups[]=annual_accounts:read:no-content
 */
export async function getAnnualAccountLight(
  id: number
): Promise<InpiComptesAnnuels> {
  return inpiRequest<InpiComptesAnnuels>(
    `/api/annual_accounts/${id}?groups[]=annual_accounts:read:no-content`
  );
}

/**
 * Mettre à jour un dépôt (régularisation)
 * PUT /api/annual_accounts/{id}
 */
export async function updateAnnualAccount(
  id: number,
  account: InpiComptesAnnuels
): Promise<InpiComptesAnnuels> {
  return inpiRequest<InpiComptesAnnuels>(`/api/annual_accounts/${id}`, {
    method: "PUT",
    body: JSON.stringify(account),
  });
}

/**
 * Supprimer un dépôt non payé
 * DELETE /api/annual_accounts/{id}
 */
export async function deleteAnnualAccount(id: number): Promise<void> {
  await inpiRequest<void>(`/api/annual_accounts/${id}`, {
    method: "DELETE",
  });
}

/**
 * Lister les PJ d'un dépôt de comptes annuels
 * GET /api/annual_accounts/{id}/attachments
 */
export async function listAnnualAccountAttachments(
  id: number
): Promise<InpiAttachment[]> {
  return inpiRequest<InpiAttachment[]>(
    `/api/annual_accounts/${id}/attachments`
  );
}

/**
 * Upload PJ pour un dépôt de comptes annuels
 * POST /api/annual_accounts/{id}/attachments
 */
export async function uploadAnnualAccountAttachment(
  id: number,
  attachment: InpiAttachmentUpload
): Promise<InpiAttachment> {
  return inpiRequest<InpiAttachment>(
    `/api/annual_accounts/${id}/attachments`,
    {
      method: "POST",
      body: JSON.stringify(attachment),
    }
  );
}

/**
 * Historique des statuts d'un dépôt de comptes annuels
 * GET /api/annual_accounts/{id}/formality_status_histories
 */
export async function getAnnualAccountStatusHistory(
  id: number
): Promise<Array<{ status: string; date: string }>> {
  return inpiRequest(
    `/api/annual_accounts/${id}/formality_status_histories`
  );
}

/**
 * Transférer un dépôt de comptes annuels
 * PUT /api/annual_accounts/{id}/transfer_agent
 */
export async function transferAnnualAccount(
  id: number,
  transfer: InpiTransferRequest
): Promise<void> {
  await inpiRequest<void>(`/api/annual_accounts/${id}/transfer_agent`, {
    method: "PUT",
    body: JSON.stringify(transfer),
  });
}

/**
 * Transférer un brouillon de comptes annuels
 * PUT /api/annual_account_drafts/{id}/transfer_agent
 */
export async function transferAnnualAccountDraft(
  id: number,
  transfer: InpiTransferRequest
): Promise<void> {
  await inpiRequest<void>(
    `/api/annual_account_drafts/${id}/transfer_agent`,
    {
      method: "PUT",
      body: JSON.stringify(transfer),
    }
  );
}

// ============================================================
// 8. DÉPÔTS D'ACTES
// ============================================================

/**
 * Transférer un dépôt d'acte
 * PUT /api/acte_deposits/{id}/transfer_agent
 */
export async function transferActeDeposit(
  id: number,
  transfer: InpiTransferRequest
): Promise<void> {
  await inpiRequest<void>(`/api/acte_deposits/${id}/transfer_agent`, {
    method: "PUT",
    body: JSON.stringify(transfer),
  });
}

/**
 * Transférer un brouillon de dépôt d'acte
 * PUT /api/acte_deposit_drafts/{id}/transfer_agent
 */
export async function transferActeDepositDraft(
  id: number,
  transfer: InpiTransferRequest
): Promise<void> {
  await inpiRequest<void>(
    `/api/acte_deposit_drafts/${id}/transfer_agent`,
    {
      method: "PUT",
      body: JSON.stringify(transfer),
    }
  );
}

// ============================================================
// 9. RÉGULARISATION
// ============================================================

/**
 * Lister les demandes de régularisation
 * GET /api/regularization_requests
 */
export async function listRegularizationRequests(): Promise<
  InpiRegularizationRequest[]
> {
  return inpiRequest<InpiRegularizationRequest[]>(
    "/api/regularization_requests"
  );
}

/**
 * Demandes de régularisation pour un dépôt de comptes annuels
 * GET /api/regularization_requests?annualAccountValidationRequest.annualAccount={id}
 */
export async function getRegularizationRequestsForAnnualAccount(
  annualAccountId: number
): Promise<InpiRegularizationRequest[]> {
  return inpiRequest<InpiRegularizationRequest[]>(
    `/api/regularization_requests?annualAccountValidationRequest.annualAccount=${annualAccountId}`
  );
}

/**
 * Indiquer qu'une régularisation est effectuée
 * PUT /api/regularization_requests/{id}
 */
export async function updateRegularizationRequest(
  regularizationId: number
): Promise<void> {
  await inpiRequest<void>(
    `/api/regularization_requests/${regularizationId}`,
    {
      method: "PUT",
    }
  );
}

// ============================================================
// 10. DÉLÉGATION DE PAIEMENT
// ============================================================

/**
 * Créer une délégation de paiement
 * POST /api/delegation-payments
 */
export async function createDelegationPayment(
  delegation: InpiDelegationPaymentCreate
): Promise<InpiDelegationPayment> {
  return inpiRequest<InpiDelegationPayment>("/api/delegation-payments", {
    method: "POST",
    body: JSON.stringify(delegation),
  });
}

/**
 * Activer/désactiver une délégation
 * PATCH /api/delegation-payments/{id}
 */
export async function toggleDelegationPayment(
  delegationId: number,
  activated: boolean
): Promise<InpiDelegationPayment> {
  return inpiRequest<InpiDelegationPayment>(
    `/api/delegation-payments/${delegationId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ activated }),
    }
  );
}

/**
 * Lister les délégations d'un dépôt
 * GET /api/delegation-payments?depositType={type}&depositId={id}
 */
export async function listDelegationPayments(
  depositType: "formality" | "annual_account" | "acte_deposit",
  depositId: number
): Promise<InpiDelegationPayment[]> {
  return inpiRequest<InpiDelegationPayment[]>(
    `/api/delegation-payments?depositType=${depositType}&depositId=${depositId}`
  );
}

/**
 * Lister les délégations de l'utilisateur connecté
 * GET /api/delegation-payments
 */
export async function listMyDelegationPayments(): Promise<
  InpiDelegationPayment[]
> {
  return inpiRequest<InpiDelegationPayment[]>("/api/delegation-payments");
}

// ============================================================
// 11. GESTION DES UTILISATEURS
// ============================================================

/**
 * Donner accès en consultation aux dépôts d'un utilisateur
 * POST /api/access_deposit_requests
 */
export async function grantDepositAccess(
  access: InpiAccessDepositRequest
): Promise<void> {
  await inpiRequest<void>("/api/access_deposit_requests", {
    method: "POST",
    body: JSON.stringify(access),
  });
}

/**
 * Supprimer un accès en consultation
 * DELETE /api/access_deposit_requests
 */
export async function revokeDepositAccess(
  access: InpiAccessDepositRequest
): Promise<void> {
  await inpiRequest<void>("/api/access_deposit_requests", {
    method: "DELETE",
    body: JSON.stringify(access),
  });
}

/**
 * Activer/désactiver un utilisateur
 * PUT /api/users/{id}/active
 */
export async function setUserActive(
  userId: number,
  active: boolean
): Promise<void> {
  await inpiRequest<void>(`/api/users/${userId}/active`, {
    method: "PUT",
    body: JSON.stringify({ active }),
  });
}

// ============================================================
// 12. EXPORT
// ============================================================

/**
 * Exporter la liste des communes INSEE en CSV
 * GET /api/communes_csv
 */
export async function exportCommunesCsv(): Promise<string> {
  const url = `${getBaseUrl()}/api/communes_csv`;

  const headers: Record<string, string> = {};
  if (currentConfig.sessionToken) {
    headers["Authorization"] = `Bearer ${currentConfig.sessionToken}`;
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new InpiApiError(
      `Erreur lors de l'export des communes`,
      response.status
    );
  }

  return response.text();
}

// ============================================================
// UTILITAIRES
// ============================================================

/**
 * Convertir un fichier en base64 pour l'upload INPI
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extraire seulement la partie base64 (après "data:...;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Préparer une pièce jointe pour l'upload depuis un fichier browser
 */
export async function prepareAttachment(
  file: File,
  typeDocument: string,
  sousTypeDocument?: string
): Promise<InpiAttachmentUpload> {
  const base64 = await fileToBase64(file);
  const extension = file.name.split(".").pop()?.toLowerCase() || "pdf";

  return {
    nomDocument: file.name,
    typeDocument,
    langueDocument: "fr",
    documentBase64: base64,
    documentExtension: extension,
    sousTypeDocument,
  };
}

/**
 * Workflow complet : Soumettre une formalité de création
 * 1. Créer la formalité
 * 2. Signer (signature simple)
 * 3. Payer (si nécessaire)
 */
export async function submitCreationFormality(
  formalite: InpiFormalite,
  payerAddress?: InpiPaymentRequest["payer"]
): Promise<{
  formality: InpiFormalite;
  signature: InpiSignatureResponse;
  payment?: InpiPaymentResponse;
}> {
  // Étape 1 : Créer
  const createdFormality = await createFormality(formalite);

  if (!createdFormality.id) {
    throw new InpiApiError("Pas d'ID retourné par l'INPI", 500);
  }

  // Étape 2 : Signer (signature simple pour une création)
  const signature = await signFormalitySimple(createdFormality.id);

  // Étape 3 : Payer (si compte client configuré)
  let payment: InpiPaymentResponse | undefined;
  if (currentConfig.cclLogin && currentConfig.cclPassword) {
    payment = await payFormality(createdFormality.id, payerAddress);
  }

  return { formality: createdFormality, signature, payment };
}

/**
 * Workflow complet : Soumettre une formalité de modification
 * 1. Créer la formalité de modification
 * 2. Télécharger la synthèse PDF (PJ_99)
 * 3. L'utilisateur signe avec certificat RGS (étape externe)
 * 4. Uploader le document signé (PJ_115)
 * 5. Signer (signature avancée)
 * 6. Payer
 */
export async function initiateModificationFormality(
  formalite: InpiFormalite
): Promise<{
  formality: InpiFormalite;
  synthesisUrl: string;
}> {
  // Étape 1 : Créer la formalité de modification
  const createdFormality = await createFormalityUpdate(formalite);

  if (!createdFormality.id) {
    throw new InpiApiError("Pas d'ID retourné par l'INPI", 500);
  }

  // Étape 2 : L'URL de la synthèse sera disponible après traitement INPI
  const synthesisUrl = `${getBaseUrl()}/api/formalities/${createdFormality.id}/synthesis`;

  return { formality: createdFormality, synthesisUrl };
}

// Export du type d'erreur pour usage dans les composants
export { InpiApiError };
