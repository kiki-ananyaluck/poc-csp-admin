import { Component, input, output } from '@angular/core';
import { IconComponent } from '@exim/ui-kit';

export interface StepItem {
  id: string;
  label: string;
  number: string;
}

@Component({
  selector: 'app-srm-step-sidebar',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './srm-step-sidebar.html',
  styleUrl: './srm-step-sidebar.scss',
})
export class SrmStepSidebarComponent {
  readonly steps = input.required<StepItem[]>();
  readonly selectedStep = input.required<string>();
  readonly stepSelected = output<string>();

  protected onStepClick(stepId: string): void {
    this.stepSelected.emit(stepId);
  }
}
