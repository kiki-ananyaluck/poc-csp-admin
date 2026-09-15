import { Route } from '@angular/router';
import { AdminPortalLayout } from '@layouts/admin-portal-layout/admin-portal-layout';
import { AuthLayout } from '@layouts/auth-layout/auth-layout';
import { authGuard, guestGuard } from '@exim/auth-sdk';
import { realtimeConnectionGuard } from '../guards/realtime-connection.guard';
import { menuAccessGuard } from '../guards/menu-access.guard';
import { APP_ROUTE_PATHS } from '../app.routes.const';

const seg = (p: string) => p.slice(1);

export const remoteRoutes: Route[] = [
  {
    path: seg(APP_ROUTE_PATHS.LOGIN),
    component: AuthLayout,
    canActivate: [guestGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('@pages/login/login').then((m) => m.Login),
      },
    ],
  },
  {
    path: '',
    component: AdminPortalLayout,
    canActivate: [authGuard, realtimeConnectionGuard],
    canActivateChild: [menuAccessGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('@pages/home/home').then((m) => m.HomeComponent),
      },
      {
        path: seg(APP_ROUTE_PATHS.HOME),
        loadComponent: () =>
          import('@pages/home/home').then((m) => m.HomeComponent),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@pages/dashboard/dashboard').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: `${seg(APP_ROUTE_PATHS.CODEX)}/:id`,
        loadComponent: () => import('@pages/codex/codex').then((m) => m.Codex),
      },
      {
        path: 'workflow/document/:documentId',
        loadComponent: () =>
          import('@pages/workflow/workflow-document/workflow-document').then(
            (m) => m.WorkflowDocument,
          ),
      },
      {
        path: 'workflow/document',
        loadComponent: () =>
          import('@pages/workflow/workflow-document/workflow-document').then(
            (m) => m.WorkflowDocument,
          ),
      },
      {
        path: 'workflow/start',
        loadComponent: () =>
          import('@pages/workflow/workflow-start/workflow-start').then(
            (m) => m.WorkflowStart,
          ),
      },
      {
        path: 'workflow/my/approvals',
        loadComponent: () =>
          import('@pages/workflow/workflow-approval/workflow-approval').then(
            (m) => m.WorkflowApproval,
          ),
      },
      {
        path: 'workflow/template/create',
        loadComponent: () =>
          import('@pages/workflow/workflow-template/workflow-template').then(
            (m) => m.WorkflowTemplate,
          ),
      },
      {
        path: seg(APP_ROUTE_PATHS.DOCUMENT_NUMBERS),
        loadComponent: () =>
          import(
            '@pages/document-numbers/document-number-list/document-number-list'
          ).then((m) => m.DocumentNumberList),
      },
      {
        path: seg(APP_ROUTE_PATHS.DOCUMENT_NUMBERS_API_DEMO),
        loadComponent: () =>
          import(
            '@pages/document-numbers/document-number-api-demo/document-number-api-demo'
          ).then((m) => m.DocumentNumberApiDemo),
      },
      {
        path: `${seg(APP_ROUTE_PATHS.DOCUMENT_NUMBERS)}/:configCode`,
        loadComponent: () =>
          import(
            '@pages/document-numbers/document-number-detail/document-number-detail'
          ).then((m) => m.DocumentNumberDetail),
      },
      {
        path: seg(APP_ROUTE_PATHS.NOTIFICATION),
        loadComponent: () =>
          import('@pages/notification/notification').then(
            (m) => m.NotificationComponent,
          ),
      },
      {
        path: `${seg(APP_ROUTE_PATHS.NOTIFICATION)}/:id`,
        loadComponent: () =>
          import('@pages/notification-info/notification-info').then(
            (m) => m.NotificationInfoComponent,
          ),
      },
      {
        path: seg(APP_ROUTE_PATHS.FORBIDDEN),
        loadComponent: () =>
          import('@pages/forbidden/forbidden').then((m) => m.Forbidden),
      },
      {
        path: 'health-check',
        loadComponent: () =>
          import('@pages/health-check/health-check').then(
            (m) => m.HealthCheckComponent,
          ),
      },
      {
        path: `${seg(APP_ROUTE_PATHS.APP_STATUS)}`,
        loadComponent: () =>
          import('@pages/app-status/app-status').then(
            (m) => m.AppStatusComponent,
          ),
      },
      {
        path: seg(APP_ROUTE_PATHS.HEALTH_CHECK),
        loadComponent: () =>
          import('@pages/health-check/health-check').then(
            (m) => m.HealthCheckComponent,
          ),
      },
      {
        path: seg(APP_ROUTE_PATHS.TERM_SERVICE),
        loadComponent: () =>
          import('@pages/term-service/term-list/term-list').then(
            (m) => m.ApplicationTermHomeComponent,
          ),
      },
      {
        path: `${seg(APP_ROUTE_PATHS.TERM_SERVICE)}/new`,
        loadComponent: () =>
          import('@pages/term-service/term-create/term-create').then(
            (m) => m.TermCreateComponent,
          ),
      },
      {
        path: `${seg(APP_ROUTE_PATHS.TERM_SERVICE)}/:code/version/new`,
        loadComponent: () =>
          import('@pages/term-service/term-create/term-create').then(
            (m) => m.TermCreateComponent,
          ),
      },
      {
        path: `${seg(APP_ROUTE_PATHS.TERM_SERVICE)}/:code`,
        loadComponent: () =>
          import('@pages/term-service/term-detail/term-detail').then(
            (m) => m.ApplicationTermDetailComponent,
          ),
      },
      {
        path: `${seg(APP_ROUTE_PATHS.TERM_SERVICE)}/:code/detail/:version`,
        loadComponent: () =>
          import(
            '@pages/term-service/term-detail/term-version-detail/term-version-detail'
          ).then((m) => m.TermVersionDetailComponent),
      },
      {
        path: `${seg(APP_ROUTE_PATHS.TERM_SERVICE)}/:code/operators/:version`,
        loadComponent: () =>
          import(
            '@pages/term-service/term-detail/term-version-operators/term-version-operators'
          ).then((m) => m.TermVersionOperatorsComponent),
      },
      {
        path: seg(APP_ROUTE_PATHS.SERVICE_REQUEST_MANAGEMENT),
        loadComponent: () =>
          import(
            '@pages/service-request-management/service-request-management-list/service-request-management-list'
          ).then((m) => m.ServiceRequestManagementListComponent),
      },
      {
        path: `${seg(APP_ROUTE_PATHS.SERVICE_REQUEST_MANAGEMENT)}/:id`,
        loadComponent: () =>
          import(
            '@pages/service-request-management/service-request-management-detail/service-request-management-detail'
          ).then((m) => m.ServiceRequestManagementDetailComponent),
      },
    ],
  },
];
