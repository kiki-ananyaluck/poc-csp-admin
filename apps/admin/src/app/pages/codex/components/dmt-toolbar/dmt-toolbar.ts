import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  HostListener,
  ElementRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { IconService, ButtonComponent } from '@exim/ui-kit';
import { BreadcrumbItem } from '../../codex.types';
import { DATA_MANAGEMENT_TABLE_MESSAGES } from '../../codex.message';

@Component({
  selector: 'app-dmt-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NzBreadCrumbModule,
    ButtonComponent,
  ],
  templateUrl: './dmt-toolbar.html',
  styleUrl: './dmt-toolbar.scss',
})
export class DmtToolbarComponent {
  protected readonly messages = DATA_MANAGEMENT_TABLE_MESSAGES;
  private readonly el = inject(ElementRef);
  private readonly iconService = inject(IconService);

  constructor() {
    this.iconService.registerIconSvg(
      'download-template',
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.4" d="M18.81 9.021C18.36 9.021 17.76 9.011 17.01 9.011C15.2 9.011 13.71 7.508 13.71 5.675V2.459C13.71 2.206 13.5 2 13.25 2H7.96C5.5 2 3.5 4.026 3.5 6.509V17.284C3.5 19.889 5.59 22 8.17 22H16.05C18.51 22 20.5 19.987 20.5 17.502V9.471C20.5 9.217 20.3 9.012 20.05 9.013C19.62 9.016 19.12 9.021 18.81 9.021Z" fill="currentColor"/><path opacity="0.4" d="M16.08 2.567C15.79 2.256 15.26 2.47 15.26 2.901V5.538C15.26 6.644 16.17 7.554 17.28 7.554C17.98 7.562 18.94 7.564 19.77 7.562C20.19 7.561 20.4 7.058 20.11 6.754C19.05 5.657 17.17 3.691 16.08 2.567Z" fill="currentColor"/><path d="M14.36 12.994H12.75V11.384C12.75 10.97 12.41 10.634 12 10.634C11.58 10.634 11.25 10.97 11.25 11.384V12.994H9.63C9.22 12.994 8.88 13.334 8.88 13.744C8.88 14.154 9.22 14.494 9.63 14.494H11.25V16.104C11.25 16.518 11.58 16.854 12 16.854C12.41 16.854 12.75 16.518 12.75 16.104V14.494H14.36C14.78 14.494 15.11 14.154 15.11 13.744C15.11 13.334 14.78 12.994 14.36 12.994Z" fill="currentColor"/></svg>`,
    );
    this.iconService.registerIconSvg(
      'download-data',
      `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path opacity="0.4" d="M16.34 2H7.67C4.28 2 2 4.38 2 7.92V16.09C2 19.62 4.28 22 7.67 22H16.34C19.73 22 22 19.62 22 16.09V7.92C22 4.38 19.73 2 16.34 2Z" fill="currentColor"/><path d="M16.5 8.25H7.5C7.09 8.25 6.75 7.91 6.75 7.5C6.75 7.09 7.09 6.75 7.5 6.75H16.5C16.91 6.75 17.25 7.09 17.25 7.5C17.25 7.91 16.91 8.25 16.5 8.25Z" fill="currentColor"/><path d="M16.5 12.75H7.5C7.09 12.75 6.75 12.41 6.75 12C6.75 11.59 7.09 11.25 7.5 11.25H16.5C16.91 11.25 17.25 11.59 17.25 12C17.25 12.41 16.91 12.75 16.5 12.75Z" fill="currentColor"/><path d="M16.5 17.25H7.5C7.09 17.25 6.75 16.91 6.75 16.5C6.75 16.09 7.09 15.75 7.5 15.75H16.5C16.91 15.75 17.25 16.09 17.25 16.5C17.25 16.91 16.91 17.25 16.5 17.25Z" fill="currentColor"/></svg>`,
    );
  }

  @Input() pageTitle = '';
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() showDownloadTemplate = true;
  @Input() showImport = true;

  protected isDownloadMenuOpen = signal(false);

  @Output() addClick = new EventEmitter<void>();
  @Output() openImportClick = new EventEmitter<void>();
  @Output() downloadTemplateClick = new EventEmitter<void>();
  @Output() downloadDataClick = new EventEmitter<void>();

  protected onDownloadTemplate(): void {
    this.isDownloadMenuOpen.set(false);
    this.downloadTemplateClick.emit();
  }

  protected onDownloadData(): void {
    this.isDownloadMenuOpen.set(false);
    this.downloadDataClick.emit();
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    if (!this.el.nativeElement.contains(target)) {
      this.isDownloadMenuOpen.set(false);
    }
  }
}
