import { signal } from '@angular/core';
import {
  WorkflowInstance,
  StepAssignee,
} from '../../../services/workflow-service/workflow/workflow.model';

export interface WorkflowDocumentState {
  instance: WorkflowInstance | null;
  loading: boolean;
  errorMessage: string;
  isConfirmModalOpen: boolean;
  confirmModalTitle: string;
  confirmModalMessage: string;
  confirmRequiresRemark: boolean;
  confirmActionType: 'APPROVE' | 'REJECT';
  actionRemark: string;
  isRemarkModalOpen: boolean;
  isAssigneeEditModalOpen: boolean;
  editingAssignees: StepAssignee[];
  showSuccessToast: boolean;
  toastMessage: string;
}

export const workflowDocumentState = {
  instance: signal<WorkflowInstance | null>(null),
  loading: signal<boolean>(false),
  errorMessage: signal<string>(''),
  isConfirmModalOpen: signal<boolean>(false),
  confirmModalTitle: signal<string>(''),
  confirmModalMessage: signal<string>(''),
  confirmRequiresRemark: signal<boolean>(false),
  confirmActionType: signal<'APPROVE' | 'REJECT'>('APPROVE'),
  actionRemark: signal<string>(''),
  isRemarkModalOpen: signal<boolean>(false),
  isAssigneeEditModalOpen: signal<boolean>(false),
  editingAssignees: signal<StepAssignee[]>([]),
  showSuccessToast: signal<boolean>(false),
  toastMessage: signal<string>(''),
  searchDocumentId: signal<string>(''),
  notFound: signal<boolean>(false),
};
