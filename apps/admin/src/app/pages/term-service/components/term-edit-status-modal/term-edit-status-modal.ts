import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent, ModalButton, RadioBoxComponent } from '@exim/ui-kit';

export interface TermEditStatusModalState {
  code: string;
  version: string;
  selectedStatus: string;
  changeType: string;
}

export interface TermStatusOption {
  value: string;
  label: string;
  description?: string;
  dotColor?: string;
}

@Component({
  selector: 'app-term-edit-status-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, RadioBoxComponent],
  templateUrl: './term-edit-status-modal.html',
})
export class TermEditStatusModalComponent {
  @Input() modal: TermEditStatusModalState | null = null;
  @Input() title = '';
  @Input() options: TermStatusOption[] = [];
  @Input() cancelLabel = 'ยกเลิก';
  @Input() saveLabel = 'บันทึก';
  @Output() closed = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string>();
  @Output() save = new EventEmitter<void>();

  get isOpen(): boolean {
    return this.modal !== null;
  }

  get cancelButton(): ModalButton {
    return {
      label: this.cancelLabel,
      variant: 'default',
      action: () => this.closed.emit(),
    };
  }

  get saveButton(): ModalButton {
    return {
      label: this.saveLabel,
      variant: 'primary',
      action: () => this.save.emit(),
    };
  }
}
