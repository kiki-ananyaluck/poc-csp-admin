import {
  ChangeDetectorRef,
  Component,
  computed,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ButtonComponent,
  ModalComponent,
  ModalButton,
  ToastComponent,
} from '@exim/ui-kit';
import { WorkflowService } from '../../../services/workflow-service/workflow/workflow.service';
import {
  Assignee,
  StepData,
  StepSummary,
} from '../../../services/workflow-service/workflow/workflow.model';
import { StatusBadgeComponent } from '../components/status-badge/status-badge';
import { AssignmentPolicyBadgeComponent } from '../components/assignment-policy-badge/assignment-policy-badge';
import { WorkflowStepperComponent } from '../components/workflow-stepper/workflow-stepper';
import { WORKFLOW_DOCUMENT_MESSAGES } from './workflow-document.message';
import { WORKFLOW_DOCUMENT_SELECTORS } from './workflow-document.selector';
import { workflowDocumentState } from './workflow-document.state';

@Component({
  selector: 'app-workflow-document',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    ToastComponent,
    StatusBadgeComponent,
    AssignmentPolicyBadgeComponent,
    WorkflowStepperComponent,
  ],
  templateUrl: './workflow-document.html',
  styleUrl: './workflow-document.scss',
})
export class WorkflowDocument implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly workflowService = inject(WorkflowService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly messages = WORKFLOW_DOCUMENT_MESSAGES;
  readonly selectors = WORKFLOW_DOCUMENT_SELECTORS;
  readonly state = workflowDocumentState;

  /** The StepData for the currently active (IN_PROGRESS) phase */
  readonly activeStep = computed<StepData | undefined>(() => {
    const inst = this.state.instance();
    if (!inst) return undefined;
    return inst.currentPhase ?? undefined;
  });

  /** Flatten allPhases into StepSummary[] for the stepper component */
  get stepsForStepper(): StepSummary[] {
    return (this.state.instance()?.allPhases ?? []).map((p) => ({
      stepOrder: p.phaseOrder,
      stepName: p.phaseName,
      status: p.phaseStatus as StepData['status'],
    }));
  }

  /** Wrap currentPhase as array for the step-detail loop */
  get currentPhaseAsArray(): StepData[] {
    const phase = this.state.instance()?.currentPhase;
    return phase ? [phase] : [];
  }

  readonly confirmLeftButton: ModalButton = {
    label: WORKFLOW_DOCUMENT_MESSAGES.MODAL_CANCEL,
    variant: 'neutral',
    action: () => this.state.isConfirmModalOpen.set(false),
  };
  readonly confirmRightButton: ModalButton = {
    label: WORKFLOW_DOCUMENT_MESSAGES.MODAL_CONFIRM,
    variant: 'primary',
    action: () => this.submitAction(),
  };
  readonly remarkLeftButton: ModalButton = {
    label: WORKFLOW_DOCUMENT_MESSAGES.MODAL_CANCEL,
    variant: 'neutral',
    action: () => this.state.isRemarkModalOpen.set(false),
  };
  readonly remarkRightButton: ModalButton = {
    label: WORKFLOW_DOCUMENT_MESSAGES.MODAL_REJECT_CONFIRM,
    variant: 'error',
    action: () => this.submitReject(),
  };
  readonly assigneeLeftButton: ModalButton = {
    label: WORKFLOW_DOCUMENT_MESSAGES.MODAL_CANCEL,
    variant: 'neutral',
    action: () => this.state.isAssigneeEditModalOpen.set(false),
  };
  readonly assigneeRightButton: ModalButton = {
    label: WORKFLOW_DOCUMENT_MESSAGES.MODAL_SAVE,
    variant: 'primary',
    action: () => this.submitAssigneeEdit(),
  };

  ngOnInit(): void {
    const documentId = this.route.snapshot.paramMap.get('documentId');
    if (documentId) {
      this.state.searchDocumentId.set(documentId);
      this.loadInstance(documentId);
    }
  }

  async onSearch(): Promise<void> {
    const documentId = this.state.searchDocumentId().trim();
    if (!documentId) return;
    await this.loadInstance(documentId);
  }

  async loadInstance(documentId: string): Promise<void> {
    this.state.loading.set(true);
    this.state.errorMessage.set('');
    this.state.notFound.set(false);
    this.state.instance.set(null);
    try {
      this.state.instance.set(
        await this.workflowService.getInstanceByDocument(documentId),
      );
    } catch (err: any) {
      const status = err?.status ?? err?.error?.status;
      if (status === 404) {
        this.state.notFound.set(true);
      } else {
        this.state.errorMessage.set(
          err?.message || 'ไม่สามารถโหลดข้อมูล Workflow ได้',
        );
      }
    } finally {
      this.state.loading.set(false);
      this.cdr.detectChanges();
    }
  }

  canApprove(): boolean {
    return (
      this.activeStep()?.assignees?.some((a: Assignee) =>
        a.allowedActions?.includes('APPROVE'),
      ) ?? false
    );
  }

  canReject(): boolean {
    return (
      (this.activeStep()?.allowReject ?? false) &&
      (this.activeStep()?.assignees?.some((a: Assignee) =>
        a.allowedActions?.includes('REJECT'),
      ) ??
        false)
    );
  }

  openConfirmModal(action: 'APPROVE'): void {
    this.state.confirmActionType.set(action);
    this.state.confirmModalTitle.set(this.messages.MODAL_APPROVE_TITLE);
    this.state.confirmModalMessage.set(this.messages.MODAL_APPROVE_MESSAGE);
    this.state.confirmRequiresRemark.set(false);
    this.state.actionRemark.set('');
    this.state.isConfirmModalOpen.set(true);
  }

  openRemarkModal(): void {
    this.state.actionRemark.set('');
    this.state.isRemarkModalOpen.set(true);
  }

  openForceStopModal(): void {
    this.state.confirmActionType.set('APPROVE');
    this.state.confirmModalTitle.set(this.messages.MODAL_FORCE_STOP_TITLE);
    this.state.confirmModalMessage.set(this.messages.MODAL_FORCE_STOP_MESSAGE);
    this.state.confirmRequiresRemark.set(true);
    this.state.actionRemark.set('');
    this.state.isConfirmModalOpen.set(true);
  }

  openAssigneeEditModal(): void {
    this.state.editingAssignees.set(
      this.activeStep()?.assignees?.map((a) => ({
        userId: a.userId,
        role: a.role,
      })) ?? [],
    );
    this.state.isAssigneeEditModalOpen.set(true);
  }

  openResubmitModal(): void {
    this.submitResubmit();
  }

  isValidUserId(userId: string): boolean {
    return !userId.trim() || userId.includes('@');
  }

  addEditingAssignee(): void {
    this.state.editingAssignees.set([
      ...this.state.editingAssignees(),
      { userId: '', role: '' },
    ]);
  }

  removeEditingAssignee(index: number): void {
    this.state.editingAssignees.set(
      this.state.editingAssignees().filter((_, i) => i !== index),
    );
  }

  async submitAction(): Promise<void> {
    const instance = this.state.instance();
    if (!instance) return;
    if (this.state.confirmRequiresRemark()) {
      // Force Stop
      await this.workflowService.forceStop(Number(instance.instanceId), {
        userId: 'currentUser',
        role: 'currentRole',
        remark: this.state.actionRemark(),
      });
    } else {
      // Approve
      await this.workflowService.takeActionParallel(
        Number(instance.instanceId),
        Number(this.activeStep()?.stepInstanceId),
        {
          actionType: 'APPROVE',
          remark: this.state.actionRemark() || undefined,
        },
      );
    }
    this.state.isConfirmModalOpen.set(false);
    this.showToast(this.messages.TOAST_ACTION_SUCCESS);
    await this.loadInstance(instance.documentId);
  }

  async submitReject(): Promise<void> {
    const instance = this.state.instance();
    if (!instance) return;
    await this.workflowService.takeActionParallel(
      Number(instance.instanceId),
      Number(this.activeStep()?.stepInstanceId),
      { actionType: 'REJECT', remark: this.state.actionRemark() },
    );
    this.state.isRemarkModalOpen.set(false);
    this.showToast(this.messages.TOAST_REJECT_SUCCESS);
    await this.loadInstance(instance.documentId);
  }

  async submitAssigneeEdit(): Promise<void> {
    const instance = this.state.instance();
    if (!instance) return;
    await this.workflowService.updateAssignees(
      Number(instance.instanceId),
      Number(instance.currentPhase?.stepInstanceId),
      {
        assignees: this.state
          .editingAssignees()
          .filter((a) => a.userId || a.role),
      },
    );
    this.state.isAssigneeEditModalOpen.set(false);
    this.showToast(this.messages.TOAST_ASSIGNEE_SUCCESS);
    await this.loadInstance(instance.documentId);
  }

  async submitResubmit(): Promise<void> {
    const instance = this.state.instance();
    if (!instance) return;
    await this.workflowService.resubmit(Number(instance.instanceId), {});
    this.showToast(this.messages.TOAST_RESUBMIT_SUCCESS);
    await this.loadInstance(instance.documentId);
  }

  private showToast(message: string): void {
    this.state.toastMessage.set(message);
    this.state.showSuccessToast.set(true);
  }
}
