// =============================================================================
// Application Tracking — โมเดลตรงกับ DTO ของ UserService OnboardingController
// (admin/flow-instances, onboarding/instances/{id}/history*)
// JSON ฝั่ง backend เป็น camelCase (System.Text.Json) — map ตรงชื่อ field
// =============================================================================

/**
 * FlowInstanceStatus (UserService04.Domain.Ports.Enums) — serialize เป็นชื่อ string
 * Draft, Submitted, Approved, Rejected, Rework, Finalized, Abandoned, Cancelled
 */
export type FlowInstanceStatusCode =
  | 'Draft'
  | 'Submitted'
  | 'Approved'
  | 'Rejected'
  | 'Rework'
  | 'Finalized'
  | 'Abandoned'
  | 'Cancelled';

/** GET admin/flow-instances → List<FlowInstanceSummaryDto> */
export interface FlowInstanceSummary {
  flowInstanceId: string;
  refNo: string | null;
  flowCode: string;
  companyId: string | null;
  /** ชื่อบริษัท (TH) จาก JuristicBindingStep — โชว์ได้ก่อน approve (SA-1557) */
  companyName: string | null;
  serviceId: string | null;
  status: FlowInstanceStatusCode | string;
  currentStepType: string | null;
  stuckAtStepType: string | null;
  createdAt: string;
  updatedAt: string | null;
}

/** GET onboarding/instances/{id}/history → FlowInstanceHistoryListDto */
export interface FlowInstanceHistoryList {
  items: FlowInstanceHistoryRow[];
}

export interface FlowInstanceHistoryRow {
  id: string;
  sequence: number;
  fromStatus: string;
  toStatus: string;
  /** TransitionAction */
  action: string;
  actorType: string;
  actorName: string | null;
  actorEmployeeIdRaw: string | null;
  reason: string | null;
  occurredAt: string;
  submissionNo: number | null;
  isSubmissionRow: boolean;
  refNo: string | null;
}

/** GET onboarding/instances/{id}/history/{historyId} → FlowInstanceHistoryDetailDto */
export interface FlowInstanceHistoryDetail {
  id: string;
  action: string;
  fromStatus: string;
  toStatus: string;
  actorType: string;
  actorName: string | null;
  actorEmployeeIdRaw: string | null;
  reason: string | null;
  /** เฉพาะ Rework row */
  reworkTargets: ReworkTarget[] | null;
  occurredAt: string;
  submissionNo: number | null;
  isSubmissionRow: boolean;
  refNo: string | null;
  /** ว่างถ้า !isSubmissionRow */
  steps: HistoryStep[];
}

export interface ReworkTarget {
  stepType: string;
  note: string | null;
}

export interface HistoryStep {
  stepType: string;
  stepOrder: number;
  /** null ถ้า isSensitive (กรองออกฝั่ง backend) */
  dataJson: string | null;
  isSensitive: boolean;
  isSkipped: boolean;
  completedAt: string | null;
}

/** query params ของ GET admin/flow-instances */
export interface AdminListFlowInstancesParams {
  status?: FlowInstanceStatusCode | string;
  stuckOnly?: boolean;
}
