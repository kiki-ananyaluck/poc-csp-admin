/**
 * Messages and labels for service request management detail page
 */
export const SRM_DETAIL_MESSAGES = {
  // Breadcrumb
  BREADCRUMB_HOME: 'รายการสมัครใช้บริการ',

  // Page header
  PAGE_TITLE: 'รายละเอียดใบสมัคร',

  // Info labels
  LABEL_REF_NO: 'เลขที่คำขอ',
  LABEL_SERVICE: 'บริการ',
  LABEL_COMPANY_NAME: 'ชื่อบริษัท',
  LABEL_STATUS: 'สถานะ',
  LABEL_SUBMITTED_DATE: 'วันที่ยื่น',

  // Tab names
  TAB_DETAILS: 'รายละเอียดใบสมัคร',
  TAB_HISTORY: 'ประวัติสถานะ',
  TAB_EDIT_HISTORY: 'ประวัติการแก้ไขใบสมัคร',

  // Step labels
  STEP_01_LABEL: 'ข้อมูลดีบุคคล',
  STEP_02_LABEL: 'รูปแบบการใช้งาน FX Online',
  STEP_03_LABEL: 'ผู้ใช้งานและสิทธิ์',
  STEP_04_LABEL: 'ผู้ติดต่อหลัก',
  STEP_05_LABEL: 'ผู้มีอำนาจลงนาม',

  // Step 01 field labels
  STEP_01_TITLE: '1. ข้อมูลดีบุคคล',
  STEP_01_COMPANY_NAME_TH: 'ชื่อบริษัท (TH)',
  STEP_01_COMPANY_NAME_EN: 'ชื่อบริษัท (EN)',
  STEP_01_TAX_ID: 'เลขดีบุคคล',
  STEP_01_BUSINESS_TYPE: 'ประเภทธุรกิจ',
  STEP_01_REGISTRATION_DATE: 'วันที่จดทะเบียน',
  STEP_01_STATUS: 'สถานะ',
  STEP_01_REGISTERED_ADDRESS: 'ที่อยู่จดทะเบียน',
  STEP_01_CONTACT_ADDRESS: 'ที่อยู่ที่ติดต่อได้',

  // Step content placeholders
  STEP_02_TITLE: '2. รูปแบบการใช้งาน FX Online',
  STEP_03_TITLE: '3. ผู้ใช้งานและสิทธิ์',
  STEP_04_TITLE: '4. ผู้ติดต่อหลัก',
  STEP_05_TITLE: '5. ผู้มีอำนาจลงนาม',
  PLACEHOLDER_API_PENDING: 'ข้อมูลจะถูกเพิ่มเมื่อ API พร้อม',

  // Tab 2 & 3 titles
  TAB_HISTORY_TITLE: 'ประวัติสถานะ',
  TAB_EDIT_HISTORY_TITLE: 'ประวัติการแก้ไขใบสมัคร',

  // Action buttons
  BTN_CANCEL: 'ยกเลิก',
  BTN_PICKUP: 'รับงาน',
  BTN_REASSIGN: 'เปลี่ยนแปลงผู้รับผิดชอบ',
  BTN_SEND_BACK: 'ส่งคืนแก้ไข',
  BTN_REJECT: 'ไม่ผ่านพิจารณา',
  BTN_REJECT_IN_APPROVE: 'ไม่อนุมัติ',
  BTN_APPROVE: 'ส่งพิจารณา',
  BTN_PRIMARY_IN_REVIEW: 'ส่งพิจารณา',
  BTN_PRIMARY_IN_APPROVE: 'อนุมัติ',

  // Primary action modal titles
  MODAL_PRIMARY_TITLE_IN_REVIEW: 'ยืนยันการส่งพิจารณาใบสมัคร',
  MODAL_PRIMARY_TITLE_IN_APPROVE: 'ยืนยันการอนุมัติใบสมัคร',

  // Reject action modal titles/subtitles
  MODAL_REJECT_TITLE_IN_REVIEW: 'ยืนยันการไม่ผ่านพิจารณาใบสมัคร',
  MODAL_REJECT_TITLE_IN_APPROVE: 'ยืนยันการไม่อนุมัติใบสมัคร',
  MODAL_REJECT_SUBTITLE_IN_REVIEW: 'กรุณาระบุเหตุผลในการไม่ผ่านพิจารณา',
  MODAL_REJECT_SUBTITLE_IN_APPROVE: 'กรุณาระบุเหตุผลในการไม่อนุมัติ',
  MODAL_REJECT_REASON_PLACEHOLDER: 'เหตุผล',

  // Rework validation modal
  MODAL_REWORK_REQUIRED_TITLE: 'ระบุรายละเอียดในการแก้ไข',
  MODAL_REWORK_REQUIRED_SUBTITLE:
    'กรุณาระบุรายละเอียดในการแก้ไขก่อนส่งกลับแก้ไข',
  MODAL_REWORK_REQUIRED_OK: 'ตกลง',

  // Rework confirm modal
  MODAL_REWORK_CONFIRM_TITLE: 'ยืนยันการส่งกลับแก้ไข',
  MODAL_REWORK_CONFIRM_SUBTITLE:
    'คุณต้องการส่งกลับใบสมัครนี้เพื่อให้ลูกค้าแก้ไขข้อมูลตามเงื่อนไขที่ระบุไว้หรือไม่',
  MODAL_REWORK_CONFIRM_CANCEL: 'ยกเลิก',
  MODAL_REWORK_CONFIRM_SUBMIT: 'ส่งกลับแก้ไข',

  // Reassign modal
  MODAL_REASSIGN_TITLE: 'ย้ายผู้รับผิดชอบ',
  MODAL_REASSIGN_ASSIGNEE_LABEL: 'ชื่อผู้รับผิดชอบ',
  MODAL_REASSIGN_ASSIGNEE_PLACEHOLDER: 'กรุณาเลือกชื่อผู้รับผิดชอบ',
  MODAL_REASSIGN_SEARCH_PLACEHOLDER: 'ค้นหาชื่อ...',
  MODAL_REASSIGN_EMPTY: 'ไม่พบข้อมูล',
  MODAL_REASSIGN_CANCEL: 'ยกเลิก',
  MODAL_REASSIGN_CONFIRM: 'เปลี่ยนแปลงผู้รับผิดชอบ',
  MODAL_REASSIGN_CLOSE_DROPDOWN_ARIA: 'ปิดรายการตัวเลือก',

  // Empty state
  EMPTY_REQUEST_NOT_FOUND: 'ไม่พบข้อมูลคำขอสำหรับรายการนี้',

  // Toasts and error messages
  TOAST_ACTOR_NOT_FOUND: 'ไม่สามารถระบุผู้ดำเนินการได้',
  TOAST_ACTION_APP_ID_NOT_FOUND: 'ไม่พบ appId สำหรับดำเนินการ',
  TOAST_ACTION_TASK_ID_NOT_FOUND: 'ไม่พบ taskId สำหรับดำเนินการ',
  TOAST_REWORK_TASK_ID_NOT_FOUND: 'ไม่พบ taskId สำหรับส่งกลับแก้ไข',
  TOAST_REWORK_APP_ID_NOT_FOUND: 'ไม่พบ appId สำหรับส่งกลับแก้ไข',
  TOAST_REWORK_SUCCESS: 'ส่งกลับแก้ไขสำเร็จ',
  TOAST_API_BAD_REQUEST: 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่อีกครั้ง',
  TOAST_API_UNAUTHORIZED: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  TOAST_API_FORBIDDEN: 'คุณไม่มีสิทธิ์ทำรายการนี้',
  TOAST_API_NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
  TOAST_API_CONFLICT: 'รายการนี้ถูกเปลี่ยนแปลงไปแล้ว กรุณารีเฟรชและลองอีกครั้ง',
  TOAST_API_UNPROCESSABLE: 'ไม่สามารถดำเนินการได้ กรุณาตรวจสอบข้อมูลที่กรอก',
  TOAST_API_TOO_MANY_REQUESTS:
    'มีการใช้งานหนาแน่น กรุณาลองใหม่อีกครั้งในภายหลัง',
  TOAST_API_SERVER_ERROR: 'ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง',
  TOAST_API_SERVICE_UNAVAILABLE:
    'ไม่สามารถเชื่อมต่อระบบได้ชั่วคราว กรุณาลองใหม่อีกครั้ง',
  TOAST_API_NETWORK_ERROR:
    'การเชื่อมต่อมีปัญหา กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง',
  TOAST_GENERIC_ERROR: 'ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',

  // Dry run labels
  DRY_RUN_ACTION_PICKUP: 'รับงาน',
  DRY_RUN_ACTION_REASSIGN: 'ย้ายผู้รับผิดชอบ',
  DRY_RUN_ACTION_REWORK: 'ส่งกลับแก้ไข',
  FORMAT_DRY_RUN_TOAST: (actionLabel: string): string =>
    `โหมดทดสอบ: ${actionLabel} (ยังไม่ยิง API จริง)`,

  // Pickup toast formats
  FORMAT_PICKUP_SUCCESS: (successCount: number): string =>
    `รับงานสำเร็จ ${successCount} รายการ`,
  FORMAT_PICKUP_PARTIAL_FAIL: (
    successCount: number,
    failedCount: number,
    reasonSuffix: string,
  ): string =>
    `รับงานสำเร็จ ${successCount} รายการ รับงานไม่สำเร็จ ${failedCount} รายการ${reasonSuffix}`,
  FORMAT_PICKUP_REASON_SUFFIX: (reason: string): string =>
    ` เนื่องจาก${reason.startsWith(' ') ? '' : ' '}${reason}`,

  // Edit history labels
  EDIT_HISTORY_ITEM_DEFAULT_TITLE: 'รายละเอียด',
  EDIT_HISTORY_RESUBMIT_TITLE: 'แก้ไขและยื่นคำขออีกครั้ง',
  EDIT_HISTORY_REQUEST_TITLE: 'ธนาคารแจ้งให้แก้ไข',
  FORMAT_EDIT_HISTORY_CHANGES_TITLE: (count: number): string =>
    `รายละเอียดการแจ้งแก้ไขจากธนาคาร (${count} รายการ)`,

  // Date format labels
  THAI_SHORT_MONTHS: [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ],

  // Confirm modal copy (prepared for app modal integration)
  MODAL_REJECT_IN_REVIEW: 'ยืนยันไม่ผ่านพิจารณารายการนี้ใช่หรือไม่',
  MODAL_REJECT_IN_APPROVE: 'ยืนยันไม่อนุมัติรายการนี้ใช่หรือไม่',
  MODAL_PRIMARY_IN_REVIEW:
    'หลังจากส่งแล้ว ใบสมัครจะถูกส่งต่อไปยังกองงานสำหรับผู้อนุมัติ',
  MODAL_PRIMARY_IN_APPROVE: 'ยืนยันอนุมัติรายการนี้ใช่หรือไม่',
} as const;
