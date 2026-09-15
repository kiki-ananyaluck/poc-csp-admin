import { Component, inject, input } from '@angular/core';
import { ServiceRequestManagementListState } from '../../service-request-management-list.state';
import { SrmTabTableComponent } from '../srm-tab-table/srm-tab-table';
import { SRM_TAB_TYPES } from '../srm-tab.config';

@Component({
  selector: 'app-srm-queue-tab',
  standalone: true,
  imports: [SrmTabTableComponent],
  providers: [ServiceRequestManagementListState],
  template: `<app-srm-tab-table
    [showCheckbox]="showActionControls()"
  ></app-srm-tab-table>`,
})
export class SrmQueueTabComponent {
  readonly showActionControls = input(true);
  private readonly state = inject(ServiceRequestManagementListState);
  protected readonly tabTypes = SRM_TAB_TYPES;

  constructor() {
    this.state.setTabType(this.tabTypes.QUEUE);
  }
}
