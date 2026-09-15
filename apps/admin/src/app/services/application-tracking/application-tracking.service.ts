import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environments';
import { ApiResponse } from '@exim/auth-sdk';
import {
  AdminListFlowInstancesParams,
  FlowInstanceHistoryDetail,
  FlowInstanceHistoryList,
  FlowInstanceSummary,
} from './application-tracking.model';

/**
 * Application Tracking — เรียก OnboardingController (UserService) สำหรับ admin
 * base = {baseDomain}/{user}/v1  (user = userservice-api/api/user-service)
 */
@Injectable({ providedIn: 'root' })
export class ApplicationTrackingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.servicePaths['baseDomain']}/${environment.servicePaths['user']}/v1`;

  /** GET admin/flow-instances?status=&stuckOnly= — รายการใบสมัครทั้งหมด (admin) */
  async listFlowInstances(
    params?: AdminListFlowInstancesParams,
  ): Promise<FlowInstanceSummary[]> {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.stuckOnly !== undefined)
      httpParams = httpParams.set('stuckOnly', String(params.stuckOnly));

    const response = await firstValueFrom(
      this.http.get<ApiResponse<FlowInstanceSummary[]>>(
        `${this.baseUrl}/admin/flow-instances`,
        { params: httpParams },
      ),
    );
    return response.data ?? [];
  }

  /** GET onboarding/instances/{id}/history — timeline ของใบสมัคร (ประวัติสถานะ) */
  async getHistory(instanceId: string): Promise<FlowInstanceHistoryList> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<FlowInstanceHistoryList>>(
        `${this.baseUrl}/onboarding/instances/${instanceId}/history`,
      ),
    );
    return response.data ?? { items: [] };
  }

  /** GET onboarding/instances/{id}/history/{historyId} — รายละเอียด 1 transition */
  async getHistoryDetail(
    instanceId: string,
    historyId: string,
  ): Promise<FlowInstanceHistoryDetail> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<FlowInstanceHistoryDetail>>(
        `${this.baseUrl}/onboarding/instances/${instanceId}/history/${historyId}`,
      ),
    );
    return response.data!;
  }

  /** GET onboarding/instances/{id}/application-pdf — ดาวน์โหลดใบสมัคร (PDF blob) */
  async downloadApplicationPdf(instanceId: string): Promise<Blob> {
    return await firstValueFrom(
      this.http.get(
        `${this.baseUrl}/onboarding/instances/${instanceId}/application-pdf`,
        { responseType: 'blob' },
      ),
    );
  }

  /** POST admin/flow-instances/{id}/abandon — admin ยกเลิกใบสมัคร (ตามคำขอ) */
  async abandon(instanceId: string, reason: string): Promise<void> {
    await firstValueFrom(
      this.http.post<ApiResponse<unknown>>(
        `${this.baseUrl}/admin/flow-instances/${instanceId}/abandon`,
        { reason },
      ),
    );
  }
}
