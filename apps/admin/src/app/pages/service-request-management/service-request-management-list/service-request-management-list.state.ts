import { Injectable, inject, signal } from '@angular/core';
import type { NzTableSortOrder } from 'ng-zorro-antd/table';
import { AuthUserService } from '@exim/auth-sdk';
import { environment } from '@environments/environments';
import {
  createSrmRoleConfig,
  extractEmployeeRoleIds,
} from '../srm-permission.util';
import { AdminService } from '../../../services/user-service/admin/admin.service';
import { TaskService } from '../../../services/task-service/task-service';
import type { FlowInstanceItem } from '../../../services/user-service/admin/admin.model';
import type {
  TaskSearchFilters,
  PendingTask,
} from '../../../services/task-service/task-service.model';

export type SrmTabType = 'queue' | 'my-work' | 'in-progress' | 'all';

export type SrmStatusCode =
  | 'PENDING_PAYMENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'UNDER_REVIEW'
  | 'UNDER_CONSIDERATION'
  | 'EDITED_UNDER_REVIEW'
  | 'REQUEST_INFO'
  | 'CANCELLED';

export interface SrmRow {
  id: string;
  flowInstanceId: string;
  refNo: string;
  status: string;
  statusDisplay: string | null;
  service: string;
  company: string;
  submitDate: string;
  assignee: string;
  receivedDate: string;
  lastOperator: string;
  lastOperatedDate: string;
}

export type SrmSortKey = keyof Omit<SrmRow, 'id'>;

// ── Task API Config: Filter แต่ละ tab ────────────────────────────────────
// 🔧 แก้ไขส่วนนี้เพื่อปรับ filter ของแต่ละ tab
// ตอนนี้ filter ยังว่างไว้ เดี๋ยวค่อยมาแก้ไขทีหลัง

/** Config สำหรับ Task API - กำหนด filter เริ่มต้นของแต่ละ tab */
interface TaskTabConfig {
  /** ใช้ Task API หรือไม่ (ถ้า false จะใช้ FlowInstances API เดิม) */
  useTaskApi: boolean;
  /** ชื่อ role ที่จะส่งไปใน API */
  roleName: string;
  /** Filters เริ่มต้นสำหรับ tab นี้ (ยังไม่ได้กำหนด ปล่อยว่างไว้) */
  defaultFilters: Partial<TaskSearchFilters>;
  /** Sort field เริ่มต้น */
  sortField: string;
  /** Sort order เริ่มต้น */
  sortOrder: 'asc' | 'desc';
}

const TASK_SORT_KEY_TO_API: Partial<Record<SrmSortKey, string>> = {
  refNo: 'appId',
  status: 'documentStatusDisplay',
  service: 'requestTypeName',
  company: 'companyName',
  submitDate: 'submittedDate',
  assignee: 'assignName',
  receivedDate: 'createdDate',
  lastOperator: 'updatedBy',
  lastOperatedDate: 'updatedDate',
};

/**
 * TAB_TASK_CONFIG - กำหนดค่าเริ่มต้นสำหรับแต่ละ tab
 * 🔧 แก้ไข defaultFilters เพื่อปรับเงื่อนไขการกรองข้อมูลของแต่ละ tab
 */
export const TAB_TASK_CONFIG: Record<SrmTabType, TaskTabConfig> = {
  queue: {
    useTaskApi: true, // ✅ ใช้ Task API ใหม่
    roleName: 'AdminMaker',
    defaultFilters: {
      // TODO: ใส่ filter สำหรับ Queue tab ตรงนี้
      // ตัวอย่าง: assignTo: null (งานที่ยังไม่มีผู้รับผิดชอบ)
    },
    sortField: 'updatedDate',
    sortOrder: 'desc',
  },
  'my-work': {
    useTaskApi: false, // ใช้ FlowInstances API เดิม
    roleName: 'AdminMaker',
    defaultFilters: {},
    sortField: 'updatedDate',
    sortOrder: 'desc',
  },
  'in-progress': {
    useTaskApi: false, // ใช้ FlowInstances API เดิม
    roleName: 'AdminMaker',
    defaultFilters: {},
    sortField: 'updatedDate',
    sortOrder: 'desc',
  },
  all: {
    useTaskApi: true,
    roleName: 'AdminMaker',
    defaultFilters: {},
    sortField: 'updatedDate',
    sortOrder: 'desc',
  },
};

// ── Per-tab default API params (Legacy - เก็บไว้สำหรับ backward compatibility) ──────
// แก้ไข statuses/sortBy/sortDir ตรงนี้เพื่อเปลี่ยน behavior ของแต่ละ tab

export const QUEUE_STATUSES: SrmStatusCode[] = [
  'PENDING_PAYMENT',
  'UNDER_REVIEW',
  'UNDER_CONSIDERATION',
  'EDITED_UNDER_REVIEW',
  'REQUEST_INFO',
];

export const IN_PROGRESS_STATUSES: SrmStatusCode[] = [
  'UNDER_REVIEW',
  'UNDER_CONSIDERATION',
  'EDITED_UNDER_REVIEW',
];

interface TabQueryDefaults {
  statuses: SrmStatusCode[];
  sortBy: string;
  sortDir: 'asc' | 'desc';
}

export const TAB_QUERY_PARAMS: Record<SrmTabType, TabQueryDefaults> = {
  queue: {
    statuses: QUEUE_STATUSES,
    sortBy: 'lastActionAt',
    sortDir: 'desc',
  },
  'my-work': {
    statuses: IN_PROGRESS_STATUSES,
    sortBy: 'lastActionAt',
    sortDir: 'desc',
  },
  'in-progress': {
    statuses: IN_PROGRESS_STATUSES,
    sortBy: 'lastActionAt',
    sortDir: 'desc',
  },
  all: {
    statuses: [],
    sortBy: 'lastActionAt',
    sortDir: 'desc',
  },
};

// sort key (SrmRow field) → API field name (สำหรับ FlowInstances API เดิม)
const SORT_KEY_TO_API: Partial<Record<SrmSortKey, string>> = {
  refNo: 'refNo',
  status: 'status',
  submitDate: 'submittedAt',
  receivedDate: 'createdAt',
  lastOperatedDate: 'lastActionAt',
};

// ── Thai date formatter ──────────────────────────────────────────────────────
const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

const DEV_ALLOWED_ROLES = ['AdminMaker', 'AdminApprover'] as const;
const SRM_DEV_MODE_ENABLED = true;

interface SrmUserContext {
  email: string | null;
  roleName: string | null;
}

let cachedSrmUserContext: SrmUserContext | null = null;
let srmUserContextPromise: Promise<SrmUserContext> | null = null;

function formatThaiDateTime(iso: string | null | undefined): string {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '-';
  const day = d.getDate();
  const month = THAI_MONTHS[d.getMonth()];
  const year = d.getFullYear() + 543;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} (${hh}:${mm} น.)`;
}

// ── Row mapper สำหรับ FlowInstances API เดิม ───────────────────────────────
function toSrmRow(item: FlowInstanceItem): SrmRow {
  return {
    id: item.flowInstanceId,
    flowInstanceId: item.flowInstanceId,
    refNo: item.refNo,
    status: item.status,
    statusDisplay: null,
    service: item.flowCode,
    company: item.companyName,
    submitDate: formatThaiDateTime(item.submittedAt),
    assignee: item.lastActorName ?? '-',
    receivedDate: formatThaiDateTime(item.createdAt),
    lastOperator: item.lastActorName ?? '-',
    lastOperatedDate: formatThaiDateTime(item.updatedAt),
  };
}

// ── Task API Row mapper ──────────────────────────────────────────────────────
/** แปลง PendingTask จาก Task API เป็น SrmRow สำหรับแสดงผลใน table */
function taskToSrmRow(task: PendingTask): SrmRow {
  const statusCode = task.documentStatus ?? task.progress ?? 'UNDER_REVIEW';
  return {
    id: String(task.taskID),
    flowInstanceId: task.appId ?? String(task.taskID),
    refNo: task.appId ?? '-',
    status: statusCode,
    statusDisplay: task.documentStatusDisplay,
    service: task.requestTypeName ?? '-',
    company: task.companyName ?? '-',
    submitDate: formatThaiDateTime(task.submittedDate),
    assignee: task.assignName ?? '-',
    receivedDate: formatThaiDateTime(task.assignedDate),
    lastOperator: task.updatedByDisplay ?? '-',
    lastOperatedDate: formatThaiDateTime(task.updatedDate),
  };
}

@Injectable()
export class ServiceRequestManagementListState {
  private readonly adminService = inject(AdminService);
  private readonly taskService = inject(TaskService);
  private readonly authUserService = inject(AuthUserService);
  private readonly roleConfig = createSrmRoleConfig(
    (
      environment as {
        srm?: {
          roles?: {
            adminMakerRoleId?: string;
            adminApproverRoleId?: string;
          };
        };
      }
    ).srm?.roles,
  );
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly isLoading = signal(false);
  readonly searchQuery = signal('');
  readonly filterOpen = signal(false);
  readonly sortKey = signal<SrmSortKey | null>(null);
  readonly sortOrder = signal<NzTableSortOrder>(null);
  readonly tabType = signal<SrmTabType>('all');
  readonly page = signal(1);
  readonly pageSize = signal(10);

  private readonly appliedStatuses = signal<string[]>([]);
  private readonly draftStatuses = signal<string[]>([]);
  private readonly appliedServiceIds = signal<string[]>([]);
  private readonly draftServiceIds = signal<string[]>([]);

  // Date range filter
  private readonly appliedDateRange = signal<{
    from: string | null;
    to: string | null;
  }>({ from: null, to: null });
  private readonly draftDateRange = signal<{
    from: string | null;
    to: string | null;
  }>({ from: null, to: null });

  readonly activeStatuses = this.appliedStatuses.asReadonly();
  readonly activeServiceIds = this.appliedServiceIds.asReadonly();
  readonly activeDateRange = this.appliedDateRange.asReadonly();

  // ── Server-driven data ───────────────────────────────────────────────────
  private readonly _rows = signal<SrmRow[]>([]);
  private readonly _totalCount = signal(0);

  readonly rows = this._rows.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();

  // ── Load ─────────────────────────────────────────────────────────────────
  /**
   * Load data โดยเช็คว่าจะใช้ Task API ใหม่ หรือ FlowInstances API เดิม
   * แต่ละ tab จะส่ง filter ที่แตกต่างกันตาม TAB_TASK_CONFIG
   */
  async load(): Promise<void> {
    const tab = this.tabType();
    const config = TAB_TASK_CONFIG[tab];

    if (tab === 'all') {
      await this.loadAllTasksApi(config);
      return;
    }

    if (tab === 'my-work') {
      await this.loadMyTasksApi(config);
      return;
    }

    if (tab === 'in-progress') {
      await this.loadAssignedTasksApi(config);
      return;
    }

    // เช็คว่า tab นี้ใช้ Task API หรือไม่
    if (config.useTaskApi) {
      await this.loadWithTaskApi(config);
    } else {
      await this.loadWithFlowInstancesApi();
    }
  }

  /**
   * Load data โดยใช้ Task API ใหม่ (สำหรับ Queue tab)
   */
  private async loadWithTaskApi(config: TaskTabConfig): Promise<void> {
    // ดึง filter พื้นฐานจาก config
    const baseFilters: TaskSearchFilters = {
      ...config.defaultFilters,
      appId: null,
      companyName: null,
      documentStatus: [],
      serviceId: [],
      assignTo: null,
      submittedDateFrom: null,
      submittedDateTo: null,
    };

    // รวม filter ที่ user เลือกจาก UI (ถ้ามี)
    const dateRange = this.appliedDateRange();
    const searchValue = this.searchQuery().trim();
    const searchKeyword = searchValue || null;
    const mergedFilters: TaskSearchFilters = {
      ...baseFilters,
      keyword: searchKeyword,
      documentStatus: this.appliedStatuses(),
      serviceId: this.appliedServiceIds(),
      submittedDateFrom: dateRange.from,
      submittedDateTo: dateRange.to,
      // TODO: เพิ่ม filter อื่นๆ จาก UI ถ้ามี (เช่น status, assignee)
    };

    // กำหนด sort
    const sortKey = this.sortKey();
    const sortOrder = this.sortOrder();
    const sortField =
      (sortKey && TASK_SORT_KEY_TO_API[sortKey]) ?? config.sortField;
    const sortOrderValue =
      sortOrder === 'descend'
        ? 'desc'
        : sortOrder === 'ascend'
          ? 'asc'
          : config.sortOrder;
    const roleName = (await this.getCurrentUserRoleName()) ?? config.roleName;

    this.isLoading.set(true);
    try {
      const result = await this.taskService.searchPendingTasks({
        roleName,
        filters: mergedFilters,
        pagination: {
          page: this.page(),
          pageSize: this.pageSize(),
        },
        sort: {
          field: sortField,
          order: sortOrderValue,
        },
      });

      // แปลง PendingTask เป็น SrmRow
      this._rows.set(result.pendingTasks.map(taskToSrmRow));
      this._totalCount.set(result.totalCount);
    } catch (err) {
      console.error('[SRM] Failed to load pending tasks (Task API)', err);
      this._rows.set([]);
      this._totalCount.set(0);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadAllTasksApi(config: TaskTabConfig): Promise<void> {
    const userEmail = await this.getCurrentUserEmail();
    if (!userEmail) {
      console.error(
        '[SRM] Unable to resolve current user email for all tasks API',
      );
      this._rows.set([]);
      this._totalCount.set(0);
      return;
    }

    const dateRange = this.appliedDateRange();
    const searchValue = this.searchQuery().trim();
    const searchKeyword = searchValue || null;
    const filters: TaskSearchFilters = {
      keyword: searchKeyword,
      appId: searchKeyword,
      companyName: searchKeyword,
      documentStatus: this.appliedStatuses(),
      serviceId: this.appliedServiceIds(),
      assignTo: searchKeyword,
      submittedDateFrom: dateRange.from,
      submittedDateTo: dateRange.to,
      ...config.defaultFilters,
    };

    const sortKey = this.sortKey();
    const sortOrder = this.sortOrder();
    const sortField =
      (sortKey && TASK_SORT_KEY_TO_API[sortKey]) ?? config.sortField;
    const sortOrderValue: 'asc' | 'desc' =
      sortOrder === 'descend'
        ? 'desc'
        : sortOrder === 'ascend'
          ? 'asc'
          : config.sortOrder;

    this.isLoading.set(true);
    try {
      const result = await this.taskService.searchAllTasks({
        userEmail,
        filters,
        pagination: {
          page: this.page(),
          pageSize: this.pageSize(),
        },
        sort: {
          field: sortField,
          order: sortOrderValue,
        },
      });

      this._rows.set(result.pendingTasks.map(taskToSrmRow));
      this._totalCount.set(result.totalCount);
    } catch (err) {
      console.error('[SRM] Failed to load all tasks (Task API)', err);
      this._rows.set([]);
      this._totalCount.set(0);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadAssignedTasksApi(config: TaskTabConfig): Promise<void> {
    const userEmail = await this.getCurrentUserEmail();
    if (!userEmail) {
      console.error(
        '[SRM] Unable to resolve current user email for assigned tasks API',
      );
      this._rows.set([]);
      this._totalCount.set(0);
      return;
    }

    const dateRange = this.appliedDateRange();
    const searchValue = this.searchQuery().trim();
    const searchKeyword = searchValue || null;
    const filters: TaskSearchFilters = {
      keyword: searchKeyword,
      appId: searchKeyword,
      companyName: searchKeyword,
      documentStatus: this.appliedStatuses(),
      serviceId: this.appliedServiceIds(),
      assignTo: searchKeyword,
      submittedDateFrom: dateRange.from,
      submittedDateTo: dateRange.to,
      ...config.defaultFilters,
    };

    const sortKey = this.sortKey();
    const sortOrder = this.sortOrder();
    const sortField =
      (sortKey && TASK_SORT_KEY_TO_API[sortKey]) ?? config.sortField;
    const sortOrderValue: 'asc' | 'desc' =
      sortOrder === 'descend'
        ? 'desc'
        : sortOrder === 'ascend'
          ? 'asc'
          : config.sortOrder;

    this.isLoading.set(true);
    try {
      const result = await this.taskService.searchAssignedTasks({
        userEmail,
        filters,
        pagination: {
          page: this.page(),
          pageSize: this.pageSize(),
        },
        sort: {
          field: sortField,
          order: sortOrderValue,
        },
      });

      this._rows.set(result.pendingTasks.map(taskToSrmRow));
      this._totalCount.set(result.totalCount);
    } catch (err) {
      console.error('[SRM] Failed to load assigned tasks (Task API)', err);
      this._rows.set([]);
      this._totalCount.set(0);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadMyTasksApi(config: TaskTabConfig): Promise<void> {
    const userEmail = await this.getCurrentUserEmail();
    if (!userEmail) {
      console.error(
        '[SRM] Unable to resolve current user email for my tasks API',
      );
      this._rows.set([]);
      this._totalCount.set(0);
      return;
    }

    const dateRange = this.appliedDateRange();
    const searchValue = this.searchQuery().trim();
    const searchKeyword = searchValue || null;
    const filters: TaskSearchFilters = {
      keyword: searchKeyword,
      appId: searchKeyword,
      companyName: searchKeyword,
      documentStatus: this.appliedStatuses(),
      serviceId: this.appliedServiceIds(),
      assignTo: searchKeyword,
      submittedDateFrom: dateRange.from,
      submittedDateTo: dateRange.to,
      ...config.defaultFilters,
    };

    const sortKey = this.sortKey();
    const sortOrder = this.sortOrder();
    const sortField =
      (sortKey && TASK_SORT_KEY_TO_API[sortKey]) ?? config.sortField;
    const sortOrderValue: 'asc' | 'desc' =
      sortOrder === 'descend'
        ? 'desc'
        : sortOrder === 'ascend'
          ? 'asc'
          : config.sortOrder;

    this.isLoading.set(true);
    try {
      const result = await this.taskService.searchMyTasks({
        userEmail,
        filters,
        pagination: {
          page: this.page(),
          pageSize: this.pageSize(),
        },
        sort: {
          field: sortField,
          order: sortOrderValue,
        },
      });

      this._rows.set(result.pendingTasks.map(taskToSrmRow));
      this._totalCount.set(result.totalCount);
    } catch (err) {
      console.error('[SRM] Failed to load my tasks (Task API)', err);
      this._rows.set([]);
      this._totalCount.set(0);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async getCurrentUserEmail(): Promise<string | null> {
    const context = await this.getCurrentUserContext();
    return context.email;
  }

  private async getCurrentUserRoleName(): Promise<string | null> {
    const context = await this.getCurrentUserContext();
    return context.roleName;
  }

  private async getCurrentUserContext(): Promise<SrmUserContext> {
    if (cachedSrmUserContext) {
      return cachedSrmUserContext;
    }

    if (!srmUserContextPromise) {
      srmUserContextPromise = this.fetchCurrentUserContext();
    }

    const context = await srmUserContextPromise;
    // Do not cache empty context; auth profile may not be ready yet.
    if (context.email || context.roleName) {
      cachedSrmUserContext = context;
    }
    srmUserContextPromise = null;
    return context;
  }

  private async fetchCurrentUserContext(): Promise<SrmUserContext> {
    const devModeEnabled = this.isDevModeEnabled();
    const mockUser = this.getDevMockUser();
    const fallbackRole = devModeEnabled ? null : DEV_ALLOWED_ROLES[0];
    const userInfo = this.authUserService.userInfo();
    const userProfile = this.authUserService.userProfile();
    const employeeInfo = this.authUserService.employeeInfo();
    const role = this.authUserService.role();

    const resolvedEmail =
      userProfile?.email?.trim() ||
      userInfo?.user?.email?.trim() ||
      employeeInfo?.empEmail?.trim() ||
      null;

    const mockRoleName = this.normalizeRoleName(mockUser.roleName);
    const profileRole = this.getPrimaryRoleNameFromAllowedRoleIds(
      extractEmployeeRoleIds(employeeInfo),
    );
    const signalRoleName =
      this.normalizeRoleName(role?.name) || role?.name?.trim() || null;
    const resolvedRoleName = profileRole ?? signalRoleName;
    const roleName = devModeEnabled
      ? (mockRoleName ?? resolvedRoleName)
      : (resolvedRoleName ?? fallbackRole);
    const email = devModeEnabled
      ? (mockUser.email ?? resolvedEmail)
      : resolvedEmail;
    return {
      email,
      roleName,
    };
  }

  private getPrimaryRoleNameFromAllowedRoleIds(
    roleIds: string[],
  ): string | null {
    const matchedRoles = roleIds
      .map((roleId) => this.mapRoleIdToRoleName(roleId))
      .filter((roleName): roleName is string => !!roleName);

    return matchedRoles[0] ?? null;
  }

  private mapRoleIdToRoleName(
    roleId: string | null | undefined,
  ): string | null {
    if (!roleId) {
      return null;
    }

    if (this.roleConfig.adminMakerRoleId === roleId) {
      return DEV_ALLOWED_ROLES[0];
    }

    if (this.roleConfig.adminApproverRoleId === roleId) {
      return DEV_ALLOWED_ROLES[1];
    }

    return null;
  }

  private isDevModeEnabled(): boolean {
    if (!SRM_DEV_MODE_ENABLED) {
      return false;
    }

    const envDevMode = Boolean(
      (environment as { devMode?: { enabled?: boolean } }).devMode?.enabled,
    );
    const queryDevMode = this.readQueryParam('devmode') === 'true';
    return envDevMode || queryDevMode;
  }

  private getDevMockUser(): { email: string | null; roleName: string | null } {
    const envDevMode = (
      environment as {
        devMode?: {
          mockEmail?: string;
          mockRole?: string;
        };
      }
    ).devMode;

    const queryEmail = this.readQueryParam('devEmail');
    const queryRole = this.readQueryParam('devRole');

    return {
      email: queryEmail || envDevMode?.mockEmail || null,
      roleName: this.normalizeRoleName(
        queryRole || envDevMode?.mockRole || null,
      ),
    };
  }

  private normalizeRoleName(rawRole: string | null | undefined): string | null {
    if (!rawRole) {
      return null;
    }

    const normalized = rawRole.trim().toLowerCase();
    if (normalized === 'adminmaker' || normalized === 'admin') {
      return DEV_ALLOWED_ROLES[0];
    }
    if (normalized === 'adminapprover' || normalized === 'approver') {
      return DEV_ALLOWED_ROLES[1];
    }

    return null;
  }

  private readQueryParam(key: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return new URLSearchParams(window.location.search).get(key);
  }

  /**
   * Load data โดยใช้ FlowInstances API เดิม (สำหรับ My Work, In Progress, All tabs)
   */
  private async loadWithFlowInstancesApi(): Promise<void> {
    const tab = this.tabType();
    const defaults = TAB_QUERY_PARAMS[tab];
    const appliedStatuses = this.appliedStatuses();
    const appliedServiceIds = this.appliedServiceIds();
    const dateRange = this.appliedDateRange();

    const statuses = appliedStatuses.length
      ? appliedStatuses
      : defaults.statuses;

    const sortKey = this.sortKey();
    const sortOrder = this.sortOrder();
    const sortBy = (sortKey && SORT_KEY_TO_API[sortKey]) ?? defaults.sortBy;
    const sortDir =
      sortOrder === 'descend'
        ? 'desc'
        : sortOrder === 'ascend'
          ? 'asc'
          : defaults.sortDir;

    const search = this.searchQuery().trim() || undefined;

    this.isLoading.set(true);
    try {
      const result = await this.adminService.getFlowInstances({
        page: this.page(),
        pageSize: this.pageSize(),
        status: statuses.length ? statuses : undefined,
        serviceId: appliedServiceIds.length ? appliedServiceIds : undefined,
        sortBy,
        sortDir,
        search,
        submittedFrom: dateRange.from || undefined,
        submittedTo: dateRange.to || undefined,
      });
      this._rows.set(result.items.map(toSrmRow));
      this._totalCount.set(result.totalCount);
    } catch (err) {
      console.error(
        '[SRM] Failed to load flow instances (FlowInstances API)',
        err,
      );
      this._rows.set([]);
      this._totalCount.set(0);
    } finally {
      this.isLoading.set(false);
    }
  }

  // ── Setters ───────────────────────────────────────────────────────────────

  setTabType(type: SrmTabType): void {
    this.tabType.set(type);
    this.page.set(1);
    this.load();
  }

  setSearch(value: string): void {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      if (this.searchQuery() === value) return;
      this.searchQuery.set(value);
      this.page.set(1);
      this.load();
    }, 300);
  }

  setSort(key: string, order: NzTableSortOrder): void {
    const nextKey = key as SrmSortKey;
    if (this.sortKey() === nextKey && this.sortOrder() === order) {
      return;
    }

    this.sortKey.set(nextKey);
    this.sortOrder.set(order);
    this.page.set(1);
    this.load();
  }

  setPage(page: number): void {
    if (this.page() === page) {
      return;
    }

    this.page.set(page);
    this.load();
  }

  setPageSize(size: number): void {
    if (this.pageSize() === size && this.page() === 1) {
      return;
    }

    this.pageSize.set(size);
    this.page.set(1);
    this.load();
  }

  async getActionByEmail(): Promise<string | null> {
    return this.getCurrentUserEmail();
  }

  // ── Filter ────────────────────────────────────────────────────────────────

  toggleFilter(): void {
    this.filterOpen.update((v) => !v);
    if (this.filterOpen()) {
      this.draftStatuses.set([...this.appliedStatuses()]);
      this.draftServiceIds.set([...this.appliedServiceIds()]);
      this.draftDateRange.set({ ...this.appliedDateRange() });
    }
  }

  closeFilter(): void {
    this.filterOpen.set(false);
  }

  clearDraft(): void {
    this.draftStatuses.set([]);
    this.draftServiceIds.set([]);
    this.draftDateRange.set({ from: null, to: null });
  }

  applyFilter(): void {
    this.appliedStatuses.set([...this.draftStatuses()]);
    this.appliedServiceIds.set([...this.draftServiceIds()]);
    this.appliedDateRange.set({ ...this.draftDateRange() });
    this.page.set(1);
    this.filterOpen.set(false);
    this.load();
  }

  isDraftStatusChecked(code: string): boolean {
    return this.draftStatuses().includes(code);
  }

  toggleDraftStatus(code: string): void {
    this.draftStatuses.update((list) =>
      list.includes(code) ? list.filter((s) => s !== code) : [...list, code],
    );
  }

  removeAppliedStatus(code: string): void {
    this.appliedStatuses.update((list) => list.filter((s) => s !== code));
    this.page.set(1);
    this.load();
  }

  isDraftServiceChecked(serviceId: string): boolean {
    return this.draftServiceIds().includes(serviceId);
  }

  toggleDraftService(serviceId: string): void {
    this.draftServiceIds.update((list) =>
      list.includes(serviceId)
        ? list.filter((id) => id !== serviceId)
        : [...list, serviceId],
    );
  }

  removeAppliedService(serviceId: string): void {
    this.appliedServiceIds.update((list) =>
      list.filter((id) => id !== serviceId),
    );
    this.page.set(1);
    this.load();
  }

  // Date range filter methods
  getDraftDateFrom(): string | null {
    return this.draftDateRange().from;
  }

  getDraftDateTo(): string | null {
    return this.draftDateRange().to;
  }

  setDraftDateFrom(date: string | null): void {
    this.draftDateRange.update((range) => ({ ...range, from: date }));
  }

  setDraftDateTo(date: string | null): void {
    this.draftDateRange.update((range) => ({ ...range, to: date }));
  }

  // Quick date filter methods (apply immediately without draft)
  getActiveDateFrom(): string | null {
    return this.appliedDateRange().from;
  }

  getActiveDateTo(): string | null {
    return this.appliedDateRange().to;
  }

  setActiveDateFrom(date: string | null): void {
    this.appliedDateRange.update((range) => ({ ...range, from: date }));
    this.page.set(1);
    this.load();
  }

  setActiveDateTo(date: string | null): void {
    this.appliedDateRange.update((range) => ({ ...range, to: date }));
    this.page.set(1);
    this.load();
  }

  clearActiveDateRange(): void {
    this.appliedDateRange.set({ from: null, to: null });
    this.page.set(1);
    this.load();
  }
}
