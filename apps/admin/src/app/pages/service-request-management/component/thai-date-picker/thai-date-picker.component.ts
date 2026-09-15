import {
  AfterViewInit,
  Component,
  computed,
  input,
  NgZone,
  OnDestroy,
  output,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { DateHelperService } from 'ng-zorro-antd/i18n';
import { BuddhistEraDateHelperService } from './buddhist-era-date-helper.service';
import { THAI_DATE_PICKER_MESSAGES } from './thai-date-picker.message';
import { THAI_DATE_PICKER_STATE } from './thai-date-picker.state';

@Component({
  selector: 'app-thai-date-picker',
  standalone: true,
  imports: [FormsModule, NzDatePickerModule],
  templateUrl: './thai-date-picker.component.html',
  styleUrl: './thai-date-picker.component.scss',
  providers: [
    { provide: DateHelperService, useClass: BuddhistEraDateHelperService },
  ],
})
export class ThaiDatePickerComponent implements AfterViewInit, OnDestroy {
  protected readonly inputId = `thai-date-${Math.random().toString(36).slice(2, 10)}`;

  readonly label = input<string>(THAI_DATE_PICKER_MESSAGES.LABEL);
  readonly placeholder = input<string>(THAI_DATE_PICKER_MESSAGES.PLACEHOLDER);
  readonly dropdownClassName = input<string>(
    THAI_DATE_PICKER_STATE.DROPDOWN_CLASS_NAME,
  );
  readonly dateFormat = input<string>(THAI_DATE_PICKER_STATE.DATE_FORMAT);

  readonly value = input<string | null>(null);

  readonly valueChange = output<string | null>();

  private decadeObserver: MutationObserver | null = null;
  private readonly ngZone = inject(NgZone);

  protected readonly dateValue = computed(() => {
    const value = this.value();
    return value ? this.parseDateString(value) : null;
  });

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.decadeObserver = new MutationObserver(() =>
        this.patchBuddhistEraLabels(),
      );
      this.decadeObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    });
  }

  ngOnDestroy(): void {
    this.decadeObserver?.disconnect();
  }

  protected onDateChange(date: Date | null): void {
    this.valueChange.emit(date ? this.formatDateToString(date) : null);
  }

  private patchBuddhistEraLabels(): void {
    const dropdownClass = this.dropdownClassName();
    if (!document.querySelector(`.${dropdownClass}`)) return;

    const selector = [
      `.${dropdownClass} .ant-picker-header-decade-btn`,
      `.${dropdownClass} .ant-picker-header-century-btn`,
      `.${dropdownClass} .ant-picker-decade-panel .ant-picker-cell-inner`,
    ].join(',');

    document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      const text = el.textContent ?? '';
      const patched = text.replace(/\b(\d{4})-(\d{4})\b/g, (_, a, b) => {
        const ya = +a;
        const yb = +b;
        return ya >= 1900 && ya <= 2200
          ? `${ya + 543}-${yb + 543}`
          : `${a}-${b}`;
      });
      if (patched !== text) {
        el.textContent = patched;
      }
    });
  }

  private parseDateString(dateString: string): Date {
    const datePart = dateString.includes('T')
      ? dateString.slice(0, 10)
      : dateString;
    const [year, month, day] = datePart.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatDateToString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00Z`;
  }
}
