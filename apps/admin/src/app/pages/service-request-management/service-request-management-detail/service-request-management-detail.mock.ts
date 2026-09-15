/**
 * Mock data for service request management detail page
 * TODO: Replace with actual API data
 */

import { type EditHistoryRound, type StatusHistoryItem } from '@exim/ui-kit';

export interface SrmDetailMockData {
  refNo: string;
  service: string;
  companyName: string;
  status: string;
  submittedDate: string;
}

export interface SrmStep01Data {
  companyNameTH: string;
  companyNameEN: string;
  taxId: string;
  businessType: string;
  registrationDate: string;
  companyStatus: string;
  registeredAddress: string;
  contactAddress: string;
}

/**
 * Mock data for service request header information
 */
export const MOCK_SRM_DETAIL_DATA: SrmDetailMockData = {
  refNo: 'FXO-2025-00001234',
  service: 'FX Online',
  companyName: 'A Company จำกัด มหาชน',
  status: 'PENDING_PAYMENT',
  submittedDate: '30 มิ.ย. 2569 (00:00 น.)',
};

/**
 * Mock data for step 01 - Company Information
 */
export const MOCK_SRM_STEP_01_DATA: SrmStep01Data = {
  companyNameTH: 'บริษัท เอแอลทีอาร์ (ประเทศไทย) จำกัด',
  companyNameEN: 'ALTR (Thailand) Co., Ltd.',
  taxId: '0105565043912',
  businessType: 'ธุรกิจส่งออก',
  registrationDate: '10 มีนาคม 2565',
  companyStatus: 'ยังดำเนินกิจการอยู่',
  registeredAddress:
    '522 ซอย บางนา-ตราด 27 แขวงบางนามหาชัย เขตบางนา กรุงเทพมหานคร 10260',
  contactAddress:
    '522 ซอย บางนา-ตราด 27 แขวงบางนามหาชัย เขตบางนา กรุงเทพมหานคร 10260',
};

/**
 * Mock data for status history (Tab 2)
 */
export const MOCK_SRM_STATUS_HISTORY: StatusHistoryItem[] = [
  {
    id: '7',
    status: 'อนุมัติ',
    description: 'ใบสมัครได้รับการอนุมัติเรียบร้อย',
    actionBy: 'ธนาคาร',
    actionDate: '13 มิ.ย. 2568 (00:00 น.)',
    iconColor: 'success',
  },
  {
    id: '6',
    status: 'อยู่ระหว่างพิจารณา',
    description: 'ธนาคารกำลังตรวจสอบข้อมูลใบสมัคร',
    actionBy: 'ธนาคาร',
    actionDate: '13 มิ.ย. 2568 (00:00 น.)',
    iconColor: 'primary',
  },
  {
    id: '5',
    status: 'อยู่ระหว่างตรวจสอบ',
    description: 'ธนาคารกำลังตรวจสอบข้อมูลใบสมัคร',
    actionBy: 'ธนาคาร',
    actionDate: '13 มิ.ย. 2568 (00:00 น.)',
    iconColor: 'warning',
  },
  {
    id: '4',
    status: 'อยู่ระหว่างดำเนินการ',
    description: 'ระบบได้รับการข้อมูลเรียบร้อยแล้ว',
    actionBy: 'ธนาคาร',
    actionDate: '13 มิ.ย. 2568 (00:00 น.)',
    iconColor: 'primary',
  },
  {
    id: '3',
    status: 'รอการแก้ไขข้อมูล',
    description: 'ธนาคารขอให้แก้ไขข้อมูล',
    actionBy: 'ตัวแทนลูกค้า',
    actionDate: '13 มิ.ย. 2568 (00:00 น.)',
    iconColor: 'warning',
  },
  {
    id: '2',
    status: 'อยู่ระหว่างตรวจสอบ',
    description: 'ธนาคารกำลังตรวจสอบข้อมูลใบสมัคร',
    actionBy: 'ธนาคาร',
    actionDate: '13 มิ.ย. 2568 (00:00 น.)',
    iconColor: 'warning',
  },
  {
    id: '1',
    status: 'อยู่ระหว่างดำเนินการ',
    description: 'ระบบได้รับการข้อมูลเรียบร้อยแล้ว',
    actionBy: 'ธนาคาร',
    actionDate: '13 มิ.ย. 2568 (00:00 น.)',
    iconColor: 'primary',
  },
];

/**
 * Mock data for edit history (Tab 3)
 */
export const MOCK_SRM_EDIT_HISTORY: EditHistoryRound[] = [
  {
    id: 'round-2',
    round: 2,
    isLatest: true,
    isExpanded: true,
    entries: [
      {
        id: 'r2-e1',
        title: 'แก้ไข',
        date: '13 มิ.ย. 2568 (00:00 น.)',
        icon: 'Send',
        iconColor: 'primary',
        changesTitle: 'รายละเอียดการแจ้งแก้ไขจากธนาคาร (2 รายการ)',
        changes: [
          {
            title: '1. ข้อมูลผู้ใช้งาน',
            details: [
              '- ผู้ใช้งานคนที่ 2 : ชื่อ-นามสกุล',
              '- ผู้ใช้งานคนที่ 3 : ชื่อ-นามสกุล',
            ],
          },
          {
            title: '2. ผู้ติดต่อหลัก',
            details: [
              '- ผู้ติดต่อหลักที่ 2 : ชื่อ-นามสกุล เบอร์โทรศัพท์ อีเมล',
            ],
          },
        ],
      },
      {
        id: 'r2-e2',
        title: 'ธนาคารแจ้งให้แก้ไข',
        date: '10 มิ.ย. 2568 (00:00 น.)',
        icon: 'Message Square',
        iconColor: 'primary',
      },
    ],
  },
  {
    id: 'round-1',
    round: 1,
    isLatest: false,
    isExpanded: true,
    entries: [
      {
        id: 'r1-e1',
        title: 'แก้ไข',
        date: '13 พ.ค. 2568 (00:00 น.)',
        icon: 'Send',
        iconColor: 'primary',
        changesTitle: 'รายละเอียดการแจ้งแก้ไขจากธนาคาร (1 รายการ)',
        changes: [
          {
            title: '1. ข้อมูลผู้ใช้งาน',
            details: [
              '- ผู้ใช้งานคนที่ 2 : ชื่อ-นามสกุล',
              '- ผู้ใช้งานคนที่ 3 : ชื่อ-นามสกุล',
            ],
          },
        ],
      },
      {
        id: 'r1-e2',
        title: 'ธนาคารแจ้งให้แก้ไข',
        date: '10 พ.ค. 2568 (00:00 น.)',
        icon: 'Message Square',
        iconColor: 'primary',
      },
    ],
  },
];
