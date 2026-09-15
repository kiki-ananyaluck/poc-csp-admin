import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ButtonComponent,
  ConsentData,
  ConsentModalComponent,
  ConsentResult,
  SpinningComponent,
  DynamicFormComponent,
  DynamicFormConfig,
  DynamicFormValueChangeEvent,
  DropdownComponent,
  TextInputComponent,
  TextEditorComponent,
  ToastComponent,
  ModalComponent,
  ModalButton,
  ModalInputComponent,
  ModalInputButton,
  TagComponent,
  IconComponent,
} from '@exim/ui-kit';
import { TERM_CREATE_MESSAGES } from './term-create.message';
import { TERM_CREATE_SELECTORS } from './term-create.selector';
import { TermCreateState } from './term-create.state';
import type { TermsChangeType } from '../../../services/term-service/term.model';
import { APP_ROUTE_PATHS } from '../../../app.routes.const';
import {
  TermBreadcrumbComponent,
  TermBreadcrumbItem,
} from '../components/term-breadcrumb/term-breadcrumb';

type EditorLike = {
  root?: Element | null;
};

@Component({
  selector: 'app-term-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ConsentModalComponent,
    SpinningComponent,
    DynamicFormComponent,
    DropdownComponent,
    TextInputComponent,
    TextEditorComponent,
    ToastComponent,
    ModalComponent,
    ModalInputComponent,
    TagComponent,
    IconComponent,
    TermBreadcrumbComponent,
  ],
  providers: [TermCreateState],
  templateUrl: './term-create.html',
  styleUrl: './term-create.scss',
})
export class TermCreateComponent implements OnInit {
  protected readonly messages = TERM_CREATE_MESSAGES;
  protected readonly selectors = TERM_CREATE_SELECTORS;
  protected readonly state = inject(TermCreateState);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private editorInstance: EditorLike | null = null;
  private readonly versionCode = signal<string | null>(null);
  readonly isTitleModalOpen = signal(false);
  readonly isPreviewModalOpen = signal(false);
  readonly previewAccepted = signal(false);
  readonly previewHtml = signal('');
  readonly submitAttempted = signal(false);
  readonly titleDraft = signal('');
  readonly showDynamicForm = signal(true);

  content = '';

  readonly isVersionMode = computed(() => this.versionCode() !== null);

  readonly formConfig = computed<DynamicFormConfig>(() => ({
    showSubmit: false,
    rows: this.isVersionMode()
      ? [
          {
            gridTemplateColumns: 'minmax(0, 180px) 1fr',
            keys: ['conditionType', 'conditionTitle'],
          },
        ]
      : [
          {
            gridTemplateColumns: 'minmax(0, 180px) 1fr',
            keys: ['customerType', 'applicationCode'],
          },
          {
            gridTemplateColumns: 'minmax(0, 180px) 1fr',
            keys: ['conditionType', 'conditionTitle'],
          },
        ],
    fields: this.isVersionMode()
      ? [
          {
            key: 'conditionType',
            type: 'dropdown',
            label: this.messages.FIELD_CONDITION_TYPE,
            defaultValue: this.state.form().conditionType,
            validators: { required: true },
            options: [
              {
                value: 'MANDATORY',
                label: this.messages.CONDITION_TYPE_MANDATORY,
              },
              {
                value: 'OPTIONAL',
                label: this.messages.CONDITION_TYPE_OPTIONAL,
              },
            ],
            disabled: true,
          },
          {
            key: 'conditionTitle',
            type: 'text',
            label: this.messages.FIELD_CONDITION_TITLE,
            placeholder: this.messages.FIELD_CONDITION_TITLE_PLACEHOLDER,
            defaultValue: this.state.form().conditionTitle,
            validators: { required: true },
          },
        ]
      : [
          {
            key: 'customerType',
            type: 'dropdown',
            label: this.messages.FIELD_CUSTOMER_TYPE,
            defaultValue: this.state.form().customerType,
            validators: { required: true },
            options: [
              {
                value: 'INDIVIDUAL',
                label: this.messages.CUSTOMER_TYPE_INDIVIDUAL,
              },
              {
                value: 'CORPORATE',
                label: this.messages.CUSTOMER_TYPE_CORPORATE,
              },
            ],
          },
          {
            key: 'applicationCode',
            type: 'dropdown',
            label: this.messages.FIELD_SERVICE,
            placeholder: this.messages.SERVICE_PLACEHOLDER,
            validators: { required: true },
            options: this.state.serviceOptions(),
          },
          {
            key: 'conditionType',
            type: 'dropdown',
            label: this.messages.FIELD_CONDITION_TYPE,
            defaultValue: 'MANDATORY',
            validators: { required: true },
            options: [
              {
                value: 'MANDATORY',
                label: this.messages.CONDITION_TYPE_MANDATORY,
              },
              {
                value: 'OPTIONAL',
                label: this.messages.CONDITION_TYPE_OPTIONAL,
              },
            ],
          },
          {
            key: 'conditionTitle',
            type: 'text',
            label: this.messages.FIELD_CONDITION_TITLE,
            placeholder: this.messages.FIELD_CONDITION_TITLE_PLACEHOLDER,
            validators: { required: true },
          },
        ],
  }));

  isFormReadyToSave(): boolean {
    const form = this.state.form();
    const hasConditionTitle = form.conditionTitle.trim().length > 0;
    const hasContent = this.hasMeaningfulContent(this.content);

    if (this.isVersionMode()) {
      return hasConditionTitle && hasContent;
    }

    const hasApplicationCode = form.applicationCode.trim().length > 0;
    return hasApplicationCode && hasConditionTitle && hasContent;
  }

  showContentError(): boolean {
    return this.submitAttempted() && !this.hasMeaningfulContent(this.content);
  }

  readonly dynamicFormExternalErrors = computed<
    Record<string, string | null | undefined>
  >(() => {
    if (!this.submitAttempted()) {
      return {};
    }

    const form = this.state.form();
    const errors: Record<string, string | null | undefined> = {};

    if (!this.isVersionMode()) {
      if (!form.customerType?.trim()) {
        errors['customerType'] = this.messages.FIELD_CUSTOMER_TYPE_REQUIRED;
      }

      if (!form.applicationCode?.trim()) {
        errors['applicationCode'] = this.messages.FIELD_SERVICE_REQUIRED;
      }
    }

    if (!form.conditionType?.trim()) {
      errors['conditionType'] = this.messages.FIELD_CONDITION_TYPE_REQUIRED;
    }

    if (!form.conditionTitle?.trim()) {
      errors['conditionTitle'] = this.messages.FIELD_CONDITION_TITLE_REQUIRED;
    }

    return errors;
  });

  get cancelClearButton(): ModalButton {
    return {
      label: this.messages.MODAL_BTN_CANCEL,
      variant: 'text',
      action: () => this.state.closeConfirmClearDialog(),
    };
  }

  get confirmClearButton(): ModalButton {
    return {
      label: this.messages.MODAL_BTN_CONFIRM_CLEAR,
      variant: 'primary',
      action: () => this.onConfirmClear(),
    };
  }

  get titleModalCancelButton(): ModalInputButton {
    return {
      label: this.messages.TITLE_MODAL_BTN_CANCEL,
      variant: 'text',
      action: () => this.closeTitleModal(),
    };
  }

  get titleModalSaveButton(): ModalInputButton {
    return {
      label: this.messages.TITLE_MODAL_BTN_SAVE,
      variant: 'primary',
      action: () => this.saveTitleModal(),
    };
  }

  get titleLabel(): string {
    return this.state.form().title.trim() || this.messages.DEFAULT_TITLE_LABEL;
  }

  get previewConditionLabel(): string {
    return this.state.form().conditionTitle.trim();
  }

  get previewConditionFallbackText(): string {
    return 'ยังไม่ได้ระบุคำอธิบายวัตถุประสงค์';
  }

  get previewModalTitle(): string {
    return this.state.form().title.trim() || this.messages.DEFAULT_TITLE_LABEL;
  }

  get showPreviewRequiredStar(): boolean {
    return this.state.form().conditionType === 'MANDATORY';
  }

  readonly hidePreviewBackArrow = () => false;

  readonly previewConsentData = computed<ConsentData>(() => {
    const content = this.previewHtml().trim();
    const consentText =
      this.previewConditionLabel || this.previewConditionFallbackText;
    const purpose = {
      purposeId: 'term-create-preview-purpose',
      purposeName: 'term-create-preview-purpose',
      description: consentText,
      require: this.showPreviewRequiredStar,
      check: this.previewAccepted(),
    };

    return {
      noticeList: [
        {
          noticeId: 'term-create-preview-notice',
          noticeName: this.previewModalTitle,
          version: 'PUBLISHED',
          sections: [
            {
              name: 'preview-content',
              description: '',
              content: content || `<p>${this.messages.PREVIEW_MODAL_EMPTY}</p>`,
              sectionType: 'PLAIN',
              order: 1,
            },
          ],
          purposes: [purpose],
        },
      ],
      purposeList: [purpose],
    };
  });

  ngOnInit(): void {
    const code = this.route.snapshot.paramMap.get('code');
    const customerTypeQuery =
      this.route.snapshot.queryParamMap.get('customerType');

    if (customerTypeQuery === 'CORPORATE') {
      this.state.patchForm({ customerType: 'CORPORATE' });
    } else if (customerTypeQuery === 'INDIVIDUAL') {
      this.state.patchForm({ customerType: 'INDIVIDUAL' });
    }

    if (!code) {
      return;
    }

    this.versionCode.set(code);
    const copyFrom = this.route.snapshot.queryParamMap.get('copyFrom');

    void this.state.initVersionMode(code).then(() => {
      if (copyFrom) {
        void this.state.copyFromVersion(code, copyFrom).then(() => {
          this.state.ensureConditionTitleFromCopyFallback();
          this.content = this.state.form().content;
          this.refreshDynamicForm();
        });
        return;
      }

      this.refreshDynamicForm();
    });
  }

  private refreshDynamicForm(): void {
    this.showDynamicForm.set(false);
    queueMicrotask(() => this.showDynamicForm.set(true));
  }

  get breadcrumbItems(): TermBreadcrumbItem[] {
    if (this.isVersionMode()) {
      return [
        { label: this.messages.BREADCRUMB_HOME, click: () => this.goToHome() },
        {
          label: this.messages.BREADCRUMB_DETAIL,
          click: () => this.goToDetail(),
        },
        { label: this.messages.BREADCRUMB_CREATE_VERSION },
      ];
    }

    return [
      { label: this.messages.BREADCRUMB_HOME, click: () => this.goToHome() },
      { label: this.messages.BREADCRUMB_CREATE },
    ];
  }

  onFormValueChange(event: DynamicFormValueChangeEvent): void {
    this.state.patchForm({
      customerType: event.value['customerType'] as 'INDIVIDUAL' | 'CORPORATE',
      applicationCode: (event.value['applicationCode'] as string) ?? '',
      conditionType: event.value['conditionType'] as 'MANDATORY' | 'OPTIONAL',
      conditionTitle: (event.value['conditionTitle'] as string) ?? '',
    });
  }

  onVersionConditionTitleChange(value: string): void {
    this.state.patchForm({ conditionTitle: value ?? '' });
  }

  get changeTypeOptions() {
    return [
      { value: 'MAJOR', label: this.messages.CHANGE_TYPE_MAJOR },
      { value: 'MINOR', label: this.messages.CHANGE_TYPE_MINOR },
    ];
  }

  onChangeTypeChange(value: string): void {
    this.state.setChangeType(value as TermsChangeType);
  }

  openTitleModal(): void {
    this.titleDraft.set(this.titleLabel);
    this.isTitleModalOpen.set(true);
  }

  closeTitleModal(): void {
    this.isTitleModalOpen.set(false);
  }

  saveTitleModal(): void {
    const nextTitle =
      this.titleDraft().trim() || this.messages.DEFAULT_TITLE_LABEL;
    this.state.patchForm({ title: nextTitle });
    this.isTitleModalOpen.set(false);
  }

  onEditorCreated(editor: EditorLike): void {
    this.editorInstance = editor;
  }

  private buildPreviewHtmlFromEditor(): string {
    const root = this.editorInstance?.root;
    if (!(root instanceof HTMLElement)) {
      return this.content ?? '';
    }

    const snapshot = document.createElement('div');
    snapshot.innerHTML = root.innerHTML;

    const sourceImages = Array.from(root.querySelectorAll('img'));
    const snapshotImages = Array.from(snapshot.querySelectorAll('img'));

    snapshotImages.forEach((img, index) => {
      const source = sourceImages[index];
      if (!source) return;

      const width = source.clientWidth;
      const height = source.clientHeight;
      const originalStyle = img.getAttribute('style')?.trim() ?? '';
      const normalizedStyle = originalStyle.endsWith(';')
        ? originalStyle
        : originalStyle
          ? `${originalStyle};`
          : '';

      const sizedStyle =
        width > 0 && height > 0
          ? `${normalizedStyle} width:${width}px; height:${height}px;`
          : normalizedStyle;

      if (sizedStyle) {
        img.setAttribute('style', sizedStyle.trim());
      }

      if (width > 0) {
        img.setAttribute('width', String(width));
      }

      if (height > 0) {
        img.setAttribute('height', String(height));
      }
    });

    return snapshot.innerHTML;
  }

  private hasMeaningfulContent(html: string): boolean {
    const normalized = (html ?? '').trim();
    if (!normalized) {
      return false;
    }

    // Treat media as meaningful content even when text is empty.
    if (/<(img|video|iframe|table|hr)\b/i.test(normalized)) {
      return true;
    }

    const textOnly = normalized
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .trim();

    return textOnly.length > 0;
  }

  openPreviewModal(): void {
    this.previewHtml.set(this.buildPreviewHtmlFromEditor());
    this.previewAccepted.set(false);
    this.isPreviewModalOpen.set(true);
  }

  closePreviewModal(): void {
    this.isPreviewModalOpen.set(false);
    this.previewHtml.set('');
  }

  onPreviewConsentSubmit(results: ConsentResult[]): void {
    const selected = results.find(
      (item) => item.purposeId === 'term-create-preview-purpose',
    );
    this.previewAccepted.set(!!selected?.check);
    this.closePreviewModal();
  }

  private goToHome(): void {
    void this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE]);
  }

  private goToDetail(): void {
    const code = this.versionCode();
    if (!code) return;
    void this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE, code]);
  }

  onStartBlank(): void {
    this.state.openConfirmClearDialog();
  }

  onConfirmClear(): void {
    this.state.confirmClear();
    this.content = '';
  }

  async save(): Promise<void> {
    this.submitAttempted.set(true);

    this.state.ensureConditionTitleFromCopyFallback();

    const latestContent = this.buildPreviewHtmlFromEditor();
    this.content = latestContent;
    this.state.patchForm({ content: latestContent });

    if (!this.isFormReadyToSave()) {
      this.state.triggerToast(this.messages.VALIDATION_REQUIRED, 'error');
      return;
    }

    const code = this.versionCode();
    if (code) {
      const success = await this.state.submitVersion(code);
      if (success) {
        void this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE, code], {
          state: { toast: this.messages.TOAST_SAVE_SUCCESS },
        });
      } else {
        this.state.triggerToast(this.messages.TOAST_SAVE_ERROR, 'error');
      }
      return;
    }

    const documentCode = await this.state.submit();
    if (documentCode) {
      void this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE], {
        state: {
          toast: this.messages.TOAST_SAVE_SUCCESS,
          toastSource: 'term-create-success',
        },
      });
    } else {
      this.state.triggerToast(this.messages.TOAST_SAVE_ERROR, 'error');
    }
  }
}
