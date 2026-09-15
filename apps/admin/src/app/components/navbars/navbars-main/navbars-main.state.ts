import { inject, Injectable, computed, signal } from '@angular/core';
import { AuthService } from '@exim/auth-sdk';
import { NotificationService } from '../../../services/notification/notification.service';

@Injectable()
export class NavbarMainState {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly userName = computed(
    () => this.authService.user()?.user?.displayName || 'User',
  );

  readonly avatarUrl = computed(() => {
    const avatarURL = this.authService.user()?.user?.avatarURL;
    return avatarURL ? `${avatarURL}` : '';
  });

  readonly companyName = computed(() => {
    const companies = this.authService.user()?.companies ?? [];
    const defaultCompany = companies.find((c) => c.isDefault) ?? companies[0];
    return defaultCompany?.nameTH ?? '';
  });

  readonly isPanelOpen = signal(false);
  readonly isCorporatePanelOpen = signal(false);

  // ─── Notification Bell ───────────────────────────────────────────
  readonly isNotificationPanelOpen = signal(false);
  readonly unreadCount = signal(0);

  async loadUnreadCount(): Promise<void> {
    const count = await this.notificationService.getUnreadCount();

    this.unreadCount.set(count);
  }

  setUnreadCount(count: number): void {
    this.unreadCount.set(count);
  }

  toggleNotificationPanel(): void {
    const willOpen = !this.isNotificationPanelOpen();
    this.isNotificationPanelOpen.set(willOpen);
    // Close user panel when opening noti panel
    if (willOpen) {
      this.isPanelOpen.set(false);
      void this.loadUnreadCount();
    }
  }

  closeNotificationPanel(): void {
    this.isNotificationPanelOpen.set(false);
    // Refresh count when panel closes
    void this.loadUnreadCount();
  }

  // ─── User Profile Panel ──────────────────────────────────────────
  togglePanel(): void {
    this.isPanelOpen.update((v) => !v);
    if (this.isPanelOpen()) {
      this.isNotificationPanelOpen.set(false);
    }
  }

  closePanel(): void {
    this.isPanelOpen.set(false);
  }

  closeUserProfilePanel(): void {
    this.isPanelOpen.set(false); // Close the user profile panel
  }

  toggleCorporatePanel(): void {
    this.isCorporatePanelOpen.update((v) => !v);
  }

  closeCorporatePanel(): void {
    this.isCorporatePanelOpen.set(false);
  }
}
