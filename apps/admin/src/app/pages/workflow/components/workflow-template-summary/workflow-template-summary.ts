import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  DropdownComponent,
  DropdownOption,
  IconButtonComponent,
  InputFieldComponent,
  TagComponent,
} from '@exim/ui-kit';
import {
  AssigneeData,
  WorkflowBuilderNode,
  WorkflowBuilderState,
} from '../../workflow-template/workflow-template.state';
import { WORKFLOW_TEMPLATE_MESSAGES } from '../../workflow-template/workflow-template.message';
import {
  AssignmentPolicy,
  ResubmitRequest,
  StepAssignee,
  TemplatePhase,
  TemplateStep,
  WorkflowStep,
  WorkflowTemplate,
} from '../../../../services/workflow-service/workflow/workflow.model';

type AssigneeMode = 'userId' | 'role';
type StepSide = 'left' | 'right' | 'linear';

export interface SummaryAssignee extends StepAssignee {
  mode: AssigneeMode;
}

export interface SummaryStep {
  id: string;
  stepTemplateId: number;
  name: string;
  displayStatus: string;
  assignmentPolicy: AssignmentPolicy;
  allowReject: boolean;
  allowForceStop: boolean;
  approveLabel?: string | null;
  rejectLabel?: string | null;
  forceStopLabel?: string | null;
  autoCallFunction?: string | null;
  onRejectToPhaseOrder?: number | null;
  assignees: SummaryAssignee[];
}

export interface DisplayPhase {
  phaseOrder: number;
  label: string;
  policy: AssignmentPolicy;
  isParallel: boolean;
  steps: SummaryStep[];
  leftSteps: SummaryStep[];
  rightSteps: SummaryStep[];
}

export interface RejectPath {
  id: string;
  d: string;
  label: string;
  labelX: number;
  labelY: number;
  labelAnchor: 'start' | 'end';
}

@Component({
  selector: 'app-workflow-template-summary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    DropdownComponent,
    IconButtonComponent,
    InputFieldComponent,
    TagComponent,
  ],
  templateUrl: './workflow-template-summary.html',
  styleUrl: './workflow-template-summary.scss',
})
export class WorkflowTemplateSummaryComponent
  implements OnChanges, AfterViewChecked
{
  @Input() isEditable = false;
  @Input() template: WorkflowTemplate | null = null;
  @Input() newAssignee: ResubmitRequest | null = null;
  @Input() templateCode = '';
  @Input() templateName = '';
  @Input() description = '';
  @Input() businessType = '';
  @Input() submitting = false;

  @Output() submitted = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
  @Output() newAssigneeChange = new EventEmitter<ResubmitRequest>();

  @ViewChildren('phaseRef') phaseRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('stepRef') stepRefs!: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('phaseZeroRef') phaseZeroRef?: ElementRef<HTMLElement>;
  @ViewChild('diagramRef') diagramRef?: ElementRef<HTMLElement>;

  private readonly builderState = inject(WorkflowBuilderState);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly messages = WORKFLOW_TEMPLATE_MESSAGES;
  readonly roles: DropdownOption[] = [
    { label: 'Branch Manager', value: 'Branch Manager' },
    { label: 'Loan Officer', value: 'Loan Officer' },
    { label: 'Teller', value: 'Teller' },
    { label: 'Credit Analyst', value: 'Credit Analyst' },
    { label: 'Compliance Officer', value: 'Compliance Officer' },
    { label: 'IOS Approver Level 1', value: 'IOS Approver Level 1' },
    { label: 'IOS Approver Level 2', value: 'IOS Approver Level 2' },
    { label: 'IOS Approver Level 3', value: 'IOS Approver Level 3' },
    { label: 'IOS Approver Level 4', value: 'IOS Approver Level 4' },
    { label: 'IOS Approver Level 5', value: 'IOS Approver Level 5' },
  ];
  readonly assigneeModeOptions: DropdownOption[] = [
    { label: this.messages.ASSIGNEE_TYPE_USER, value: 'userId' },
    { label: this.messages.ASSIGNEE_TYPE_ROLE, value: 'role' },
  ];
  readonly policyOptions = [
    { label: 'ทุกคนต้องอนุมัติ', value: 'ALL' },
    { label: 'คนใดคนหนึ่งอนุมัติ', value: 'ANY' },
  ] as const;

  displayPhases: DisplayPhase[] = [];
  rejectPaths: RejectPath[] = [];
  rejectSvgWidth = 0;
  rejectSvgHeight = 0;

  private editableAssigneesByStepId = new Map<number, SummaryAssignee[]>();

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['newAssignee'] ||
      changes['template'] ||
      changes['isEditable']
    ) {
      this.rebuildEditableAssignees();
    }

    this.buildDisplayPhases();
  }

  ngAfterViewChecked(): void {
    this.calculateRejectPaths();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.calculateRejectPaths();
  }

  get summaryCode(): string {
    return this.template?.templateCode ?? this.templateCode;
  }

  get summaryName(): string {
    return this.template?.templateName ?? this.templateName;
  }

  get summaryDescription(): string {
    return this.template?.description ?? this.description;
  }

  get summaryBusinessType(): string {
    return this.template?.businessType ?? this.businessType;
  }

  getVisibleAssignees(step: SummaryStep): SummaryAssignee[] {
    if (this.isEditable) {
      return this.ensureEditableAssignees(step);
    }

    return step.assignees.filter(
      (assignee) => assignee.role || assignee.userId,
    );
  }

  getAssigneeTypeLabel(assignee: SummaryAssignee): string {
    return assignee.mode === 'userId'
      ? this.messages.ASSIGNEE_TYPE_USER
      : this.messages.ASSIGNEE_TYPE_ROLE;
  }

  getAssigneeLabel(assignee: SummaryAssignee): string {
    if (assignee.mode === 'role') {
      return assignee.role || '-';
    }

    return assignee.userId || '-';
  }

  getAssigneeSummaryTypeLabel(assignee: SummaryAssignee): string {
    return assignee.mode === 'userId' ? 'UserId' : 'Role';
  }

  getRejectTargetLabel(step: SummaryStep): string {
    const target = step.onRejectToPhaseOrder;
    return target && target > 0 ? `step ${target}` : 'จบกระบวนการ';
  }

  getPolicyLabel(policy: AssignmentPolicy): string {
    return (
      this.policyOptions.find((option) => option.value === policy)?.label ??
      policy
    );
  }

  getStepStatus(step: SummaryStep): string {
    return step.displayStatus || step.name || '-';
  }

  getApproveLabel(step: SummaryStep): string {
    return step.approveLabel || this.messages.PLACEHOLDER_APPROVE_LABEL;
  }

  getRejectLabel(step: SummaryStep): string {
    return step.rejectLabel || this.messages.PLACEHOLDER_REJECT_LABEL;
  }

  getForceStopLabel(step: SummaryStep): string {
    return step.forceStopLabel || this.messages.PLACEHOLDER_FORCE_STOP_LABEL;
  }

  addAssignee(step: SummaryStep): void {
    const assignees = [
      ...this.ensureEditableAssignees(step),
      { mode: 'userId' as const, role: '', userId: '' },
    ];
    this.setEditableAssignees(step.stepTemplateId, assignees);
  }

  removeAssignee(step: SummaryStep, index: number): void {
    const assignees = this.ensureEditableAssignees(step).filter(
      (_, i) => i !== index,
    );
    this.setEditableAssignees(
      step.stepTemplateId,
      assignees.length > 0
        ? assignees
        : [{ mode: 'userId', role: '', userId: '' }],
    );
  }

  updateAssigneeMode(
    step: SummaryStep,
    index: number,
    mode: AssigneeMode,
  ): void {
    const assignees = [...this.ensureEditableAssignees(step)];
    const current = assignees[index] ?? {
      mode: 'userId',
      role: '',
      userId: '',
    };
    assignees[index] = {
      ...current,
      mode,
      role: mode === 'role' ? current.role : '',
      userId: mode === 'userId' ? current.userId : '',
    };
    this.setEditableAssignees(step.stepTemplateId, assignees);
  }

  updateAssigneeValue(
    step: SummaryStep,
    index: number,
    field: 'role' | 'userId',
    value: string,
  ): void {
    const assignees = [...this.ensureEditableAssignees(step)];
    const current = assignees[index] ?? {
      mode: 'userId',
      role: '',
      userId: '',
    };
    assignees[index] = { ...current, [field]: value };
    this.setEditableAssignees(step.stepTemplateId, assignees);
  }

  onSubmit(): void {
    this.submitted.emit();
  }

  onBack(): void {
    this.back.emit();
  }

  private buildDisplayPhases(): void {
    const phases = this.template
      ? this.mapTemplatePhases(this.template.phases)
      : this.mapBuilderPhases();

    this.displayPhases = phases.map((phase) => this.withParallelColumns(phase));
  }

  private mapBuilderPhases(): DisplayPhase[] {
    return this.builderState
      .getNodes()
      .filter((node) => node.type !== 'trigger')
      .map((node, index) => {
        const phaseOrder = index + 1;
        const sourceSteps = node.type === 'parallel' ? node.children : [node];
        const steps = sourceSteps.map((step, stepIndex) =>
          this.mapBuilderStep(step, phaseOrder, stepIndex),
        );

        return {
          phaseOrder,
          label: node.data.stepName || `Phase ${phaseOrder}`,
          policy: node.data.assignmentPolicy,
          isParallel: node.type === 'parallel',
          steps,
          leftSteps: [],
          rightSteps: [],
        };
      });
  }

  private mapTemplatePhases(phases: TemplatePhase[] = []): DisplayPhase[] {
    return phases.map((phase) => {
      const steps = phase.steps.map((step) =>
        this.mapTemplateStep(phase, step),
      );
      const fallbackPolicy = this.toAssignmentPolicy(phase.completionPolicy);

      return {
        phaseOrder: phase.phaseOrder,
        label: phase.phaseName || `Phase ${phase.phaseOrder}`,
        policy: fallbackPolicy,
        isParallel: this.isParallelPhase(phase),
        steps,
        leftSteps: [],
        rightSteps: [],
      };
    });
  }

  private mapBuilderStep(
    node: WorkflowBuilderNode,
    phaseOrder: number,
    stepIndex: number,
  ): SummaryStep {
    const data = node.data;

    return {
      id: node.id,
      stepTemplateId: this.getBuilderStepId(phaseOrder, stepIndex),
      name: data.stepName || `Step ${stepIndex + 1}`,
      displayStatus: data.displayStatus?.trim() || data.stepName || '',
      assignmentPolicy: data.assignmentPolicy,
      allowReject: data.allowReject,
      allowForceStop: data.allowForceStop,
      approveLabel: data.approveLabel,
      rejectLabel: data.rejectLabel,
      forceStopLabel: data.forceStopLabel,
      autoCallFunction: data.autoCallFunction,
      onRejectToPhaseOrder: data.onRejectToPhaseOrder,
      assignees: this.mapBuilderAssignees(data.assignees),
    };
  }

  private mapTemplateStep(
    phase: TemplatePhase,
    step: TemplateStep,
  ): SummaryStep {
    return {
      id: `template-step-${step.stepTemplateId}`,
      stepTemplateId: step.stepTemplateId,
      name: step.stepName || `Step ${step.stepTemplateId}`,
      displayStatus: step.stepName || '',
      assignmentPolicy: step.assignmentPolicy,
      allowReject: step.allowReject,
      allowForceStop: step.allowForceStop,
      approveLabel: step.approveLabel,
      rejectLabel: step.rejectLabel,
      forceStopLabel: step.forceStopLabel,
      autoCallFunction: step.autoCallFunction,
      onRejectToPhaseOrder: step.onRejectToPhaseOrder,
      assignees: this.mapStepAssignees(step.assignees),
    };
  }

  private withParallelColumns(phase: DisplayPhase): DisplayPhase {
    if (!phase.isParallel) {
      return { ...phase, leftSteps: phase.steps, rightSteps: [] };
    }

    const splitIndex = Math.ceil(phase.steps.length / 2);
    return {
      ...phase,
      leftSteps: phase.steps.slice(0, splitIndex),
      rightSteps: phase.steps.slice(splitIndex),
    };
  }

  private calculateRejectPaths(): void {
    const phaseRefs = this.phaseRefs?.toArray();
    const stepRefs = this.stepRefs?.toArray();
    const diagramEl = this.diagramRef?.nativeElement;
    if (!phaseRefs || !stepRefs || !diagramEl || phaseRefs.length === 0) return;

    const diagramRect = diagramEl.getBoundingClientRect();
    const svgWidth = Math.max(diagramEl.scrollWidth, diagramEl.clientWidth);
    const svgHeight = Math.max(diagramEl.scrollHeight, diagramEl.clientHeight);
    const stepRefById = new Map<string, HTMLElement>();

    for (const ref of stepRefs) {
      const stepId = ref.nativeElement.dataset['stepId'];
      if (stepId) {
        stepRefById.set(stepId, ref.nativeElement);
      }
    }

    const paths: RejectPath[] = [];

    this.displayPhases.forEach((phase, sourceIndex) => {
      for (const step of phase.steps) {
        if (
          !step.allowReject ||
          step.onRejectToPhaseOrder === null ||
          step.onRejectToPhaseOrder === undefined
        ) {
          continue;
        }

        const targetEl = this.getRejectTargetElement(
          step.onRejectToPhaseOrder,
          phaseRefs,
        );
        if (!targetEl) continue;

        const targetIndex = this.displayPhases.findIndex(
          (item) => item.phaseOrder === step.onRejectToPhaseOrder,
        );
        if (
          step.onRejectToPhaseOrder > 0 &&
          (targetIndex < 0 || targetIndex >= sourceIndex)
        ) {
          continue;
        }

        const sourceEl = stepRefById.get(step.id);
        if (!sourceEl) continue;

        paths.push(
          this.createRejectPath({
            sourceEl,
            targetEl,
            diagramRect,
            scrollLeft: diagramEl.scrollLeft,
            scrollTop: diagramEl.scrollTop,
            svgWidth,
            targetPhaseOrder: step.onRejectToPhaseOrder,
            id: `${step.id}-${step.onRejectToPhaseOrder}`,
            label:
              step.onRejectToPhaseOrder === 0
                ? 'จบกระบวนการ'
                : `ไป step${step.onRejectToPhaseOrder}`,
          }),
        );
      }
    });

    if (
      !this.arePathsSame(paths) ||
      this.rejectSvgWidth !== svgWidth ||
      this.rejectSvgHeight !== svgHeight
    ) {
      this.rejectPaths = paths;
      this.rejectSvgWidth = svgWidth;
      this.rejectSvgHeight = svgHeight;
      this.cdr.detectChanges();
    }
  }

  private createRejectPath(config: {
    sourceEl: HTMLElement;
    targetEl: HTMLElement;
    diagramRect: DOMRect;
    scrollLeft: number;
    scrollTop: number;
    svgWidth: number;
    targetPhaseOrder: number;
    id: string;
    label: string;
  }): RejectPath {
    const sourceRect = config.sourceEl.getBoundingClientRect();
    const targetRect = config.targetEl.getBoundingClientRect();
    const side = this.getStepSide(config.sourceEl);
    const direction = side === 'left' ? -1 : 1;
    const sourceX =
      (side === 'left' ? sourceRect.left : sourceRect.right) -
      config.diagramRect.left +
      config.scrollLeft;
    const sourceY =
      sourceRect.top +
      sourceRect.height / 2 -
      config.diagramRect.top +
      config.scrollTop;
    const targetX =
      targetRect.left +
      targetRect.width / 2 -
      config.diagramRect.left +
      config.scrollLeft;
    const targetY =
      (config.targetPhaseOrder === 0
        ? targetRect.bottom - 18
        : targetRect.bottom) -
      config.diagramRect.top +
      config.scrollTop;
    const sourceOutX = sourceX + direction * 38;
    const targetApproachY = targetY + 26;
    const outerX =
      direction < 0
        ? Math.max(8, Math.min(sourceX - 76, targetX - 220))
        : Math.min(config.svgWidth - 8, Math.max(sourceX + 76, targetX + 220));
    const labelX =
      direction < 0
        ? Math.max(8, sourceOutX + 4)
        : Math.min(config.svgWidth - 8, sourceOutX - 4);
    const d = [
      `M ${sourceX} ${sourceY}`,
      `L ${sourceOutX} ${sourceY}`,
      `L ${outerX} ${sourceY}`,
      `L ${outerX} ${targetApproachY}`,
      `L ${targetX} ${targetApproachY}`,
      `L ${targetX} ${targetY}`,
    ].join(' ');

    return {
      id: config.id,
      d,
      label: config.label,
      labelX,
      labelY: sourceY - 8,
      labelAnchor: direction < 0 ? 'start' : 'end',
    };
  }

  private getRejectTargetElement(
    targetPhaseOrder: number,
    phaseRefs: ElementRef<HTMLElement>[],
  ): HTMLElement | null {
    if (targetPhaseOrder === 0) {
      return this.phaseZeroRef?.nativeElement ?? null;
    }

    const targetIndex = this.displayPhases.findIndex(
      (item) => item.phaseOrder === targetPhaseOrder,
    );

    return phaseRefs[targetIndex]?.nativeElement ?? null;
  }

  private getStepSide(sourceEl: HTMLElement): StepSide {
    const side = sourceEl.dataset['stepSide'];
    return side === 'left' || side === 'right' ? side : 'linear';
  }

  private arePathsSame(nextPaths: RejectPath[]): boolean {
    return (
      nextPaths.length === this.rejectPaths.length &&
      nextPaths.every((path, index) => {
        const current = this.rejectPaths[index];
        return (
          path.id === current.id &&
          path.d === current.d &&
          path.label === current.label &&
          path.labelX === current.labelX &&
          path.labelY === current.labelY &&
          path.labelAnchor === current.labelAnchor
        );
      })
    );
  }

  private rebuildEditableAssignees(): void {
    this.editableAssigneesByStepId.clear();

    for (const step of this.newAssignee?.steps ?? []) {
      this.editableAssigneesByStepId.set(
        step.stepInstanceId,
        this.mapStepAssignees(step.assignees),
      );
    }
  }

  private ensureEditableAssignees(step: SummaryStep): SummaryAssignee[] {
    const current = this.editableAssigneesByStepId.get(step.stepTemplateId);
    if (current) {
      return current;
    }

    const fallback =
      step.assignees.length > 0
        ? step.assignees.map((assignee) => ({ ...assignee }))
        : [{ mode: 'userId' as const, role: '', userId: '' }];

    this.editableAssigneesByStepId.set(step.stepTemplateId, fallback);
    return fallback;
  }

  private setEditableAssignees(
    stepTemplateId: number,
    assignees: SummaryAssignee[],
  ): void {
    this.editableAssigneesByStepId.set(stepTemplateId, assignees);
    this.emitNewAssigneeChange();
  }

  private emitNewAssigneeChange(): void {
    const steps: WorkflowStep[] = Array.from(
      this.editableAssigneesByStepId.entries(),
    ).map(([stepInstanceId, assignees]) => ({
      stepInstanceId,
      assignees: assignees.map(({ role, userId }) => ({ role, userId })),
    }));

    this.newAssigneeChange.emit({ steps });
  }

  private mapBuilderAssignees(
    assignees: AssigneeData[] = [],
  ): SummaryAssignee[] {
    return assignees
      .map((assignee) => ({
        mode: assignee.mode,
        role: assignee.role || '',
        userId: assignee.userId || '',
      }))
      .filter((assignee) => assignee.role || assignee.userId);
  }

  private mapStepAssignees(assignees: StepAssignee[] = []): SummaryAssignee[] {
    return assignees.map((assignee) => ({
      mode: assignee.userId ? 'userId' : 'role',
      role: assignee.role || '',
      userId: assignee.userId || '',
    }));
  }

  private isParallelPhase(phase: TemplatePhase): boolean {
    return (
      phase.executionMode?.toLowerCase() === 'parallel' ||
      phase.steps.length > 1
    );
  }

  private toAssignmentPolicy(policy: string | undefined): AssignmentPolicy {
    return policy === 'ANY' ? 'ANY' : 'ALL';
  }

  private getBuilderStepId(phaseOrder: number, stepIndex: number): number {
    return phaseOrder * 100 + stepIndex + 1;
  }
}
