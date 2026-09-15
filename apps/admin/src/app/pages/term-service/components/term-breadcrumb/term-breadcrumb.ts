import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';

export interface TermBreadcrumbItem {
  label: string;
  routerLink?: string[];
  click?: () => void;
}

@Component({
  selector: 'app-term-breadcrumb',
  standalone: true,
  imports: [RouterModule, NzBreadCrumbModule],
  templateUrl: './term-breadcrumb.html',
  styleUrl: './term-breadcrumb.scss',
})
export class TermBreadcrumbComponent {
  @Input() items: TermBreadcrumbItem[] = [];
  @Input() testId?: string;
}
