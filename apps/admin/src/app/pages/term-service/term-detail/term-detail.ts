import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ButtonComponent,
  ModalComponent,
  TableComponent,
  TableColumnComponent,
  TableCellDirective,
  TagComponent,
  IconButtonComponent,
  RadioBoxComponent,
  SpinningComponent,
  ToastComponent,
} from '@exim/ui-kit';
import { APPLICATION_TERM_DETAIL_MESSAGES } from './term-detail.message';
import { APPLICATION_TERM_DETAIL_SELECTORS } from './term-detail.selector';
import {
  ApplicationTermDetailState,
  TermVersionStatus,
} from './term-detail.state';
import type { NzTableSortOrder } from 'ng-zorro-antd/table';
import { APP_ROUTE_PATHS } from '../../../app.routes.const';
import {
  TermBreadcrumbComponent,
  TermBreadcrumbItem,
} from '../components/term-breadcrumb/term-breadcrumb';
import { TermInfoCardComponent } from '../components/term-info-card/term-info-card';
import { TermInfoItemComponent } from '../components/term-info-item/term-info-item';
import {
  TermEditStatusModalComponent,
  TermStatusOption,
} from '../components/term-edit-status-modal/term-edit-status-modal';
import { TermStatusBadgeComponent } from '../components/term-status-badge/term-status-badge';

@Component({
  selector: 'app-application-term-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalComponent,
    TableComponent,
    TableColumnComponent,
    TableCellDirective,
    TagComponent,
    IconButtonComponent,
    RadioBoxComponent,
    SpinningComponent,
    ToastComponent,
    TermBreadcrumbComponent,
    TermInfoCardComponent,
    TermInfoItemComponent,
    TermEditStatusModalComponent,
    TermStatusBadgeComponent,
  ],
  providers: [ApplicationTermDetailState],
  templateUrl: './term-detail.html',
  styleUrl: './term-detail.scss',
})
export class ApplicationTermDetailComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  protected readonly messages = APPLICATION_TERM_DETAIL_MESSAGES;
  protected readonly selectors = APPLICATION_TERM_DETAIL_SELECTORS;
  protected readonly state = inject(ApplicationTermDetailState);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private code = '';
  @ViewChild('versionTableWrapper')
  versionTableWrapper?: ElementRef<HTMLDivElement>;
  private scrollElement: HTMLElement | null = null;
  private scrollListener: (() => void) | null = null;

  get breadcrumbItems(): TermBreadcrumbItem[] {
    return [
      { label: this.messages.BREADCRUMB_HOME, click: () => this.goBack() },
      { label: this.state.detail()?.code ?? '' },
    ];
  }

  get editStatusOptions(): TermStatusOption[] {
    return [
      {
        value: 'published',
        label: this.messages.MODAL_STATUS_PUBLISHED,
        description: this.messages.MODAL_STATUS_PUBLISHED_DESC,
        dotColor: '#197D3F',
      },
      {
        value: 'inactive',
        label: this.messages.MODAL_STATUS_INACTIVE,
        description: this.messages.MODAL_STATUS_INACTIVE_DESC,
        dotColor: '#8C8C8C',
      },
    ];
  }

  ngOnInit(): void {
    this.code = this.route.snapshot.paramMap.get('code') ?? '';
    void this.state.loadDetail(this.code);

    const histState = history.state as {
      toast?: string;
      toastVariant?: 'success' | 'error';
    };

    if (histState?.toast) {
      this.state.triggerToast(
        histState.toast,
        histState.toastVariant ?? 'success',
      );
    }
  }

  ngAfterViewChecked(): void {
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    this.removeScrollListener();
  }

  private setupScrollListener(): void {
    if (!this.versionTableWrapper?.nativeElement) {
      return;
    }

    const scrollElement = this.versionTableWrapper.nativeElement.querySelector(
      '.ant-table-body',
    ) as HTMLElement | null;
    if (!scrollElement || this.scrollElement === scrollElement) {
      return;
    }

    this.removeScrollListener();
    this.scrollElement = scrollElement;

    this.scrollListener = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const threshold = 100;
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        void this.state.loadMoreVersions();
      }
    };

    scrollElement.addEventListener('scroll', this.scrollListener);
  }

  private removeScrollListener(): void {
    if (!this.scrollListener || !this.scrollElement) {
      return;
    }

    this.scrollElement.removeEventListener('scroll', this.scrollListener);
    this.scrollElement = null;
    this.scrollListener = null;
  }

  goBack(): void {
    void this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE]);
  }

  onViewDetail(version: string): void {
    void this.router.navigate([
      APP_ROUTE_PATHS.TERM_SERVICE,
      this.code,
      'detail',
      version,
    ]);
  }

  onViewOperators(version: string): void {
    void this.router.navigate([
      APP_ROUTE_PATHS.TERM_SERVICE,
      this.code,
      'operators',
      version,
    ]);
  }

  onEditStatus(version: string, currentStatus: TermVersionStatus): void {
    this.state.openEditModal(this.code, version, currentStatus);
  }

  onSelectEditStatus(value: string): void {
    this.state.selectEditStatus(value as TermVersionStatus);
  }

  onCreateVersion(): void {
    void this.router.navigate([
      APP_ROUTE_PATHS.TERM_SERVICE,
      this.code,
      'version',
      'new',
    ]);
  }

  onColumnSort(event: { key: string; value: NzTableSortOrder }): void {
    this.state.setSort(event.key, event.value);
  }
}
