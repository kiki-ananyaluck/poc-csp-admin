import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CreateTemplateAssignee,
  CreateTemplatePhase,
  CreateTemplateRequest,
  CreateTemplateStep,
} from '../../../services/workflow-service/workflow/workflow.model';
import { WORKFLOW_TEMPLATE_MESSAGES } from './workflow-template.message';

export type NodeType = 'trigger' | 'action' | 'parallel';
export type PhaseType = 'linear' | 'parallel';

export interface AssigneeData {
  mode: 'userId' | 'role';
  role: string;
  userId: string;
}

export interface StepNodeData {
  stepName: string;
  displayStatus?: string;
  assignmentPolicy: 'ALL' | 'ANY';
  allowReject: boolean;
  allowForceStop: boolean;
  approveLabel: string;
  rejectLabel: string;
  forceStopLabel: string;
  autoCallFunction: string;
  onRejectToPhaseOrder?: number;
  assignees: AssigneeData[];
}

export interface WorkflowBuilderNode {
  id: string;
  type: NodeType;
  parentId: string | null;
  branchId: string | null;
  data: StepNodeData;
  children: WorkflowBuilderNode[];
}

export interface WorkflowPhase {
  id: string;
  phaseOrder: number;
  type: PhaseType;
  data: StepNodeData;
  steps: WorkflowBuilderNode[];
}

export interface FlatNode {
  id: string;
  name: string;
  type: NodeType;
  level: number;
  expandable: boolean;
  parentId: string | null;
  branchId: string | null;
  data: StepNodeData;
}

export interface WorkflowTemplateState {
  templateCode: string;
  templateName: string;
  description: string;
  businessType: string;
  businessTypeInput: string;
  submitting: boolean;
  submitError: string;
  showSuccessToast: boolean;
  showErrorToast: boolean;
  showSummary: boolean;
}

export const workflowTemplateState = {
  templateCode: signal<string>(''),
  templateName: signal<string>(''),
  description: signal<string>(''),
  businessType: signal<string>(''),
  businessTypeInput: signal<string>(''),
  submitting: signal<boolean>(false),
  submitError: signal<string>(''),
  showSuccessToast: signal<boolean>(false),
  showErrorToast: signal<boolean>(false),
  showSummary: signal<boolean>(false),
};

@Injectable()
export class WorkflowBuilderState {
  private _idCounter = 0;
  private _phaseCounter = 0;
  private readonly messages = WORKFLOW_TEMPLATE_MESSAGES;
  private readonly triggerNode = this.createNode('trigger', null, null, {
    stepName: this.messages.TRIGGER_LABEL,
  });
  private readonly _phases = new BehaviorSubject<WorkflowPhase[]>([]);

  readonly phases$ = this._phases.asObservable();
  readonly nodes$ = this._phases.pipe(
    map((phases) => this.toBuilderNodes(phases)),
  );
  readonly flatNodes$ = this._phases.pipe(
    map((phases) => this.flatten(this.toBuilderNodes(phases))),
  );

  addAction(afterId: string | null): string {
    const phases = [...this._phases.value];
    const phase = this.createLinearPhase();
    const insertIndex = this.getInsertIndex(phases, afterId);
    phases.splice(insertIndex, 0, phase);
    this.commitPhases(phases);
    return phase.steps[0].id;
  }

  addParallel(afterId: string | null): string {
    const phases = [...this._phases.value];
    const phase = this.createParallelPhase();
    const insertIndex = this.getInsertIndex(phases, afterId);
    phases.splice(insertIndex, 0, phase);
    this.commitPhases(phases);
    return phase.id;
  }

  addBranch(parallelId: string): string | null {
    const phases = this._phases.value.map((phase) => {
      if (phase.id !== parallelId || phase.type !== 'parallel') {
        return phase;
      }

      const branchNum = phase.steps.length + 1;
      const branch = this.createNode('action', phase.id, `branch-${branchNum}`);
      return { ...phase, steps: [...phase.steps, branch] };
    });

    const branchPhase = phases.find(
      (phase) => phase.id === parallelId && phase.type === 'parallel',
    );
    const branch = branchPhase
      ? branchPhase.steps[branchPhase.steps.length - 1]
      : null;
    this.commitPhases(phases);
    return branch?.id ?? null;
  }

  deleteNode(id: string): void {
    const target = this.findPhaseById(this._phases.value, id);
    if (target?.phase.type === 'linear') {
      this.commitPhases(
        this._phases.value.filter((phase) => phase.id !== target.phase.id),
      );
      return;
    }

    if (target?.phase.type === 'parallel' && target.phase.id === id) {
      this.commitPhases(this._phases.value.filter((phase) => phase.id !== id));
      return;
    }

    if (
      target?.phase.type === 'parallel' &&
      target.step &&
      target.phase.steps.length > 2
    ) {
      const phases = this._phases.value.map((phase) =>
        phase.id === target.phase.id
          ? { ...phase, steps: phase.steps.filter((step) => step.id !== id) }
          : phase,
      );
      this.commitPhases(phases);
    }
  }

  updateNode(id: string, data: Partial<StepNodeData>): void {
    const phases = this._phases.value.map((phase) => {
      if (phase.id === id) {
        return { ...phase, data: { ...phase.data, ...data } };
      }

      let didUpdateStep = false;
      const steps = phase.steps.map((step) => {
        if (step.id !== id) {
          return step;
        }

        didUpdateStep = true;
        return { ...step, data: { ...step.data, ...data } };
      });

      if (didUpdateStep) {
        const phaseData =
          phase.type === 'linear' && steps[0]?.id === id
            ? steps[0].data
            : phase.data;
        return { ...phase, data: phaseData, steps };
      }

      return phase;
    });

    this.commitPhases(phases);
  }

  getNodes(): WorkflowBuilderNode[] {
    return this.toBuilderNodes(this._phases.value);
  }

  getPhases(): WorkflowPhase[] {
    return this._phases.value;
  }

  reset(): void {
    this._idCounter = 1;
    this._phaseCounter = 0;
    this.commitPhases([]);
  }

  getPhaseOrderByNodeId(nodeId: string): number {
    const match = this.findPhaseById(this._phases.value, nodeId);
    return match?.phase.phaseOrder ?? 0;
  }

  getMaxRejectPhaseByNodeId(nodeId: string): number {
    const phaseOrder = this.getPhaseOrderByNodeId(nodeId);
    return Math.max(phaseOrder - 1, 0);
  }

  coerceRejectPhaseOrder(nodeId: string, value: string | number): number {
    const parsed = parseInt(String(value), 10);
    if (Number.isNaN(parsed)) {
      return 0;
    }

    const max = this.getMaxRejectPhaseByNodeId(nodeId);
    return Math.min(Math.max(parsed, 0), max);
  }

  toApiPayload(meta: {
    templateCode: string;
    templateName: string;
    description: string;
    businessType: string;
  }): CreateTemplateRequest {
    const phases: CreateTemplatePhase[] = this._phases.value.map((phase) => {
      if (phase.type === 'linear') {
        return {
          phaseOrder: phase.phaseOrder,
          phaseName: phase.data.stepName,
          executionMode: 'linear',
          completionPolicy: 'ALL',
          steps: [this.toStepPayload(phase.steps[0].data)],
        };
      }

      return {
        phaseOrder: phase.phaseOrder,
        phaseName: phase.data.stepName || 'Parallel  Step Group',
        executionMode: 'parallel',
        completionPolicy: phase.data.assignmentPolicy || 'ALL',
        steps: phase.steps.map((step) => this.toStepPayload(step.data)),
      };
    });

    return {
      templateCode: meta.templateCode,
      templateName: meta.templateName,
      description: meta.description || null,
      businessType: meta.businessType,
      phases,
    };
  }

  private commitPhases(phases: WorkflowPhase[]): void {
    this._phases.next(this.reorderPhases(phases));
  }

  private reorderPhases(phases: WorkflowPhase[]): WorkflowPhase[] {
    return phases.map((phase, index) => ({
      ...phase,
      phaseOrder: index + 1,
      data: this.clampStepDataRejectTarget(phase.data, index),
      steps: phase.steps.map((step) => ({
        ...step,
        parentId: phase.type === 'parallel' ? phase.id : null,
        data: this.clampStepDataRejectTarget(step.data, index),
      })),
    }));
  }

  private getInsertIndex(
    phases: WorkflowPhase[],
    afterId: string | null,
  ): number {
    if (!afterId) {
      return phases.length;
    }

    if (afterId === this.triggerNode.id) {
      return 0;
    }

    const match = this.findPhaseById(phases, afterId);
    return match ? phases.indexOf(match.phase) + 1 : phases.length;
  }

  private clampStepDataRejectTarget(
    data: StepNodeData,
    maxRejectPhase: number,
  ): StepNodeData {
    const currentValue = data.onRejectToPhaseOrder ?? 0;
    const clampedValue = Math.min(Math.max(currentValue, 0), maxRejectPhase);
    return currentValue === clampedValue
      ? data
      : { ...data, onRejectToPhaseOrder: clampedValue };
  }

  private findPhaseById(
    phases: WorkflowPhase[],
    id: string,
  ): { phase: WorkflowPhase; step?: WorkflowBuilderNode } | null {
    for (const phase of phases) {
      if (phase.id === id) {
        return { phase };
      }

      const step = phase.steps.find((item) => item.id === id);
      if (step) {
        return { phase, step };
      }
    }

    return null;
  }

  private createLinearPhase(): WorkflowPhase {
    const step = this.createNode('action', null, null);
    return {
      id: this.createPhaseId(),
      phaseOrder: 0,
      type: 'linear',
      data: step.data,
      steps: [step],
    };
  }

  private createParallelPhase(): WorkflowPhase {
    const phaseId = this.createPhaseId();
    const branch1 = this.createNode('action', phaseId, 'branch-1');
    const branch2 = this.createNode('action', phaseId, 'branch-2');

    return {
      id: phaseId,
      phaseOrder: 0,
      type: 'parallel',
      data: this.createStepData({ stepName: 'Parallel  Step Group' }),
      steps: [branch1, branch2],
    };
  }

  private toBuilderNodes(phases: WorkflowPhase[]): WorkflowBuilderNode[] {
    return [
      this.triggerNode,
      ...phases.map((phase) => {
        if (phase.type === 'linear') {
          return {
            ...phase.steps[0],
            parentId: null,
            branchId: null,
            children: [],
          };
        }

        return {
          id: phase.id,
          type: 'parallel' as const,
          parentId: null,
          branchId: null,
          data: phase.data,
          children: phase.steps.map((step) => ({
            ...step,
            parentId: phase.id,
            children: [],
          })),
        };
      }),
    ];
  }

  private toStepPayload(data: StepNodeData): CreateTemplateStep {
    const assignees: CreateTemplateAssignee[] = data.assignees.map(
      (assignee) => ({
        role: assignee.role,
        userId: assignee.mode === 'userId' ? assignee.userId || null : null,
      }),
    );

    return {
      stepName: data.stepName,
      displayStatus: data.displayStatus?.trim() || data.stepName || undefined,
      assignmentPolicy: data.assignmentPolicy,
      allowReject: data.allowReject,
      allowForceStop: data.allowForceStop,
      approveLabel: data.approveLabel || null,
      rejectLabel: data.rejectLabel || null,
      forceStopLabel: data.forceStopLabel || null,
      autoCallFunction: data.autoCallFunction || null,
      assignees,
      onRejectToPhaseOrder: data.onRejectToPhaseOrder ?? null,
    };
  }

  private createNode(
    type: NodeType,
    parentId: string | null,
    branchId: string | null,
    dataOverride?: Partial<StepNodeData>,
  ): WorkflowBuilderNode {
    return {
      id: `node-${++this._idCounter}`,
      type,
      parentId,
      branchId,
      data: this.createStepData(dataOverride),
      children: [],
    };
  }

  private createPhaseId(): string {
    return `phase-${++this._phaseCounter}`;
  }

  private createStepData(dataOverride?: Partial<StepNodeData>): StepNodeData {
    return {
      stepName: '',
      displayStatus: '',
      assignmentPolicy: 'ALL',
      allowReject: false,
      allowForceStop: false,
      approveLabel: this.messages.PLACEHOLDER_APPROVE_LABEL,
      rejectLabel: this.messages.PLACEHOLDER_REJECT_LABEL,
      forceStopLabel: this.messages.PLACEHOLDER_FORCE_STOP_LABEL,
      autoCallFunction: '/api/v1/WebHook/create-job',
      assignees: [{ mode: 'userId', role: '', userId: '' }],
      onRejectToPhaseOrder: 0,
      ...dataOverride,
    };
  }

  private flatten(nodes: WorkflowBuilderNode[]): FlatNode[] {
    const result: FlatNode[] = [];
    for (const node of nodes) {
      result.push({
        id: node.id,
        name: node.data.stepName,
        type: node.type,
        level: 0,
        expandable: node.type === 'parallel',
        parentId: node.parentId,
        branchId: node.branchId,
        data: node.data,
      });

      if (node.type === 'parallel' && node.children.length > 0) {
        for (const child of node.children) {
          result.push({
            id: child.id,
            name: child.data.stepName,
            type: child.type,
            level: 1,
            expandable: false,
            parentId: node.id,
            branchId: child.branchId,
            data: child.data,
          });
        }
      }
    }
    return result;
  }
}
