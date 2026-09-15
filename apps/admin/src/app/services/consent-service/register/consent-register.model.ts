import { ApiResponse } from '@exim/auth-sdk';

export interface NoticeSection {
  name: string;
  description: string;
  content: string;
  sectionType: string;
  order: number;
}

export interface ConsentPurpose {
  purposeId: string;
  purposeName: string;
  description: string;
  require: boolean;
  requireScroll?: boolean;
  check?: boolean;
  time?: string;
  status?: string;
}

export interface Notice {
  noticeId: string;
  noticeName: string;
  version: string;
  sections: NoticeSection[];
  purposeList: ConsentPurpose[];
}

export interface NoticeListData {
  noticeList: Notice[];
}

export interface SubmitConsentRequest {
  organizationId: string;
  collectionPointId: string;
  identifier: string;
  purposes: {
    purposeId: string;
    check: boolean;
  }[];
  firstName?: string;
  lastName?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentNotice {
  noticeId: string;
  noticeName: string;
  version: string;
  sections: NoticeSection[];
}

export interface ConsentData {
  noticeList: ConsentNotice[];
  purposeList: ConsentPurpose[];
}

export type ConsentRequestResponse = ApiResponse<NoticeListData>;
export type ConsentResponse = ApiResponse<ConsentData>;
