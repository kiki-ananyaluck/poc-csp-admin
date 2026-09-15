import { APP_ROUTE_PATHS } from '../../app.routes.const';

export interface HomeMenuItem {
  label: string;
  iconId: string;
  route: string | null;
  disabled: boolean;
}

export const HOME_MENU_ITEMS: HomeMenuItem[] = [
  {
    label: 'จัดการสถานะแอปพลิเคชันย่อย',
    iconId: 'application_edit',
    route: APP_ROUTE_PATHS.APP_STATUS,
    disabled: false,
  },
  {
    label: 'เพิ่มแอปพลิเคชันย่อย',
    iconId: 'application_add',
    route: null,
    disabled: false,
  },
  {
    label: 'จัดการแหล่งข้อมูล',
    iconId: 'filter_line',
    route: null,
    disabled: false,
  },
  {
    label: 'ข้อกำหนดและเงื่อนไข',
    iconId: 'document',
    route: APP_ROUTE_PATHS.TERM_SERVICE,
    disabled: false,
  },
  {
    label: 'ตรวจสอบสุขภาพระบบ',
    iconId: 'shield',
    route: '/health-check',
    disabled: false,
  },
  { label: 'Menu Name', iconId: 'application', route: null, disabled: true },
  { label: 'Menu Name', iconId: 'application', route: null, disabled: true },
  { label: 'Menu Name', iconId: 'application', route: null, disabled: true },
];
