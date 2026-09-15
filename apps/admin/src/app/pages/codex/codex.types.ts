export type SortOrder = 'ascend' | 'descend' | null;

export interface SortValue {
  field: 'no' | 'code' | 'label:th-TH' | 'label:en-EN' | 'status';
  order: SortOrder;
}

export interface BreadcrumbItem {
  label: string;
  routerLink?: string;
}

export interface DataManagementRow {
  id: string | number;
  no: number;
  code: string;
  name: string;
  nameEn?: string;
  status: 'active' | 'inactive';
  version?: number;
  [key: string]: unknown;
}

export interface FilterValue {
  statusActive: boolean;
  statusInactive: boolean;
}

export interface ReviewRow {
  no: number;
  code: string;
  nameTh: string;
  nameEn: string;
  status: 'active' | 'inactive';
  remark: string;
  hasError: boolean;
}
