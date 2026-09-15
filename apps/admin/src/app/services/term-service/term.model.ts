// ─── Common Types ────────────────────────────────────────────────────────────
export type TermsDocumentStatus = 'PUBLISHED' | 'INACTIVE';
export type ConditionType = 'MANDATORY' | 'OPTIONAL';
export type CustomerType = 'INDIVIDUAL' | 'CORPORATE';

/**
 * How a published version changes relative to the live one.
 * MAJOR (e.g. v1.0 → v2.0) requires users to re-consent; MINOR (e.g. v1.0 → v1.1)
 * carries the previous consent forward (no re-consent prompt on the host app).
 */
export type TermsChangeType = 'MAJOR' | 'MINOR';

// ─── List Documents ──────────────────────────────────────────────────────────
export interface ListDocumentsParams {
  search?: string;
  customerType?: CustomerType;
  conditionType?: ConditionType;
  termsStatus?: TermsDocumentStatus;
  page?: number;
  pageSize?: number;
}

export interface TermsDocumentSummary {
  id: string;
  applicationCode: string;
  documentCode: string;
  title: string;
  customerType: CustomerType;
  conditionType: ConditionType;
  termsStatus: TermsDocumentStatus;
  latestVersion: string | null;
  updatedAt: string | null;
}

export interface ListDocumentsResponse {
  items: TermsDocumentSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
}

// ─── Create Document ─────────────────────────────────────────────────────────
export interface CreateDocumentRequest {
  customerType: CustomerType;
  applicationCode: string;
  title: string;
  operationBy?: string;
  description?: string;
  languageCode?: string;
}

export interface CreateDocumentResponse {
  id: string;
  documentCode: string;
  applicationCode: string;
  customerType: CustomerType;
  status: 'INACTIVE';
  createdAt: string;
}

// ─── Get Document (Detail + Version List) ────────────────────────────────────
export interface TermsVersionSummary {
  id: string;
  version: string;
  status: TermsDocumentStatus;
  createdAt: string;
  createdBy: string;
  operationBy?: string;
}

export interface TermsDocumentDetail {
  id: string;
  documentCode: string;
  title: string;
  applicationCode: string;
  customerType: CustomerType;
  conditionType: ConditionType;
  conditionTitle: string | null;
  operationBy?: string | null;
  versionCount: number;
  latestVersion: string | null;
  updatedAt: string | null;
  createdBy: string;
  versions: TermsVersionSummary[];
}

// ─── Create Version ──────────────────────────────────────────────────────────
export interface ConditionItemRequest {
  consentCode: string;
  inputType: string;
  label: string;
  isRequired: boolean;
  allowReject?: boolean;
  allowWithdraw?: boolean;
  requiresScrollToEnd?: boolean;
  displayOrder?: number;
}

export interface CreateVersionRequest {
  title?: string;
  conditionType: ConditionType;
  conditionTitle?: string;
  effectiveAt: string;
  content: string;
  operationBy?: string;
  conditions: ConditionItemRequest[];
  languageCode?: string;
  // MAJOR/MINOR — finalizes the version number at create time (draft saved Inactive).
  changeType?: TermsChangeType;
}

export interface CreateVersionResponse {
  id: string;
  documentCode: string;
  version: string;
  conditionType: string;
  status: 'INACTIVE';
  effectiveAt: string;
  createdAt: string;
}

// ─── Get Version Detail ──────────────────────────────────────────────────────
export interface TermsVersionDetail {
  id: string;
  documentCode: string;
  name: string;
  version: string;
  conditionType: ConditionType;
  conditionTitle: string | null;
  operationBy?: string | null;
  conditions?: Array<{
    label?: string | null;
    isRequired?: boolean | null;
  }>;
  content: string | null;
  contentType: 'HTML';
  status: TermsDocumentStatus;
  createdAt: string;
  createdBy: string;
}

// ─── Publish Version ─────────────────────────────────────────────────────────
export interface PublishVersionRequest {
  changeType: TermsChangeType;
  operationBy?: string;
}

export interface PublishVersionResponse {
  id: string;
  documentCode: string;
  version: string;
  status: 'PUBLISHED';
  publishedAt: string;
  supersededVersion: string;
}

// ─── Deactivate Version ──────────────────────────────────────────────────────
export interface DeactivateVersionResponse {
  id: string;
  documentCode: string;
  version: string;
  status: 'INACTIVE';
  deactivatedAt: string;
}

// ─── Get Consents ────────────────────────────────────────────────────────────
export interface GetConsentsParams {
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ConsentItem {
  sequenceNo: number;
  name: string;
  email: string;
  decision: 'ACCEPT';
  acceptedAt: string;
}

export interface GetConsentsResponse {
  documentCode: string;
  termName: string;
  version: string;
  totalCount: number;
  items: ConsentItem[];
  page: number;
  pageSize: number;
}
