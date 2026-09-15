import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { RealtimeAppConnectionService } from '../services/realtime/realtime-app-connection.service';

export const realtimeConnectionGuard: CanActivateFn = async () => {
  const realtimeAppConnectionService = inject(RealtimeAppConnectionService);
  await realtimeAppConnectionService.initialize();
  return true;
};
