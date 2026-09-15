export const SERVICE_REQUEST_MANAGEMENT_MESSAGES = {
  PAGE_TITLE: 'รายการสมัครใช้บริการ',
  PAGE_SUBTITLE: 'จัดการและติดตามคำขอสมัครใช้บริการทั้งหมด',

  // Tabs
  TAB_QUEUE: 'รับใบสมัคร',
  TAB_MY_WORK: 'งานของฉัน',
  TAB_IN_PROGRESS: 'งานที่กำลังดำเนินการ',
  TAB_ALL: 'งานทั้งหมด',
  SEARCH_PLACEHOLDER:
    'ค้นหาจากเลขที่คำขอ, ชื่อบริษัท หรือ อีเมลของผู้ที่ได้รับมอบหมาย',
  BTN_FILTER: 'กรองข้อมูล',
  FILTER_BY: 'กรองตาม:',
  RESULT_COUNT: 'แสดงผลลัพธ์',
  RESULT_UNIT: 'ชุด',

  // Columns
  COL_REF_NO: 'เลขที่คำขอ',
  COL_STATUS: 'สถานะ',
  COL_SERVICE: 'บริการ',
  COL_COMPANY: 'ชื่อบริษัท',
  COL_SUBMIT_DATE: 'วันที่ยื่นใบสมัคร',
  COL_ASSIGNEE: 'ผู้ที่ได้รับมอบหมาย',
  COL_RECEIVED_DATE: 'วันที่รับงาน',
  COL_LAST_OPERATOR: 'ผู้ดำเนินการล่าสุด',
  COL_LAST_OPERATED_DATE: 'วันที่ดำเนินการล่าสุด',

  // Filter panel
  FILTER_PANEL_TITLE: 'กรองข้อมูล',
  FILTER_CLEAR: 'ล้างค่า',
  FILTER_SECTION_SUBMIT_DATE: 'วันที่ยื่นใบสมัคร',
  FILTER_DATE_FROM: 'ตั้งแต่วันที่',
  FILTER_DATE_TO: 'ถึงวันที่',
  FILTER_SECTION_STATUS: 'สถานะ',
  FILTER_BTN_CANCEL: 'ยกเลิก',
  FILTER_BTN_APPLY: 'นำไปใช้',

  // Selection bar
  SELECTION_LABEL: 'ใบสมัครที่เลือกอยู่',
  BTN_ACCEPT: 'รับงาน',

  // Empty states
  EMPTY_NO_DATA_TITLE: 'ยังไม่มีคำขอใช้บริการ',
  EMPTY_NO_DATA_DESC: 'เมื่อท่านสมัครใช้บริการ รายการคำขอของคุณจะแสดงที่นี่',
  EMPTY_NO_RESULT_TITLE: 'ไม่พบผลลัพธ์การค้นหา',
  EMPTY_NO_RESULT_DESC:
    'กรุณาตรวจสอบคำค้นหาของท่าน หรือลองเปลี่ยนคำค้นหาแล้วลองอีกครั้ง',

  // Status labels
  STATUS_PENDING_PAYMENT: 'อยู่ระหว่างดำเนินการ',
  STATUS_APPROVED: 'อนุมัติ',
  STATUS_REJECTED: 'ไม่อนุมัติ',
  STATUS_UNDER_REVIEW: 'อยู่ระหว่างตรวจสอบ',
  STATUS_UNDER_CONSIDERATION: 'อยู่ระหว่างพิจารณา',
  STATUS_EDITED_UNDER_REVIEW: 'แก้ไขแล้ว อยู่ระหว่างตรวจสอบ',
  STATUS_REQUEST_INFO: 'ขอการแก้ไขข้อมูล',
  STATUS_CANCELLED: 'ยกเลิก',
} as const;
