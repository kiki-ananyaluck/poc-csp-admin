import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@environments/environments';
import { ApiResponse } from '@exim/auth-sdk';
import {
  TaskByRefResult,
  TaskAllSearchRequest,
  TaskAssignedSearchRequest,
  TaskMySearchRequest,
  TaskSearchRequest,
  TaskSearchResult,
} from './task-service.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly taskBaseUrl = `${environment.servicePaths['baseDomain']}/task-api/api/task-service/v1`;

  async getTaskByRef(appId: string): Promise<TaskByRefResult | null> {
    const normalized = appId.trim();
    if (!normalized) {
      return null;
    }

    const response = await firstValueFrom(
      this.http.get<ApiResponse<TaskByRefResult>>(
        `${this.taskBaseUrl}/tasks/ref/${encodeURIComponent(normalized)}`,
      ),
    );

    const raw = response as unknown as Record<string, unknown>;
    return (
      (raw['result'] as TaskByRefResult | undefined) ??
      (raw['data'] as TaskByRefResult | undefined) ??
      null
    );
  }

  private readonly fallbackFrom = (request: {
    pagination: { page: number; pageSize: number };
  }): TaskSearchResult => ({
    pendingTasks: [],
    totalCount: 0,
    pageNumber: request.pagination.page,
    pageSize: request.pagination.pageSize,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  private unwrapTaskResponse(
    response: ApiResponse<TaskSearchResult>,
  ): TaskSearchResult | null {
    const raw = response as unknown as Record<string, unknown>;
    const statusCode =
      typeof raw['statusCode'] === 'number' ? raw['statusCode'] : null;
    const statusMessage =
      typeof raw['statusMessage'] === 'string' ? raw['statusMessage'] : '';

    if (statusCode !== null && statusCode !== 200) {
      console.warn('[Task API] Non-200 status:', statusCode, statusMessage);
    }

    const result =
      (raw['result'] as TaskSearchResult | undefined) ??
      (raw['data'] as TaskSearchResult | undefined);

    return result ?? null;
  }

  async searchPendingTasks(
    request: TaskSearchRequest,
  ): Promise<TaskSearchResult> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<TaskSearchResult>>(
        `${this.taskBaseUrl}/tasks/pending-tasks/search`,
        request,
      ),
    );

    return this.unwrapTaskResponse(response) ?? this.fallbackFrom(request);
  }

  async searchAllTasks(
    request: TaskAllSearchRequest,
  ): Promise<TaskSearchResult> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<TaskSearchResult>>(
        `${this.taskBaseUrl}/tasks/all-tasks/search`,
        request,
      ),
    );

    const fallback = this.fallbackFrom(request);
    const result = this.unwrapTaskResponse(response) ?? fallback;
    const tasks = result.allTasks ?? result.pendingTasks ?? [];

    return {
      ...result,
      pendingTasks: tasks,
      allTasks: tasks,
    };
  }

  async searchAssignedTasks(
    request: TaskAssignedSearchRequest,
  ): Promise<TaskSearchResult> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<TaskSearchResult>>(
        `${this.taskBaseUrl}/tasks/assigned-tasks/search`,
        request,
      ),
    );

    const fallback = this.fallbackFrom(request);
    const result = this.unwrapTaskResponse(response) ?? fallback;
    const tasks = result.assignedTasks ?? result.pendingTasks ?? [];

    return {
      ...result,
      pendingTasks: tasks,
      assignedTasks: tasks,
    };
  }

  async searchMyTasks(request: TaskMySearchRequest): Promise<TaskSearchResult> {
    const response = await firstValueFrom(
      this.http.post<ApiResponse<TaskSearchResult>>(
        `${this.taskBaseUrl}/tasks/my-tasks/search`,
        request,
      ),
    );

    const fallback = this.fallbackFrom(request);
    const result = this.unwrapTaskResponse(response) ?? fallback;
    const tasks = result.myTasks ?? result.pendingTasks ?? [];

    return {
      ...result,
      pendingTasks: tasks,
      myTasks: tasks,
    };
  }
}
