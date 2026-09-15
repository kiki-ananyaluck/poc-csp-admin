import { MenuItemConfig } from '@exim/ui-kit';
export type { MenuItemConfig };

export const ADMIN_PORTAL_BOTTOM_MENU: MenuItemConfig[] = [
  // {
  //   title: 'ตั้งค่าเร่งด่วน',
  //   icon: 'danger',
  //   iconColor: 'var(--color-error-icon)',
  //   action: 'goSettings',
  // },
];

export const ADMIN_PORTAL_MENU: MenuItemConfig[] = [
  {
    title: 'แอปฯ ย่อย',
    icon: 'application',
    children: [
      {
        title: 'จัดการสถานะแอปฯ',
        icon: 'application_edit',
        action: 'appStatus',
      },
      // {
      //   title: 'เพิ่มแอปฯ ย่อย',
      //   icon: 'application_edit',
      //   action: 'goDashboard',
      // },
    ],
  },
  // {
  //   title: 'ข้อมูล',
  //   icon: 'info square',
  // },
  {
    title: 'จัดการแหล่งข้อมูล',
    icon: 'info square',
    children: [
      {
        title: 'ประเภทที่ 1',
        icon: 'info square',
        action: 'goCodexType1',
      },
      {
        title: 'ประเภทที่ 2',
        icon: 'info square',
        action: 'goCodexType2',
      },
    ],
  },
  {
    title: 'จัดการเลขเอกสาร',
    icon: 'document',
    action: 'goDocumentNumbers',
  },
  // {
  //   title: 'Helper Function',
  //   icon: 'setting',
  //   children: [
  //     {
  //       title: 'log Auth State',
  //       icon: 'application_add',
  //       action: 'getAuthState',
  //     },
  //   ],
  // },
  {
    title: 'ข้อกำหนดและเงื่อนไข',
    icon: 'document',
    action: 'goTermService',
  },
  {
    title: 'ตรวจสอบสุขภาพระบบ',
    icon: 'info square',
    action: 'goHealthCheck',
  },
  {
    title: 'Workflow',
    icon: 'application',
    children: [
      {
        title: 'สร้าง Workflow',
        icon: 'application_edit',
        action: 'goWorkflowStart',
      },
      {
        title: 'รายละเอียด Workflow',
        icon: 'application_edit',
        action: 'goWorkflowMyWorkflow',
      },
      {
        title: 'เอกสารที่รออนุมัติ',
        icon: 'application_edit',
        action: 'goWorkflowMyApprovals',
      },
      {
        title: 'สร้างแม่แบบ',
        icon: 'application_edit',
        action: 'goWorkflowTemplate',
      },
    ],
  },
  {
    title: 'รายการสมัครใช้บริการ',
    icon: 'setting',
    action: 'goServiceRequestManagement',
  },
];
