export interface GenerateDocumentNumberRequest {
  configCode: string;
}

export interface GenerateDocumentNumberData {
  documentNumber: string;
  configCode: string;
  generatedAt: string;
  generatedBy: string | null;
}

export interface CurrentRunningNumberData {
  configCode: string;
  formatPattern: string;
  resetCycle: string;
  currentNumber: number;
  lastResetAt: string;
  nextDocumentNumber: string;
}

export interface ResetDocumentNumberData {
  configCode: string;
  previousNumber: number;
  resetTo: number;
  startNumber: number;
  resetAt: string;
}

export interface DocumentNumberApiResponse<TData> {
  isSuccess?: boolean;
  data: TData | null;
  meta?: unknown;
  error?: {
    code?: string;
    message?: string;
    details?: string;
  };
}

export interface DocumentNumberListItem {
  configCode: string;
  formatPattern: string;
  resetCycle: string;
  currentNumber: number;
  lastResetAt: string;
  nextDocumentNumber: string;
}

export interface DocumentNumberListError {
  configCode: string;
  message: string;
}

export interface DocumentNumberPolicyItem {
  id: string;
  policyCode: string;
  description: string;
  status: string;
  formatPattern: string;
  resetCycle: string;
}

export interface CodexEnvelope<TData> {
  data: TData;
  meta?: unknown;
}
