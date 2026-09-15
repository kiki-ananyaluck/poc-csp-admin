import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { ApiResponse, AUTH_SDK_CONFIG, AuthSDKConfig } from '@exim/auth-sdk';
import {
  UserSettingResponse,
  UpdateContactEmailRequestBody,
  UpdateNotificationRequestBody,
  UserProfileNameResponse,
  UserInfoSettingsResponse,
  UserInfoSettingsData,
  SetDefaultCompanyRequest,
  SetDefaultCompanyResponse,
  SetDefaultCompanyData,
  CompanyDetailData,
  CompanyDetailResponse,
  SyncCompanyData,
  SyncCompanyResponse,
  EmployeeByRoleData,
  EmployeeByRoleItem,
  EmployeeByRoleResponse,
} from './user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly config = inject<AuthSDKConfig>(AUTH_SDK_CONFIG);
  private readonly baseUrl = `${this.config.servicePaths?.baseDomain}/${this.config.servicePaths?.user}`;

  // User Service API
  getUserSetting(): Observable<UserSettingResponse> {
    return this.http.get<UserSettingResponse>(
      `${this.baseUrl}/v1/users/settings/me/notifications`,
    );
  }

  updateInAppNotification(enable: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/v1/users/settings/me/notification/within-app`,
      { enable } satisfies UpdateNotificationRequestBody,
    );
  }

  updateRealtimeNotification(enable: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/v1/users/settings/me/notification/real-time`,
      { enable } satisfies UpdateNotificationRequestBody,
    );
  }

  updateViaEmailNotification(enable: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/v1/users/settings/me/notification/via-email`,
      { enable } satisfies UpdateNotificationRequestBody,
    );
  }

  updateContactEmail(contactEmail: string): Observable<void> {
    return this.http.patch<void>(
      `${this.baseUrl}/v1/users/settings/me/contact-email`,
      {
        contactEmail,
      } satisfies UpdateContactEmailRequestBody,
    );
  }

  getProfileMeName(): Observable<UserProfileNameResponse> {
    return this.http
      .get<
        ApiResponse<UserProfileNameResponse>
      >(`${this.baseUrl}/v1/users/profile/me/name`)
      .pipe(map((res) => res.data!));
  }

  getUserInfoSettings(): Observable<UserInfoSettingsData> {
    return this.http
      .get<UserInfoSettingsResponse>(`${this.baseUrl}/v1/users/settings/me`)
      .pipe(map((res) => res.data!));
  }

  deleteUserPhoto(): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/v1/users/settings/me/profile-photo`,
    );
  }

  uploadUserPhoto(blob: Blob): Observable<void> {
    const formData = new FormData();
    formData.append('photo', blob, 'profile-photo');
    return this.http.put<void>(
      `${this.baseUrl}/v1/users/settings/me/profile-photo`,
      formData,
    );
  }

  setDefaultCompany(companyId: string): Observable<SetDefaultCompanyData> {
    return this.http
      .patch<SetDefaultCompanyResponse>(
        `${this.baseUrl}/v1/companies/default`,
        { companyId } satisfies SetDefaultCompanyRequest,
      )
      .pipe(map((res) => res.data!));
  }

  getCompanyDetail(companyId: string): Observable<CompanyDetailData> {
    return this.http
      .get<CompanyDetailResponse>(
        `${this.baseUrl}/v1/companies/${companyId}/detail`,
      )
      .pipe(map((res) => res.data!));
  }

  syncCompany(juristicId: string): Observable<SyncCompanyData> {
    return this.http
      .post<SyncCompanyResponse>(`${this.baseUrl}/v1/companies/sync`, {
        juristicId,
      })
      .pipe(map((res) => res.data!));
  }

  async getEmployeesByRole(roleId: string): Promise<EmployeeByRoleItem[]> {
    const baseUrl = `${this.config.servicePaths?.baseDomain}/${this.config.servicePaths?.user}/v1`;
    const response = await firstValueFrom(
      this.http.get<EmployeeByRoleResponse>(
        `${baseUrl}/employees/by-role/${roleId}`,
      ),
    );

    return this.extractEmployeesByRole(response.data);
  }

  private extractEmployeesByRole(
    data: EmployeeByRoleResponse['data'] | null | undefined,
  ): EmployeeByRoleItem[] {
    if (!data) {
      return [];
    }

    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.employees)) {
      return data.employees;
    }

    const nested = data.data;
    if (Array.isArray(nested)) {
      return nested;
    }

    if (nested && Array.isArray((nested as EmployeeByRoleData).employees)) {
      return (nested as EmployeeByRoleData).employees ?? [];
    }

    return [];
  }
}
