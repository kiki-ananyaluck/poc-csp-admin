import { NoticeSection } from '../consent-service/register/consent-register.model';

export type TacConsentStatus = 'ACCEPTED' | 'NOT_ACCEPTED' | 'VERSION_UPDATED';

export interface TacPendingPurpose {
  purposeId: string;
  purposeName: string;
  description: string;
  require: boolean;
  currentVersion?: number;
  userVersion?: number | null;
}

export interface TacPendingNotice {
  noticeId: string;
  noticeName: string;
  version: string;
  pendingReason: string;
  sections: NoticeSection[];
  purposeList: TacPendingPurpose[];
}

/** Raw API response from GET /v1/pending-notices */
export interface TacPendingNoticesApiResponse {
  data: {
    noticeList: TacPendingNotice[];
    hasPendingConsent: boolean;
  };
  meta: unknown;
}

/** Normalized state — mapped จาก API response */
export interface TacConsentStatusResponse {
  status: TacConsentStatus;
  hasPendingConsent: boolean;
  pendingNotices: TacPendingNotice[];
}
