// =============================================================================
// Onboarding Service — API models
// =============================================================================

/** Item 1 รายการใน history จาก GET /onboarding/instances/{id}/history */
export interface InstanceHistoryItem {
  id: string;
  action: string;
  actionBy: string | null;
  actorEmployeeIdRaw: string | null;
  actorName: string | null;
  actorType: string;
  fromStatus: string;
  occurredAt: string;
  reason: string | null;
  refNo: string;
  sequence: number;
  submissionNo: number;
  toStatus: string;
  isSubmissionRow: boolean;
}

/** Metadata ใน history response */
export interface InstanceHistoryMeta {
  traceId?: string;
  apiVersion?: string;
  processingTime?: string;
}

/** Response จาก GET /onboarding/instances/{id}/history */
export interface InstanceHistoryResult {
  items: InstanceHistoryItem[];
  meta: InstanceHistoryMeta;
}
