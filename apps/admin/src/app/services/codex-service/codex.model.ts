export interface CodexLocalization {
  locale: string;
  label: string;
  description: string;
}

export interface CodexEntry {
  id: string;
  code: string;
  categoryId: string;
  companyId: string | null;
  parentEntryId: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  version: number;
  label: string;
  description: string;
  metadata: unknown;
  localizations: CodexLocalization[];
}

export interface CodexPagination {
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CodexEntriesData {
  items: CodexEntry[];
  pagination: CodexPagination;
}

export interface CodexEntriesResponse {
  data: CodexEntriesData;
  meta: unknown;
}

export interface CodexEntriesParams {
  groupCode?: string;
  categoryCode?: string;
  categoryId: string;
  pageNumber: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
  isActive?: boolean;
}

export interface CodexAppsParams {
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface CodexAppItem {
  id: string;
  appCode: string;
  appName: string;
  isActive: boolean;
}

export interface CodexAppsData {
  items: CodexAppItem[];
}

export interface CodexAppsResponse {
  data: CodexAppsData;
  meta: unknown;
}

export interface CodexImportError {
  rowNumber: number;
  code: string;
  errorCode: string;
  errorMessage: string;
  labelTh?: string;
  labelEn?: string;
}

export interface CodexImportResponse {
  data: {
    totalRows: number;
    inserted: number;
    errors: CodexImportError[];
  };
  meta: unknown;
}

export interface CodexCategory {
  id: string;
  groupId: string;
  code: string;
  nameTH: string;
  nameEN: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
  isEditable: boolean;
  isVisible: boolean;
}

export interface CodexCategoriesResponse {
  data: CodexCategory;
  meta: unknown;
}

export interface CreateEntryRequest {
  categoryId: string;
  code: string;
  companyId: string;
  parentEntryId: string;
  level: number;
  sortOrder: number;
  metadata: string | null;
  localizations: CodexLocalization[];
  isActive: boolean;
}

export interface CreateEntryResponse {
  data: CodexEntry;
  meta: unknown;
}

export interface UpdateEntryRequest {
  id: string;
  sortOrder: number;
  metadata: string | null;
  expectedVersion: number;
  localizations: CodexLocalization[];
  isActive: boolean;
}

export interface UpdateEntryResponse {
  data: CodexEntry;
  meta: unknown;
}
