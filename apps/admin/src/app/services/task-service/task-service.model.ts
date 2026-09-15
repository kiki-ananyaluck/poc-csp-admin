/** Filters สำหรับ Task API */
export interface TaskSearchFilters {
  keyword?: string | null;
  appId?: string | null;
  companyName?: string | null;
  documentStatus?: string[];
  serviceId?: string[];
  assignTo?: string | null;
  submittedDateFrom?: string | null;
  submittedDateTo?: string | null;
}

/** Pagination สำหรับ Task API */
export interface TaskPagination {
  page: number;
  pageSize: number;
}

/** Sort สำหรับ Task API */
export interface TaskSort {
  field: string;
  order: 'asc' | 'desc';
}

/** Request body สำหรับ POST /tasks/pending-tasks/search */
export interface TaskSearchRequest {
  roleName: string;
  filters: TaskSearchFilters;
  pagination: TaskPagination;
  sort: TaskSort;
}

/** Request body สำหรับ POST /tasks/all-tasks/search */
export interface TaskAllSearchRequest {
  userEmail: string;
  filters: TaskSearchFilters;
  pagination: TaskPagination;
  sort: TaskSort;
}

/** Request body สำหรับ POST /tasks/assigned-tasks/search */
export interface TaskAssignedSearchRequest {
  userEmail: string;
  filters: TaskSearchFilters;
  pagination: TaskPagination;
  sort: TaskSort;
}

/** Request body สำหรับ POST /tasks/my-tasks/search */
export interface TaskMySearchRequest {
  userEmail: string;
  filters: TaskSearchFilters;
  pagination: TaskPagination;
  sort: TaskSort;
}

/** รายการ task 1 รายการจาก Task API */
export interface PendingTask {
  taskID: number;
  workTypeName: string | null;
  title: string;
  progress: string;
  documentStatus: string | null;
  documentStatusDisplay: string | null;
  startDate: string;
  endDate: string;
  note: string | null;
  assignTo: string | null;
  assignName: string | null;
  department: string | null;
  departmentName: string | null;
  division: string | null;
  divisionName: string | null;
  url: string;
  isLock: boolean;
  remain: number;
  appId: string | null;
  companyName: string | null;
  requestTypeId: string | null;
  requestTypeName: string | null;
  submittedDate: string | null;
  assignedDate: string | null;
  updatedDate: string;
  updatedByDisplay?: string | null;
  updatedBy: string;
  createdBy: string;
  createdDate: string;
  tags: string[];
  assignHistory: unknown[];
}

/** Result ใน response จาก Task API */
export interface TaskSearchResult {
  pendingTasks: PendingTask[];
  allTasks?: PendingTask[];
  assignedTasks?: PendingTask[];
  myTasks?: PendingTask[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Result from GET /tasks/ref/{appId} used for ownership validation */
export interface TaskByRefResult {
  assignTo?: string | null;
}
