import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ButtonComponent,
  TableComponent,
  TableColumnComponent,
  TableCellDirective,
  ModalComponent,
  ModalButton,
  ToastComponent,
} from '@exim/ui-kit';
import { WorkflowService } from '../../../services/workflow-service/workflow/workflow.service';
import type {
  PendingTask,
  TakeActionRequest,
} from '../../../services/workflow-service/workflow/workflow.model';
import { StatusBadgeComponent } from '../components/status-badge/status-badge';
import { AssignmentPolicyBadgeComponent } from '../components/assignment-policy-badge/assignment-policy-badge';
import { WORKFLOW_APPROVAL_MESSAGES } from './workflow-approval.message';
import { WORKFLOW_APPROVAL_SELECTORS } from './workflow-approval.selector';
import { workflowApprovalState } from './workflow-approval.state';

type DialogType = 'APPROVE' | 'REJECT' | 'FORCE_STOP' | 'RESUBMIT';

@Component({
  selector: 'app-workflow-approval',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TableComponent,
    TableColumnComponent,
    TableCellDirective,
    ModalComponent,
    ToastComponent,
    StatusBadgeComponent,
    AssignmentPolicyBadgeComponent,
  ],
  templateUrl: './workflow-approval.html',
  styleUrl: './workflow-approval.scss',
})
export class WorkflowApproval implements OnInit {
  private readonly workflowService = inject(WorkflowService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly messages = WORKFLOW_APPROVAL_MESSAGES;
  readonly selectors = WORKFLOW_APPROVAL_SELECTORS;
  readonly state = workflowApprovalState;

  // Hardcoded user context (TODO: replace with AuthService)
  readonly currentUserId = 'approver-202@exim.go.th';
  readonly currentRole = 'IOS Approver Level 2';

  readonly leftButton: ModalButton = {
    label: WORKFLOW_APPROVAL_MESSAGES.MODAL_CANCEL,
    variant: 'outline',
    action: () => this.closeDialog(),
  };
  rightButton: ModalButton = {
    label: WORKFLOW_APPROVAL_MESSAGES.MODAL_CONFIRM,
    variant: 'primary',
    action: () => this.dispatchAction(),
  };

  ngOnInit(): void {
    this.loadPendingApprovals();
  }

  async loadPendingApprovals(): Promise<void> {
    this.state.isLoading.set(true);
    try {
      const approvals = await this.workflowService.getPendingTasks(
        this.currentUserId,
        this.currentRole,
      );
      this.state.pendingApprovals.set(approvals);
      this.state.tableData.set(
        (approvals as unknown as Record<string, unknown>[]).map(
          (item, index) => ({
            ...item,
            createdAt: new Date(item['createdAt'] as string)
              .toISOString()
              .slice(0, 10),
            index: index + 1,
          }),
        ),
      );
    } catch {
      this.showToastNotification('error', this.messages.TOAST_LOAD_ERROR);
    } finally {
      this.state.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  async openActionDialog(
    task: PendingTask,
    dialogType: DialogType,
  ): Promise<void> {
    this.state.isActioning.set(true);
    this.cdr.detectChanges();
    try {
      const instance = await this.workflowService.getInstanceByDocument(
        task.documentId,
      );
      this.state.selectedInstance.set(instance);
      this.state.selectedTask.set(task);
      this.state.selectedDialogType.set(dialogType);
      this.state.remark.set('');
      this.state.remarkError.set('');
      this.state.resubmitSteps.set(undefined);
      this.updateDialogConfig();
      this.state.dialogOpen.set(true);
    } catch {
      this.showToastNotification(
        'error',
        this.messages.TOAST_WORKFLOW_LOAD_ERROR,
      );
    } finally {
      this.state.isActioning.set(false);
      this.cdr.detectChanges();
    }
  }

  async dispatchAction(): Promise<void> {
    const task = this.state.selectedTask();
    const instance = this.state.selectedInstance();
    if (!task || !instance) return;

    const instanceId = task.instanceId;
    const dialogType = this.state.selectedDialogType();

    // Validation
    if (
      (dialogType === 'REJECT' || dialogType === 'FORCE_STOP') &&
      !this.state.remark().trim()
    ) {
      this.state.remarkError.set(this.messages.REMARK_REQUIRED_ERROR);
      return;
    }

    this.state.isActioning.set(true);
    try {
      switch (dialogType) {
        case 'APPROVE':
        case 'REJECT': {
          const request: TakeActionRequest = {
            actionType: dialogType,
            userId: this.currentUserId,
            role: this.currentRole,
            remark: this.state.remark().trim() || undefined,
          };
          const stepInstanceId = Number(instance.currentPhase?.stepInstanceId);
          if (task.assignmentPolicy === 'ALL') {
            await this.workflowService.takeActionParallel(
              instanceId,
              stepInstanceId,
              request,
            );
          } else {
            await this.workflowService.takeActionLinear(instanceId, request);
          }
          break;
        }

        case 'FORCE_STOP': {
          await this.workflowService.forceStop(instanceId, {
            userId: this.currentUserId,
            role: this.currentRole,
            remark: this.state.remark().trim(),
          });
          break;
        }

        case 'RESUBMIT': {
          await this.workflowService.resubmit(instanceId, {
            steps: this.state.resubmitSteps(),
          });
          break;
        }
      }

      this.state.dialogOpen.set(false);
      this.showToastNotification('success', this.getSuccessMessage());
      await this.loadPendingApprovals();
    } catch {
      this.showToastNotification('error', this.messages.TOAST_ACTION_ERROR);
    } finally {
      this.state.isActioning.set(false);
      this.cdr.detectChanges();
    }
  }

  closeDialog(): void {
    this.state.dialogOpen.set(false);
    this.state.selectedTask.set(null);
    this.state.selectedInstance.set(null);
    this.state.selectedDialogType.set(null);
    this.state.remark.set('');
    this.state.remarkError.set('');
  }

  navigateToDocument(task: PendingTask): void {
    this.router.navigate(['/workflow/document', task.documentId]);
  }

  dismissToast(): void {
    this.state.showToastFlag.set(false);
  }

  private updateDialogConfig(): void {
    const dialogType = this.state.selectedDialogType();
    switch (dialogType) {
      case 'APPROVE':
        this.state.dialogTitle.set(this.messages.DIALOG_APPROVE_TITLE);
        this.state.confirmLabel.set(this.messages.DIALOG_APPROVE_LABEL);
        this.state.confirmVariant.set('primary');
        this.state.remarkRequired.set(false);
        break;
      case 'REJECT':
        this.state.dialogTitle.set(this.messages.DIALOG_REJECT_TITLE);
        this.state.confirmLabel.set(this.messages.DIALOG_REJECT_LABEL);
        this.state.confirmVariant.set('error');
        this.state.remarkRequired.set(true);
        break;
      case 'FORCE_STOP':
        this.state.dialogTitle.set(this.messages.DIALOG_FORCE_STOP_TITLE);
        this.state.confirmLabel.set(this.messages.DIALOG_FORCE_STOP_LABEL);
        this.state.confirmVariant.set('error');
        this.state.remarkRequired.set(true);
        break;
      case 'RESUBMIT':
        this.state.dialogTitle.set(this.messages.DIALOG_RESUBMIT_TITLE);
        this.state.confirmLabel.set(this.messages.DIALOG_RESUBMIT_LABEL);
        this.state.confirmVariant.set('primary');
        this.state.remarkRequired.set(false);
        break;
    }
    this.rightButton = {
      label: this.state.confirmLabel(),
      variant: this.state.confirmVariant() as ModalButton['variant'],
      action: () => this.dispatchAction(),
    };
  }

  private getSuccessMessage(): string {
    switch (this.state.selectedDialogType()) {
      case 'APPROVE':
        return this.messages.TOAST_APPROVE_SUCCESS;
      case 'REJECT':
        return this.messages.TOAST_REJECT_SUCCESS;
      case 'FORCE_STOP':
        return this.messages.TOAST_FORCE_STOP_SUCCESS;
      case 'RESUBMIT':
        return this.messages.TOAST_RESUBMIT_SUCCESS;
      default:
        return this.messages.TOAST_DEFAULT_SUCCESS;
    }
  }

  private showToastNotification(
    variant: 'success' | 'error',
    message: string,
  ): void {
    this.state.toastVariant.set(variant);
    this.state.toastMessage.set(message);
    this.state.showToastFlag.set(true);
  }
}
