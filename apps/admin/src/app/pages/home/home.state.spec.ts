import { homeState } from './home.state';

describe('homeState', () => {
  it('should initialize isLoading as false', () => {
    expect(homeState.isLoading()).toBe(false);
  });

  it('should update isLoading to true', () => {
    homeState.isLoading.set(true);
    expect(homeState.isLoading()).toBe(true);
    homeState.isLoading.set(false); // reset
  });

  it('should reset isLoading back to false', () => {
    homeState.isLoading.set(true);
    homeState.isLoading.set(false);
    expect(homeState.isLoading()).toBe(false);
  });
});
