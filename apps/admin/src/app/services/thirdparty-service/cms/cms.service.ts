import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AUTH_SDK_CONFIG, AuthSDKConfig } from '@exim/auth-sdk';
import { firstValueFrom } from 'rxjs';
import { CmsContentsResponse } from './cms.model';

@Injectable({
  providedIn: 'root',
})
export class CmsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject<AuthSDKConfig>(AUTH_SDK_CONFIG);
  private readonly baseUrl = `${this.config.servicePaths?.baseDomain}/${this.config.servicePaths?.thirdParty}`;

  async getContentsByTag(tag: string): Promise<CmsContentsResponse> {
    return await firstValueFrom(
      this.http.get<CmsContentsResponse>(
        `${this.baseUrl}/v1/cms/admin/contents/${encodeURIComponent(tag)}`,
      ),
    );
  }
}
