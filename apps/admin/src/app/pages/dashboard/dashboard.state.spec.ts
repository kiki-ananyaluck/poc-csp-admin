import { dashboardState } from './dashboard.state';

describe('dashboardState', () => {
  it('should initialize isLoading as false', () => {
    expect(dashboardState.isLoading()).toBe(false);
  });

  it('should update isLoading to true', () => {
    dashboardState.isLoading.set(true);
    expect(dashboardState.isLoading()).toBe(true);
    dashboardState.isLoading.set(false); // reset
  });

  it('should reset isLoading back to false', () => {
    dashboardState.isLoading.set(true);
    dashboardState.isLoading.set(false);
    expect(dashboardState.isLoading()).toBe(false);
  });
});
