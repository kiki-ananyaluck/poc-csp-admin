import { ApiResponse } from '@exim/auth-sdk';

export interface OtpInitiateData {
  continuationToken: string;
  refCode: string;
  expiresInSeconds: number;
}

export interface OtpVerifyData {
  sessionId: string;
  tokenSessionId?: string;
}

export interface OtpInitiateRequest {
  tenantKey: string;
  email: string;
}

export interface OtpVerifyRequest {
  tenantKey: string;
  email: string;
  otp: string;
  continuationToken: string;
}

export interface BffAuthErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errorCode: string;
  errors?: Record<string, string[]>;
}

export type BffAuthInitiateResponse = ApiResponse<OtpInitiateData>;
export type BffAuthVerifyResponse = ApiResponse<OtpVerifyData>;
