import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ButtonComponent,
  InputFieldComponent,
  TitleComponent,
  ToastComponent,
} from '@exim/ui-kit';
import { WorkflowService } from '../../../services/workflow-service/workflow/workflow.service';
import { WorkflowBuilderComponent } from '../components/workflow-builder/workflow-builder';
import { WorkflowTemplateSummaryComponent } from '../components/workflow-template-summary/workflow-template-summary';
import { WORKFLOW_TEMPLATE_MESSAGES } from './workflow-template.message';
import { WORKFLOW_TEMPLATE_SELECTORS } from './workflow-template.selector';
import {
  WorkflowBuilderNode,
  WorkflowBuilderState,
  workflowTemplateState,
} from './workflow-template.state';

@Component({
  selector: 'app-workflow-template',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    InputFieldComponent,
    TitleComponent,
    ToastComponent,
    WorkflowBuilderComponent,
    WorkflowTemplateSummaryComponent,
  ],
  providers: [WorkflowBuilderState],
  templateUrl: './workflow-template.html',
  styleUrl: './workflow-template.scss',
})
export class WorkflowTemplate {
  private readonly workflowService = inject(WorkflowService);
  private readonly builderState = inject(WorkflowBuilderState);
  private readonly router = inject(Router);

  readonly messages = WORKFLOW_TEMPLATE_MESSAGES;
  readonly selectors = WORKFLOW_TEMPLATE_SELECTORS;
  readonly state = workflowTemplateState;
  readonly heroPillLabel = 'Workflow Studio';

  onBusinessTypeInputChange(value: string): void {
    this.state.businessTypeInput.set(value);
    this.state.businessType.set(value.trim());
  }

  private validateForm(): boolean {
    if (!this.state.templateCode().trim()) {
      this.state.submitError.set(this.messages.ERROR_REQUIRED_CODE);
      return false;
    }

    if (!this.state.templateName().trim()) {
      this.state.submitError.set(this.messages.ERROR_REQUIRED_NAME);
      return false;
    }

    const businessType =
      this.state.businessType().trim() || this.state.businessTypeInput().trim();
    if (!businessType) {
      this.state.submitError.set(this.messages.ERROR_REQUIRED_BUSINESS_TYPE);
      return false;
    }

    const nodes = this.builderState
      .getNodes()
      .filter((node) => node.type !== 'trigger');
    if (nodes.length === 0) {
      this.state.submitError.set(this.messages.ERROR_NO_STEPS);
      return false;
    }

    const stepNodes = this.getStepNodes(nodes);
    const missingNameNode = stepNodes.find(
      (node) => !node.data.stepName?.trim(),
    );
    if (missingNameNode) {
      this.state.submitError.set(this.messages.ERROR_REQUIRED_STEP_NAME);
      return false;
    }

    const missingAssigneeNode = stepNodes.find(
      (node) => !this.hasValidAssignee(node),
    );
    if (missingAssigneeNode) {
      this.state.submitError.set(this.messages.ERROR_REQUIRED_ASSIGNEE);
      return false;
    }

    this.state.submitError.set('');
    return true;
  }

  goToSummary(): void {
    if (!this.validateForm()) {
      this.showErrorToast();
      return;
    }

    this.state.showSummary.set(true);
  }

  backToBuilder(): void {
    this.state.showSummary.set(false);
  }

  async submit(): Promise<void> {
    if (!this.validateForm()) {
      this.showErrorToast();
      return;
    }

    this.state.submitting.set(true);
    this.state.submitError.set('');

    try {
      const businessType =
        this.state.businessType().trim() ||
        this.state.businessTypeInput().trim();
      const payload = this.builderState.toApiPayload({
        templateCode: this.state.templateCode(),
        templateName: this.state.templateName(),
        description: this.state.description(),
        businessType,
      });

      console.log('API Payload:', payload);
      await this.workflowService.createTemplate(payload);

      this.showSuccessToast();

      this.state.templateCode.set('');
      this.state.templateName.set('');
      this.state.description.set('');
      this.state.businessType.set('');
      this.state.businessTypeInput.set('');
      this.state.submitError.set('');
      this.state.showErrorToast.set(false);
      this.state.showSummary.set(false);

      this.builderState.reset();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : this.messages.TOAST_ERROR;
      this.state.submitError.set(message);
      this.showErrorToast();
    } finally {
      this.state.submitting.set(false);
    }
  }

  cancel(): void {
    this.router.navigate(['/']);
  }

  showErrorToast(): void {
    this.state.showErrorToast.set(true);
    setTimeout(() => {
      this.state.showErrorToast.set(false);
    }, 4000);
  }

  showSuccessToast(): void {
    this.state.showSuccessToast.set(true);
    setTimeout(() => {
      this.state.showSuccessToast.set(false);
    }, 3000);
  }

  private getStepNodes(nodes: WorkflowBuilderNode[]): WorkflowBuilderNode[] {
    return nodes.flatMap((node) =>
      node.type === 'parallel' ? node.children : [node],
    );
  }

  private hasValidAssignee(node: WorkflowBuilderNode): boolean {
    return node.data.assignees.some((assignee) => {
      if (assignee.mode === 'role') {
        return !!assignee.role?.trim();
      }

      return !!assignee.userId?.trim();
    });
  }
}
