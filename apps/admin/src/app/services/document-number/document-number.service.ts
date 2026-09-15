import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environments';
import {
  CodexEnvelope,
  CurrentRunningNumberData,
  DocumentNumberApiResponse,
  DocumentNumberListError,
  DocumentNumberListItem,
  DocumentNumberPolicyItem,
  GenerateDocumentNumberData,
  GenerateDocumentNumberRequest,
  ResetDocumentNumberData,
} from './document-number.models';

@Injectable({ providedIn: 'root' })
export class DocumentNumberService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.servicePaths['baseDomain']}/${environment.servicePaths['centralized']}/v1/document-numbers`;
  private readonly codexBaseUrl = `${environment.servicePaths['baseDomain']}/${environment.servicePaths['codex']}/v1`;

  async getPolicies(search = ''): Promise<DocumentNumberPolicyItem[]> {
    let params = new HttpParams().set('pageSize', 100).set('page', 1);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    const response = await firstValueFrom(
      this.http.get<CodexEnvelope<unknown>>(
        `${this.codexBaseUrl}/document-numbers/policies`,
        { params },
      ),
    );

    const rawList = this.extractArray(response.data);

    return rawList
      .map((item) => this.toPolicyItem(item))
      .filter((item): item is DocumentNumberPolicyItem => item !== null);
  }

  async generate(
    request: GenerateDocumentNumberRequest,
  ): Promise<GenerateDocumentNumberData> {
    const response = await firstValueFrom(
      this.http.post<DocumentNumberApiResponse<GenerateDocumentNumberData>>(
        `${this.baseUrl}/generate`,
        request,
      ),
    );

    return this.getRequiredData(response, 'Generate document number failed');
  }

  async getCurrent(configCode: string): Promise<CurrentRunningNumberData> {
    const response = await firstValueFrom(
      this.http.get<DocumentNumberApiResponse<CurrentRunningNumberData>>(
        `${this.baseUrl}/configs/${encodeURIComponent(configCode)}/current`,
      ),
    );

    const data = this.getRequiredData(
      response,
      'Get current running number failed',
    );

    return {
      ...data,
      configCode: data.configCode ?? configCode,
    };
  }

  async reset(configCode: string): Promise<ResetDocumentNumberData> {
    const response = await firstValueFrom(
      this.http.post<DocumentNumberApiResponse<ResetDocumentNumberData>>(
        `${this.baseUrl}/configs/${encodeURIComponent(configCode)}/reset`,
        null,
      ),
    );

    return this.getRequiredData(response, 'Reset document number failed');
  }

  async getCurrentForMany(configCodes: string[]): Promise<{
    items: DocumentNumberListItem[];
    errors: DocumentNumberListError[];
  }> {
    const settled = await Promise.allSettled(
      configCodes.map(async (configCode) => {
        const current = await this.getCurrent(configCode);
        return {
          configCode: current.configCode,
          formatPattern: current.formatPattern,
          resetCycle: current.resetCycle,
          currentNumber: current.currentNumber,
          lastResetAt: current.lastResetAt,
          nextDocumentNumber: current.nextDocumentNumber,
        } satisfies DocumentNumberListItem;
      }),
    );

    const items: DocumentNumberListItem[] = [];
    const errors: DocumentNumberListError[] = [];

    settled.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        items.push(result.value);
        return;
      }

      const configCode = configCodes[index] ?? '';
      const reason = result.reason as { message?: string };
      errors.push({
        configCode,
        message: reason?.message ?? 'Unknown error',
      });
    });

    return { items, errors };
  }

  private getRequiredData<TData>(
    response: DocumentNumberApiResponse<TData>,
    fallbackMessage: string,
  ): TData {
    if (response?.data) {
      return response.data;
    }

    if (response?.isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response.error?.message ?? fallbackMessage);
  }

  private extractArray(data: unknown): unknown[] {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && typeof data === 'object') {
      const typed = data as { items?: unknown[] };
      if (Array.isArray(typed.items)) {
        return typed.items;
      }
    }

    return [];
  }

  private toPolicyItem(raw: unknown): DocumentNumberPolicyItem | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const item = raw as {
      id?: string;
      configCode?: string;
      policyCode?: string;
      code?: string;
      description?: string;
      status?: string;
      formatPattern?: string;
      resetCycle?: string;
    };

    const policyCode = item.configCode ?? item.policyCode ?? item.code ?? '';

    if (!policyCode) {
      return null;
    }

    return {
      id: item.id ?? policyCode,
      policyCode,
      description: item.description ?? '-',
      status: item.status ?? 'Unknown',
      formatPattern: item.formatPattern ?? '-',
      resetCycle: item.resetCycle ?? '-',
    };
  }
}
