import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@environments/environments';

/**
 * Gateway Credentials Interceptor
 *
 * เพิ่ม withCredentials: true ให้ทุก request ที่ไปยัง API Gateway (cross-origin)
 * เพื่อให้ browser ส่ง session cookie (จาก Sentinel login) กลับไปกับทุก request
 *
 * ใช้ baseDomain จาก environment เป็นตัวเทียบ URL
 * ถ้า baseDomain ว่าง (proxy mode) จะไม่ทำอะไร เพราะ cookie อยู่บน localhost อยู่แล้ว
 */
export const gatewayCredentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const baseDomain = environment.servicePaths?.baseDomain;

  if (!baseDomain || !req.url.startsWith(baseDomain)) {
    return next(req);
  }

  return next(req.clone({ withCredentials: true }));
};
