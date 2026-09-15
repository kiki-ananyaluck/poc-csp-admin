import { Component, inject } from '@angular/core';
import { ButtonComponent } from '@exim/ui-kit';
import { CMS_TAGS } from '../../services/thirdparty-service/cms/cms.model';
import { CmsService } from '../../services/thirdparty-service/cms/cms.service';
import { HEALTH_CHECK_MESSAGES } from './health-check.message';
import {
  HealthCheckBannerContent,
  HealthCheckBannerItem,
  healthCheckState,
} from './health-check.state';

@Component({
  selector: 'app-health-check',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './health-check.html',
  styleUrls: ['./health-check.scss'],
})
export class HealthCheckComponent {
  readonly messages = HEALTH_CHECK_MESSAGES;
  readonly state = healthCheckState;

  private readonly cmsService = inject(CmsService);

  constructor() {
    this.loadBannerData();
  }

  private async loadBannerData(): Promise<void> {
    try {
      this.state.isLoading.set(true);
      const response = await this.cmsService.getContentsByTag(
        CMS_TAGS.HEALTH_CHECK_ADMIN,
      );
      this.state.bannerData.set(response.data ?? null);
    } finally {
      this.state.isLoading.set(false);
    }
  }

  getCardHeader(
    content: HealthCheckBannerContent,
  ): HealthCheckBannerItem | null {
    return content.data[0] ?? null;
  }

  getCardFeatures(content: HealthCheckBannerContent): HealthCheckBannerItem[] {
    return content.data.slice(1).filter((item) => item.isActive);
  }

  navigateTo(url: string | null): void {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
