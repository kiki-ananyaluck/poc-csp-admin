import { ApiResponse } from '@exim/auth-sdk';

export const CMS_TAGS = {
  BANNER: 'content-type:banner',
  POPUP: 'content-type:popup',
  CARD: 'content-type:card',
  PLATFORM_WEB: 'platform:web',
  PLATFORM_MOBILE: 'platform:mobile',
  HEALTH_CHECK_ADMIN: 'menu-health-check-admin',
} as const;

export interface CmsBannerSlide {
  id: number;
  title: string | null;
  subtitle: string | null;
  description: string | null;
  buttonText: string | null;
  imageUrl: string;
  buttonLink: string | null;
  displayOrder: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
  tags: string[];
  sourceSystem: string;
}

export interface CmsContentItem {
  tag: string;
  data: CmsBannerSlide[];
}

export interface CmsContentsData {
  tag: string;
  contents: CmsContentItem[];
}

export type CmsContentsResponse = ApiResponse<CmsContentsData>;
