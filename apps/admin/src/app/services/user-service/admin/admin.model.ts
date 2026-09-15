// =============================================================================
// Admin Service — API models
// =============================================================================

/** สถานะคำขอสมัครใช้บริการ (ใช้ใน UI / filter) */
export type SrmApiStatusCode =
  | 'PENDING_PAYMENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'UNDER_REVIEW'
  | 'UNDER_CONSIDERATION'
  | 'EDITED_UNDER_REVIEW'
  | 'REQUEST_INFO'
  | 'CANCELLED';

// ── /flow-instances ────────────────────────────────────────────────────────────

/** Item 1 รายการจาก GET /flow-instances */
export interface FlowInstanceItem {
  flowInstanceId: string;
  refNo: string;
  companyId: string;
  companyName: string;
  createdAt: string;
  currentStepType: string | null;
  flowCode: string;
  lastActionAt: string | null;
  lastActorName: string | null;
  serviceId: string;
  status: string;
  stuckAtStepType: string | null;
  submittedAt: string | null;
  updatedAt: string;
}

/** Paginated response จาก GET /flow-instances */
export interface FlowInstancePagedResult {
  items: FlowInstanceItem[];
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/** Item จาก GET /flow-instances/by-ref-no/{refNo} */
export interface FlowInstanceByRefNoItem {
  flowInstanceId: string;
  refNo: string;
  flowCode: string;
  serviceId: string;
  companyName: string;
  status: string;
  submittedAt: string | null;
}

/** Query params สำหรับ GET /flow-instances */
export interface GetFlowInstancesParams {
  page?: number;
  pageSize?: number;
  /** ส่งได้หลายค่า (repeating query param) */
  status?: string[];
  /** ส่งได้หลายค่า (repeating query param) */
  serviceId?: string[];
  /** ชื่อ field ที่ต้อง sort เช่น submittedAt, refNo */
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  /** วันที่ยื่นใบสมัครเริ่มต้น (ISO 8601 format: YYYY-MM-DD) */
  submittedFrom?: string;
  /** วันที่ยื่นใบสมัครสิ้นสุด (ISO 8601 format: YYYY-MM-DD) */
  submittedTo?: string;
}

// ── Request params ──────────────────────────────────────────────────────────

/** Query params สำหรับ GET queue (กองงาน) */
export interface GetQueueParams {
  search?: string;
  statuses?: SrmApiStatusCode[];
  page?: number;
  pageSize?: number;
}

/** Query params สำหรับ GET my-work (งานของฉัน) */
export interface GetMyWorkParams {
  search?: string;
  statuses?: SrmApiStatusCode[];
  page?: number;
  pageSize?: number;
}

/** Query params สำหรับ GET in-progress (งานที่กำลังดำเนินการ) */
export interface GetInProgressParams {
  search?: string;
  statuses?: SrmApiStatusCode[];
  page?: number;
  pageSize?: number;
}

/** Query params สำหรับ GET all (งานทั้งหมด) */
export interface GetAllParams {
  search?: string;
  statuses?: SrmApiStatusCode[];
  assigneeId?: string;
  page?: number;
  pageSize?: number;
}

// ── Edit History ──────────────────────────────────────────────────────────────

/** Action 1 รายการจาก GET /admin/flow-instances/{id}/edit-history */
export interface InstanceEditHistoryAction {
  stepType: string;
  stepLabel: string;
  notes: string[];
}

/** Metadata ใน history response */
export interface InstanceHistoryMeta {
  traceId?: string;
  apiVersion?: string;
  processingTime?: string;
}

/** Round 1 รายการจาก GET /admin/flow-instances/{id}/edit-history */
export interface InstanceEditHistoryRound {
  roundNo: number;
  isLatest: boolean;
  bankRequestedAt: string | null;
  resumedAt?: string | null;
  resubmittedAt?: string | null;
  actions?: InstanceEditHistoryAction[];
  corrections?: InstanceEditHistoryAction[];
}

/** Response จาก GET /admin/flow-instances/{id}/edit-history */
export interface InstanceEditHistoryResult {
  rounds: InstanceEditHistoryRound[];
  meta: InstanceHistoryMeta;
}

// ── Legacy response DTOs ──────────────────────────────────────────────────────

/** ข้อมูล 1 รายการคำขอจาก API */
export interface SrmItemDto {
  id: string;
  refNo: string;
  status: SrmApiStatusCode;
  service: string;
  companyName: string;
  submitDate: string; // ISO datetime
  assigneeId: string | null;
  assigneeName: string | null;
  receivedDate: string | null; // ISO datetime
  lastOperatorId: string | null;
  lastOperatorName: string | null;
  lastOperatedDate: string | null; // ISO datetime
}

/** Paginated response wrapper */
export interface SrmPagedResult {
  items: SrmItemDto[];
  total: number;
  page: number;
  pageSize: number;
}
