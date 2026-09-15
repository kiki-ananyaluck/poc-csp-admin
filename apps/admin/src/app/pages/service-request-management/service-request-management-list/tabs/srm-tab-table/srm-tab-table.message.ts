/**
 * Messages for SRM tab table component
 */
export const SRM_TAB_TABLE_MESSAGES = {
  BTN_CANCEL: 'ยกเลิก',
  BTN_REASSIGN_CONFIRM: 'เปลี่ยนแปลงผู้รับผิดชอบ',

  TOAST_ACTOR_NOT_FOUND: 'ไม่สามารถระบุผู้ดำเนินการได้',
  TOAST_REASSIGN_SUCCESS: 'ย้ายผู้รับผิดชอบสำเร็จ',

  TOAST_API_NETWORK_ERROR:
    'การเชื่อมต่อมีปัญหา กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง',
  TOAST_GENERIC_ERROR: 'ทำรายการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
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

  FORMAT_DATE_FROM: (from: string): string => `ตั้งแต่ ${from}`,
  FORMAT_DATE_TO: (to: string): string => `ถึง ${to}`,
} as const;
