import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UserService } from './user.service';
import { environment } from '@environments/environments';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.servicePaths?.baseDomain}/${environment.servicePaths?.user}`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getUserSetting', () => {
    it('should GET user settings', () => {
      const mockResponse = {
        success: true,
        data: {
          noticeWithinApp: { enable: true },
          noticeRealTime: { enable: false },
          subscriptionViaEmail: {
            enable: true,
            contactEmail: 'test@example.com',
          },
        },
      };

      service.getUserSetting().subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `${baseUrl}/v1/users/settings/me/notifications`,
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('updateInAppNotification', () => {
    it('should PATCH with enable flag', () => {
      service.updateInAppNotification(true).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/v1/users/settings/me/notification/within-app`,
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ enable: true });
      req.flush(null);
    });
  });

  describe('updateRealtimeNotification', () => {
    it('should PATCH with enable flag', () => {
      service.updateRealtimeNotification(false).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/v1/users/settings/me/notification/real-time`,
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ enable: false });
      req.flush(null);
    });
  });

  describe('updateViaEmailNotification', () => {
    it('should PATCH with enable flag', () => {
      service.updateViaEmailNotification(true).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/v1/users/settings/me/notification/via-email`,
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ enable: true });
      req.flush(null);
    });
  });

  describe('updateContactEmail', () => {
    it('should PATCH with contactEmail', () => {
      const email = 'new@example.com';
      service.updateContactEmail(email).subscribe();

      const req = httpMock.expectOne(
        `${baseUrl}/v1/users/settings/me/contact-email`,
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ contactEmail: email });
      req.flush(null);
    });
  });
});
