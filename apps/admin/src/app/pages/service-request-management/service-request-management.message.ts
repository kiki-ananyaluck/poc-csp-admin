/**
 * Messages for service request management common config
 */
export const SERVICE_REQUEST_MANAGEMENT_MESSAGES = {
  STATUS_PENDING_PAYMENT: 'อยู่ระหว่างดำเนินการ',
  STATUS_APPROVED: 'อนุมัติ',
  STATUS_REJECTED: 'ไม่อนุมัติ',
  STATUS_UNDER_REVIEW: 'อยู่ระหว่างตรวจสอบ',
  STATUS_UNDER_CONSIDERATION: 'อยู่ระหว่างพิจารณา',
  STATUS_EDITED_UNDER_REVIEW: 'แก้ไขแล้ว อยู่ระหว่างตรวจสอบ',
  STATUS_REQUEST_INFO: 'ขอการแก้ไขข้อมูล',
  STATUS_CANCELLED: 'ยกเลิก',
  STATUS_DRAFT: 'บันทึกร่าง',
  STATUS_INAPPROVE: 'กำลังพิจารณา',
  STATUS_REWORK: 'ส่งกลับแก้ไข',
  STATUS_CLOSED: 'ปิดการใช้งาน',
} as const;
