import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AUTH_SDK_CONFIG, AuthSDKConfig } from '@exim/auth-sdk';
import { environment } from '@environments/environments';
import {
  ConsentRequestResponse,
  SubmitConsentRequest,
} from './consent-register.model';
import {
  TacConsentStatusResponse,
  TacPendingNoticesApiResponse,
} from '../../tac-consent/tac-consent.model';

@Injectable({
  providedIn: 'root',
})
export class ConsentRegisterService {
  private readonly http = inject(HttpClient);
  private readonly config = inject<AuthSDKConfig>(AUTH_SDK_CONFIG);
  private readonly baseUrl = `${this.config.servicePaths?.baseDomain}/${this.config.servicePaths?.consent}`;
  private readonly collectionPointId = environment.consent.collectionPointId;
  private readonly organizationId = environment.consent.organizationId;

  getConsentRegister(): Observable<ConsentRequestResponse> {
    return this.http.get<ConsentRequestResponse>(`${this.baseUrl}/v1/notice`, {
      params: { collectionPointId: this.collectionPointId },
    });
  }

  /** SA-1150 — GET /v1/pending-notices: ตรวจสถานะว่า user ต้อง accept T&C หรือไม่ */
  getPendingNotices(identifier: string): Observable<TacConsentStatusResponse> {
    return this.http
      .get<TacPendingNoticesApiResponse>(`${this.baseUrl}/v1/pending-notices`, {
        params: { collectionPointId: this.collectionPointId, identifier },
      })
      .pipe(
        map((res) => {
          const noticeList = res.data?.noticeList ?? [];
          // ถ้ามี noticeList → ต้อง consent, ไม่งั้นถือว่า accepted แล้ว
          const hasPending = noticeList.length > 0;
          return {
            status: hasPending ? 'NOT_ACCEPTED' : 'ACCEPTED',
            hasPendingConsent: hasPending,
            pendingNotices: noticeList,
          } as TacConsentStatusResponse;
        }),
      );
  }

  submitConsent(
    identifier: string,
    email: string,
    purposes: SubmitConsentRequest['purposes'],
  ): Observable<null> {
    const request: SubmitConsentRequest = {
      organizationId: this.organizationId,
      collectionPointId: this.collectionPointId,
      identifier,
      email,
      purposes,
    };
    return this.http.post<null>(`${this.baseUrl}/v1/receipt`, request);
  }

  getConsentUserSettings(
    identifier: string,
  ): Observable<ConsentRequestResponse> {
    return this.http.get<ConsentRequestResponse>(
      `${this.baseUrl}/v1/preference`,
      {
        params: {
          collectionPointId: this.collectionPointId,
          identifier,
        },
      },
    );
  }
}
