import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, LoginResponse } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  // 使用 Signal 管理狀態
  private currentUserSignal = signal<User | null>(null);

  // 公開的 computed signals
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  constructor(private http: HttpClient) {
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
    window.location.href = `${this.apiUrl}/google`;
  }

  loginWithLine(): void {
    window.location.href = `${this.apiUrl}/line`;
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .post<{
        message: string;
      }>(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(tap(() => this.currentUserSignal.set(null)));
  }

  // 處理 OAuth callback
  handleAuthCallback(
    provider: string,
    code: string,
  ): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${this.apiUrl}/${provider}/callback`,
        { code },
        { withCredentials: true },
      )
      .pipe(tap((response) => this.currentUserSignal.set(response.user)));
  }

  setUser(user: User): void {
    this.currentUserSignal.set(user);
  }
}
