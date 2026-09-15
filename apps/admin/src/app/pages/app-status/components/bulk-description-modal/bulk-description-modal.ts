import { Component, inject } from '@angular/core';
import { ModalInputComponent, ModalInputButton } from '@exim/ui-kit';
import { BulkDescriptionModalState } from './bulk-description-modal.state';
import { APP_STATUS_MESSAGES } from '../../app-status.message';

@Component({
  selector: 'app-bulk-description-modal',
  standalone: true,
  imports: [ModalInputComponent],
  templateUrl: './bulk-description-modal.html',
  styleUrl: './bulk-description-modal.scss',
})
export class BulkDescriptionModalComponent {
  protected readonly state = inject(BulkDescriptionModalState);
  protected readonly messages = APP_STATUS_MESSAGES;

  protected readonly cancelButton: ModalInputButton = {
    label: APP_STATUS_MESSAGES.MODAL_BULK_CANCEL,
    variant: 'secondary',
    action: () => this.state.close(),
  };

  protected readonly confirmButton: ModalInputButton = {
    label: APP_STATUS_MESSAGES.MODAL_BULK_CONFIRM,
    variant: 'primary',
    action: () => this.state.confirm(),
  };
}
