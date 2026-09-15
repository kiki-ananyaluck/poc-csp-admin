import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { APP_ROUTE_PATHS } from '../../../../../app.routes.const';
import { encodeFlowInstanceId, encodeTaskIdToken } from '../../../srm-id.util';
import type { NzTableSortOrder } from 'ng-zorro-antd/table';
import {
  ButtonComponent,
  SearchInputComponent,
  CheckboxComponent,
  TableComponent,
  TableColumnComponent,
  TableCellDirective,
  TagComponent,
  IconComponent,
  ToastComponent,
  ModalInputComponent,
  ModalInputButton,
} from '@exim/ui-kit';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { SERVICE_REQUEST_MANAGEMENT_MESSAGES } from '../../service-request-management-list.message';
import { SERVICE_REQUEST_MANAGEMENT_SELECTORS } from '../../service-request-management-list.selector';
import { ServiceRequestManagementListState } from '../../service-request-management-list.state';
import { UserService as UserApiService } from '../../../../../services/user-service/user/user.service';
import { WorkflowService } from '../../../../../services/workflow-service/workflow/workflow.service';
import {
  SrmStatusDisplay,
  getStatusDisplay,
} from '../../../service-request-management.config';
import { CodexService } from '../../../../../services/codex-service/codex.service';
import { CodexEntry } from '../../../../../services/codex-service/codex.model';
import { ThaiDatePickerComponent } from '../../../component/thai-date-picker/thai-date-picker.component';
import { environment } from '@environments/environments';
import {
  SRM_TAB_ACTION_ICON,
  SRM_TAB_ACTION_LABEL,
  SRM_TAB_ACTION_MODE,
} from '../srm-tab.config';
import { SRM_TAB_TABLE_MESSAGES } from './srm-tab-table.message';
import { SRM_TAB_TABLE_STATE } from './srm-tab-table.state';

interface SrmAssigneeOption {
  value: string;
  name: string;
  position: string;
  department: string;
}

interface SrmCodexStatusLabel {
  id: string;
  code: string;
  value: string;
  labelTH: string;
  labelEN: string;
}

interface SrmServiceOption {
  id: string;
  appName: string;
}

interface SrmActionOutcome {
  total: number;
  successCount: number;
  failedCount: number;
  reason: string | null;
}

let codexStatusEntriesCache: SrmCodexStatusLabel[] | null = null;
let codexStatusEntriesPromise: Promise<SrmCodexStatusLabel[]> | null = null;
let serviceOptionsCache: SrmServiceOption[] | null = null;
let serviceOptionsPromise: Promise<SrmServiceOption[]> | null = null;
let assigneeOptionsCache: SrmAssigneeOption[] | null = null;
let assigneeOptionsPromise: Promise<SrmAssigneeOption[]> | null = null;

@Component({
  selector: 'app-srm-tab-table',
  standalone: true,
  imports: [
    ButtonComponent,
    SearchInputComponent,
    CheckboxComponent,
    TableComponent,
    TableColumnComponent,
    TableCellDirective,
    TagComponent,
    IconComponent,
    ToastComponent,
    ModalInputComponent,
    ThaiDatePickerComponent,
    NzTooltipModule,
  ],
  templateUrl: './srm-tab-table.html',
  styleUrl: './srm-tab-table.scss',
})
export class SrmTabTableComponent {
  readonly showCheckbox = input<boolean>(false);
  readonly actionLabel = input<string>(SRM_TAB_ACTION_LABEL.PICKUP);
  readonly actionIcon = input<string>(SRM_TAB_ACTION_ICON.PICKUP);
  readonly actionMode = input<'pickup' | 'reassign'>(
    SRM_TAB_ACTION_MODE.PICKUP,
  );
  readonly sourceTabOverride = input<string | null>(null);

  protected readonly tableMessages = SRM_TAB_TABLE_MESSAGES;

  protected readonly computedActionIcon = computed(() => {
    if (this.actionMode() === SRM_TAB_ACTION_MODE.REASSIGN) {
      return 'swap';
    }
    return this.actionIcon();
  });

  protected readonly messages = SERVICE_REQUEST_MANAGEMENT_MESSAGES;
  protected readonly selectors = SERVICE_REQUEST_MANAGEMENT_SELECTORS;
  protected readonly state = inject(ServiceRequestManagementListState);
  private readonly router = inject(Router);
  private readonly codexService = inject(CodexService);
  private readonly userApiService = inject(UserApiService);
  private readonly workflowService = inject(WorkflowService);

  protected readonly codexStatusEntries = signal<SrmCodexStatusLabel[]>([]);
  protected readonly serviceOptions = signal<SrmServiceOption[]>([]);
  protected readonly assigneeOptions = signal<SrmAssigneeOption[]>([]);
  protected readonly filterPanelMaxHeight = signal<number | null>(null);

  @ViewChild('filterPanel')
  private filterPanelRef?: ElementRef<HTMLDivElement>;

  constructor() {
    void this.loadCodexStatusEntries();
    void this.loadServiceOptions();
  }

  private async loadCodexStatusEntries(): Promise<void> {
    if (codexStatusEntriesCache) {
      this.codexStatusEntries.set(codexStatusEntriesCache);
      return;
    }

    try {
      if (!codexStatusEntriesPromise) {
        codexStatusEntriesPromise = this.codexService
          .getEntries({
            categoryId: SRM_TAB_TABLE_STATE.STATUS_CATEGORY_ID,
            pageNumber: 1,
            pageSize: 200,
          })
          .then((response) =>
            response.data.items.map((entry) => {
              const labelEN = this.getLocalizationLabel(
                entry,
                SRM_TAB_TABLE_STATE.STATUS_LABEL_LOCALE_EN,
              );
              const labelTH = this.getLocalizationLabel(
                entry,
                SRM_TAB_TABLE_STATE.STATUS_LABEL_LOCALE_TH,
              );

              return {
                id: entry.id,
                code: entry.code,
                value: labelEN,
                labelTH,
                labelEN,
              };
            }),
          );
      }

      const entries = await codexStatusEntriesPromise;
      codexStatusEntriesCache = entries;
      this.codexStatusEntries.set(entries);
    } catch (error) {
      console.error('[SRM] Failed to load Codex status entries', error);
      this.codexStatusEntries.set([]);
    } finally {
      codexStatusEntriesPromise = null;
    }
  }

  private getLocalizationLabel(entry: CodexEntry, locale: string): string {
    return (
      entry.localizations.find((item) => item.locale.toLowerCase() === locale)
        ?.label ?? ''
    );
  }

  private async loadServiceOptions(): Promise<void> {
    if (serviceOptionsCache) {
      this.serviceOptions.set(serviceOptionsCache);
      return;
    }

    try {
      if (!serviceOptionsPromise) {
        serviceOptionsPromise = this.codexService
          .getApps({
            isActive: true,
            page: 1,
            pageSize: 100,
            sortBy: 'sortOrder',
            sortDirection: 'asc',
          })
          .then((response) =>
            response.data.items.map((item) => ({
              id: item.appCode,
              appName: item.appName,
            })),
          );
      }

      const options = await serviceOptionsPromise;
      serviceOptionsCache = options;
      this.serviceOptions.set(options);
    } catch (error) {
      console.error('[SRM] Failed to load service options', error);
      this.serviceOptions.set([]);
    } finally {
      serviceOptionsPromise = null;
    }
  }

  protected readonly statusOptions = computed(() =>
    this.codexStatusEntries()
      .filter((entry) => entry.code !== 'DRAFT')
      .map((entry) => ({
        code: entry.labelEN,
        label: entry.labelTH || entry.labelEN || entry.code,
      })),
  );

  getServiceLabel(serviceId: string): string {
    return (
      this.serviceOptions().find((item) => item.id === serviceId)?.appName ||
      serviceId
    );
  }

  getSelectedStatusLabels(): string {
    return this.state
      .activeStatuses()
      .map((code) => this.getStatusLabel(code))
      .join(', ');
  }

  getSelectedServiceLabels(): string {
    return this.state
      .activeServiceIds()
      .map((serviceId) => this.getServiceLabel(serviceId))
      .join(', ');
  }

  clearAppliedStatuses(): void {
    this.state
      .activeStatuses()
      .forEach((code) => this.state.removeAppliedStatus(code));
  }

  clearAppliedServices(): void {
    this.state
      .activeServiceIds()
      .forEach((serviceId) => this.state.removeAppliedService(serviceId));
  }

  protected readonly selectedIds = signal<Set<string>>(new Set());
  protected readonly isActionLoading = signal(false);
  protected readonly showToast = signal(false);
  protected readonly toastMessage = signal('');
  protected readonly toastVariant = signal<'success' | 'error'>('success');
  protected readonly allSelected = computed(() => {
    const total = this.state.rows().length;
    return total > 0 && this.selectedIds().size === total;
  });
  private toastShowTimer?: ReturnType<typeof setTimeout>;
  private toastHideTimer?: ReturnType<typeof setTimeout>;

  // ── Reassign modal ────────────────────────────────────────────────────────
  protected readonly reassignModalOpen = signal(false);
  protected readonly assigneeDropdownOpen = signal(false);
  protected readonly assigneeSearchQuery = signal('');
  protected readonly assigneePanelRect = signal<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  protected reassigneeId: string | null = null;

  @ViewChild('assigneeTrigger')
  private assigneeTriggerRef!: ElementRef<HTMLButtonElement>;

  protected get selectedAssignee() {
    return (
      this.assigneeOptions().find((o) => o.value === this.reassigneeId) ?? null
    );
  }

  protected readonly filteredAssigneeOptions = computed(() => {
    const q = this.assigneeSearchQuery().toLowerCase().trim();
    const options = this.assigneeOptions();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.position.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    );
  });

  protected readonly reassignCancelButton: ModalInputButton = {
    label: SRM_TAB_TABLE_MESSAGES.BTN_CANCEL,
    variant: 'secondary',
    action: () => this.closeReassignModal(),
  };

  protected readonly reassignConfirmButton: ModalInputButton = {
    label: SRM_TAB_TABLE_MESSAGES.BTN_REASSIGN_CONFIRM,
    variant: 'primary',
    action: () => {
      void this.confirmReassign();
    },
  };

  async onActionClick(): Promise<void> {
    if (this.actionMode() === SRM_TAB_ACTION_MODE.REASSIGN) {
      this.openReassignModal();
      return;
    }

    const outcome = await this.pickupSelectedTasks();
    if (outcome) {
      this.showPickupToast(outcome);
    }
  }

  private async pickupSelectedTasks(
    actionByOverride?: string,
  ): Promise<SrmActionOutcome | null> {
    const appIds = this.getSelectedAppIds();
    if (appIds.length === 0 || this.isActionLoading()) {
      return null;
    }

    const actionBy =
      actionByOverride?.trim() || (await this.state.getActionByEmail());
    if (!actionBy) {
      console.error('[SRM] Unable to resolve actionBy for pickup workflow');
      this.triggerToast(SRM_TAB_TABLE_MESSAGES.TOAST_ACTOR_NOT_FOUND, 'error');
      return null;
    }

    this.isActionLoading.set(true);
    try {
      const outcome = await this.workflowService.pickupWorkflowByAppIds(
        appIds,
        actionBy,
      );

      this.selectedIds.set(new Set());
      await this.state.load();
      return outcome;
    } catch (error) {
      console.error(
        '[SRM] Failed to pickup selected workflow instances',
        error,
      );
      this.triggerToast(this.getErrorMessage(error), 'error');
      return null;
    } finally {
      this.isActionLoading.set(false);
    }
  }

  private getSelectedAppIds(): string[] {
    const selected = this.selectedIds();
    const appIds = this.state
      .rows()
      .filter((row) => selected.has(row.id))
      .map((row) => row.refNo?.trim())
      .filter((appId): appId is string => !!appId && appId !== '-');

    return Array.from(new Set(appIds));
  }

  openReassignModal(): void {
    this.reassigneeId = null;
    this.assigneeSearchQuery.set('');
    this.assigneeDropdownOpen.set(false);
    void this.loadAssigneeOptions();
    this.reassignModalOpen.set(true);
  }

  private async loadAssigneeOptions(): Promise<void> {
    if (assigneeOptionsCache) {
      this.assigneeOptions.set(assigneeOptionsCache);
      return;
    }

    try {
      const adminMakerRoleId = this.getAdminMakerRoleId();
      if (!adminMakerRoleId) {
        console.error('[SRM] Missing adminMakerRoleId config');
        this.assigneeOptions.set([]);
        return;
      }

      if (!assigneeOptionsPromise) {
        assigneeOptionsPromise = this.userApiService
          .getEmployeesByRole(adminMakerRoleId)
          .then((employees) => {
            const uniqueByEmail = new Map<string, SrmAssigneeOption>();

            for (const employee of employees) {
              const email = employee.empEmail?.trim();
              if (!email) {
                continue;
              }

              const title = employee.empTitleTH?.trim() ?? '';
              const firstName = employee.empFirstNameTH?.trim() ?? '';
              const lastName = employee.empLastNameTH?.trim() ?? '';
              const name = [title, firstName, lastName]
                .filter((part) => part.length > 0)
                .join(' ');

              const levelName = employee.levelName?.trim() ?? '';
              const posName = employee.posName?.trim() ?? '';
              const position = [levelName, posName]
                .filter((part) => part.length > 0)
                .join(' - ');

              uniqueByEmail.set(email, {
                value: email,
                name: name || '-',
                position: position || '-',
                department: employee.depName?.trim() || '-',
              });
            }

            return Array.from(uniqueByEmail.values());
          });
      }

      const options = await assigneeOptionsPromise;
      assigneeOptionsCache = options;
      this.assigneeOptions.set(options);
    } catch (error) {
      console.error('[SRM] Failed to load assignee options', error);
      this.assigneeOptions.set([]);
    } finally {
      assigneeOptionsPromise = null;
    }
  }

  private getAdminMakerRoleId(): string {
    const roleId = (
      environment as {
        srm?: {
          roles?: {
            adminMakerRoleId?: string;
          };
        };
      }
    ).srm?.roles?.adminMakerRoleId;

    return roleId?.trim() ?? '';
  }

  closeReassignModal(): void {
    this.assigneeSearchQuery.set('');
    this.assigneeDropdownOpen.set(false);
    this.reassignModalOpen.set(false);
  }

  toggleAssigneeDropdown(): void {
    if (this.assigneeDropdownOpen()) {
      this.assigneeDropdownOpen.set(false);
      return;
    }
    const rect = this.assigneeTriggerRef.nativeElement.getBoundingClientRect();
    this.assigneePanelRect.set({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
    this.assigneeSearchQuery.set('');
    this.assigneeDropdownOpen.set(true);
  }

  onToggleFilter(): void {
    this.state.toggleFilter();

    if (!this.state.filterOpen()) {
      this.filterPanelMaxHeight.set(null);
      return;
    }

    setTimeout(() => this.syncFilterPanelMaxHeight(), 0);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.state.filterOpen()) {
      this.syncFilterPanelMaxHeight();
    }
  }

  private syncFilterPanelMaxHeight(): void {
    const panel = this.filterPanelRef?.nativeElement;
    if (!panel) return;

    const top = panel.getBoundingClientRect().top;
    const bottomGap = 16;
    const availableHeight = Math.floor(window.innerHeight - top - bottomGap);

    this.filterPanelMaxHeight.set(Math.max(280, availableHeight));
  }

  selectAssignee(opt: SrmAssigneeOption): void {
    this.reassigneeId = opt.value;
    this.assigneeDropdownOpen.set(false);
  }

  private async confirmReassign(): Promise<void> {
    const reassigneeEmail = this.reassigneeId?.trim();
    if (!reassigneeEmail) {
      return;
    }

    const outcome = await this.pickupSelectedTasks(reassigneeEmail);
    if (outcome && outcome.failedCount === 0) {
      this.closeReassignModal();
      this.triggerToast(
        SRM_TAB_TABLE_MESSAGES.TOAST_REASSIGN_SUCCESS,
        'success',
      );
      return;
    }

    if (outcome && outcome.failedCount > 0) {
      this.showPickupToast(outcome);
    }
  }

  dismissToast(): void {
    clearTimeout(this.toastShowTimer);
    clearTimeout(this.toastHideTimer);
    this.showToast.set(false);
  }

  private triggerToast(message: string, variant: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastVariant.set(variant);
    this.showToast.set(false);
    clearTimeout(this.toastShowTimer);
    clearTimeout(this.toastHideTimer);
    this.toastShowTimer = setTimeout(() => {
      this.showToast.set(true);
      this.toastHideTimer = setTimeout(
        () => this.showToast.set(false),
        SRM_TAB_TABLE_STATE.TOAST_AUTO_DISMISS_MS,
      );
    }, 0);
  }

  private showPickupToast(outcome: SrmActionOutcome): void {
    if (outcome.failedCount <= 0) {
      this.triggerToast(
        SRM_TAB_TABLE_MESSAGES.FORMAT_PICKUP_SUCCESS(outcome.successCount),
        'success',
      );
      return;
    }

    const reasonSuffix = outcome.reason
      ? SRM_TAB_TABLE_MESSAGES.FORMAT_PICKUP_REASON_SUFFIX(outcome.reason)
      : '';

    this.triggerToast(
      SRM_TAB_TABLE_MESSAGES.FORMAT_PICKUP_PARTIAL_FAIL(
        outcome.successCount,
        outcome.failedCount,
        reasonSuffix,
      ),
      'error',
    );
  }

  private getErrorMessage(error: unknown): string {
    if (this.isNetworkError(error)) {
      return SRM_TAB_TABLE_MESSAGES.TOAST_API_NETWORK_ERROR;
    }

    const backendDetail = this.extractBackendErrorMessage(error);
    if (backendDetail && this.isUserFriendlyErrorMessage(backendDetail)) {
      return backendDetail;
    }

    const statusCode = this.getHttpStatusCode(error);
    if (statusCode !== null) {
      return this.getStatusErrorMessage(statusCode);
    }

    return SRM_TAB_TABLE_MESSAGES.TOAST_GENERIC_ERROR;
  }

  private getHttpStatusCode(error: unknown): number | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const status = (error as { status?: unknown }).status;
    return typeof status === 'number' ? status : null;
  }

  private isNetworkError(error: unknown): boolean {
    const statusCode = this.getHttpStatusCode(error);
    if (statusCode === 0) {
      return true;
    }

    const detail = this.extractBackendErrorMessage(error);
    if (!detail) {
      return false;
    }

    const normalized = detail.toLowerCase();
    return /network|failed to fetch|timeout|econn|socket/i.test(normalized);
  }

  private extractBackendErrorMessage(error: unknown): string | null {
    if (!error || typeof error !== 'object') {
      return null;
    }

    const errObj = error as Record<string, unknown>;
    const errBody =
      errObj['error'] && typeof errObj['error'] === 'object'
        ? (errObj['error'] as Record<string, unknown>)
        : null;

    return (
      this.toString(errBody?.['detail']) ??
      this.toString(errBody?.['message']) ??
      this.toString(errObj['message'])
    );
  }

  private isUserFriendlyErrorMessage(message: string): boolean {
    const normalized = message.toLowerCase();
    if (normalized.length < 4) {
      return false;
    }

    if (this.looksLikeTechnicalMessage(normalized)) {
      return false;
    }

    return true;
  }

  private looksLikeTechnicalMessage(message: string): boolean {
    return /(exception|stack|trace|sql|constraint|nullreference|undefined|internal server|http failure|cors|syntaxerror|typeerror|referenceerror|gateway timeout|service unavailable)/i.test(
      message,
    );
  }

  private getStatusErrorMessage(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return SRM_TAB_TABLE_MESSAGES.TOAST_API_BAD_REQUEST;
      case 401:
        return SRM_TAB_TABLE_MESSAGES.TOAST_API_UNAUTHORIZED;
      case 403:
        return SRM_TAB_TABLE_MESSAGES.TOAST_API_FORBIDDEN;
      case 404:
        return SRM_TAB_TABLE_MESSAGES.TOAST_API_NOT_FOUND;
      case 409:
        return SRM_TAB_TABLE_MESSAGES.TOAST_API_CONFLICT;
      case 422:
        return SRM_TAB_TABLE_MESSAGES.TOAST_API_UNPROCESSABLE;
      case 429:
        return SRM_TAB_TABLE_MESSAGES.TOAST_API_TOO_MANY_REQUESTS;
      case 503:
      case 504:
        return SRM_TAB_TABLE_MESSAGES.TOAST_API_SERVICE_UNAVAILABLE;
      default:
        if (statusCode >= 500) {
          return SRM_TAB_TABLE_MESSAGES.TOAST_API_SERVER_ERROR;
        }
        return SRM_TAB_TABLE_MESSAGES.TOAST_GENERIC_ERROR;
    }
  }

  private toString(value: unknown): string | null {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    return null;
  }

  protected get headerCheckboxConfig() {
    return { indeterminate: false };
  }

  getStatusDisplay(code: string): SrmStatusDisplay {
    return getStatusDisplay(code);
  }

  getStatusLabel(code: string): string {
    const normalizedCode = this.normalizeStatusCode(code);

    const directMatched = this.codexStatusEntries().find(
      (entry) => this.normalizeStatusCode(entry.code) === normalizedCode,
    );

    if (directMatched) {
      return directMatched.labelTH || directMatched.labelEN || code;
    }

    return code;
  }

  private normalizeStatusCode(value: string): string {
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  get isFiltering(): boolean {
    const dateRange = this.state.activeDateRange();
    return (
      this.state.searchQuery().trim() !== '' ||
      this.state.activeStatuses().length > 0 ||
      this.state.activeServiceIds().length > 0 ||
      dateRange.from !== null ||
      dateRange.to !== null
    );
  }

  onColumnSort(event: { key: string; value: NzTableSortOrder }): void {
    this.state.setSort(event.key, event.value);
  }

  onDateFromChange(dateString: string | null): void {
    this.state.setDraftDateFrom(dateString);
  }

  onDateToChange(dateString: string | null): void {
    this.state.setDraftDateTo(dateString);
  }

  formatDateRangeLabel(): string {
    const range = this.state.activeDateRange();
    const from = range.from ? this.formatThaiDate(range.from) : '';
    const to = range.to ? this.formatThaiDate(range.to) : '';

    if (from && to) {
      return `${from} - ${to}`;
    } else if (from) {
      return SRM_TAB_TABLE_MESSAGES.FORMAT_DATE_FROM(from);
    } else if (to) {
      return SRM_TAB_TABLE_MESSAGES.FORMAT_DATE_TO(to);
    }
    return '';
  }

  private formatThaiDate(dateString: string): string {
    const datePart = dateString.includes('T')
      ? dateString.slice(0, 10)
      : dateString;
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }

  clearDateFilter(): void {
    this.state.clearActiveDateRange();
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.state.setPage(event.pageIndex);
  }

  onPageSizeChange(size: number): void {
    this.state.setPageSize(size);
  }

  toggleSelectAll(event: { key: string; value: boolean }): void {
    if (event.value) {
      this.selectedIds.set(new Set(this.state.rows().map((r) => r.id)));
    } else {
      this.selectedIds.set(new Set());
    }
  }

  toggleSelectRow(id: string, checked: boolean): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  isRowSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  navigateToDetail(row: { refNo?: string; id?: string | number }): void {
    const refNo = row.refNo?.trim();
    if (!refNo) {
      return;
    }

    const encodedRefNo = encodeFlowInstanceId(refNo);
    const encodedTaskId =
      row.id !== undefined && row.id !== null && String(row.id).trim()
        ? encodeTaskIdToken(String(row.id).trim())
        : null;

    const sourceTab = this.sourceTabOverride() ?? this.state.tabType();

    const queryParams = {
      sourceTab,
      ...(encodedTaskId ? { taskId: encodedTaskId } : {}),
    };

    this.router.navigate(
      [APP_ROUTE_PATHS.SERVICE_REQUEST_MANAGEMENT, encodedRefNo],
      {
        queryParams,
        state: {
          sourceTab,
          taskId: encodedTaskId,
        },
      },
    );
  }

  protected displayValue(value: unknown): string {
    return value != null && value !== '' ? String(value) : '-';
  }
}
