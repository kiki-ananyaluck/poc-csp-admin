import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@exim/ui-kit';
import {
  NotificationIconType,
  NotificationItem,
} from '../../../../../services/notification/notification.models';
import { getRelativeTime } from '../../../../../shared/utils/relative-time.util';

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
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './notification-item.html',
  styleUrl: './notification-item.scss',
})
export class NotificationItemComponent {
  readonly item = input.required<NotificationItem>();

  readonly clicked = output<NotificationItem>();

  readonly iconConfig = computed(() => ICON_CONFIG[this.item().iconType]);

  readonly timeLabel = computed(() => getRelativeTime(this.item().createdAt));

  onClick(): void {
    this.clicked.emit(this.item());
  }
}
