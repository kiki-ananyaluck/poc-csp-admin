import { Component, computed, effect, inject, signal } from '@angular/core';
import { IconComponent } from '@exim/ui-kit';
import { AuthUserService } from '@exim/auth-sdk';
import { environment } from '@environments/environments';
import { SERVICE_REQUEST_MANAGEMENT_MESSAGES } from './service-request-management-list.message';
import { SERVICE_REQUEST_MANAGEMENT_SELECTORS } from './service-request-management-list.selector';
import { SrmQueueTabComponent } from './tabs/srm-queue-tab/srm-queue-tab';
import { SrmMyWorkTabComponent } from './tabs/srm-my-work-tab/srm-my-work-tab';
import { SrmInProgressTabComponent } from './tabs/srm-in-progress-tab/srm-in-progress-tab';
import { SrmAllTabComponent } from './tabs/srm-all-tab/srm-all-tab';
import {
  createSrmRoleConfig,
  createSrmPermissionAccess,
  extractEmployeeRoleIds,
  resolveSrmVisibleTabs,
  resolveSrmRoleMembership,
} from '../srm-permission.util';

type SrmTabKey = 'queue' | 'my-work' | 'in-progress' | 'all';

interface SrmTabItem {
  key: SrmTabKey;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-service-request-management-list',
  standalone: true,
  imports: [
    IconComponent,
    SrmQueueTabComponent,
    SrmMyWorkTabComponent,
    SrmInProgressTabComponent,
    SrmAllTabComponent,
  ],
  templateUrl: './service-request-management-list.html',
  styleUrl: './service-request-management-list.scss',
})
export class ServiceRequestManagementListComponent {
  private readonly authUserService = inject(AuthUserService);

  protected readonly messages = SERVICE_REQUEST_MANAGEMENT_MESSAGES;
  protected readonly selectors = SERVICE_REQUEST_MANAGEMENT_SELECTORS;
  protected readonly canEditSrm = computed(
    () => this.permissionAccess().canEdit,
  );

  readonly tabIndex = signal<number>(0);
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
  private readonly permissionAccess = computed(() =>
    createSrmPermissionAccess(this.authUserService.permissions()),
  );
  private readonly roleMembership = computed(() =>
    resolveSrmRoleMembership(
      extractEmployeeRoleIds(this.authUserService.employeeInfo()),
      this.roleConfig,
    ),
  );

  readonly tabs: SrmTabItem[] = [
    { key: 'queue', label: this.messages.TAB_QUEUE, icon: 'file-tray' },
    {
      key: 'in-progress',
      label: this.messages.TAB_IN_PROGRESS,
      icon: 'clipboard-clock-outline',
    },
    { key: 'my-work', label: this.messages.TAB_MY_WORK, icon: 'briefcase' },
    { key: 'all', label: this.messages.TAB_ALL, icon: 'paper' },
  ];

  readonly visibleTabs = computed(() => {
    const visibleTabKeys = resolveSrmVisibleTabs(
      this.permissionAccess(),
      this.roleMembership(),
    );
    return this.tabs.filter((tab) => visibleTabKeys.includes(tab.key));
  });

  readonly activeTabKey = computed<SrmTabKey>(() => {
    const visibleTabs = this.visibleTabs();
    const index = this.tabIndex();
    return visibleTabs[index]?.key ?? visibleTabs[0]?.key ?? 'all';
  });

  constructor() {
    this.applyTabFromNavigationState(this.getSourceTabFromNavigationState());
    effect(() => {
      this.visibleTabs();
      this.clampTabIndex();
    });
  }

  selectTab(index: number): void {
    this.tabIndex.set(index);
  }

  private clampTabIndex(): void {
    const maxIndex = this.visibleTabs().length - 1;
    if (this.tabIndex() > maxIndex) {
      this.tabIndex.set(Math.max(0, maxIndex));
    }
  }

  private readQueryParam(key: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return new URLSearchParams(window.location.search).get(key);
  }

  private applyTabFromNavigationState(sourceTab: SrmTabKey | null): void {
    if (!sourceTab) {
      return;
    }

    const index = this.visibleTabs().findIndex((tab) => tab.key === sourceTab);
    if (index >= 0) {
      this.tabIndex.set(index);
    }
  }

  private getSourceTabFromNavigationState(): SrmTabKey | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const sourceTab = window.history?.state?.['sourceTab'];
    if (this.isSrmTabKey(sourceTab)) {
      return sourceTab;
    }

    const sourceTabFromQuery = this.readQueryParam('sourceTab');
    if (this.isSrmTabKey(sourceTabFromQuery)) {
      return sourceTabFromQuery;
    }

    return null;
  }

  private isSrmTabKey(value: unknown): value is SrmTabKey {
    return (
      value === 'queue' ||
      value === 'my-work' ||
      value === 'in-progress' ||
      value === 'all'
    );
  }
}
