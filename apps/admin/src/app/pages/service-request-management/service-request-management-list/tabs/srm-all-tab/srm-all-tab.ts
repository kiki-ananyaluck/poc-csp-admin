import { Component, inject } from '@angular/core';
import { ServiceRequestManagementListState } from '../../service-request-management-list.state';
import { SrmTabTableComponent } from '../srm-tab-table/srm-tab-table';
import { SRM_TAB_TYPES } from '../srm-tab.config';

@Component({
  selector: 'app-srm-all-tab',
  standalone: true,
  imports: [SrmTabTableComponent],
  providers: [ServiceRequestManagementListState],
  template: `<app-srm-tab-table
    [sourceTabOverride]="tabTypes.ALL"
  ></app-srm-tab-table>`,
})
export class SrmAllTabComponent {
  private readonly state = inject(ServiceRequestManagementListState);
  protected readonly tabTypes = SRM_TAB_TYPES;

  constructor() {
    this.state.setTabType(this.tabTypes.ALL);
  }
}
