import { Component, inject, input } from '@angular/core';
import { ServiceRequestManagementListState } from '../../service-request-management-list.state';
import { SrmTabTableComponent } from '../srm-tab-table/srm-tab-table';
import {
  SRM_TAB_ACTION_ICON,
  SRM_TAB_ACTION_LABEL,
  SRM_TAB_ACTION_MODE,
  SRM_TAB_TYPES,
} from '../srm-tab.config';

@Component({
  selector: 'app-srm-in-progress-tab',
  standalone: true,
  imports: [SrmTabTableComponent],
  providers: [ServiceRequestManagementListState],
  template: `<app-srm-tab-table
    [showCheckbox]="showActionControls()"
    [actionMode]="actionMode.REASSIGN"
    [actionLabel]="actionLabel.REASSIGN"
    [actionIcon]="actionIcon.REASSIGN"
  ></app-srm-tab-table>`,
})
export class SrmInProgressTabComponent {
  readonly showActionControls = input(true);
  private readonly state = inject(ServiceRequestManagementListState);
  protected readonly tabTypes = SRM_TAB_TYPES;
  protected readonly actionMode = SRM_TAB_ACTION_MODE;
  protected readonly actionLabel = SRM_TAB_ACTION_LABEL;
  protected readonly actionIcon = SRM_TAB_ACTION_ICON;

  constructor() {
    this.state.setTabType(this.tabTypes.IN_PROGRESS);
  }
}
