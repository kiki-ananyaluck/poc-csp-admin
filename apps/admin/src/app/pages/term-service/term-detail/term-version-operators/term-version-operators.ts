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
import { ActivatedRoute, Router } from '@angular/router';
import {
  ButtonComponent,
  SearchInputComponent,
  TableComponent,
  TableColumnComponent,
  TableCellDirective,
  TagComponent,
  SpinningComponent,
} from '@exim/ui-kit';
import { TERM_VERSION_OPERATORS_MESSAGES } from './term-version-operators.message';
import { TERM_VERSION_OPERATORS_SELECTORS } from './term-version-operators.selector';
import { TermVersionOperatorsState } from './term-version-operators.state';
import type { NzTableSortOrder } from 'ng-zorro-antd/table';
import { APP_ROUTE_PATHS } from '../../../../app.routes.const';
import {
  TermBreadcrumbComponent,
  TermBreadcrumbItem,
} from '../../components/term-breadcrumb/term-breadcrumb';

@Component({
  selector: 'app-term-version-operators',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    SearchInputComponent,
    TableComponent,
    TableColumnComponent,
    TableCellDirective,
    TagComponent,
    SpinningComponent,
    TermBreadcrumbComponent,
  ],
  providers: [TermVersionOperatorsState],
  templateUrl: './term-version-operators.html',
  styleUrl: './term-version-operators.scss',
})
export class TermVersionOperatorsComponent
  implements OnInit, OnDestroy, AfterViewChecked
{
  protected readonly messages = TERM_VERSION_OPERATORS_MESSAGES;
  protected readonly selectors = TERM_VERSION_OPERATORS_SELECTORS;
  protected readonly state = inject(TermVersionOperatorsState);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private code = '';
  private version = '';
  @ViewChild('tableWrapper') tableWrapper?: ElementRef<HTMLDivElement>;
  private scrollElement: HTMLElement | null = null;
  private scrollListener: (() => void) | null = null;

  get breadcrumbItems(): TermBreadcrumbItem[] {
    const info = this.state.info();
    return [
      { label: this.messages.BREADCRUMB_HOME, click: () => this.goToHome() },
      { label: info?.code ?? '', click: () => this.goToDetail() },
      {
        label: `${this.messages.BREADCRUMB_OPERATORS_PREFIX} ${info?.version ?? ''}`,
      },
    ];
  }

  ngOnInit(): void {
    this.code = this.route.snapshot.paramMap.get('code') ?? '';
    this.version = this.route.snapshot.paramMap.get('version') ?? '';
    void this.state.loadInfo(this.code, this.version);
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

  goToHome(): void {
    void this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE]);
  }

  goToDetail(): void {
    void this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE, this.code]);
  }

  onColumnSort(event: { key: string; value: NzTableSortOrder }): void {
    this.state.setSort(event.key, event.value);
  }
}
