import { Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SkeletonComponent } from '@exim/ui-kit';
import { NOTIFICATION_PANEL_MESSAGES } from './notification-panel.message';
import { NOTIFICATION_PANEL_SELECTORS } from './notification-panel.selector';
import { NotificationPanelState } from './notification-panel.state';
import { NotificationItemComponent } from './components/notification-item/notification-item';
import { NotificationItem } from '../../../services/notification/notification.models';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SkeletonComponent,
    NotificationItemComponent,
  ],
  providers: [NotificationPanelState],
  templateUrl: './notification-panel.html',
  styleUrl: './notification-panel.scss',
})
export class NotificationPanelComponent implements OnInit {
  protected readonly messages = NOTIFICATION_PANEL_MESSAGES;
  protected readonly selectors = NOTIFICATION_PANEL_SELECTORS;
  protected readonly state = inject(NotificationPanelState);

  readonly isOpen = input(false);
  readonly closed = output<void>();

  ngOnInit(): void {
    void this.state.loadNotifications();
  }

  onClose(): void {
    this.closed.emit();
  }

  onItemClicked(item: NotificationItem): void {
    this.state.handleItemClick(item);
    this.closed.emit();
  }

  onMarkAllRead(): void {
    this.state.markAllAsRead();
  }

  onViewAll(): void {
    this.state.navigateToList();
    this.closed.emit();
  }

  readonly skeletonItems = Array(5).fill(0);
}
