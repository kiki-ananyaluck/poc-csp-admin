import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StepSummary } from '../../../../services/workflow-service/workflow/workflow.model';

@Component({
  selector: 'app-workflow-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-stepper.html',
  styleUrl: './workflow-stepper.scss',
})
export class WorkflowStepperComponent {
  @Input() steps: StepSummary[] = [];
}
