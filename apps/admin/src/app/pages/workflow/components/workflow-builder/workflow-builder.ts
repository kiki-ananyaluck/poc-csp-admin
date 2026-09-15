import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkTreeModule, FlatTreeControl } from '@angular/cdk/tree';
import { ArrayDataSource } from '@angular/cdk/collections';
import { Subscription } from 'rxjs';
import { ButtonComponent, IconButtonComponent } from '@exim/ui-kit';
import { FlatNode, WorkflowBuilderState } from '../../workflow-template/workflow-template.state';
import { StepEditorComponent } from '../step-editor/step-editor';
import { ActionPickerComponent } from '../action-picker/action-picker';
import { WORKFLOW_TEMPLATE_MESSAGES } from '../../workflow-template/workflow-template.message';

@Component({
  selector: 'app-workflow-builder',
  standalone: true,
  imports: [
    CommonModule,
    CdkTreeModule,
    StepEditorComponent,
    ActionPickerComponent,
    ButtonComponent,
    IconButtonComponent,
  ],
  templateUrl: './workflow-builder.html',
  styleUrl: './workflow-builder.scss',
})
export class WorkflowBuilderComponent implements OnInit, OnDestroy {
  private readonly builderState = inject(WorkflowBuilderState);
  private subscription?: Subscription;

  readonly messages = WORKFLOW_TEMPLATE_MESSAGES;

  treeControl = new FlatTreeControl<FlatNode>(
    (node) => node.level,
    (node) => node.expandable,
  );

  dataSource = new ArrayDataSource<FlatNode>([]);
  flatNodes: FlatNode[] = [];
  expandedNodeId: string | null = null;
  pickerAnchorId: string | null = null;

  ngOnInit(): void {
    this.subscription = this.builderState.flatNodes$.subscribe((nodes) => {
      this.flatNodes = nodes;
      this.dataSource = new ArrayDataSource(nodes);
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  hasChild(_: number, node: FlatNode): boolean {
    return node.expandable;
  }

  isParallelChild(node: FlatNode): boolean {
    return node.level === 1;
  }

  getParallelChildren(parallelId: string): FlatNode[] {
    return this.flatNodes.filter((n) => n.parentId === parallelId && n.level === 1);
  }

  toggleExpand(nodeId: string): void {
    this.expandedNodeId = this.expandedNodeId === nodeId ? null : nodeId;
  }

  openPicker(nodeId: string): void {
    this.pickerAnchorId = this.pickerAnchorId === nodeId ? null : nodeId;
  }

  closePicker(): void {
    this.pickerAnchorId = null;
  }

  onPickerAction(action: string, afterId: string): void {
    this.pickerAnchorId = null;

    switch (action) {
      case 'action': {
        const newNodeId = this.builderState.addAction(afterId);
        this.expandedNodeId = newNodeId;
        break;
      }
      case 'parallel': {
        const newNodeId = this.builderState.addParallel(afterId);
        this.expandedNodeId = newNodeId;
        break;
      }
      case 'branch': {
        this.builderState.addBranch(afterId);
        this.expandedNodeId = afterId;
        break;
      }
      case 'close': {
        this.expandedNodeId = null;
        break;
      }
    }
  }

  deleteNode(id: string): void {
    this.builderState.deleteNode(id);
    if (this.expandedNodeId === id) {
      this.expandedNodeId = null;
    }
  }

  getNodeLabel(node: FlatNode): string {
    if (node.type === 'trigger') {
      return '0';
    }

    const workflowSteps = this.flatNodes.filter((n) => n.level === 0 && n.type !== 'trigger');
    return `${workflowSteps.indexOf(node) + 1}`;
  }

  getNodeColorClass(type: string): string {
    switch (type) {
      case 'trigger':
        return 'node--trigger';
      case 'action':
        return 'node--action';
      case 'parallel':
        return 'node--parallel';
      default:
        return '';
    }
  }
}
