import { signal } from '@angular/core';
import {
  CmsBannerSlide,
  CmsContentItem,
  CmsContentsData,
} from '../../services/thirdparty-service/cms/cms.model';

export type HealthCheckBannerItem = CmsBannerSlide;
export type HealthCheckBannerContent = CmsContentItem;
export type HealthCheckBannerData = CmsContentsData;

export interface HealthCheckState {
  isLoading: boolean;
}

export const healthCheckState = {
  isLoading: signal<boolean>(false),
  bannerData: signal<HealthCheckBannerData | null>(null),
};
