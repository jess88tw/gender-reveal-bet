import { Injectable, signal, computed, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, LoginResponse } from '../models/types';
import { ConfigService } from './config.service';

// Google Identity Services 型別宣告
declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private configService = inject(ConfigService);

  // 使用 Signal 管理狀態
  private currentUserSignal = signal<User | null>(null);
  private loginErrorSignal = signal<string | null>(null);

  // 公開的 computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);
  readonly isAdmin = computed(() => {
    const user = this.currentUserSignal();
    return user !== null && this.configService.adminEmails().includes(user.email);
  });
  readonly loginError = this.loginErrorSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private ngZone: NgZone,
  ) {
    // 初始化時檢查登入狀態
    this.checkAuthStatus();
  }

  private checkAuthStatus(): void {
    this.http
      .get<{ user: User }>(`${this.apiUrl}/me`, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe((response) => {
        if (response?.user) {
          this.currentUserSignal.set(response.user);
        }
      });
  }

  loginWithGoogle(): void {
    this.loginErrorSignal.set(null);

    // 使用 Google Identity Services One Tap / Popup
    google.accounts.id.initialize({
      client_id: this.configService.googleClientId(),
      callback: (response: any) => {
        this.ngZone.run(() => {
          this.handleGoogleCredential(response.credential);
        });
      },
    });

    // 顯示 Google 登入彈出視窗
    google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        // 如果 One Tap 不顯示，改用按鈕式登入
        google.accounts.id.renderButton(
          document.getElementById('google-signin-btn'),
          {
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            locale: 'zh-TW',
          },
        );
      }
    });
  }

  private handleGoogleCredential(token: string): void {
    this.http
      .post<LoginResponse>(
        `${this.apiUrl}/google`,
        { token },
        { withCredentials: true },
      )
      .subscribe({
        next: (response) => {
          this.currentUserSignal.set(response.user);
          this.loginErrorSignal.set(null);
        },
        error: (err) => {
          console.error('Google login error:', err);
          this.loginErrorSignal.set('登入失敗，請稍後再試');
        },
      });
  }

  loginWithLine(): void {
    // TODO: 稍後實作 LINE Login
    console.log('LINE Login - 尚未實作');
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .post<{
        message: string;
      }>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.currentUserSignal.set(null);
          // 登出時也撤銷 Google 的登入狀態
          google.accounts.id.disableAutoSelect();
        }),
      );
  }

  setUser(user: User): void {
    this.currentUserSignal.set(user);
  }
}
