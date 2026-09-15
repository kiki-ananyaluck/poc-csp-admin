import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environments';
import { ApiResponse } from '@exim/auth-sdk';
import { InstanceHistoryResult } from './onboarding.model';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.servicePaths['baseDomain']}/${environment.servicePaths['user']}/v1/onboarding`;

  private historyCache = new Map<string, InstanceHistoryResult>();

  async getInstanceHistory(
    instanceId: string,
    forceRefresh = false,
  ): Promise<InstanceHistoryResult> {
    if (!forceRefresh && this.historyCache.has(instanceId)) {
      const cached = this.historyCache.get(instanceId);
      if (cached) {
        return cached;
      }
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<InstanceHistoryResult>>(
        `${this.baseUrl}/instances/${instanceId}/history`,
      ),
    );

    const result = response.data ?? { items: [], meta: { traceId: '' } };
    this.historyCache.set(instanceId, result);
    return result;
  }

  clearHistoryCache(instanceId?: string): void {
    if (instanceId) {
      this.historyCache.delete(instanceId);
    } else {
      this.historyCache.clear();
    }
  }
}
