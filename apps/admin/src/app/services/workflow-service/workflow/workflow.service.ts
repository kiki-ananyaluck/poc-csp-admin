import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environments';
import { ApiResponse } from '@exim/auth-sdk';
import {
  PendingTask,
  WorkflowInstance,
  CheckDocumentWorkflowResponse,
  CreateInstanceRequest,
  CreateInstanceResponse,
  TakeActionRequest,
  TakeActionResponse,
  ResubmitRequest,
  ForceStopRequest,
  UpdateAssigneesRequest,
  UpdateAssigneesResponse,
  WorkflowTemplate,
  CreateTemplateRequest,
  CreateTemplateResponse,
  PickupActionOutcome,
  PickupWorkflowRequest,
  PickupWorkflowResponse,
  ReworkWorkflowRequest,
} from './workflow.model';
import { HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.servicePaths['baseDomain']}/${environment.servicePaths['workflow']}/v1`;
  private readonly srmWorkflowBaseUrl = `${environment.servicePaths['baseDomain']}/workflow-api/api/workflow-service/v1`;

  // ─── 1. Get My Workflow Tasks APIs ─────────────────────────────────────────────────────────

  async getPendingTasks(userId: string, role: string): Promise<PendingTask[]> {
    const params = new HttpParams().set('userId', userId).set('role', role);
    const res = await firstValueFrom(
      this.http.get<ApiResponse<PendingTask[]>>(
        `${this.baseUrl}/Workflow/tasks/pending`,
        { params },
      ),
    );
    return this.unwrapResponse(res) ?? [];
  }

  // ─── 2. Workflow Instance APIs ────────────────────────────────────────────

  async getInstanceByDocument(documentId: string): Promise<WorkflowInstance> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<WorkflowInstance>>(
        `${this.baseUrl}/Workflow/instances/by-document/${documentId}`,
      ),
    );
    return this.unwrapRequiredResponse(res);
  }

  async checkDocumentWorkflow(
    documentId: string,
  ): Promise<CheckDocumentWorkflowResponse> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<CheckDocumentWorkflowResponse>>(
        `${this.baseUrl}/Workflow/check-document/${documentId}`,
      ),
    );
    return this.unwrapRequiredResponse(res);
  }

  async createInstance(
    request: CreateInstanceRequest,
  ): Promise<CreateInstanceResponse> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<CreateInstanceResponse>>(
        `${this.baseUrl}/Workflow/instances`,
        request,
      ),
    );
    return this.unwrapRequiredResponse(res);
  }

  async takeActionParallel(
    instanceId: number,
    stepInstanceId: number,
    request: TakeActionRequest,
  ): Promise<TakeActionResponse> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<TakeActionResponse>>(
        `${this.baseUrl}/Workflow/instances/${instanceId}/steps/${stepInstanceId}/action`,
        request,
      ),
    );
    return this.unwrapRequiredResponse(res);
  }

  async takeActionLinear(
    instanceId: number,
    request: TakeActionRequest,
  ): Promise<TakeActionResponse> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<TakeActionResponse>>(
        `${this.baseUrl}/Workflow/${instanceId}/action`,
        request,
      ),
    );
    return this.unwrapRequiredResponse(res);
  }

  async resubmit(
    instanceId: number,
    request: ResubmitRequest,
  ): Promise<TakeActionResponse> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<TakeActionResponse>>(
        `${this.baseUrl}/Workflow/${instanceId}/resubmit`,
        request,
      ),
    );
    return this.unwrapRequiredResponse(res);
  }

  async forceStop(
    instanceId: number,
    request: ForceStopRequest,
  ): Promise<TakeActionResponse> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<TakeActionResponse>>(
        `${this.baseUrl}/Workflow/${instanceId}/force-stop`,
        request,
      ),
    );
    return this.unwrapRequiredResponse(res);
  }

  async updateAssignees(
    instanceId: number,
    stepInstanceId: number,
    request: UpdateAssigneesRequest,
  ): Promise<UpdateAssigneesResponse> {
    const res = await firstValueFrom(
      this.http.put<ApiResponse<UpdateAssigneesResponse>>(
        `${this.baseUrl}/Workflow/instances/${instanceId}/steps/${stepInstanceId}/assignees`,
        request,
      ),
    );
    return this.unwrapRequiredResponse(res);
  }

  // ─── 3. Workflow Template APIs ────────────────────────────────────────────

  async getTemplate(templateId: string): Promise<WorkflowTemplate> {
    const res = await firstValueFrom(
      this.http.get<ApiResponse<WorkflowTemplate>>(
        `${this.baseUrl}/Workflow/templates/${templateId}`,
      ),
    );
    return this.unwrapRequiredResponse(res);
  }

  async createTemplate(
    request: CreateTemplateRequest,
  ): Promise<CreateTemplateResponse> {
    const res = await firstValueFrom(
      this.http.post<ApiResponse<CreateTemplateResponse>>(
        `${this.baseUrl}/Workflow/templates`,
        request,
      ),
    );
    return this.unwrapRequiredResponse(res);
  }

  async getCorporateRoles(): Promise<{ role: string[] }> {
    return Promise.resolve({
      role: [
        'Project Manager',
        'Loan Officer',
        'It',
        'Credit Analyst',
        'Human Resource',
        'Risk Manager',
        'Relationship Manager',
        'Auditor',
        'Treasury Analyst',
        'Financial Advisor',
      ],
    });
  }

  // ─── 3. SRM Workflow APIs ─────────────────────────────────────────────

  async pickupWorkflowInstances(
    request: PickupWorkflowRequest,
  ): Promise<PickupWorkflowResponse['data'] | null> {
    const response = await firstValueFrom(
      this.http.patch<PickupWorkflowResponse>(
        `${this.srmWorkflowBaseUrl}/workflow/pickup`,
        request,
      ),
    );

    return response.data ?? null;
  }

  async pickupWorkflowByAppIds(
    appIds: string[],
    actionBy: string,
  ): Promise<PickupActionOutcome> {
    const responseData = await this.pickupWorkflowInstances({
      appIds,
      actionBy,
    });

    return this.parsePickupOutcome(responseData, appIds.length);
  }

  async submitWorkflowAction(
    appId: string,
    request: {
      actionType: 'Approved' | 'Rejected';
      userId: string;
      role: string;
      taskId: number;
      remark?: string;
    },
  ): Promise<void> {
    await firstValueFrom(
      this.http.post<unknown>(
        `${this.srmWorkflowBaseUrl}/workflow/${encodeURIComponent(appId)}/action`,
        request,
      ),
    );
  }

  async reworkWorkflow(
    appId: string,
    request: ReworkWorkflowRequest,
  ): Promise<void> {
    await firstValueFrom(
      this.http.post<unknown>(
        `${this.srmWorkflowBaseUrl}/workflow/${encodeURIComponent(appId)}/rework`,
        request,
      ),
    );
  }

  private unwrapResponse<T>(response: ApiResponse<T>): T | null {
    const raw = response as unknown as Record<string, unknown>;
    const legacyResult = raw['result'] as T | undefined;
    return legacyResult ?? response.data ?? null;
  }

  private unwrapRequiredResponse<T>(response: ApiResponse<T>): T {
    const unwrapped = this.unwrapResponse(response);
    if (unwrapped === null) {
      throw new Error('[WorkflowService] API response does not contain data');
    }
    return unwrapped;
  }

  private parsePickupOutcome(
    data: unknown,
    totalRequested: number,
  ): PickupActionOutcome {
    const payload =
      data && typeof data === 'object'
        ? (data as Record<string, unknown>)
        : undefined;

    const results = Array.isArray(payload?.['results'])
      ? (payload['results'] as Array<Record<string, unknown>>)
      : null;

    const successFromResults =
      results?.filter((item) => item?.['success'] === true).length ?? null;
    const failedFromResults =
      results?.filter((item) => item?.['success'] === false).length ?? null;

    const successCount =
      this.toNumber(payload?.['successCount']) ??
      this.toNumber(payload?.['success']) ??
      successFromResults ??
      (totalRequested > 0 ? totalRequested : 0);

    const failedCount =
      this.toNumber(payload?.['failedCount']) ??
      this.toNumber(payload?.['failCount']) ??
      failedFromResults ??
      Math.max(totalRequested - successCount, 0);

    const reason = this.toString(
      payload?.['reason'] ??
        payload?.['failureReason'] ??
        payload?.['failedReason'] ??
        payload?.['detail'],
    );

    return {
      total: totalRequested,
      successCount,
      failedCount,
      reason,
    };
  }

  private toNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private toString(value: unknown): string | null {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    return null;
  }
}
