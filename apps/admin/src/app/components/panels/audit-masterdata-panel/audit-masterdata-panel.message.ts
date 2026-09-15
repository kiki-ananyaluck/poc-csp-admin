export const AUDIT_MASTERDATA_MESSAGES = {
  TITLE: 'ตรวจสอบข้อมูล',
  REIMPORT_BUTTON: 'นำเข้าชุดข้อมูลใหม่',
  CANCEL_BUTTON: 'ยกเลิก',
  ERROR_BANNER:
    'พบความผิดพลาดของข้อมูลที่นำเข้า กรุณาปรับข้อมูลตามหมายเหตุ และนำเข้าชุดข้อมูลใหม่อีกครั้ง',
  COL_ROW: 'แถวที่',
  COL_CODE: 'รหัส',
  COL_NAME_TH: 'ชื่อ (TH)',
  COL_NAME_EN: 'ชื่อ (EN)',
  COL_STATUS: 'สถานะ',
  COL_REMARK: 'หมายเหตุ',
  STATUS_ACTIVE: 'Active',
  STATUS_INACTIVE: 'Inactive',
  PAGINATION_PER_PAGE: 'จำนวนผลลัพธ์ต่อหน้า',
  PAGINATION_RANGE: (start: number, end: number, total: number) =>
    `ข้อมูล ${start}-${end} จาก ${total}`,
};
