import { Injectable } from '@angular/core';
import { DateHelperByDatePipe } from 'ng-zorro-antd/i18n';

const CE_MIN = 1900;
const CE_MAX = 2200;
const BE_OFFSET = 543;

@Injectable()
export class BuddhistEraDateHelperService extends DateHelperByDatePipe {
  override format(date: Date, formatStr: string): string {
    const result = super.format(date, formatStr);
    return this.ceYearToBe(result);
  }

  override parseDate(text: string): Date {
    return super.parseDate(this.beYearToCe(text));
  }

  private ceYearToBe(value: string): string {
    return value.replace(/\b(\d{4})\b/g, (match) => {
      const y = +match;
      return y >= CE_MIN && y <= CE_MAX ? String(y + BE_OFFSET) : match;
    });
  }

  private beYearToCe(value: string): string {
    const beMin = CE_MIN + BE_OFFSET;
    const beMax = CE_MAX + BE_OFFSET;
    return value.replace(/\b(\d{4})\b/g, (match) => {
      const y = +match;
      return y >= beMin && y <= beMax ? String(y - BE_OFFSET) : match;
    });
  }
}
