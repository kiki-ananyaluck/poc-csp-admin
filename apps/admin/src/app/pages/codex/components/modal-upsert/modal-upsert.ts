import { Component, inject, computed } from '@angular/core';
import {
  ModalInputButton,
  DynamicFormConfig,
  DynamicFormSubmitEvent,
  ModalInputComponent,
  DynamicFormComponent,
} from '@exim/ui-kit';
import { ModalUpsertCodexState } from './modal-upsert.state';
import { MODAL_UPSERT_CODEX_MESSAGES } from './modal-upsert.message';
import { MODAL_UPSERT_CODEX_SELECTORS } from './modal-upsert.selectors';

@Component({
  selector: 'app-codex-modal-upsert',
  standalone: true,
  imports: [ModalInputComponent, DynamicFormComponent],
  templateUrl: './modal-upsert.html',
  styleUrls: ['./modal-upsert.scss'],
  // providers: [ModalUpsertCodexState],
})
export class CodexModalUpsert {
  readonly state = inject(ModalUpsertCodexState);

  readonly messages = MODAL_UPSERT_CODEX_MESSAGES;
  readonly ID = MODAL_UPSERT_CODEX_SELECTORS;

  readonly title = computed(() =>
    this.state.mode() === 'edit'
      ? this.messages.TITLE_EDIT
      : this.messages.TITLE_CREATE,
  );

  readonly subtitle = computed(() =>
    this.state.mode() === 'edit'
      ? `${this.messages.TITLE_DESCRIPTION_EDIT}${this.state.editCode()}`
      : this.messages.TITLE_DESCRIPTION_CREATE,
  );

  readonly formConfig = computed(
    (): DynamicFormConfig => ({
      title: '',
      showSubmit: false,
      fields: [
        {
          key: 'code',
          type: 'text',
          label: 'รหัส',
          placeholder: 'MD-123456',
          validators: { required: true },
          ...(this.state.mode() === 'edit' ? { disabled: true } : {}),
        },
        {
          key: 'nameTh',
          type: 'text',
          label: 'ชื่อ (TH)',
          placeholder: 'ชื่อที่ใช้แสดงผล ภาษาไทย',
          validators: { required: true },
        },
        {
          key: 'nameEn',
          type: 'text',
          label: 'ชื่อ (EN)',
          placeholder: 'ชื่อที่ใช้แสดงผล ภาษาอังกฤษ',
          validators: { required: true },
        },
        {
          key: 'status',
          type: 'radioCard',
          label: 'สถานะ',
          options: [
            {
              label: 'Active',
              value: 'active',
              description: 'ผู้ใช้งานสามารถเห็นได้',
              dotColor: '#197D3F',
            },
            {
              label: 'Inactive',
              value: 'inactive',
              description: 'ผู้ใช้งานจะไม่เห็นข้อมูลนี้',
              dotColor: '#505050',
            },
          ],
          ui: { direction: 'horizontal' },
          validators: { required: true },
        },
      ],
    }),
  );

  onLeaveConfirm(): void {
    void this.state.onConfirm();
  }

  onLeaveCancel(): void {
    this.state.onCancel();
  }

  onLogin(formValue: DynamicFormSubmitEvent): void {
    console.log('Login form submitted with value:', formValue);
  }

  protected readonly leaveConfirmButton: ModalInputButton = {
    label: MODAL_UPSERT_CODEX_MESSAGES.BTN_CONFIRM,
    icon: 'save',
    variant: 'primary',
    action: () => this.onLeaveConfirm(),
  };

  protected readonly leaveCancelButton: ModalInputButton = {
    label: MODAL_UPSERT_CODEX_MESSAGES.BTN_CANCEL,
    variant: 'text',
    action: () => this.onLeaveCancel(),
  };
}
