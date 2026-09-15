import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IconComponent, SkeletonComponent } from '@exim/ui-kit';
import { NOTIFICATION_INFO_MESSAGES } from './notification-info.message';
import { NOTIFICATION_INFO_SELECTORS } from './notification-info.selector';
import { NotificationInfoState } from './notification-info.state';
import { APP_ROUTE_PATHS } from '../../app.routes.const';
import { getRelativeTime } from '../../shared/utils/relative-time.util';
import { NotificationIconType } from '../../services/notification/notification.models';

interface IconConfig {
  name: string;
  color: string;
  bgColor: string;
}

const ICON_CONFIG: Record<NotificationIconType, IconConfig> = {
  success: { name: 'check', color: '#197D3F', bgColor: '#EBFFF1' },
  info: { name: 'info_circle', color: '#284AA9', bgColor: '#DEEBFF' },
  warning: { name: 'danger', color: '#CA9400', bgColor: '#FEF3D6' },
  error: { name: 'cross circle', color: '#A81A1A', bgColor: '#FFE8E8' },
};

@Component({
  selector: 'app-notification-info',
  standalone: true,
  imports: [CommonModule, IconComponent, SkeletonComponent],
  providers: [NotificationInfoState],
  templateUrl: './notification-info.html',
  styleUrl: './notification-info.scss',
})
export class NotificationInfoComponent implements OnInit {
  protected readonly messages = NOTIFICATION_INFO_MESSAGES;
  protected readonly selectors = NOTIFICATION_INFO_SELECTORS;
  protected readonly state = inject(NotificationInfoState);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly relativeTime = computed(() => {
    const item = this.state.item();
    return item ? getRelativeTime(item.createdAt) : '';
  });

  readonly iconConfig = computed(
    () => ICON_CONFIG[this.state.item()?.iconType ?? 'info'],
  );

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.state.loadItem(id);
  }

  goBack(): void {
    this.router.navigate([APP_ROUTE_PATHS.NOTIFICATION]);
  }
}
