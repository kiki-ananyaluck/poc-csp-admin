export enum ConsentCategory {
  STRICTLY_NECESSARY = 'strictly_necessary',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
}

export interface CookieConsentState {
  anonymousId: string;
  consentedAt: string;
  categories: string[];
}
