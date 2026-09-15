export type SubAppStatus = 'active' | 'maintenance' | 'inactive';

export interface SubAppRow {
  id: string | number;
  name: string;
  version: string;
  status: SubAppStatus;
  description: string;
  announcementTag: string;
  updatedAt: string;
  avatarUrl?: string;
  [key: string]: unknown;
}
