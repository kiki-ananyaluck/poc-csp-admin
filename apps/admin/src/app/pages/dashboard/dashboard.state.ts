import { signal } from '@angular/core';

export interface DashboardState {
  isLoading: boolean;
}

export const dashboardState = {
  isLoading: signal<boolean>(false),
};
