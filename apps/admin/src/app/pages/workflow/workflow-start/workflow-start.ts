import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ButtonComponent,
  DropdownComponent,
  ToastComponent,
} from '@exim/ui-kit';
import { WorkflowService } from '../../../services/workflow-service/workflow/workflow.service';
import { WorkflowStep } from '../../../services/workflow-service/workflow/workflow.model';
import { AssignmentPolicyBadgeComponent } from '../components/assignment-policy-badge/assignment-policy-badge';
import { WORKFLOW_START_MESSAGES } from './workflow-start.message';
import { WORKFLOW_START_SELECTORS } from './workflow-start.selector';
import { workflowStartState } from './workflow-start.state';

@Component({
  selector: 'app-workflow-start',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    DropdownComponent,
    ToastComponent,
    AssignmentPolicyBadgeComponent,
  ],
  templateUrl: './workflow-start.html',
  styleUrl: './workflow-start.scss',
})
export class WorkflowStart {
  private readonly workflowService = inject(WorkflowService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly messages = WORKFLOW_START_MESSAGES;
  readonly selectors = WORKFLOW_START_SELECTORS;
  readonly state = workflowStartState;
  readonly roleOptions = [
    { value: 'IOS Approver Level 1', label: 'IOS Approver Level 1' },
    { value: 'IOS Approver Level 2', label: 'IOS Approver Level 2' },
    { value: 'IOS Approver Level 3', label: 'IOS Approver Level 3' },
    { value: 'IOS Approver Level 4', label: 'IOS Approver Level 4' },
    { value: 'IOS Approver Level 5', label: 'IOS Approver Level 5' },
  ];

  goToStep(step: number): void {
    this.state.currentStep.set(step);
  }

  isValidUserId(userId: string): boolean {
    return !userId.trim() || userId.includes('@');
  }

  hasInvalidUserIds(): boolean {
    const map = this.state.stepAssigneesMap();
    return Object.values(map).some((assignees) =>
      assignees.some((a) => a.userId.trim() && !a.userId.includes('@')),
    );
  }

  async checkDocument(): Promise<void> {
    this.state.checkingDocument.set(true);
    this.state.checkResult.set(null);
    this.state.checkError.set('');
    this.state.canProceedToStep2.set(false);
    try {
      const result = await this.workflowService.checkDocumentWorkflow(
        this.state.documentId().trim(),
      );
      // hasWorkflow: false → ยังไม่มี workflow → ไปต่อได้
      // hasWorkflow: true  → มี workflow อยู่แล้ว → ห้ามไปต่อ
      // ใช้ === false เพื่อกัน undefined/null กรณี property name ไม่ตรง
      console.log('checkResult', result);
      console.log('hasworkflow', result.hasWorkflow);
      this.state.checkResult.set(result);
      this.state.canProceedToStep2.set(result.hasWorkflow === false);
      if (this.state.canProceedToStep2()) {
        this.goToStep(2);
      }
    } catch (err: any) {
      this.state.checkError.set(err?.message || 'ไม่สามารถตรวจสอบเอกสารได้');
    } finally {
      this.state.checkingDocument.set(false);
      this.cdr.detectChanges();
    }
  }

  /** Flat list of all template steps across phases — for HTML iteration */
  get templateStepsFlat() {
    return (this.state.selectedTemplate()?.phases ?? []).flatMap(
      (p) => p.steps,
    );
  }

  addAssignee(stepOrder: number): void {
    const map = this.state.stepAssigneesMap();
    this.state.stepAssigneesMap.set({
      ...map,
      [stepOrder]: [...(map[stepOrder] ?? []), { userId: '', role: '' }],
    });
  }

  removeAssignee(stepOrder: number, index: number): void {
    const map = this.state.stepAssigneesMap();
    this.state.stepAssigneesMap.set({
      ...map,
      [stepOrder]: (map[stepOrder] ?? []).filter((_, i) => i !== index),
    });
  }

  navigateToExisting(): void {
    if (this.state.checkResult()?.workflowInstanceId) {
      this.router.navigate(['/workflow/document', this.state.documentId()]);
    }
  }

  async onTemplateSelect(code: string): Promise<void> {
    this.state.selectedTemplateCode.set(code);
    if (!code) {
      this.state.selectedTemplate.set(null);
      return;
    }
    this.state.loadingTemplate.set(true);
    this.state.stepAssigneesMap.set({});
    try {
      const template = await this.workflowService.getTemplate(code);
      this.state.selectedTemplate.set(template);
      // Pre-populate assignees from template so user sees them and can edit
      if (template) {
        const newMap: Record<number, { userId: string; role: string }[]> = {};
        for (const phase of template.phases) {
          for (const step of phase.steps) {
            newMap[step.stepTemplateId] = step.assignees.map((a) => ({
              userId: a.userId ?? '',
              role: a.role ?? '',
            }));
            if (newMap[step.stepTemplateId].length === 0) {
              newMap[step.stepTemplateId] = [{ userId: '', role: '' }];
            }
          }
        }
        this.state.stepAssigneesMap.set(newMap);
      }
    } catch {
      this.state.selectedTemplate.set(null);
    } finally {
      this.state.loadingTemplate.set(false);
      this.cdr.detectChanges();
    }
  }

  async submitWorkflow(): Promise<void> {
    const template = this.state.selectedTemplate();
    if (!template) return;
    this.state.submitting.set(true);
    this.state.submitError.set('');

    const stepAssigneesMap = this.state.stepAssigneesMap();
    const steps: WorkflowStep[] = (template.phases ?? [])
      .flatMap((p) => p.steps)
      .map((step) => ({
        stepInstanceId: step.stepTemplateId,
        assignees: (stepAssigneesMap[step.stepTemplateId] ?? []).filter(
          (a) => a.userId.trim() || a.role.trim(),
        ),
      }));

    try {
      await this.workflowService.createInstance({
        businessType: template.businessType ?? '',
        documentID: this.state.documentId(),
        steps,
        requesterID: 'user@example.com', // TODO: replace with actual user context
      });
      this.state.showSuccessToast.set(true);
      setTimeout(() => {
        this.router.navigate(['/workflow/document', this.state.documentId()]);
      }, 1500);
    } catch (err: any) {
      this.state.submitError.set(
        err?.message || 'เกิดข้อผิดพลาดในการสร้าง Workflow',
      );
    } finally {
      this.state.submitting.set(false);
      this.cdr.detectChanges();
    }
  }
}
