import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  ButtonComponent,
  EditHistoryComponent,
  IconComponent,
  SpinningComponent,
  type EditHistoryEntry,
  type EditHistoryRound,
  ModalComponent,
  ModalInputComponent,
  StatusHistoryComponent,
  type StatusHistoryItem,
  TagComponent,
  TabsComponent,
  SearchInputComponent,
  ToastComponent,
} from '@exim/ui-kit';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { AuthUserService } from '@exim/auth-sdk';
import { environment } from '@environments/environments';
import { APP_ROUTE_PATHS } from '../../../app.routes.const';
import { decodeFlowInstanceId, decodeTaskIdToken } from '../srm-id.util';
import { getStatusDisplay } from '../service-request-management.config';
import { AdminService } from '../../../services/user-service/admin/admin.service';
import { OnboardingService } from '../../../services/user-service/onboarding/onboarding.service';
import { UserService as UserApiService } from '../../../services/user-service/user/user.service';
import { WorkflowService } from '../../../services/workflow-service/workflow/workflow.service';
import { CodexService } from '../../../services/codex-service/codex.service';
import {
  CodexAppItem,
  CodexAppsResponse,
} from '../../../services/codex-service/codex.model';
import { TaskService } from '../../../services/task-service/task-service';
import { InstanceEditHistoryRound } from '../../../services/user-service/admin/admin.model';
import { ReworkStepPayload } from '../../../services/workflow-service/workflow/workflow.model';
import { EmployeeByRoleItem } from '../../../services/user-service/user/user.model';
import {
  SRM_DETAIL_BOTTOM_ACTION_POLICY_BY_STATUS,
  SRM_DETAIL_REWORK_ACTOR,
  SRM_DETAIL_STATUS,
  SRM_DETAIL_TAB_PAGES,
  SRM_DETAIL_STEPS,
} from './service-request-management-detail.state';
import { SRM_DETAIL_MESSAGES } from './service-request-management-detail.message';
import {
  OnboardingComponent,
  OnboardingReview,
  ReworkTargetInput,
} from '@exim/onboarding';

const SRM_DETAIL_ACTION_API_DRY_RUN = false;

interface SrmAssigneeOption {
  value: string;
  name: string;
  position: string;
  department: string;
}

let assigneeOptionsCache: SrmAssigneeOption[] | null = null;
let assigneeOptionsPromise: Promise<SrmAssigneeOption[]> | null = null;

@Component({
  selector: 'app-service-request-management-detail',
  standalone: true,
  imports: [
    RouterModule,
    NzBreadCrumbModule,
    ButtonComponent,
    TagComponent,
    TabsComponent,
    ModalComponent,
    ModalInputComponent,
    IconComponent,
    StatusHistoryComponent,
    EditHistoryComponent,
    OnboardingComponent,
    SpinningComponent,
    SearchInputComponent,
    ToastComponent,
  ],
  templateUrl: './service-request-management-detail.html',
  styleUrl: './service-request-management-detail.scss',
})
export class ServiceRequestManagementDetailComponent {
  private static readonly REJECT_REASON_MAX_LENGTH = 500;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminService = inject(AdminService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly userApiService = inject(UserApiService);
  private readonly workflowService = inject(WorkflowService);
  private readonly codexService = inject(CodexService);
  private readonly taskService = inject(TaskService);
  private readonly authUserService = inject(AuthUserService);
  private readonly encodedRefNo = this.route.snapshot.paramMap.get('id') ?? '';
  private readonly routeTaskId = this.getTaskIdFromNavigationState();
  protected readonly refNo = signal(
    this.decodeRouteParamRefNo(this.encodedRefNo),
  );
  protected readonly taskId = signal<number | null>(
    this.parseTaskId(this.routeTaskId),
  );
  protected readonly sourceTab = signal(this.getSourceTabFromNavigationState());
  protected readonly flowInstanceId = signal('');
  protected readonly showReassignButton = computed(
    () =>
      this.sourceTab().trim() === 'in-progress' && this.canShowReassignByRole(),
  );

  /** สถานะ review จาก <ex-onboarding> (instanceId/status/refNo + step ที่ติ๊ก "แจ้งแก้ไข") */
  protected readonly review = signal<OnboardingReview | null>(null);
  protected readonly deciding = signal(false);
  /** จำนวน step ที่ติ๊กแจ้งแก้ไข — ใช้ disable ปุ่ม "ส่งคืนแก้ไข" */
  protected readonly reworkCount = computed(
    () => this.review()?.reworkTargets.length ?? 0,
  );

  // Summary data from GET /admin/flow-instances/by-ref-no/{refNo}
  protected readonly serviceId = signal('');
  private readonly serviceFallback = signal('-');
  private readonly serviceNameMap = signal<Map<string, string>>(new Map());
  protected readonly service = computed(() => {
    const serviceId = this.serviceId();
    if (!serviceId) {
      return this.serviceFallback();
    }
    return this.serviceNameMap().get(serviceId) ?? serviceId;
  });
  protected readonly companyName = signal('-');
  protected readonly status = signal('-');
  protected readonly submittedDate = signal('-');

  // State
  protected readonly selectedTab = signal<number>(0);
  protected readonly loadedTabs = signal<Record<number, boolean>>({ 0: true });
  protected readonly selectedStep = signal<string>('01');
  protected readonly isLoadingDetail = signal<boolean>(false);
  protected readonly isLoadingHistory = signal<boolean>(false);
  protected readonly isLoadingEditHistory = signal<boolean>(false);
  protected readonly isAccessChecking = signal(false);
  protected readonly isPickupLoading = signal(false);
  protected readonly isReassignLoading = signal(false);
  protected readonly isApproveModalOpen = signal(false);
  protected readonly isRejectModalOpen = signal(false);
  protected readonly isReworkValidationModalOpen = signal(false);
  protected readonly isReworkConfirmModalOpen = signal(false);
  protected readonly rejectReason = signal('');
  protected readonly showToast = signal(false);
  protected readonly toastMessage = signal('');
  protected readonly toastVariant = signal<'success' | 'error'>('success');
  private toastShowTimer?: ReturnType<typeof setTimeout>;
  private toastHideTimer?: ReturnType<typeof setTimeout>;
  private currentUserEmail: string | null = null;
  private currentUserRole: string | null = null;

  // Reassign modal state
  protected readonly reassignModalOpen = signal(false);
  protected readonly assigneeDropdownOpen = signal(false);
  protected readonly assigneeSearchQuery = signal('');
  protected readonly assigneeOptions = signal<SrmAssigneeOption[]>([]);
  protected readonly assigneePanelRect = signal<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  protected reassigneeId: string | null = null;

  @ViewChild('assigneeTrigger')
  private assigneeTriggerRef?: ElementRef<HTMLButtonElement>;

  // Configuration
  protected readonly tabPages = SRM_DETAIL_TAB_PAGES;
  protected readonly steps = SRM_DETAIL_STEPS;
  protected readonly messages = SRM_DETAIL_MESSAGES;

  // Breadcrumb
  protected readonly breadcrumbs = computed(() => [
    {
      label: this.messages.BREADCRUMB_HOME,
      routerLink: APP_ROUTE_PATHS.SERVICE_REQUEST_MANAGEMENT,
    },
    { label: this.refNo() || '-' },
  ]);

  // Status history data — จะโหลดจาก API ครั้งเดียวตอนเข้าหน้า
  protected readonly statusHistory = signal<StatusHistoryItem[]>([]);

  // Edit history data
  protected readonly editHistory = signal<EditHistoryRound[]>([]);

  protected readonly normalizedStatus = computed(() =>
    this.normalizeStatusCode(this.status()),
  );

  protected readonly isAllTabSource = computed(
    () => this.sourceTab().trim() === 'all',
  );

  private readonly bottomActionPolicy = computed(
    () => SRM_DETAIL_BOTTOM_ACTION_POLICY_BY_STATUS[this.normalizedStatus()],
  );

  private readonly isApproverRole = computed(() => {
    const { adminApproverRoleId } = this.getSrmRoleIdConfig();
    return this.hasUserRoleId(adminApproverRoleId);
  });

  protected readonly canPickup = computed(() => {
    if (
      !this.flowInstanceId() ||
      this.isLoadingDetail() ||
      this.sourceTab().trim() === 'in-progress' ||
      this.isAllTabSource()
    ) {
      return false;
    }

    return this.canPickupByStatusAndRole();
  });

  protected readonly showBottomActions = computed(() => {
    return (
      !!this.bottomActionPolicy() &&
      !this.showReassignButton() &&
      !this.isAllTabSource()
    );
  });

  protected readonly showOnboardingReworkInput = computed(() => {
    return this.bottomActionPolicy()?.showOnboardingReworkInput ?? false;
  });

  protected readonly bottomRejectLabel = computed(() => {
    if (this.isApproverRole()) {
      return this.messages.BTN_REJECT_IN_APPROVE;
    }

    return this.bottomActionPolicy()?.rejectLabel ?? this.messages.BTN_REJECT;
  });

  protected readonly bottomPrimaryLabel = computed(() => {
    if (this.isApproverRole()) {
      return this.messages.BTN_PRIMARY_IN_APPROVE;
    }

    return (
      this.bottomActionPolicy()?.primaryLabel ??
      this.messages.BTN_PRIMARY_IN_REVIEW
    );
  });

  protected readonly approveModalTitle = computed(() => {
    return (
      this.bottomActionPolicy()?.primaryModalTitle ??
      this.messages.MODAL_PRIMARY_TITLE_IN_REVIEW
    );
  });

  protected readonly approveModalDescription = computed(() => {
    return this.getPrimaryConfirmMessage();
  });

  protected readonly rejectModalTitle = computed(() => {
    return (
      this.bottomActionPolicy()?.rejectModalTitle ??
      this.messages.MODAL_REJECT_TITLE_IN_REVIEW
    );
  });

  protected readonly rejectModalSubtitle = computed(() => {
    return (
      this.bottomActionPolicy()?.rejectModalSubtitle ??
      this.messages.MODAL_REJECT_SUBTITLE_IN_REVIEW
    );
  });

  protected readonly isRejectSubmitDisabled = computed(() => {
    return this.deciding() || this.rejectReason().trim().length === 0;
  });

  protected readonly rejectReasonCount = computed(
    () => this.rejectReason().length,
  );

  protected readonly isReassignDisabled = computed(() => {
    return (
      this.deciding() ||
      this.isPickupLoading() ||
      this.isReassignLoading() ||
      !this.refNo().trim()
    );
  });

  protected get selectedAssignee(): SrmAssigneeOption | null {
    const selectedId = this.reassigneeId;
    if (!selectedId) {
      return null;
    }

    return this.assigneeOptions().find((o) => o.value === selectedId) ?? null;
  }

  protected readonly filteredAssigneeOptions = computed(() => {
    const q = this.assigneeSearchQuery().toLowerCase().trim();
    const options = this.assigneeOptions();
    if (!q) {
      return options;
    }

    return options.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.position.toLowerCase().includes(q) ||
        o.department.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    );
  });

  protected readonly handleApproveModalCancel = (): void => {
    this.closeApproveModal();
  };

  protected readonly handleApproveModalConfirm = (): void => {
    void this.confirmApprove();
  };

  protected readonly handleRejectModalCancel = (): void => {
    this.closeRejectModal();
  };

  protected readonly handleRejectModalConfirm = (): void => {
    void this.confirmReject();
  };

  protected readonly handleReworkValidationModalOk = (): void => {
    this.closeReworkValidationModal();
  };

  protected readonly handleReworkConfirmModalCancel = (): void => {
    this.closeReworkConfirmModal();
  };

  protected readonly handleReworkConfirmModalSubmit = (): void => {
    void this.confirmRework();
  };

  protected readonly handleReassignModalCancel = (): void => {
    this.closeReassignModal();
  };

  protected readonly handleReassignModalConfirm = (): void => {
    void this.confirmReassign();
  };

  protected getStatusDisplay = getStatusDisplay;

  constructor() {
    void this.loadServiceOptions();

    // โหลด summary จาก refNo ก่อน แล้วค่อยใช้ flowInstanceId ไปโหลด API อื่น
    effect(
      () => {
        const refNo = this.refNo();
        if (refNo) {
          void this.loadTaskRefThenDetail(refNo);
        }
      },
      { allowSignalWrites: true },
    );
  }

  private async loadTaskRefThenDetail(refNo: string): Promise<void> {
    const hasAccess = await this.preloadTaskRefForMyWork(refNo);
    if (!hasAccess) {
      this.redirectToForbidden();
      return;
    }

    await this.loadDetailAndHistory(refNo);
  }

  private async preloadTaskRefForMyWork(appId: string): Promise<boolean> {
    if (this.sourceTab().trim() !== 'my-work') {
      return true;
    }

    this.isAccessChecking.set(true);
    try {
      const task = await this.taskService.getTaskByRef(appId);
      const assignTo = task?.assignTo?.trim().toLowerCase() ?? '';
      const currentUserEmail =
        (await this.getActionByEmail())?.toLowerCase() ?? '';

      return !!assignTo && !!currentUserEmail && assignTo === currentUserEmail;
    } catch (error) {
      console.error('[SRM Detail] Failed to preload task by appId', error);
      return false;
    } finally {
      this.isAccessChecking.set(false);
    }
  }

  private redirectToForbidden(): void {
    if (typeof window !== 'undefined') {
      window.location.assign('/403');
      return;
    }

    void this.router.navigateByUrl('/403');
  }

  protected goBack(): void {
    const sourceTab = this.sourceTab();

    this.router.navigate([APP_ROUTE_PATHS.SERVICE_REQUEST_MANAGEMENT], {
      queryParams: sourceTab ? { sourceTab } : undefined,
      state: {
        sourceTab,
      },
    });
  }

  private getSourceTabFromNavigationState(): string {
    const fromCurrentNav =
      this.router.getCurrentNavigation()?.extras.state?.['sourceTab'];
    if (typeof fromCurrentNav === 'string' && fromCurrentNav.trim()) {
      return fromCurrentNav;
    }

    if (
      typeof window !== 'undefined' &&
      window.history?.state &&
      typeof window.history.state['sourceTab'] === 'string' &&
      window.history.state['sourceTab'].trim()
    ) {
      return window.history.state['sourceTab'].trim();
    }

    const sourceTabFromQuery =
      this.route.snapshot.queryParamMap.get('sourceTab');
    if (sourceTabFromQuery?.trim()) {
      return sourceTabFromQuery.trim();
    }

    return '';
  }

  private getTaskIdFromNavigationState(): string | null {
    const fromCurrentNav =
      this.router.getCurrentNavigation()?.extras.state?.['taskId'];
    if (typeof fromCurrentNav === 'string' && fromCurrentNav.trim()) {
      return fromCurrentNav.trim();
    }

    if (
      typeof window !== 'undefined' &&
      window.history?.state &&
      typeof window.history.state['taskId'] === 'string' &&
      window.history.state['taskId'].trim()
    ) {
      return window.history.state['taskId'].trim();
    }

    // Backward compatibility: allow old links that pass taskId in query string.
    return this.route.snapshot.queryParamMap.get('taskId');
  }

  protected selectStep(stepId: string): void {
    this.selectedStep.set(stepId);
  }

  protected onTabChange(index: number): void {
    this.selectedTab.set(index);
    this.markTabAsLoaded(index);
  }

  private markTabAsLoaded(index: number): void {
    this.loadedTabs.update((tabs) => {
      if (tabs[index]) {
        return tabs;
      }

      return {
        ...tabs,
        [index]: true,
      };
    });
  }

  /** รับ review state จาก <ex-onboarding> ทุกครั้งที่ admin ติ๊ก/พิมพ์ note */
  protected onReview(review: OnboardingReview): void {
    this.review.set(review);
  }

  /** ส่งคืนแก้ไข — ใช้ step ที่ติ๊ก "แจ้งแก้ไข" + note จาก ex-onboarding */
  protected onSendBack(): void {
    const targets: ReworkTargetInput[] = this.review()?.reworkTargets ?? [];
    if (!targets.length) {
      return;
    }

    if (this.hasMissingReworkNote(targets)) {
      this.isReworkValidationModalOpen.set(true);
      return;
    }

    this.isReworkConfirmModalOpen.set(true);
  }

  protected onReject(): void {
    this.rejectReason.set('');
    this.isRejectModalOpen.set(true);
  }

  protected onApprove(): void {
    this.isApproveModalOpen.set(true);
  }

  protected closeApproveModal(): void {
    this.isApproveModalOpen.set(false);
  }

  protected closeRejectModal(): void {
    this.isRejectModalOpen.set(false);
    this.rejectReason.set('');
  }

  protected closeReworkValidationModal(): void {
    this.isReworkValidationModalOpen.set(false);
  }

  protected closeReworkConfirmModal(): void {
    this.isReworkConfirmModalOpen.set(false);
  }

  protected onRejectReasonInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement | null)?.value ?? '';
    this.rejectReason.set(
      value.slice(
        0,
        ServiceRequestManagementDetailComponent.REJECT_REASON_MAX_LENGTH,
      ),
    );
  }

  protected openReassignModal(): void {
    if (this.isReassignDisabled()) {
      return;
    }

    this.reassigneeId = null;
    this.assigneeSearchQuery.set('');
    this.assigneeDropdownOpen.set(false);
    void this.loadAssigneeOptions();
    this.reassignModalOpen.set(true);
  }

  protected closeReassignModal(): void {
    this.assigneeSearchQuery.set('');
    this.assigneeDropdownOpen.set(false);
    this.reassignModalOpen.set(false);
  }

  protected toggleAssigneeDropdown(): void {
    if (this.assigneeDropdownOpen()) {
      this.assigneeDropdownOpen.set(false);
      return;
    }

    const trigger = this.assigneeTriggerRef?.nativeElement;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    this.assigneePanelRect.set({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
    this.assigneeSearchQuery.set('');
    this.assigneeDropdownOpen.set(true);
  }

  protected selectAssignee(opt: SrmAssigneeOption): void {
    this.reassigneeId = opt.value;
    this.assigneeDropdownOpen.set(false);
  }

  protected async confirmReassign(): Promise<void> {
    const reassigneeEmail = this.reassigneeId?.trim();
    const refNo = this.refNo().trim();

    if (!reassigneeEmail || !refNo || this.isReassignLoading()) {
      return;
    }

    this.isReassignLoading.set(true);
    try {
      this.logOutgoingRequest({
        action: 'reassign',
        method: 'PATCH',
        endpoint: '/workflow-api/api/workflow-service/v1/workflow/pickup',
        payload: {
          appIds: [refNo],
          actionBy: reassigneeEmail,
        },
      });
      if (this.isActionApiDryRunEnabled()) {
        this.notifyDryRun(this.messages.DRY_RUN_ACTION_REASSIGN);
        return;
      }
      // API: ย้ายผู้รับผิดชอบ (ใช้ endpoint เดียวกับรับงาน)
      const outcome = await this.workflowService.pickupWorkflowByAppIds(
        [refNo],
        reassigneeEmail,
      );

      this.showPickupToast(
        outcome.successCount,
        outcome.failedCount,
        outcome.reason,
      );

      if (outcome.failedCount === 0) {
        this.closeReassignModal();
        this.goBack();
        return;
      }
    } catch (error) {
      console.error('[SRM Detail] Failed to reassign workflow instance', error);
      this.triggerToast(this.getErrorMessage(error), 'error');
    } finally {
      this.isReassignLoading.set(false);
    }
  }

  protected dismissToast(): void {
    clearTimeout(this.toastShowTimer);
    clearTimeout(this.toastHideTimer);
    this.showToast.set(false);
  }

  protected async onPickup(): Promise<void> {
    const refNo = this.refNo().trim();
    if (!refNo || this.isPickupLoading()) {
      return;
    }

    const actionBy = await this.getActionByEmail();
    if (!actionBy) {
      this.triggerToast(this.messages.TOAST_ACTOR_NOT_FOUND, 'error');
      return;
    }

    this.isPickupLoading.set(true);
    try {
      this.logOutgoingRequest({
        action: 'pickup',
        method: 'PATCH',
        endpoint: '/workflow-api/api/workflow-service/v1/workflow/pickup',
        payload: {
          appIds: [refNo],
          actionBy,
        },
      });
      if (this.isActionApiDryRunEnabled()) {
        this.notifyDryRun(this.messages.DRY_RUN_ACTION_PICKUP);
        return;
      }
      // API: รับงาน
      const outcome = await this.workflowService.pickupWorkflowByAppIds(
        [refNo],
        actionBy,
      );

      this.showPickupToast(
        outcome.successCount,
        outcome.failedCount,
        outcome.reason,
      );
      if (outcome.failedCount === 0) {
        await this.delay(this.getPickupSuccessDelayMs());

        if (this.shouldReloadAfterPickup()) {
          this.reloadCurrentPage();
          return;
        }
        await this.loadDetailAndHistory(refNo);
      }
    } catch (error) {
      console.error('[SRM Detail] Failed to pickup workflow instance', error);
      this.triggerToast(this.getErrorMessage(error), 'error');
    } finally {
      this.isPickupLoading.set(false);
    }
  }

  private decodeRouteParamRefNo(encodedRefNo: string): string {
    if (!encodedRefNo) {
      return '';
    }

    try {
      return decodeFlowInstanceId(encodedRefNo);
    } catch {
      // Backward compatibility: allow old links that pass plain refNo.
      return encodedRefNo;
    }
  }

  private parseTaskId(value: string | null): number | null {
    if (!value) {
      return null;
    }

    try {
      const decodedToken = decodeTaskIdToken(value);
      const parsed = Number(decodedToken);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    } catch {
      // Backward compatibility: token may be old Base64 or plain numeric.
    }

    try {
      const decoded = decodeFlowInstanceId(value);
      const parsed = Number(decoded);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    } catch {
      // Backward compatibility: old links may send plain numeric taskId.
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }

  private reloadCurrentPage(): void {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }

  private shouldReloadAfterPickup(): boolean {
    // sourceTab is set when opening detail from list; skip full page reload in that case.
    return !this.sourceTab().trim();
  }

  private getPickupSuccessDelayMs(): number {
    const configuredDelay = (
      environment as {
        srm?: {
          pickupSuccessDelayMs?: number;
        };
      }
    ).srm?.pickupSuccessDelayMs;

    return typeof configuredDelay === 'number' && configuredDelay >= 0
      ? configuredDelay
      : 800;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async submitApproveRejectAction(
    actionType: 'Approved' | 'Rejected',
    remark?: string,
  ): Promise<void> {
    const appId = this.refNo().trim();
    const taskId = this.taskId();
    if (!appId) {
      this.triggerToast(this.messages.TOAST_ACTION_APP_ID_NOT_FOUND, 'error');
      return;
    }

    if (!taskId) {
      this.triggerToast(this.messages.TOAST_ACTION_TASK_ID_NOT_FOUND, 'error');
      return;
    }

    const actor = await this.getReworkActor();
    if (!actor || this.deciding()) {
      if (!actor) {
        this.triggerToast(this.messages.TOAST_ACTOR_NOT_FOUND, 'error');
      }
      return;
    }

    this.deciding.set(true);
    try {
      const payload: {
        actionType: 'Approved' | 'Rejected';
        userId: string;
        role: string;
        taskId: number;
        remark?: string;
      } = {
        actionType,
        userId: actor.userId,
        role: actor.role,
        taskId,
      };

      if (remark?.trim()) {
        payload.remark = remark.trim();
      }

      this.logOutgoingRequest({
        action: 'workflow-action',
        method: 'POST',
        endpoint: `/workflow-api/api/workflow-service/v1/workflow/${encodeURIComponent(appId)}/action`,
        payload,
      });
      if (this.isActionApiDryRunEnabled()) {
        this.notifyDryRun(`พิจารณา (${actionType})`);
        return;
      }

      await this.workflowService.submitWorkflowAction(appId, payload);
      this.goBack();
    } catch (error) {
      console.error('Failed to submit decision:', error);
      this.triggerToast(this.getErrorMessage(error), 'error');
    } finally {
      this.deciding.set(false);
    }
  }

  private async loadDetailAndHistory(refNo: string): Promise<void> {
    this.isLoadingDetail.set(true);
    try {
      const summary = await this.adminService.getFlowInstanceByRefNo(refNo);
      if (!summary) {
        this.flowInstanceId.set('');
        this.statusHistory.set([]);
        this.editHistory.set([]);
        return;
      }

      this.refNo.set(summary.refNo || refNo);
      this.flowInstanceId.set(summary.flowInstanceId || '');
      this.serviceId.set(summary.serviceId || '');
      this.serviceFallback.set(summary.flowCode || summary.serviceId || '-');
      this.companyName.set(summary.companyName || '-');
      this.status.set(summary.status || '-');
      this.submittedDate.set(
        summary.submittedAt ? this.formatDate(summary.submittedAt) : '-',
      );

      if (summary.flowInstanceId) {
        await this.loadAllHistory(summary.flowInstanceId);
      } else {
        this.statusHistory.set([]);
        this.editHistory.set([]);
      }
    } catch (error) {
      console.error('Failed to load flow instance summary:', error);
      this.flowInstanceId.set('');
      this.statusHistory.set([]);
      this.editHistory.set([]);
    } finally {
      this.isLoadingDetail.set(false);
    }
  }

  private async loadServiceOptions(): Promise<void> {
    try {
      const codexServiceWithApps = this.codexService as CodexService & {
        getApps: (params?: {
          isActive?: boolean;
          page?: number;
          pageSize?: number;
          sortBy?: string;
          sortDirection?: 'asc' | 'desc';
        }) => Promise<CodexAppsResponse>;
      };

      const response = await codexServiceWithApps.getApps({
        isActive: true,
        page: 1,
        pageSize: 100,
        sortBy: 'sortOrder',
        sortDirection: 'asc',
      });

      const serviceMap = new Map<string, string>();
      response.data.items.forEach((item: CodexAppItem) => {
        serviceMap.set(item.id, item.appName);
        serviceMap.set(item.appCode, item.appName);
      });

      this.serviceNameMap.set(serviceMap);
    } catch (error) {
      console.error('Failed to load service options:', error);
      this.serviceNameMap.set(new Map());
    }
  }

  private async loadAssigneeOptions(): Promise<void> {
    if (assigneeOptionsCache) {
      this.assigneeOptions.set(assigneeOptionsCache);
      return;
    }

    try {
      const adminMakerRoleId = this.getSrmRoleIdConfig().adminMakerRoleId;
      if (!adminMakerRoleId) {
        console.error('[SRM Detail] Missing adminMakerRoleId config');
        this.assigneeOptions.set([]);
        return;
      }

      if (!assigneeOptionsPromise) {
        const userApiServiceWithEmployeesByRole = this
          .userApiService as UserApiService & {
          getEmployeesByRole: (roleId: string) => Promise<EmployeeByRoleItem[]>;
        };

        assigneeOptionsPromise = userApiServiceWithEmployeesByRole
          .getEmployeesByRole(adminMakerRoleId)
          .then((employees: EmployeeByRoleItem[]) => {
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

      const options = assigneeOptionsPromise
        ? await assigneeOptionsPromise
        : [];
      assigneeOptionsCache = options;
      this.assigneeOptions.set(options);
    } catch (error) {
      console.error('[SRM Detail] Failed to load assignee options', error);
      this.assigneeOptions.set([]);
    } finally {
      assigneeOptionsPromise = null;
    }
  }

  private async getActionByEmail(): Promise<string | null> {
    if (this.currentUserEmail) {
      return this.currentUserEmail;
    }

    const profile = this.authUserService.getUserProfile();
    this.currentUserEmail = profile?.email?.trim() ?? null;
    return this.currentUserEmail;
  }

  private async getReworkActor(): Promise<{
    userId: string;
    role: string;
  } | null> {
    if (this.currentUserEmail && this.currentUserRole) {
      return {
        userId: this.currentUserEmail,
        role: this.currentUserRole,
      };
    }

    const profile = this.authUserService.getUserProfile();
    const email = this.currentUserEmail ?? profile?.email?.trim() ?? '';
    if (!email) {
      return null;
    }

    const availableRoles = this.getRolesFromUserProfileStateSignal();
    const preferredRole = SRM_DETAIL_REWORK_ACTOR.preferredRole;
    const role =
      availableRoles.find((item) => item === preferredRole)?.trim() ||
      availableRoles[0]?.trim() ||
      SRM_DETAIL_REWORK_ACTOR.fallbackRole;

    this.currentUserEmail = email;
    this.currentUserRole = role;

    return {
      userId: email,
      role,
    };
  }

  private getRolesFromUserProfileStateSignal(): string[] {
    const { adminMakerRoleId, adminApproverRoleId } = this.getSrmRoleIdConfig();
    const roleIds = this.getCurrentEmployeeRoleIds();

    return roleIds
      .map((roleId) =>
        this.mapRoleIdToRoleName(roleId, adminMakerRoleId, adminApproverRoleId),
      )
      .filter((role): role is string => !!role);
  }

  private canPickupByStatusAndRole(): boolean {
    const normalizedStatus = this.normalizedStatus();
    const { adminMakerRoleId, adminApproverRoleId } = this.getSrmRoleIdConfig();

    if (normalizedStatus === SRM_DETAIL_STATUS.SUBMITTED) {
      return this.hasUserRoleId(adminMakerRoleId);
    }

    if (normalizedStatus === SRM_DETAIL_STATUS.REVIEWED) {
      return this.hasUserRoleId(adminApproverRoleId);
    }

    return false;
  }

  private canShowReassignByRole(): boolean {
    const { adminMakerRoleId, adminApproverRoleId } = this.getSrmRoleIdConfig();

    const isApprover = this.hasUserRoleId(adminApproverRoleId);
    const isMaker = this.hasUserRoleId(adminMakerRoleId);

    return isApprover && !isMaker;
  }

  private hasUserRoleId(expectedRoleId: string): boolean {
    if (!expectedRoleId) {
      return false;
    }

    return this.getCurrentEmployeeRoleIds().some(
      (roleId) => this.normalizeRoleId(roleId) === expectedRoleId,
    );
  }

  private getCurrentEmployeeRoleIds(): string[] {
    const employeeInfo = this.authUserService.getEmployeeInfo() as
      | {
          roleId?: string | null;
          roleIds?: Array<string | null | undefined>;
          roles?: Array<
            | string
            | {
                roleId?: string | null;
              }
            | null
            | undefined
          >;
        }
      | null
      | undefined;

    if (!employeeInfo) {
      return [];
    }

    const idsFromRoleIds = Array.isArray(employeeInfo.roleIds)
      ? employeeInfo.roleIds
      : [];

    const idsFromRoles = Array.isArray(employeeInfo.roles)
      ? employeeInfo.roles.map((role) => {
          if (typeof role === 'string') {
            return role;
          }

          return role?.roleId;
        })
      : [];

    const directRoleId = employeeInfo.roleId ? [employeeInfo.roleId] : [];

    return [...directRoleId, ...idsFromRoleIds, ...idsFromRoles]
      .map((roleId) => roleId?.trim() ?? '')
      .filter((roleId) => roleId.length > 0);
  }

  private mapRoleIdToRoleName(
    roleId: string | null | undefined,
    adminMakerRoleId: string,
    adminApproverRoleId: string,
  ): string | null {
    const normalizedRoleId = this.normalizeRoleId(roleId);
    if (!normalizedRoleId) {
      return null;
    }

    if (adminMakerRoleId && normalizedRoleId === adminMakerRoleId) {
      return 'AdminMaker';
    }

    if (adminApproverRoleId && normalizedRoleId === adminApproverRoleId) {
      return 'AdminApprover';
    }

    return null;
  }

  private getSrmRoleIdConfig(): {
    adminMakerRoleId: string;
    adminApproverRoleId: string;
  } {
    const roleConfig = (
      environment as {
        srm?: {
          roles?: {
            adminMakerRoleId?: string;
            adminApproverRoleId?: string;
          };
        };
      }
    ).srm?.roles;

    return {
      adminMakerRoleId: this.normalizeRoleId(roleConfig?.adminMakerRoleId),
      adminApproverRoleId: this.normalizeRoleId(
        roleConfig?.adminApproverRoleId,
      ),
    };
  }

  private normalizeRoleId(roleId: string | null | undefined): string {
    return roleId?.trim().toLowerCase() ?? '';
  }

  private async submitRework(): Promise<void> {
    const taskId = this.taskId();
    if (!taskId) {
      this.triggerToast(this.messages.TOAST_REWORK_TASK_ID_NOT_FOUND, 'error');
      return;
    }

    const appId = this.refNo().trim();
    if (!appId) {
      this.triggerToast(this.messages.TOAST_REWORK_APP_ID_NOT_FOUND, 'error');
      return;
    }

    const targets: ReworkTargetInput[] = this.review()?.reworkTargets ?? [];
    if (!targets.length) {
      return;
    }

    if (this.hasMissingReworkNote(targets)) {
      this.isReworkValidationModalOpen.set(true);
      return;
    }

    const actor = await this.getReworkActor();
    if (!actor) {
      this.triggerToast(this.messages.TOAST_ACTOR_NOT_FOUND, 'error');
      return;
    }

    const reworkSteps: ReworkStepPayload[] = targets.map((target) => ({
      stepType: target.stepType,
      note: target.note?.trim() ?? '',
    }));

    if (this.deciding()) {
      return;
    }

    this.deciding.set(true);
    try {
      const reworkPayload = {
        taskId,
        userId: actor.userId,
        role: actor.role,
        reworkSteps,
      };
      this.logOutgoingRequest({
        action: 'rework',
        method: 'POST',
        endpoint: `/workflow-api/api/workflow/${encodeURIComponent(appId)}/rework`,
        payload: reworkPayload,
      });
      if (this.isActionApiDryRunEnabled()) {
        this.notifyDryRun(this.messages.DRY_RUN_ACTION_REWORK);
        return;
      }
      // API: แจ้งแก้ไข (ส่งกลับแก้ไข)
      await this.workflowService.reworkWorkflow(appId, {
        ...reworkPayload,
      });

      this.triggerToast(this.messages.TOAST_REWORK_SUCCESS, 'success');
      this.goBack();
    } catch (error) {
      console.error('[SRM Detail] Failed to submit rework', error);
      this.triggerToast(this.getErrorMessage(error), 'error');
    } finally {
      this.deciding.set(false);
    }
  }

  private async confirmRework(): Promise<void> {
    this.closeReworkConfirmModal();
    await this.submitRework();
  }

  private hasMissingReworkNote(targets: ReworkTargetInput[]): boolean {
    return targets.some((target) => {
      const note = target.note?.trim() ?? '';
      return note.length === 0;
    });
  }

  private triggerToast(message: string, variant: 'success' | 'error'): void {
    this.toastMessage.set(message);
    this.toastVariant.set(variant);
    this.showToast.set(false);
    clearTimeout(this.toastShowTimer);
    clearTimeout(this.toastHideTimer);

    this.toastShowTimer = setTimeout(() => {
      this.showToast.set(true);
      this.toastHideTimer = setTimeout(() => this.showToast.set(false), 5000);
    }, 0);
  }

  private showPickupToast(
    successCount: number,
    failedCount: number,
    reason: string | null,
  ): void {
    if (failedCount <= 0) {
      this.triggerToast(
        this.messages.FORMAT_PICKUP_SUCCESS(successCount),
        'success',
      );
      return;
    }

    const reasonSuffix = reason
      ? this.messages.FORMAT_PICKUP_REASON_SUFFIX(reason)
      : '';

    this.triggerToast(
      this.messages.FORMAT_PICKUP_PARTIAL_FAIL(
        successCount,
        failedCount,
        reasonSuffix,
      ),
      'error',
    );
  }

  private getPrimaryConfirmMessage(): string {
    return (
      this.bottomActionPolicy()?.primaryConfirmMessage ??
      this.messages.MODAL_PRIMARY_IN_REVIEW
    );
  }

  private async confirmApprove(): Promise<void> {
    if (this.deciding()) {
      return;
    }

    this.logOutgoingRequest({
      action: 'approve-intent',
      method: 'POST',
      endpoint: `/flow-instances/${this.flowInstanceId()}/transition`,
      payload: {
        status: this.normalizedStatus(),
      },
    });
    this.closeApproveModal();
    await this.submitApproveRejectAction('Approved');
  }

  private async confirmReject(): Promise<void> {
    const reason = this.rejectReason().trim();
    if (this.deciding() || !reason) {
      return;
    }

    this.logOutgoingRequest({
      action: 'reject-intent',
      method: 'POST',
      endpoint: `/flow-instances/${this.flowInstanceId()}/transition`,
      payload: {
        status: this.normalizedStatus(),
        reason,
      },
    });
    this.closeRejectModal();
    await this.submitApproveRejectAction('Rejected', reason);
  }

  private logOutgoingRequest(params: {
    action: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    endpoint: string;
    payload: unknown;
  }): void {
    const { action, method, endpoint, payload } = params;
    console.log(`[SRM Detail][Outgoing API] ${action}`, {
      method,
      endpoint,
      payload,
    });
  }

  private isActionApiDryRunEnabled(): boolean {
    return SRM_DETAIL_ACTION_API_DRY_RUN;
  }

  private notifyDryRun(actionLabel: string): void {
    this.triggerToast(
      this.messages.FORMAT_DRY_RUN_TOAST(actionLabel),
      'success',
    );
  }

  private getErrorMessage(error: unknown): string {
    const networkError = this.isNetworkError(error);
    if (networkError) {
      return this.messages.TOAST_API_NETWORK_ERROR;
    }

    const backendDetail = this.extractBackendErrorMessage(error);
    if (backendDetail && this.isUserFriendlyErrorMessage(backendDetail)) {
      return backendDetail;
    }

    const statusCode = this.getHttpStatusCode(error);
    if (statusCode !== null) {
      return this.getStatusErrorMessage(statusCode);
    }

    return this.messages.TOAST_GENERIC_ERROR;
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
        return this.messages.TOAST_API_BAD_REQUEST;
      case 401:
        return this.messages.TOAST_API_UNAUTHORIZED;
      case 403:
        return this.messages.TOAST_API_FORBIDDEN;
      case 404:
        return this.messages.TOAST_API_NOT_FOUND;
      case 409:
        return this.messages.TOAST_API_CONFLICT;
      case 422:
        return this.messages.TOAST_API_UNPROCESSABLE;
      case 429:
        return this.messages.TOAST_API_TOO_MANY_REQUESTS;
      case 503:
      case 504:
        return this.messages.TOAST_API_SERVICE_UNAVAILABLE;
      default:
        if (statusCode >= 500) {
          return this.messages.TOAST_API_SERVER_ERROR;
        }
        return this.messages.TOAST_GENERIC_ERROR;
    }
  }

  private normalizeStatusCode(value: string): string {
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  }

  private toString(value: unknown): string | null {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    }

    return null;
  }

  /**
   * โหลดข้อมูลทั้งหมดจาก API ครั้งเดียว
   * จะแยกข้อมูลเป็น Status History และ Edit History
   */
  private async loadAllHistory(flowInstanceId: string): Promise<void> {
    try {
      this.isLoadingHistory.set(true);
      this.isLoadingEditHistory.set(true);

      const [statusResult, editResult] = await Promise.all([
        this.onboardingService.getInstanceHistory(flowInstanceId),
        this.adminService.getInstanceEditHistory(flowInstanceId),
      ]);

      // 1. ส่งข้อมูลจาก API ตรงเข้า Status History
      const historyItems: StatusHistoryItem[] = statusResult.items
        .map((item) => ({
          id: item.id,
          toStatus: item.toStatus,
          actorType: item.actorType,
          actionBy: item.actorName ?? item.actionBy ?? '-',
          occurredAt: item.occurredAt,
        }))
        .sort((a, b) => {
          const aTime = new Date(a.occurredAt ?? '').getTime();
          const bTime = new Date(b.occurredAt ?? '').getTime();
          return (
            (Number.isFinite(bTime) ? bTime : 0) -
            (Number.isFinite(aTime) ? aTime : 0)
          );
        });

      this.statusHistory.set(historyItems);

      // 2. ส่งข้อมูลจาก edit-history endpoint เข้า Edit History
      const editHistoryRounds = this.transformApiEditHistoryRounds(
        editResult.rounds,
      );
      this.editHistory.set(editHistoryRounds);
    } catch (error) {
      console.error('Failed to load history:', error);
      // แสดง error หรือ empty state
      this.statusHistory.set([]);
      this.editHistory.set([]);
    } finally {
      this.isLoadingHistory.set(false);
      this.isLoadingEditHistory.set(false);
    }
  }

  /**
   * แปลง payload จาก /admin/flow-instances/{id}/edit-history
   * ให้ตรงกับ EditHistoryRound ของ UI Kit
   */
  private transformApiEditHistoryRounds(
    rounds: InstanceEditHistoryRound[] | null | undefined,
  ): EditHistoryRound[] {
    const safeRounds = Array.isArray(rounds) ? rounds : [];
    if (safeRounds.length === 0) {
      return [];
    }

    const sortedRounds = [...safeRounds].sort(
      (a, b) => (b?.roundNo ?? 0) - (a?.roundNo ?? 0),
    );

    return sortedRounds.map((round, roundIndex) => {
      const corrections = Array.isArray(round?.corrections)
        ? round.corrections
        : Array.isArray(round?.actions)
          ? round.actions
          : [];

      const changes = corrections
        .map((item, index) => {
          const notes = Array.isArray(item?.notes)
            ? item.notes.filter(
                (note) => typeof note === 'string' && note.trim(),
              )
            : [];

          if (notes.length === 0) {
            return null;
          }

          return {
            title: `${index + 1}. ${item?.stepLabel || item?.stepType || this.messages.EDIT_HISTORY_ITEM_DEFAULT_TITLE}`,
            details: notes.map((note) => note.trim()),
          };
        })
        .filter(
          (
            item,
          ): item is {
            title: string;
            details: string[];
          } => !!item,
        );

      const editEntry: EditHistoryEntry = {
        id: `${round?.roundNo ?? roundIndex + 1}-edit`,
        title: this.messages.EDIT_HISTORY_RESUBMIT_TITLE,
        date: this.formatDate(round?.resubmittedAt ?? ''),
        icon: 'Send',
        iconColor: 'primary',
        changesTitle:
          changes.length > 0
            ? this.messages.FORMAT_EDIT_HISTORY_CHANGES_TITLE(changes.length)
            : undefined,
        changes: changes.length > 0 ? changes : undefined,
      };

      const requestedEntry: EditHistoryEntry = {
        id: `${round?.roundNo ?? roundIndex + 1}-request`,
        title: this.messages.EDIT_HISTORY_REQUEST_TITLE,
        date: this.formatDate(round?.bankRequestedAt ?? ''),
        icon: 'Message Square',
        iconColor: 'primary',
      };

      return {
        id: `round-${round?.roundNo ?? roundIndex + 1}`,
        round: round?.roundNo ?? roundIndex + 1,
        isLatest: !!round?.isLatest,
        entries: [editEntry, requestedEntry],
        isExpanded: true,
      };
    });
  }

  /**
   * แปลงวันที่เป็นรูปแบบแสดงผล
   */
  private formatDate(dateString: string): string {
    try {
      if (!dateString?.trim()) {
        return '';
      }

      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) {
        return '';
      }

      const day = date.getDate();
      const month = this.messages.THAI_SHORT_MONTHS[date.getMonth()];
      const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day} ${month} ${year} (${hours}:${minutes} น.)`;
    } catch {
      return '';
    }
  }
}
