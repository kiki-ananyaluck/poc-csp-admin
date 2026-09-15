import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  ElementRef,
  viewChild,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LayoutNotificationItem,
  LayoutNotificationItemComponent,
  SkeletonComponent,
} from '@exim/ui-kit';
import { NOTIFICATION_MESSAGES } from './notification.message';
import { NOTIFICATION_SELECTORS } from './notification.selector';
import { NotificationState } from './notification.state';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, SkeletonComponent, LayoutNotificationItemComponent],
  providers: [NotificationState],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class NotificationComponent implements OnInit, OnDestroy {
  protected readonly messages = NOTIFICATION_MESSAGES;
  protected readonly selectors = NOTIFICATION_SELECTORS;
  protected readonly state = inject(NotificationState);

  readonly sentinelEl = viewChild<ElementRef<HTMLDivElement>>('sentinel');

  private observer?: IntersectionObserver;

  readonly skeletonItems = Array(5).fill(0);
  readonly skeletonMoreItems = Array(2).fill(0);

  constructor() {
    effect(() => {
      const el = this.sentinelEl();
      this.observer?.disconnect();
      this.observer = undefined;
      if (el?.nativeElement) {
        this.observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              this.state.loadMore();
            }
          },
          { threshold: 0.1 },
        );
        this.observer.observe(el.nativeElement);
      }
    });
  }

  ngOnInit(): void {
    this.state.loadInitial();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  onItemClicked(item: LayoutNotificationItem): void {
    this.state.handleItemClick(item);
  }
}
