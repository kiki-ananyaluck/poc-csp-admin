import { signal } from '@angular/core';
import {
  CheckDocumentWorkflowResponse,
  WorkflowTemplate,
} from '../../../services/workflow-service/workflow/workflow.model';
import { TemplateOption } from '../workflow.types';

export interface WorkflowStartState {
  currentStep: number;
  documentId: string;
  checkingDocument: boolean;
  checkResult: CheckDocumentWorkflowResponse | null;
  checkError: string;
  canProceedToStep2: boolean;
  templateOptions: TemplateOption[];
  selectedTemplateCode: string;
  selectedTemplate: WorkflowTemplate | null;
  loadingTemplate: boolean;
  stepAssigneesMap: Record<number, { userId: string; role: string }[]>;
  submitting: boolean;
  submitError: string;
  showSuccessToast: boolean;
}

export const workflowStartState = {
  currentStep: signal<number>(1),
  documentId: signal<string>(''),
  checkingDocument: signal<boolean>(false),
  checkResult: signal<CheckDocumentWorkflowResponse | null>(null),
  checkError: signal<string>(''),
  canProceedToStep2: signal<boolean>(false),
  templateOptions: signal<TemplateOption[]>([
    { code: 'T001', name: 'งานรับประกัน (รายใหม่)' },
    { code: 'T001b', name: 'งานรับประกัน (ต่ออายุ)' },
    { code: 'T002', name: 'งาน UN Sanction' },
    { code: 'T003', name: 'งานบันทึกอื่นๆ' },
    { code: 'T004', name: 'poc joint3' },
    { code: 'T006', name: 'Save Flow' },
    { code: 'T007', name: 'Shield Flow' },
  ]),
  selectedTemplateCode: signal<string>(''),
  selectedTemplate: signal<WorkflowTemplate | null>(null),
  loadingTemplate: signal<boolean>(false),
  stepAssigneesMap: signal<Record<number, { userId: string; role: string }[]>>(
    {},
  ),
  submitting: signal<boolean>(false),
  submitError: signal<string>(''),
  showSuccessToast: signal<boolean>(false),
};
