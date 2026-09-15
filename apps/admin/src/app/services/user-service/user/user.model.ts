// =============================================================================
// User Service — API models
// =============================================================================

import { ApiResponse } from '@exim/auth-sdk';

// ── User Settings API ──────────────────────────────────────────────────────

export interface UserSettingData {
  noticeWithinApp: {
    enable: boolean;
  };
  noticeRealTime: {
    enable: boolean;
  };
  subscriptionViaEmail: {
    enable: boolean;
    contactEmail: string;
  };
}

export type UserSettingResponse = ApiResponse<UserSettingData>;

export interface UpdateContactEmailRequestBody {
  contactEmail: string;
}

export interface UpdateNotificationRequestBody {
  enable: boolean;
}

// ── User Profile API ───────────────────────────────────────────────────────

export interface UserProfileResponse {
  avatarBase64: string;
  nameTitleTH: string;
  firstNameTH: string;
  middleNameTH: string;
  lastNameTH: string;
  email: string;
  contactEmail: string;
  phone: string;
  kycStatus: string;
  role: string[];
}

export type UserApplicationRolesData = unknown;

export interface UserProfileNameResponse {
  nameTitleTH: string;
  firstNameTH: string;
  middleNameTH: string;
  lastNameTH: string;
  kycStatus: string;
  avatarURL: string;
}

export interface UserInfoSettingsData {
  avatarURL: string;
  nameTitleTH: string;
  firstNameTH: string;
  middleNameTH: string;
  lastNameTH: string;
  email: string;
  identifierId: string;
  preferredLanguage: string;
}

export type UserInfoSettingsResponse = ApiResponse<UserInfoSettingsData>;

// ── Company API ────────────────────────────────────────────────────────────

export interface SetDefaultCompanyRequest {
  companyId: string;
}

export interface SetDefaultCompanyData {
  companyId: string;
  companyNameTH: string;
  isDefault: boolean;
}

export type SetDefaultCompanyResponse = ApiResponse<SetDefaultCompanyData>;

export interface CompanyDetailBasicInfo {
  nameTH: string;
  nameEN: string;
  juristicType: string;
  juristicStatus: string;
  registerDate: string;
  branchName: string;
}

export interface CompanyDetailMembership {
  role: string;
  isDefault: boolean;
}

export interface CompanyDetailAddress {
  addressNo: string | null;
  moo: string | null;
  soi: string | null;
  road: string | null;
  citySubDivision: { code: string | null; textTH: string } | null;
  city: { code: string | null; textTH: string } | null;
  countrySubDivision: { code: string | null; textTH: string } | null;
  postalCode: string | null;
}

export interface CompanyDetailData {
  companyId: string;
  juristicId: string;
  membership: CompanyDetailMembership;
  basicInfo: CompanyDetailBasicInfo;
  address: CompanyDetailAddress | null;
  lastSyncedAt: string | null;
  nextSyncAvailableAt: string | null;
}

export type CompanyDetailResponse = ApiResponse<CompanyDetailData>;

export interface SyncCompanyData {
  companyId: string;
  nameTH: string;
  nameEN: string;
  juristicId: string;
  juristicStatus: string;
  registerDate: string;
  address: CompanyDetailAddress | null;
  lastSyncedAt: string | null;
  nextSyncAvailableAt: string | null;
}

export type SyncCompanyResponse = ApiResponse<SyncCompanyData>;

// ── Employee by role API ───────────────────────────────────────────────────

export interface EmployeeRoleAssignment {
  roleId: string;
  roleName: string;
  assignedAt: string;
}

export interface EmployeeByRoleItem {
  empCode: string;
  empTitleTH: string | null;
  empFirstNameTH: string | null;
  empLastNameTH: string | null;
  levelName: string | null;
  posName: string | null;
  depName: string | null;
  empEmail: string | null;
  roles: EmployeeRoleAssignment[];
}

export interface EmployeeByRoleData {
  employees?: EmployeeByRoleItem[];
  data?: EmployeeByRoleItem[] | { employees?: EmployeeByRoleItem[] };
}

export type EmployeeByRoleResponse = ApiResponse<
  EmployeeByRoleItem[] | EmployeeByRoleData
>;
