import { TabPage } from '@exim/ui-kit';
import { StepItem } from '../component/srm-step-sidebar/srm-step-sidebar';
import { SRM_DETAIL_MESSAGES } from './service-request-management-detail.message';

/**
 * Tab configuration for service request management detail page
 */
export const SRM_DETAIL_TAB_PAGES: TabPage[] = [
  {
    key: 'details',
    name: SRM_DETAIL_MESSAGES.TAB_DETAILS,
    icon: '',
    component: null,
  },
  {
    key: 'history',
    name: SRM_DETAIL_MESSAGES.TAB_HISTORY,
    icon: '',
    component: null,
  },
  {
    key: 'edit-history',
    name: SRM_DETAIL_MESSAGES.TAB_EDIT_HISTORY,
    icon: '',
    component: null,
  },
];

/**
 * Step items for service request form navigation
 */
export const SRM_DETAIL_STEPS: StepItem[] = [
  { id: '01', label: SRM_DETAIL_MESSAGES.STEP_01_LABEL, number: '01' },
  { id: '02', label: SRM_DETAIL_MESSAGES.STEP_02_LABEL, number: '02' },
  { id: '03', label: SRM_DETAIL_MESSAGES.STEP_03_LABEL, number: '03' },
  { id: '04', label: SRM_DETAIL_MESSAGES.STEP_04_LABEL, number: '04' },
  { id: '05', label: SRM_DETAIL_MESSAGES.STEP_05_LABEL, number: '05' },
];

export const SRM_DETAIL_STATUS = {
  SUBMITTED: 'SUBMITTED',
  REVIEWED: 'REVIEWED',
  IN_REVIEW: 'INREVIEW',
  IN_APPROVE: 'INAPPROVE',
  RESUBMITTED: 'RESUBMITTED',
} as const;

export type SrmDetailStatusCode =
  (typeof SRM_DETAIL_STATUS)[keyof typeof SRM_DETAIL_STATUS];

export const SRM_DETAIL_REWORK_ACTOR = {
  preferredRole: 'AdminApprover',
  fallbackRole: 'AdminApprover',
} as const;

export interface SrmDetailBottomActionPolicy {
  primaryLabel: string;
  rejectLabel: string;
  primaryModalTitle: string;
  rejectModalTitle: string;
  rejectModalSubtitle: string;
  primaryConfirmMessage: string;
  rejectConfirmMessage: string;
  showOnboardingReworkInput: boolean;
}

export const SRM_DETAIL_PICKUP_ALLOWED_STATUSES = new Set<string>([
  SRM_DETAIL_STATUS.SUBMITTED,
  SRM_DETAIL_STATUS.REVIEWED,
]);

export const SRM_DETAIL_BOTTOM_ACTION_POLICY_BY_STATUS: Record<
  string,
  SrmDetailBottomActionPolicy
> = {
  [SRM_DETAIL_STATUS.IN_REVIEW]: {
    primaryLabel: SRM_DETAIL_MESSAGES.BTN_PRIMARY_IN_REVIEW,
    rejectLabel: SRM_DETAIL_MESSAGES.BTN_REJECT,
    primaryModalTitle: SRM_DETAIL_MESSAGES.MODAL_PRIMARY_TITLE_IN_REVIEW,
    rejectModalTitle: SRM_DETAIL_MESSAGES.MODAL_REJECT_TITLE_IN_REVIEW,
    rejectModalSubtitle: SRM_DETAIL_MESSAGES.MODAL_REJECT_SUBTITLE_IN_REVIEW,
    primaryConfirmMessage: SRM_DETAIL_MESSAGES.MODAL_PRIMARY_IN_REVIEW,
    rejectConfirmMessage: SRM_DETAIL_MESSAGES.MODAL_REJECT_IN_REVIEW,
    showOnboardingReworkInput: true,
  },
  [SRM_DETAIL_STATUS.RESUBMITTED]: {
    primaryLabel: SRM_DETAIL_MESSAGES.BTN_PRIMARY_IN_REVIEW,
    rejectLabel: SRM_DETAIL_MESSAGES.BTN_REJECT,
    primaryModalTitle: SRM_DETAIL_MESSAGES.MODAL_PRIMARY_TITLE_IN_REVIEW,
    rejectModalTitle: SRM_DETAIL_MESSAGES.MODAL_REJECT_TITLE_IN_REVIEW,
    rejectModalSubtitle: SRM_DETAIL_MESSAGES.MODAL_REJECT_SUBTITLE_IN_REVIEW,
    primaryConfirmMessage: SRM_DETAIL_MESSAGES.MODAL_PRIMARY_IN_REVIEW,
    rejectConfirmMessage: SRM_DETAIL_MESSAGES.MODAL_REJECT_IN_REVIEW,
    showOnboardingReworkInput: true,
  },
  [SRM_DETAIL_STATUS.IN_APPROVE]: {
    primaryLabel: SRM_DETAIL_MESSAGES.BTN_PRIMARY_IN_APPROVE,
    rejectLabel: SRM_DETAIL_MESSAGES.BTN_REJECT_IN_APPROVE,
    primaryModalTitle: SRM_DETAIL_MESSAGES.MODAL_PRIMARY_TITLE_IN_APPROVE,
    rejectModalTitle: SRM_DETAIL_MESSAGES.MODAL_REJECT_TITLE_IN_APPROVE,
    rejectModalSubtitle: SRM_DETAIL_MESSAGES.MODAL_REJECT_SUBTITLE_IN_APPROVE,
    primaryConfirmMessage: SRM_DETAIL_MESSAGES.MODAL_PRIMARY_IN_APPROVE,
    rejectConfirmMessage: SRM_DETAIL_MESSAGES.MODAL_REJECT_IN_APPROVE,
    showOnboardingReworkInput: true,
  },
};
