import {
  Component,
  DestroyRef,
  inject,
  ElementRef,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { NAVBAR_MAIN_MESSAGES } from './navbars-main.message';
import { NavbarMainState } from './navbars-main.state';
import { IconComponent, UserAvatarComponent } from '@exim/ui-kit';
import { RealtimeService } from '@exim/util-sdk';
import { UserProfilePanelComponent } from '../../panels/user-profile-panel/user-profile-panel';
import { NotificationPanelComponent } from '../../panels/notification-panel/notification-panel';

interface RealtimeNotificationMessage {
  payload?: unknown;
}

interface RealtimeSubscription {
  unsubscribe(): void;
}

@Component({
  selector: 'app-navbar-main',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    UserAvatarComponent,
    UserProfilePanelComponent,
    NotificationPanelComponent,
  ],
  providers: [NavbarMainState],
  templateUrl: './navbars-main.html',
  styleUrl: './navbars-main.scss',
})
export class NavbarMainComponent implements OnInit {
  protected readonly messages = NAVBAR_MAIN_MESSAGES;
  protected readonly state = inject(NavbarMainState);
  protected readonly avatarSize = 40;

  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef);
  private readonly realtimeService = inject(RealtimeService);

  ngOnInit(): void {
    void this.initializeNotifications();
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.elementRef.nativeElement.contains(target)) {
      this.state.closePanel();
    }
  }

  private async initializeNotifications(): Promise<void> {
    await this.state.loadUnreadCount();
    await this.realtimeService.connect('notify');

    const client = this.realtimeService.getClient('notify');
    const subscriptions: RealtimeSubscription[] = [
      client.subscribe('Notification', () => {
        void this.state.loadUnreadCount();
      }),
      client.subscribe(
        'UnreadCountUpdated',
        (message: RealtimeNotificationMessage) => {
          const unreadCount = this.getUnreadCountFromPayload(message.payload);

          if (unreadCount === null) {
            void this.state.loadUnreadCount();
            return;
          }

          this.state.setUnreadCount(unreadCount);
        },
      ),
    ];

    this.destroyRef.onDestroy(() => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    });
  }

  private getUnreadCountFromPayload(payload: unknown): number | null {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const unreadCount = (payload as { unreadCount?: unknown }).unreadCount;

    return typeof unreadCount === 'number' ? unreadCount : null;
  }
}
