import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AppConfig {
  googleClientId: string;
  adminEmails: string[];
}

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private configSignal = signal<AppConfig>({
    googleClientId: '',
    adminEmails: [],
  });

  readonly config = this.configSignal.asReadonly();
  readonly googleClientId = () => this.configSignal().googleClientId;
  readonly adminEmails = () => this.configSignal().adminEmails;

  constructor(private http: HttpClient) {}

  /**
   * 在 APP_INITIALIZER 中呼叫，啟動時從後端載入設定
   */
  load(): Promise<void> {
    return firstValueFrom(
      this.http.get<AppConfig>(`${environment.apiUrl}/config`),
    )
      .then((config) => {
        this.configSignal.set(config);
      })
      .catch((err) => {
        console.error('Failed to load app config:', err);
      });
  }
}
