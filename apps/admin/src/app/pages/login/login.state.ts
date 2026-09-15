import { inject, Injectable, signal, DestroyRef } from '@angular/core';
import { AuthService } from '@exim/auth-sdk';
import { switchMap } from 'rxjs';
import { BffAuthService } from '../../services/bff-service/bff-auth/bff-auth.service';
import {
  OtpInitiateData,
  BffAuthErrorResponse,
} from '../../services/bff-service/bff-auth/bff-auth.model';

export enum LoginStep {
  EMAIL = 'email',
  OTP = 'otp',
}

@Injectable()
export class LoginState {
  private readonly loginService = inject(BffAuthService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _currentStep = signal<LoginStep>(LoginStep.EMAIL);
  private readonly _email = signal<string>('');
  private readonly _continuationToken = signal<string>('');
  private readonly _refCode = signal<string>('');
  private readonly _isLoading = signal(false);
  private readonly _errorMessage = signal<string | null>(null);
  private readonly _loginSuccess = signal(false);
  private readonly _slotLimitCooldown = signal<number>(0);
  private _slotLimitInterval: ReturnType<typeof setInterval> | null = null;

  readonly currentStep = this._currentStep.asReadonly();
  readonly email = this._email.asReadonly();
  readonly continuationToken = this._continuationToken.asReadonly();
  readonly refCode = this._refCode.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly errorMessage = this._errorMessage.asReadonly();
  readonly loginSuccess = this._loginSuccess.asReadonly();
  readonly slotLimitCooldown = this._slotLimitCooldown.asReadonly();

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (this._slotLimitInterval) clearInterval(this._slotLimitInterval);
    });
  }

  setCurrentStep(value: LoginStep) {
    this._currentStep.set(value);
  }

  setEmail(value: string) {
    this._email.set(value);
  }

  setIsLoading(value: boolean) {
    this._isLoading.set(value);
  }

  setErrorMessage(value: string | null) {
    this._errorMessage.set(value);
  }

  goToOtpStep(email: string) {
    this.setEmail(email);
    this.setCurrentStep(LoginStep.OTP);
  }

  submitEmail(email: string): void {
    this._isLoading.set(true);
    this._errorMessage.set(null);
    this.loginService.initiateOtp(email).subscribe({
      next: (response) => {
        this._isLoading.set(false);
        this.setEmail(email);
        this._continuationToken.set(response.data?.continuationToken ?? '');
        this._refCode.set(response.data?.refCode ?? '');
        this._currentStep.set(LoginStep.OTP);
      },
      error: (err) => {
        this._isLoading.set(false);
        const apiError: BffAuthErrorResponse = err.error;
        if (apiError?.errorCode === 'Otp.Banned') {
          this._errorMessage.set(
            'Your account is temporarily locked due to multiple failed attempts. Please try again later.',
          );
        }
        console.log('Login initiate error:', err);
      },
    });
  }

  submitOtp(email: string, otp: string, continuationToken: string): void {
    this._isLoading.set(true);
    this.loginService
      .verifyOtp(email, otp, continuationToken)
      .pipe(switchMap(() => this.authService.syncUserProfile()))
      .subscribe({
        next: () => {
          this._isLoading.set(false);
          this._loginSuccess.set(true);
        },
        error: (err) => {
          this._isLoading.set(false);
          const apiError: BffAuthErrorResponse = err.error;
          if (apiError?.errorCode === 'Otp.MaxAttempts') {
            this.reset();
          }
          console.log('Login verify error:', err);
        },
      });
  }

  goBackToEmailStep() {
    this.setCurrentStep(LoginStep.EMAIL);
  }

  resendOtp(email: string): void {
    this._isLoading.set(true);
    this._errorMessage.set(null);
    this.loginService.initiateOtp(email).subscribe({
      next: (response) => {
        this._isLoading.set(false);
        this._continuationToken.set(response.data?.continuationToken ?? '');
        this._refCode.set(response.data?.refCode ?? '');
      },
      error: (err) => {
        this._isLoading.set(false);
        const apiError: BffAuthErrorResponse = err.error;
        if (apiError?.errorCode === 'Auth.OtpSlotLimit') {
          this.startSlotLimitCooldown();
        }
        console.log('Resend OTP error:', err);
      },
    });
  }

  reset() {
    this._currentStep.set(LoginStep.EMAIL);
    this._email.set('');
    this._continuationToken.set('');
    this._refCode.set('');
    this._isLoading.set(false);
    this._errorMessage.set(null);
    this._loginSuccess.set(false);
    if (this._slotLimitInterval) {
      clearInterval(this._slotLimitInterval);
      this._slotLimitInterval = null;
    }
    this._slotLimitCooldown.set(0);
  }

  private startSlotLimitCooldown(seconds = 300) {
    this._slotLimitCooldown.set(seconds);
    if (this._slotLimitInterval) clearInterval(this._slotLimitInterval);
    this._slotLimitInterval = setInterval(() => {
      const current = this._slotLimitCooldown();
      if (current <= 1) {
        this._slotLimitCooldown.set(0);
        clearInterval(this._slotLimitInterval!);
        this._slotLimitInterval = null;
      } else {
        this._slotLimitCooldown.set(current - 1);
      }
    }, 1000);
  }
}
