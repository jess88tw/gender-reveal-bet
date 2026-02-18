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

  // 是否顯示 Google 原生按鈕（One Tap 無法顯示時的 fallback）
  private showGoogleRenderedBtnSignal = signal(false);
  readonly showGoogleRenderedBtn = this.showGoogleRenderedBtnSignal.asReadonly();

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
    // 處理 redirect 模式登入後的錯誤參數
    this.handleRedirectLoginResult();
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

  /** 處理 redirect 模式登入後的 URL 參數 */
  private handleRedirectLoginResult(): void {
    const params = new URLSearchParams(window.location.search);
    const loginError = params.get('login_error');
    if (loginError) {
      this.loginErrorSignal.set('Google 登入失敗，請再試一次');
      // 清除 URL 中的錯誤參數
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  loginWithGoogle(): void {
    this.loginErrorSignal.set(null);

    // 判斷是否為手機裝置
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile) {
      // 手機：使用 redirect 模式
      // GIS popup/iframe 在手機瀏覽器上常卡在 /gsi/transform，
      // 改用 ux_mode:'redirect'，Google 會將 credential POST 到 login_uri
      const loginUri = environment.apiUrl.startsWith('http')
        ? `${environment.apiUrl}/auth/google-redirect`
        : `${window.location.origin}${environment.apiUrl}/auth/google-redirect`;

      google.accounts.id.initialize({
        client_id: this.configService.googleClientId(),
        login_uri: loginUri,
        ux_mode: 'redirect',
        use_fedcm_for_prompt: false,
      });
    } else {
      // 桌面端：使用 popup 模式
      google.accounts.id.initialize({
        client_id: this.configService.googleClientId(),
        callback: (response: any) => {
          this.ngZone.run(() => {
            this.handleGoogleCredential(response.credential);
          });
        },
        use_fedcm_for_prompt: false,
      });

      // 先嘗試 One Tap（不使用 FedCM），失敗才 fallback 到按鈕
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          this.ngZone.run(() => this.showGoogleRenderedBtnSignal.set(true));
          setTimeout(() => {
            const btnEl = document.getElementById('google-signin-btn');
            if (btnEl) {
              google.accounts.id.renderButton(btnEl, {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                locale: 'zh-TW',
                width: 280,
              });
            }
          });
        }
      });
      return;
    }

    // 手機端：直接顯示 Google 原生按鈕（redirect 模式）
    this.ngZone.run(() => this.showGoogleRenderedBtnSignal.set(true));
    setTimeout(() => {
      const btnEl = document.getElementById('google-signin-btn');
      if (btnEl) {
        google.accounts.id.renderButton(btnEl, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          locale: 'zh-TW',
          width: 280,
        });
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

  /** 清除前端登入狀態（不呼叫後端 API，用於 session 已被後端銷毀的場景） */
  clearUser(): void {
    this.currentUserSignal.set(null);
    try {
      google.accounts.id.disableAutoSelect();
    } catch {
      // Google SDK 可能尚未載入
    }
  }
}
