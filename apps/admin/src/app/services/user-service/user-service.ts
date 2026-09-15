import { Injectable, inject } from '@angular/core';
import {
  GetFlowInstancesParams,
  GetQueueParams,
  GetMyWorkParams,
  GetInProgressParams,
  GetAllParams,
} from './admin/admin.model';
import { EmployeeByRoleItem } from './user/user.model';
import { AdminService } from './admin/admin.service';
import { OnboardingService } from './onboarding/onboarding.service';
import { UserService as UserApiService } from './user/user.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly adminService = inject(AdminService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly userApiService = inject(UserApiService);

  async getFlowInstances(params: GetFlowInstancesParams | undefined) {
    return this.adminService.getFlowInstances(params);
  }

  async getFlowInstanceByRefNo(refNo: string) {
    return this.adminService.getFlowInstanceByRefNo(refNo);
  }

  async getQueue(params: GetQueueParams | undefined) {
    return this.adminService.getQueue(params);
  }

  async getMyWork(params: GetMyWorkParams | undefined) {
    return this.adminService.getMyWork(params);
  }

  async getInProgress(params: GetInProgressParams | undefined) {
    return this.adminService.getInProgress(params);
  }

  async getAll(params: GetAllParams | undefined) {
    return this.adminService.getAll(params);
  }

  async getInstanceHistory(instanceId: string, forceRefresh = false) {
    return this.onboardingService.getInstanceHistory(instanceId, forceRefresh);
  }

  async getInstanceEditHistory(instanceId: string) {
    return this.adminService.getInstanceEditHistory(instanceId);
  }

  clearHistoryCache(instanceId?: string): void {
    this.onboardingService.clearHistoryCache(instanceId);
  }

  async getEmployeesByRole(roleId: string): Promise<EmployeeByRoleItem[]> {
    return this.userApiService.getEmployeesByRole(roleId);
  }
}
