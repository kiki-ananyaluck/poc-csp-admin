import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  ButtonComponent,
  CheckboxComponent,
  DropdownComponent,
  DropdownOption,
  IconButtonComponent,
  InputFieldComponent,
  RadioGroupComponent,
} from '@exim/ui-kit';
import {
  AssigneeData,
  StepNodeData,
  WorkflowBuilderState,
} from '../../workflow-template/workflow-template.state';
import { WORKFLOW_TEMPLATE_MESSAGES } from '../../workflow-template/workflow-template.message';

@Component({
  selector: 'app-step-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    CheckboxComponent,
    DropdownComponent,
    IconButtonComponent,
    InputFieldComponent,
    NzTooltipModule,
    RadioGroupComponent,
  ],
  templateUrl: './step-editor.html',
  styleUrl: './step-editor.scss',
})
export class StepEditorComponent {
  private readonly builderState = inject(WorkflowBuilderState);
  private readonly rejectPhaseAllowedKeys = new Set([
    'Tab',
    'Shift',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ]);

  readonly messages = WORKFLOW_TEMPLATE_MESSAGES;
  readonly roles: DropdownOption[] = [
    { label: 'Branch Manager', value: 'Branch Manager' },
    { label: 'Loan Officer', value: 'Loan Officer' },
    { label: 'Teller', value: 'Teller' },
    { label: 'Credit Analyst', value: 'Credit Analyst' },
    { label: 'Compliance Officer', value: 'Compliance Officer' },
  ];
  readonly policyOptions = [
    { label: 'ทุกคนต้องอนุมัติ', value: 'ALL' },
    { label: 'คนใดคนหนึ่งอนุมัติ', value: 'ANY' },
  ];
  readonly assigneeModeOptions: DropdownOption[] = [
    { label: this.messages.ASSIGNEE_TYPE_USER, value: 'userId' },
    { label: this.messages.ASSIGNEE_TYPE_ROLE, value: 'role' },
  ];

  @Input() nodeId!: string;
  @Input() data!: StepNodeData;

  updateField<K extends keyof StepNodeData>(field: K, value: StepNodeData[K]): void {
    this.builderState.updateNode(this.nodeId, { [field]: value });
  }

  setPolicy(policy: 'ALL' | 'ANY'): void {
    this.updateField('assignmentPolicy', policy);
  }

  toggleAllowReject(): void {
    this.updateField('allowReject', !this.data.allowReject);
  }

  toggleAllowForceStop(): void {
    this.updateField('allowForceStop', !this.data.allowForceStop);
  }

  addAssignee(): void {
    const assignees: AssigneeData[] = [
      ...this.data.assignees,
      { mode: 'userId', role: '', userId: '' },
    ];
    this.updateField('assignees', assignees);
  }

  removeAssignee(index: number): void {
    const assignees = this.data.assignees.filter((_, i) => i !== index);
    this.updateField('assignees', assignees);
  }

  updateAssigneeMode(index: number, mode: 'userId' | 'role'): void {
    const assignees = [...this.data.assignees];
    assignees[index] = {
      ...assignees[index],
      mode,
      role: mode === 'role' ? assignees[index].role : '',
      userId: mode === 'userId' ? assignees[index].userId : '',
    };
    this.updateField('assignees', assignees);
  }

  updateAssigneeValue(index: number, field: 'role' | 'userId', value: string): void {
    const assignees = [...this.data.assignees];
    assignees[index] = { ...assignees[index], [field]: value };
    this.updateField('assignees', assignees);
  }

  updateOnRejectToPhaseOrder(value: string | number): void {
    const nextValue = this.builderState.coerceRejectPhaseOrder(this.nodeId, value);
    if ((this.data.onRejectToPhaseOrder ?? 0) === nextValue) {
      return;
    }

    this.updateField('onRejectToPhaseOrder', nextValue);
  }

  syncRejectPhaseInput(input: HTMLInputElement): void {
    const nextValue = this.builderState.coerceRejectPhaseOrder(this.nodeId, input.value);
    input.value = String(nextValue);
    this.updateOnRejectToPhaseOrder(nextValue);
  }

  preventRejectPhaseTyping(event: KeyboardEvent): void {
    if (this.rejectPhaseAllowedKeys.has(event.key)) {
      return;
    }

    event.preventDefault();
  }

  preventRejectPhasePaste(event: ClipboardEvent): void {
    event.preventDefault();
  }

  preventRejectPhaseDrop(event: DragEvent): void {
    event.preventDefault();
  }

  preventRejectPhaseWheel(event: WheelEvent): void {
    event.preventDefault();
  }

  get maxRejectPhase(): number {
    return this.builderState.getMaxRejectPhaseByNodeId(this.nodeId);
  }
}
