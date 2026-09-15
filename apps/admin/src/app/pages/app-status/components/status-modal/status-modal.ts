import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ModalInputComponent,
  RadioBoxComponent,
  ModalInputButton,
} from '@exim/ui-kit';
import { StatusModalState } from './status-modal.state';
import { APP_STATUS_MESSAGES } from '../../app-status.message';
import { SubAppStatus } from '../../app-status.types';

@Component({
  selector: 'app-status-modal',
  standalone: true,
  imports: [ModalInputComponent, RadioBoxComponent, FormsModule],
  templateUrl: './status-modal.html',
  styleUrl: './status-modal.scss',
})
export class StatusModalComponent {
  protected readonly state = inject(StatusModalState);
  protected readonly messages = APP_STATUS_MESSAGES;

  protected readonly statusOptions = [
    {
      value: 'active' as SubAppStatus,
      label: APP_STATUS_MESSAGES.STATUS_ACTIVE,
      description: APP_STATUS_MESSAGES.RADIO_ACTIVE_DESC,
      dotColor: '#197D3F',
    },
    {
      value: 'maintenance' as SubAppStatus,
      label: APP_STATUS_MESSAGES.STATUS_MAINTENANCE,
      description: APP_STATUS_MESSAGES.RADIO_MAINTENANCE_DESC,
      dotColor: '#FAAD14',
    },
    {
      value: 'inactive' as SubAppStatus,
      label: APP_STATUS_MESSAGES.STATUS_INACTIVE,
      description: APP_STATUS_MESSAGES.RADIO_INACTIVE_DESC,
      dotColor: '#8C8C8C',
    },
  ];

  protected readonly cancelButton: ModalInputButton = {
    label: APP_STATUS_MESSAGES.MODAL_STATUS_CANCEL,
    variant: 'secondary',
    action: () => this.state.close(),
  };

  protected readonly confirmButton: ModalInputButton = {
    label: APP_STATUS_MESSAGES.MODAL_STATUS_CONFIRM,
    variant: 'primary',
    icon: 'save',
    action: () => this.state.confirm(),
  };

  protected get selectedStatus(): SubAppStatus {
    return this.state.selectedStatus();
  }

  protected set selectedStatus(value: SubAppStatus) {
    this.state.selectedStatus.set(value);
    // ล้าง description เมื่อเปลี่ยนจาก maintenance ไป status อื่น
    if (value !== 'maintenance') {
      this.state.description.set('');
    }
  }
}
