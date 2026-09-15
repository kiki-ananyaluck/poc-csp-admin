import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environments';

export interface AppRegistrationDto {
  id: string;
  appCode: string;
  appName: string;
  version: string;
  description: string | null;
  currentStatus: string;
  statusMessage: string | null;
  announcementTag: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export interface AppRegistrationPagedDto {
  items: AppRegistrationDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface AppRegistrationResponse {
  data: AppRegistrationPagedDto;
  meta: unknown;
}

export interface GetAppsParams {
  status?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface ChangeAppStatusRequest {
  status: string;
  description?: string | null;
  updatedAt: string;
}

export interface ChangeAppStatusResponse {
  data: AppRegistrationDto;
  meta: unknown;
}

@Injectable({ providedIn: 'root' })
export class AppManagementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.servicePaths['baseDomain']}/${environment.servicePaths['codex']}/v1/app-management`;

  async getApps(params?: GetAppsParams): Promise<AppRegistrationResponse> {
    let httpParams = new HttpParams();

    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.isActive !== undefined)
      httpParams = httpParams.set('isActive', String(params.isActive));
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.pageSize)
      httpParams = httpParams.set('pageSize', String(params.pageSize));
    if (params?.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params?.sortDirection)
      httpParams = httpParams.set('sortDirection', params.sortDirection);

    return await firstValueFrom(
      this.http.get<AppRegistrationResponse>(`${this.baseUrl}/apps`, {
        params: httpParams,
      }),
    );
  }

  async changeAppStatus(
    id: string,
    request: ChangeAppStatusRequest,
  ): Promise<ChangeAppStatusResponse> {
    return await firstValueFrom(
      this.http.patch<ChangeAppStatusResponse>(
        `${this.baseUrl}/apps/${id}/status`,
        request,
      ),
    );
  }
}
