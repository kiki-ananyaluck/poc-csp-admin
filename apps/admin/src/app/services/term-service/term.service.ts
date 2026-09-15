import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environments';
import { ApiResponse, AuthService } from '@exim/auth-sdk';
import {
  CreateDocumentRequest,
  CreateDocumentResponse,
  CreateVersionRequest,
  CreateVersionResponse,
  DeactivateVersionResponse,
  GetConsentsParams,
  GetConsentsResponse,
  ListDocumentsParams,
  ListDocumentsResponse,
  PublishVersionRequest,
  PublishVersionResponse,
  TermsChangeType,
  TermsDocumentDetail,
  TermsVersionDetail,
} from './term.model';

@Injectable({ providedIn: 'root' })
export class TermService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = `${environment.servicePaths['baseDomain']}/${environment.servicePaths['centralized']}/v1/admin/terms`;

  async listDocuments(
    params: ListDocumentsParams,
  ): Promise<ListDocumentsResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.customerType)
      httpParams = httpParams.set('customerType', params.customerType);
    if (params.conditionType)
      httpParams = httpParams.set('conditionType', params.conditionType);
    if (params.termsStatus)
      httpParams = httpParams.set('termsStatus', params.termsStatus);
    if (params.page !== undefined)
      httpParams = httpParams.set('page', params.page);
    if (params.pageSize !== undefined)
      httpParams = httpParams.set('pageSize', params.pageSize);
    const response = await firstValueFrom(
      this.http.get<ApiResponse<ListDocumentsResponse>>(
        `${this.baseUrl}/documents`,
        { params: httpParams },
      ),
    );
    return response.data!;
  }

  async createDocument(
    request: CreateDocumentRequest,
  ): Promise<CreateDocumentResponse> {
    const payload: CreateDocumentRequest = {
      ...request,
      operationBy: this.getOperationBy(),
    };
    const response = await firstValueFrom(
      this.http.post<ApiResponse<CreateDocumentResponse>>(
        `${this.baseUrl}/documents`,
        payload,
      ),
    );
    return response.data!;
  }

  async getDocument(documentCode: string): Promise<TermsDocumentDetail> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<TermsDocumentDetail>>(
        `${this.baseUrl}/documents/${documentCode}`,
      ),
    );
    return response.data!;
  }

  async createVersion(
    documentCode: string,
    request: CreateVersionRequest,
  ): Promise<CreateVersionResponse> {
    const payload: CreateVersionRequest = {
      ...request,
      operationBy: this.getOperationBy(),
    };
    const response = await firstValueFrom(
      this.http.post<ApiResponse<CreateVersionResponse>>(
        `${this.baseUrl}/documents/${documentCode}/versions`,
        payload,
      ),
    );
    return response.data!;
  }

  async getVersionDetail(
    documentCode: string,
    version: string,
  ): Promise<TermsVersionDetail> {
    const response = await firstValueFrom(
      this.http.get<ApiResponse<TermsVersionDetail>>(
        `${this.baseUrl}/documents/${documentCode}/versions/${version}`,
      ),
    );
    return response.data!;
  }

  async publishVersion(
    documentCode: string,
    version: string,
    changeType: TermsChangeType,
  ): Promise<PublishVersionResponse> {
    const payload: PublishVersionRequest = {
      changeType,
      operationBy: this.getOperationBy(),
    };
    const response = await firstValueFrom(
      this.http.post<ApiResponse<PublishVersionResponse>>(
        `${this.baseUrl}/documents/${documentCode}/versions/${version}/publish`,
        payload,
      ),
    );
    return response.data!;
  }

  async deactivateVersion(
    documentCode: string,
    version: string,
  ): Promise<DeactivateVersionResponse> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<DeactivateVersionResponse>>(
        `${this.baseUrl}/documents/${documentCode}/versions/${version}/deactivate`,
        { operationBy: this.getOperationBy() },
      ),
    );
    return response.data!;
  }

  private getOperationBy(): string {
    const user = this.authService.user()?.user as
      | {
          firstName?: string;
          lastName?: string;
          firstname?: string;
          lastname?: string;
          displayName?: string;
          name?: string;
        }
      | undefined;

    const firstName = (user?.firstName ?? user?.firstname ?? '').trim();
    const lastName = (user?.lastName ?? user?.lastname ?? '').trim();
    const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();

    return (
      fullName ||
      user?.displayName?.trim() ||
      user?.name?.trim() ||
      'Unknown User'
    );
  }

  async getConsents(
    documentCode: string,
    version: string,
    params: GetConsentsParams,
  ): Promise<GetConsentsResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.page !== undefined)
      httpParams = httpParams.set('page', params.page);
    if (params.pageSize !== undefined)
      httpParams = httpParams.set('pageSize', params.pageSize);
    const response = await firstValueFrom(
      this.http.get<ApiResponse<GetConsentsResponse>>(
        `${this.baseUrl}/documents/${documentCode}/versions/${version}/consents`,
        { params: httpParams },
      ),
    );
    return response.data!;
  }
}
