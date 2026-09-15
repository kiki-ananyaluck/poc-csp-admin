import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ButtonComponent,
  TagComponent,
  CheckboxComponent,
  SpinningComponent,
  ToastComponent,
  TextEditorViewComponent,
} from '@exim/ui-kit';
import { TERM_VERSION_DETAIL_MESSAGES } from './term-version-detail.message';
import { TERM_VERSION_DETAIL_SELECTORS } from './term-version-detail.selector';
import {
  TermVersionDetailState,
  TermVersionStatus,
} from './term-version-detail.state';
import { APP_ROUTE_PATHS } from '../../../../app.routes.const';
import {
  TermBreadcrumbComponent,
  TermBreadcrumbItem,
} from '../../components/term-breadcrumb/term-breadcrumb';
import { TermInfoCardComponent } from '../../components/term-info-card/term-info-card';
import { TermInfoItemComponent } from '../../components/term-info-item/term-info-item';
import {
  TermEditStatusModalComponent,
  TermStatusOption,
} from '../../components/term-edit-status-modal/term-edit-status-modal';
import { TermStatusBadgeComponent } from '../../components/term-status-badge/term-status-badge';

@Component({
  selector: 'app-term-version-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    TagComponent,
    CheckboxComponent,
    SpinningComponent,
    ToastComponent,
    TextEditorViewComponent,
    TermBreadcrumbComponent,
    TermInfoCardComponent,
    TermInfoItemComponent,
    TermEditStatusModalComponent,
    TermStatusBadgeComponent,
  ],
  providers: [TermVersionDetailState],
  templateUrl: './term-version-detail.html',
  styleUrl: './term-version-detail.scss',
})
export class TermVersionDetailComponent implements OnInit {
  protected readonly messages = TERM_VERSION_DETAIL_MESSAGES;
  protected readonly selectors = TERM_VERSION_DETAIL_SELECTORS;
  protected readonly state = inject(TermVersionDetailState);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private code = '';
  private version = '';

  get breadcrumbItems(): TermBreadcrumbItem[] {
    const detail = this.state.detail();
    return [
      { label: this.messages.BREADCRUMB_HOME, click: () => this.goToHome() },
      { label: detail?.code ?? '', click: () => this.goToDetail() },
      { label: `${this.messages.BREADCRUMB_PREFIX} ${detail?.version ?? ''}` },
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

  get showCheckboxRequiredStar(): boolean {
    return this.state.detail()?.checkboxRequired ?? false;
  }

  get checkboxLabel(): string {
    const detail = this.state.detail();
    return detail?.checkboxLabel ?? detail?.conditionTitle ?? '';
  }

  ngOnInit(): void {
    this.code = this.route.snapshot.paramMap.get('code') ?? '';
    this.version = this.route.snapshot.paramMap.get('version') ?? '';
    void this.state.loadDetail(this.code, this.version);
  }

  goToHome(): void {
    void this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE]);
  }

  goToDetail(): void {
    void this.router.navigate([APP_ROUTE_PATHS.TERM_SERVICE, this.code]);
  }

  onEditStatus(): void {
    this.state.openEditModal();
  }

  onSelectEditStatus(value: string): void {
    this.state.selectEditStatus(value as TermVersionStatus);
  }

  createVersion(): void {
    void this.router.navigate(
      [APP_ROUTE_PATHS.TERM_SERVICE, this.code, 'version', 'new'],
      { queryParams: { copyFrom: this.version } },
    );
  }
}
