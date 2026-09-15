import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH_SDK_CONFIG, AuthSDKConfig } from '@exim/auth-sdk';
import {
  OtpInitiateRequest,
  OtpVerifyRequest,
  BffAuthInitiateResponse,
  BffAuthVerifyResponse,
} from './bff-auth.model';

const DEFAULT_TENANT_KEY = 'employee';

@Injectable({ providedIn: 'root' })
export class BffAuthService {
  private readonly http = inject(HttpClient);
  private readonly config = inject<AuthSDKConfig>(AUTH_SDK_CONFIG);
  private readonly baseUrl = `${this.config.servicePaths?.baseDomain}/${this.config.servicePaths?.bff}`;

  initiateOtp(
    email: string,
    tenantKey = DEFAULT_TENANT_KEY,
  ): Observable<BffAuthInitiateResponse> {
    return this.http.post<BffAuthInitiateResponse>(
      `${this.baseUrl}/login-otp/initiate`,
      { tenantKey, email } satisfies OtpInitiateRequest,
    );
  }

  verifyOtp(
    email: string,
    otp: string,
    continuationToken: string,
    tenantKey = DEFAULT_TENANT_KEY,
  ): Observable<BffAuthVerifyResponse> {
    return this.http.post<BffAuthVerifyResponse>(
      `${this.baseUrl}/login-otp/verify`,
      { tenantKey, email, otp, continuationToken } satisfies OtpVerifyRequest,
    );
  }
}
