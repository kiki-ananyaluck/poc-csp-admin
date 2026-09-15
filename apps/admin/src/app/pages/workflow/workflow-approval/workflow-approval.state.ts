import { signal } from '@angular/core';
import type {
  PendingTask,
  WorkflowInstance,
  WorkflowStep,
} from '../../../services/workflow-service/workflow/workflow.model';

type DialogType = 'APPROVE' | 'REJECT' | 'FORCE_STOP' | 'RESUBMIT';

export interface WorkflowApprovalState {
  isLoading: boolean;
  isActioning: boolean;
  pendingApprovals: PendingTask[];
  tableData: Record<string, unknown>[];
  dialogOpen: boolean;
  selectedTask: PendingTask | null;
  selectedInstance: WorkflowInstance | null;
  selectedDialogType: DialogType | null;
  remark: string;
  remarkError: string;
  resubmitSteps: WorkflowStep[] | undefined;
  dialogTitle: string;
  confirmLabel: string;
  confirmVariant: string;
  remarkRequired: boolean;
  showToastFlag: boolean;
  toastVariant: 'success' | 'error';
  toastMessage: string;
}

export const workflowApprovalState = {
  isLoading: signal<boolean>(false),
  isActioning: signal<boolean>(false),
  pendingApprovals: signal<PendingTask[]>([]),
  tableData: signal<Record<string, unknown>[]>([]),
  dialogOpen: signal<boolean>(false),
  selectedTask: signal<PendingTask | null>(null),
  selectedInstance: signal<WorkflowInstance | null>(null),
  selectedDialogType: signal<DialogType | null>(null),
  remark: signal<string>(''),
  remarkError: signal<string>(''),
  resubmitSteps: signal<WorkflowStep[] | undefined>(undefined),
  dialogTitle: signal<string>(''),
  confirmLabel: signal<string>(''),
  confirmVariant: signal<string>('primary'),
  remarkRequired: signal<boolean>(false),
  showToastFlag: signal<boolean>(false),
  toastVariant: signal<'success' | 'error'>('success'),
  toastMessage: signal<string>(''),
};
