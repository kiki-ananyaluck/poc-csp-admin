import { TagVariant } from '@exim/ui-kit';
import { SrmStatusCode } from './service-request-management-list/service-request-management-list.state';
import { SERVICE_REQUEST_MANAGEMENT_MESSAGES } from './service-request-management.message';

export interface SrmStatusDisplay {
  label: string;
  variant: TagVariant;
}

export const STATUS_DISPLAY: Record<SrmStatusCode, SrmStatusDisplay> = {
  PENDING_PAYMENT: {
    label: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_PENDING_PAYMENT,
    variant: 'info',
  },
  APPROVED: {
    label: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_APPROVED,
    variant: 'success',
  },
  REJECTED: {
    label: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_REJECTED,
    variant: 'error',
  },
  UNDER_REVIEW: {
    label: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_UNDER_REVIEW,
    variant: 'warning',
  },
  UNDER_CONSIDERATION: {
    label: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_UNDER_CONSIDERATION,
    variant: 'info',
  },
  EDITED_UNDER_REVIEW: {
    label: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_EDITED_UNDER_REVIEW,
    variant: 'info',
  },
  REQUEST_INFO: {
    label: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_REQUEST_INFO,
    variant: 'warning',
  },
  CANCELLED: {
    label: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_CANCELLED,
    variant: 'default',
  },
};

const STATUS_VARIANT_BY_DOCUMENT_STATUS: Record<string, TagVariant> = {
  // Gray
  DRAFT: 'default-light',

  // Blue
  SUBMITTED: 'info',
  REVIEWED: 'info',
  INAPPROVE: 'info',
  RESUBMITTED: 'info',

  // Yellow
  INREVIEW: 'warning',
  REWORK: 'warning',

  // Green
  APPROVED: 'success',

  // Red
  REJECTED: 'error',
  CLOSED: 'error',

  // Dark gray
  CANCELLED: 'default',
};

const STATUS_LABEL_BY_DOCUMENT_STATUS: Record<string, string> = {
  DRAFT: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_DRAFT,
  SUBMITTED: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_PENDING_PAYMENT,
  INREVIEW: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_UNDER_REVIEW,
  REVIEWED: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_UNDER_CONSIDERATION,
  INAPPROVE: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_INAPPROVE,
  RESUBMITTED: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_EDITED_UNDER_REVIEW,
  APPROVED: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_APPROVED,
  REJECTED: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_REJECTED,
  REWORK: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_REWORK,
  CANCELLED: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_CANCELLED,
  CLOSED: SERVICE_REQUEST_MANAGEMENT_MESSAGES.STATUS_CLOSED,
};

function normalizeStatusCode(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function getStatusDisplay(code: string): SrmStatusDisplay {
  const normalized = normalizeStatusCode(code);

  const documentStatusVariant = STATUS_VARIANT_BY_DOCUMENT_STATUS[normalized];
  if (documentStatusVariant) {
    return {
      label: STATUS_LABEL_BY_DOCUMENT_STATUS[normalized] ?? code,
      variant: documentStatusVariant,
    };
  }

  const fromLegacy = STATUS_DISPLAY[code as SrmStatusCode];
  if (fromLegacy) return fromLegacy;

  return { label: code, variant: 'default' };
}
