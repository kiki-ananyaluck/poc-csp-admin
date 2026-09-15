import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environments';
import { ApiResponse } from '@exim/auth-sdk';
import {
  FlowInstancePagedResult,
  FlowInstanceByRefNoItem,
  GetAllParams,
  GetFlowInstancesParams,
  GetInProgressParams,
  GetMyWorkParams,
  GetQueueParams,
  InstanceEditHistoryResult,
  SrmPagedResult,
} from './admin.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.servicePaths['baseDomain']}/${environment.servicePaths['user']}/v1/admin`;

  async getFlowInstances(
    params?: GetFlowInstancesParams,
  ): Promise<FlowInstancePagedResult> {
    let httpParams = new HttpParams();
    if (params?.page !== undefined)
      httpParams = httpParams.set('page', String(params.page));
    if (params?.pageSize !== undefined)
      httpParams = httpParams.set('pageSize', String(params.pageSize));
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.sortDir) httpParams = httpParams.set('sortDir', params.sortDir);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.status?.length) {
      params.status.forEach((s) => {
        httpParams = httpParams.append('status', s);
      });
    }
    if (params?.serviceId?.length) {
      params.serviceId.forEach((id) => {
        httpParams = httpParams.append('serviceId', id);
      });
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<FlowInstancePagedResult>>(
        `${this.baseUrl}/flow-instances`,
        { params: httpParams },
      ),
    );
    return (
      response.data ?? {
        items: [],
        hasNextPage: false,
        hasPreviousPage: false,
        pageNumber: 1,
        pageSize: params?.pageSize ?? 10,
        totalCount: 0,
        totalPages: 0,
      }
    );
  }

  async getFlowInstanceByRefNo(
    refNo: string,
  ): Promise<FlowInstanceByRefNoItem | null> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<FlowInstanceByRefNoItem>>(
        `${this.baseUrl}/flow-instances/by-ref-no/${encodeURIComponent(refNo)}`,
      ),
    );

    return response.data ?? null;
  }

  async getQueue(params?: GetQueueParams): Promise<SrmPagedResult> {
    const httpParams = this.buildPagedParams(params);
    if (params?.statuses?.length) {
      params.statuses.forEach((s) =>
        (httpParams as unknown as HttpParams).append('statuses', s),
      );
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<SrmPagedResult>>(
        `${this.baseUrl}/service-requests/queue`,
        { params: httpParams },
      ),
    );
    return response.data ?? { items: [], total: 0, page: 1, pageSize: 10 };
  }

  async getMyWork(params?: GetMyWorkParams): Promise<SrmPagedResult> {
    const httpParams = this.buildPagedParams(params);

    const response = await firstValueFrom(
      this.http.get<ApiResponse<SrmPagedResult>>(
        `${this.baseUrl}/service-requests/my-work`,
        { params: httpParams },
      ),
    );
    return response.data ?? { items: [], total: 0, page: 1, pageSize: 10 };
  }

  async getInProgress(params?: GetInProgressParams): Promise<SrmPagedResult> {
    const httpParams = this.buildPagedParams(params);

    const response = await firstValueFrom(
      this.http.get<ApiResponse<SrmPagedResult>>(
        `${this.baseUrl}/service-requests/in-progress`,
        { params: httpParams },
      ),
    );
    return response.data ?? { items: [], total: 0, page: 1, pageSize: 10 };
  }

  async getAll(params?: GetAllParams): Promise<SrmPagedResult> {
    let httpParams = this.buildPagedParams(params);
    if (params?.assigneeId) {
      httpParams = httpParams.set('assigneeId', params.assigneeId);
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<SrmPagedResult>>(
        `${this.baseUrl}/service-requests`,
        { params: httpParams },
      ),
    );
    return response.data ?? { items: [], total: 0, page: 1, pageSize: 10 };
  }

  async getInstanceEditHistory(
    instanceId: string,
  ): Promise<InstanceEditHistoryResult> {
    const response = await firstValueFrom(
      this.http.get<unknown>(
        `${this.baseUrl}/flow-instances/${instanceId}/edit-history`,
      ),
    );

    return this.normalizeInstanceEditHistoryResult(response);
  }

  private normalizeInstanceEditHistoryResult(
    response: unknown,
  ): InstanceEditHistoryResult {
    const empty: InstanceEditHistoryResult = {
      rounds: [],
      meta: {},
    };

    if (!response || typeof response !== 'object') {
      return empty;
    }

    const root = response as Record<string, unknown>;

    const level1 =
      root['data'] && typeof root['data'] === 'object'
        ? (root['data'] as Record<string, unknown>)
        : null;

    const level2 =
      level1?.['data'] && typeof level1['data'] === 'object'
        ? (level1['data'] as Record<string, unknown>)
        : null;

    const candidate =
      (Array.isArray(root['rounds']) ? root : null) ??
      (level1 && Array.isArray(level1['rounds']) ? level1 : null) ??
      (level2 && Array.isArray(level2['rounds']) ? level2 : null);

    const metaCandidate =
      (root['meta'] && typeof root['meta'] === 'object'
        ? (root['meta'] as Record<string, unknown>)
        : null) ??
      (level1?.['meta'] && typeof level1['meta'] === 'object'
        ? (level1['meta'] as Record<string, unknown>)
        : null) ??
      (level2?.['meta'] && typeof level2['meta'] === 'object'
        ? (level2['meta'] as Record<string, unknown>)
        : null) ??
      (candidate?.['meta'] && typeof candidate['meta'] === 'object'
        ? (candidate['meta'] as Record<string, unknown>)
        : null);

    if (!candidate) {
      return empty;
    }

    return {
      rounds: candidate['rounds'] as InstanceEditHistoryResult['rounds'],
      meta: (metaCandidate as InstanceEditHistoryResult['meta']) ?? empty.meta,
    };
  }

  private buildPagedParams(params?: {
    search?: string;
    statuses?: string[];
    page?: number;
    pageSize?: number;
  }): HttpParams {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.page !== undefined)
      httpParams = httpParams.set('page', String(params.page));
    if (params?.pageSize !== undefined)
      httpParams = httpParams.set('pageSize', String(params.pageSize));
    if (params?.statuses?.length) {
      params.statuses.forEach((s) => {
        httpParams = httpParams.append('statuses', s);
      });
    }
    return httpParams;
  }
}
