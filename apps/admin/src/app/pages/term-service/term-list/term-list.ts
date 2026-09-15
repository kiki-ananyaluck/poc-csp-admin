import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  OnDestroy,
  AfterViewChecked,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import {
  ButtonComponent,
  TabsComponent,
  TabPage,
  SearchInputComponent,
  CheckboxComponent,
  TableComponent,
  TableColumnComponent,
  TableCellDirective,
  TagComponent,
  IconButtonComponent,
  ToastComponent,
} from '@exim/ui-kit';
import { APPLICATION_TERM_HOME_MESSAGES } from './term-list.message';
import { APPLICATION_TERM_HOME_SELECTORS } from './term-list.selector';
import { ApplicationTermHomeState } from './term-list.state';
import type { NzTableSortOrder } from 'ng-zorro-antd/table';
import { APP_ROUTE_PATHS } from '../../../app.routes.const';

@Component({
  selector: 'app-application-term-home',
  standalone: true,
  imports: [
    CommonModule,
    NzTooltipModule,
    ButtonComponent,
    TabsComponent,
    SearchInputComponent,
    CheckboxComponent,
    TableComponent,
    TableColumnComponent,
    TableCellDirective,
    TagComponent,
    IconButtonComponent,
    ToastComponent,
  ],
  providers: [ApplicationTermHomeState],
  templateUrl: './term-list.html',
  styleUrl: './term-list.scss',
})
export class ApplicationTermHomeComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  protected readonly messages = APPLICATION_TERM_HOME_MESSAGES;
  protected readonly selectors = APPLICATION_TERM_HOME_SELECTORS;
  protected readonly state = inject(ApplicationTermHomeState);
  private readonly router = inject(Router);
  @ViewChild('tableWrapper') tableWrapper?: ElementRef<HTMLDivElement>;

  readonly tabIndex = signal<number>(0);
  readonly lazySkeletonRows = Array.from({ length: 2 }, (_, idx) => ({
    __skeleton: true,
    __skeletonKey: idx,
    code: '',
    name: '',
    service: '',
    latestVersion: '',
    lastUpdated: '',
    lastUpdatedIso: '',
    type: 'mandatory' as const,
    status: 'inactive' as const,
    tabType: 'user' as const,
  }));
  readonly tableRows = computed(() => {
    const rows = this.state.filteredItems();
    if (!this.state.isLoadingMore()) {
      return rows;
    }

    return [...rows, ...this.lazySkeletonRows];
  });
  private scrollElement: HTMLElement | null = null;
  private scrollListener: (() => void) | null = null;

  readonly tabPages: TabPage[] = [
    {
      key: 'user',
      name: this.messages.TAB_USER,
      icon: 'profile',
      component: null,
    },
    {
      key: 'corporate',
      name: this.messages.TAB_CORPORATE,
      icon: 'corporate',
      component: null,
    },
  ];

  ngOnInit(): void {
    const histState = history.state as {
      toast?: string;
      toastVariant?: 'success' | 'error';
      toastSource?: 'term-create-success';
    };

    if (histState?.toast && histState.toastSource === 'term-create-success') {
      this.state.triggerToast(
        histState.toast,
        histState.toastVariant ?? 'success',
      );

      const nextState = { ...history.state } as Record<string, unknown>;
      delete nextState['toast'];
      delete nextState['toastVariant'];
      delete nextState['toastSource'];
      window.history.replaceState(nextState, document.title);
    }
  }

  ngAfterViewChecked(): void {
    this.setupScrollListener();
  }

  ngOnDestroy(): void {
    this.removeScrollListener();
  }

  private setupScrollListener(): void {
    if (!this.tableWrapper?.nativeElement) {
      return;
    }

    const scrollElement = this.tableWrapper.nativeElement.querySelector(
      '.ant-table-body',
    ) as HTMLElement | null;
    if (!scrollElement || this.scrollElement === scrollElement) {
      return;
    }

    this.removeScrollListener();
    this.scrollElement = scrollElement;

    this.scrollListener = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const threshold = 100; // Load more when 100px from bottom
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        void this.state.loadMore();
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

  navigateToCreate(): void {
    void this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE, 'new'], {
      queryParams: {
        customerType:
          this.state.activeTab() === 'corporate' ? 'CORPORATE' : 'INDIVIDUAL',
      },
    });
  }

  onTabChange(index: number): void {
    this.tabIndex.set(index);
    this.state.setTab(index === 0 ? 'user' : 'corporate');
  }

  onRowClick(code: string): void {
    void this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE, code]);
  }

  isSkeletonRow(row: unknown): boolean {
    return !!(row as { __skeleton?: boolean })?.__skeleton;
  }

  onColumnSort(event: { key: string; value: NzTableSortOrder }): void {
    this.state.setSort(event.key, event.value);
  }
}
