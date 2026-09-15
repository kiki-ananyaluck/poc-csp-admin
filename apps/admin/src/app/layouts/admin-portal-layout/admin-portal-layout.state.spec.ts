import { AdminPortalLayoutState } from './admin-portal-layout.state';

describe('AdminPortalLayoutState', () => {
  let state: AdminPortalLayoutState;

  beforeEach(() => {
    state = new AdminPortalLayoutState();
  });

  it('should initialize with isCollapsed = false', () => {
    expect(state.isCollapsed()).toBe(false);
  });

  it('should toggle collapsed', () => {
    state.toggleCollapsed();
    expect(state.isCollapsed()).toBe(true);

    state.toggleCollapsed();
    expect(state.isCollapsed()).toBe(false);
  });

  it('should set collapsed directly', () => {
    state.setCollapsed(true);
    expect(state.isCollapsed()).toBe(true);

    state.setCollapsed(false);
    expect(state.isCollapsed()).toBe(false);
  });

  it('should dispatch ToggleCollapsed message', () => {
    state.dispatch({ type: 'ToggleCollapsed' });
    expect(state.isCollapsed()).toBe(true);
  });

  it('should dispatch SetCollapsed message', () => {
    state.dispatch({ type: 'SetCollapsed', collapsed: true });
    expect(state.isCollapsed()).toBe(true);
  });
});
