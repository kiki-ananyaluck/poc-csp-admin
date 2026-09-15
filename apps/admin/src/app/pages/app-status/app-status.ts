import { Component, inject, OnInit } from '@angular/core';
import { ToastComponent } from '@exim/ui-kit';
import { AppStatusState } from './app-status.state';
import { StatusModalState } from './components/status-modal/status-modal.state';
import { BulkDescriptionModalState } from './components/bulk-description-modal/bulk-description-modal.state';
import { StatusTableComponent } from './components/status-table/status-table';
import { StatusModalComponent } from './components/status-modal/status-modal';
import { BulkDescriptionModalComponent } from './components/bulk-description-modal/bulk-description-modal';
import { SubAppRow } from './app-status.types';
import { APP_STATUS_MESSAGES } from './app-status.message';

@Component({
  selector: 'app-app-status',
  standalone: true,
  imports: [
    ToastComponent,
    StatusTableComponent,
    StatusModalComponent,
    BulkDescriptionModalComponent,
  ],
  templateUrl: './app-status.html',
  styleUrl: './app-status.scss',
  providers: [AppStatusState, StatusModalState, BulkDescriptionModalState],
})
export class AppStatusComponent implements OnInit {
  protected readonly state = inject(AppStatusState);
  private readonly statusModalState = inject(StatusModalState);
  private readonly bulkDescModalState = inject(BulkDescriptionModalState);
  protected readonly messages = APP_STATUS_MESSAGES;

  ngOnInit(): void {
    this.state.loadApps();
  }

  protected onManageStatusClick(row: SubAppRow): void {
    this.statusModalState.open(row, async (id, status, description) => {
      const result = await this.state.updateStatus([id], status, description);
      if (result.success) {
        this.state.showToast(APP_STATUS_MESSAGES.TOAST_SUCCESS);
      } else {
        this.state.showToast(result.detail!, 'error');
      }
    });
  }

  protected onBulkMaintenanceClick(): void {
    const ids = [...this.state.checkedIds()];
    this.bulkDescModalState.open(async (description) => {
      const result = await this.state.updateStatus(ids, 'maintenance', description);
      this.state.clearChecked();
      if (result.success) {
        this.state.showToast(APP_STATUS_MESSAGES.TOAST_SUCCESS);
      } else {
        this.state.showToast(result.detail!, 'error');
      }
    });
  }
}
