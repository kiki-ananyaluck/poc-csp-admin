import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environments';
import {
  CodexAppsParams,
  CodexAppsResponse,
  CodexEntriesParams,
  CodexEntriesResponse,
  CodexImportResponse,
  CodexCategoriesResponse,
  CreateEntryRequest,
  CreateEntryResponse,
  UpdateEntryRequest,
  UpdateEntryResponse,
} from './codex.model';

@Injectable({ providedIn: 'root' })
export class CodexService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.servicePaths['baseDomain']}/${environment.servicePaths['codex']}/v1`;

  async getCategories(groupCode: string): Promise<CodexCategoriesResponse> {
    // const params = new HttpParams().set('groupCode', groupCode);
    return await firstValueFrom(
      this.http.get<CodexCategoriesResponse>(
        `${this.baseUrl}/categories/${groupCode}`,
        {
          // params,
        },
      ),
    );
  }

  async getEntries(params: CodexEntriesParams): Promise<CodexEntriesResponse> {
    let httpParams = new HttpParams()
      // .set('groupCode', params.groupCode)
      // .set('categoryCode', params.categoryCode)
      .set('categoryId', params.categoryId)
      .set('pageNumber', params.pageNumber)
      .set('pageSize', params.pageSize);

    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder)
      httpParams = httpParams.set(
        'sortDirection',
        params.sortOrder.toLowerCase(),
      );
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.isActive !== undefined)
      httpParams = httpParams.set('isActive', params.isActive);

    return await firstValueFrom(
      this.http.get<CodexEntriesResponse>(`${this.baseUrl}/entries`, {
        params: httpParams,
      }),
    );
  }

  async getApps(params?: CodexAppsParams): Promise<CodexAppsResponse> {
    let httpParams = new HttpParams();

    if (params?.isActive !== undefined) {
      httpParams = httpParams.set('isActive', params.isActive);
    }
    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page);
    }
    if (params?.pageSize !== undefined) {
      httpParams = httpParams.set('pageSize', params.pageSize);
    }
    if (params?.sortBy) {
      httpParams = httpParams.set('sortBy', params.sortBy);
    }
    if (params?.sortDirection) {
      httpParams = httpParams.set('sortDirection', params.sortDirection);
    }

    return await firstValueFrom(
      this.http.get<CodexAppsResponse>(`${this.baseUrl}/app-management/apps`, {
        params: httpParams,
      }),
    );
  }

  async createEntry(request: CreateEntryRequest): Promise<CreateEntryResponse> {
    return await firstValueFrom(
      this.http.post<CreateEntryResponse>(`${this.baseUrl}/entries`, request),
    );
  }

  async updateEntry(
    id: string,
    request: UpdateEntryRequest,
  ): Promise<UpdateEntryResponse> {
    return await firstValueFrom(
      this.http.put<UpdateEntryResponse>(
        `${this.baseUrl}/entries/${id}`,
        request,
      ),
    );
  }

  async deleteEntry(id: string): Promise<unknown> {
    return await firstValueFrom(
      this.http.delete<unknown>(`${this.baseUrl}/entries/${id}`),
    );
  }

  async toggleActive(id: string, isActive: boolean): Promise<unknown> {
    return await firstValueFrom(
      this.http.patch<unknown>(`${this.baseUrl}/entries/${id}/active`, {
        isActive,
      }),
    );
  }

  async importEntries(
    file: File,
    categoryId: string,
    companyId = '',
  ): Promise<CodexImportResponse> {
    const formData = new FormData();
    formData.append('categoryId', categoryId);
    if (companyId) {
      formData.append('companyId', companyId);
    }
    formData.append('file', file);
    return await firstValueFrom(
      this.http.post<CodexImportResponse>(
        `${this.baseUrl}/entries/import`,
        formData,
      ),
    );
  }

  downloadTemplate(categoryId: string): void {
    const httpParams = new HttpParams().set('categoryId', categoryId);
    window.open(
      `${this.baseUrl}/entries/export/template?${httpParams.toString()}`,
      '_blank',
    );
  }

  downloadData(categoryId: string): void {
    const httpParams = new HttpParams().set('categoryId', categoryId);
    window.open(
      `${this.baseUrl}/entries/export/data?${httpParams.toString()}`,
      '_blank',
    );
  }
}
