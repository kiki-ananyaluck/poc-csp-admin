import { ApiResponse } from '@exim/auth-sdk';

// ─── Domain Types ────────────────────────────────────────────────────────────

export type InstanceStatus = 'ACTIVE' | 'RUNNING' | 'COMPLETED' | 'CANCELLED';
export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED';
export type ActionType =
  | 'APPROVE'
  | 'REJECT'
  | 'PENDING'
  | 'SUBMIT'
  | 'AUTO_CALL'
  | 'FORCE_STOP';
export type AssignmentPolicy = 'ALL' | 'ANY';
export type WorkflowMode = 'Linear' | 'Parallel';

// ─── 1. Pending Tasks ─────────────────────────────────────────────────────────

export interface PendingTask {
  instanceId: number;
  stepInstanceId: number;
  documentId: string;
  businessType: string;
  stepName: string;
  assignmentPolicy: AssignmentPolicy;
  allowReject: boolean;
  status: string;
  createdAt: string;
  workflowName: string;
}

// ─── 2. Workflow Instance APIs ────────────────────────────────────────────────

export interface Assignee {
  actionId: string;
  role: string;
  userId: string;
  actionType: ActionType;
  allowedActions: string[];
}

/** Current active phase+step detail — mirrors API spec 4.8 currentPhase */
export interface StepData {
  stepInstanceId: string;
  phaseOrder: number;
  phaseName: string;
  stepName: string;
  status: StepStatus;
  assignmentPolicy: AssignmentPolicy;
  allowReject: boolean;
  allowForceStop: boolean;
  approveLabel?: string;
  rejectLabel?: string;
  forceStopLabel?: string;
  approvedCount: number;
  totalAssignees: number;
  assignees: Assignee[];
}

/** @deprecated use StepData */
export type CurrentStep = StepData;

/** Summary of a step within allPhases */
export interface PhaseStepSummary {
  stepInstanceId: number;
  stepName: string;
  status: string;
}

/** Summary of a phase — used in WorkflowInstance.allPhases */
export interface PhaseStatus {
  phaseOrder: number;
  phaseName: string;
  phaseStatus: string;
  steps: PhaseStepSummary[];
}

/** Backward-compat alias for stepper component */
export interface StepSummary {
  stepOrder: number;
  stepName: string;
  status: StepStatus;
}

export interface WorkflowInstance {
  instanceId: string;
  documentId: string;
  businessType: string;
  isEditable: boolean;
  docStatus?: string;
  status: InstanceStatus;
  /** Full detail of currently active phase/step */
  currentPhase: StepData | null;
  /** All phases summary for progress display */
  allPhases: PhaseStatus[];
}

export interface CheckDocumentWorkflowResponse {
  documentId: string;
  hasWorkflow: boolean;
  workflowInstanceId?: number | null;
  businessType?: string | null;
}

export interface StepAssignee {
  role: string;
  userId: string;
}

/** Used in CreateInstanceRequest and ResubmitRequest — stepInstanceId matches template stepTemplateId */
export interface WorkflowStep {
  stepInstanceId: number;
  assignees: StepAssignee[];
}

export interface CreateInstanceRequest {
  businessType: string;
  documentID: string;
  requesterID?: string;
  steps?: WorkflowStep[];
}

export interface CreateInstanceResponse {
  documentID: string;
  payloadForCallback?: object | null;
}

export interface TakeActionRequest {
  actionType: 'APPROVE' | 'REJECT';
  userId?: string;
  role?: string;
  remark?: string;
}

export interface TakeActionResponse {
  payloadForCallback?: object | null;
}

export interface ResubmitRequest {
  steps?: WorkflowStep[];
}

export interface ForceStopRequest {
  userId: string;
  role: string;
  remark: string;
}

export interface UpdateAssigneesRequest {
  assignees: StepAssignee[];
}

export interface UpdateAssigneesResponse {
  stepInstanceId: number;
  assignees: StepAssignee[];
}

// ─── 3. Workflow Template APIs ────────────────────────────────────────────────

export interface TemplateStepAssignee {
  role: string;
  userId: string;
}

export interface TemplateStep {
  stepTemplateId: number;
  stepName: string;
  assignmentPolicy: AssignmentPolicy;
  allowReject: boolean;
  allowForceStop: boolean;
  approveLabel?: string;
  rejectLabel?: string;
  forceStopLabel?: string;
  onRejectToPhaseOrder?: number;
  autoCallFunction?: string;
  assignees: TemplateStepAssignee[];
}

export interface TemplatePhase {
  phaseTemplateId: number;
  phaseOrder: number;
  phaseName: string;
  executionMode: string;
  completionPolicy: string;
  steps: TemplateStep[];
}

export interface WorkflowTemplate {
  templateCode: string;
  templateName: string;
  description?: string;
  initCallFunction?: string;
  businessType: string;
  useHook?: boolean;
  phases: TemplatePhase[];
}

// ─── Create Template ──────────────────────────────────────────────────────────

export interface CreateTemplateAssignee {
  role: string;
  userId?: string | null;
}

export interface CreateTemplateStep {
  stepName: string;
  displayStatus?: string;
  assignmentPolicy?: 'ALL' | 'ANY';
  allowReject?: boolean;
  allowForceStop?: boolean;
  approveLabel?: string | null;
  rejectLabel?: string | null;
  forceStopLabel?: string | null;
  onRejectToPhaseOrder?: number | null;
  autoCallFunction?: string | null;
  assignees: CreateTemplateAssignee[];
}

export interface CreateTemplatePhase {
  phaseOrder: number;
  phaseName?: string | null;
  executionMode?: 'linear' | 'parallel';
  completionPolicy?: 'ALL' | 'ANY';
  steps: CreateTemplateStep[];
}

export interface CreateTemplateRequest {
  templateCode: string;
  templateName: string;
  description?: string | null;
  initCallFunction?: string | null;
  useHook?: boolean;
  businessType: string;
  phases: CreateTemplatePhase[];
}

export interface CreateTemplateResponse {
  templateCode: string;
  templateName: string;
  stepCount: number;
  parallelGroupCount: number;
}

// ─── 4. SRM Workflow APIs ────────────────────────────────────────────────────────

export interface PickupWorkflowRequest {
  appIds: string[];
  actionBy: string;
}

export type PickupWorkflowResponse = ApiResponse<unknown>;

export interface PickupActionOutcome {
  total: number;
  successCount: number;
  failedCount: number;
  reason: string | null;
}

export interface ReworkStepPayload {
  stepType: string;
  note: string;
}

export interface ReworkWorkflowRequest {
  taskId: number;
  userId: string;
  role: string;
  reworkSteps: ReworkStepPayload[];
}
