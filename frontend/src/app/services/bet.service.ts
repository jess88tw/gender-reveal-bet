import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bet, BetStats, Participant, RevealConfig, User } from '../models/types';

export interface RevealStatus {
  config: RevealConfig;
  winner: { id: string; name: string; avatarUrl?: string } | null;
  prizeInfo: { totalPool: number; fee: number; winnerPrize: number } | null;
}

@Injectable({
  providedIn: 'root',
})
export class BetService {
  private readonly apiUrl = `${environment.apiUrl}/bets`;
  private readonly adminApiUrl = `${environment.apiUrl}/admin`;

  // 使用 Signal 管理狀態
  private statsSignal = signal<BetStats | null>(null);
  private myBetsSignal = signal<Bet[]>([]);
  private participantsSignal = signal<Participant[]>([]);
  private revealStatusSignal = signal<RevealStatus | null>(null);

  // 公開的 readonly signals
  readonly stats = this.statsSignal.asReadonly();
  readonly myBets = this.myBetsSignal.asReadonly();
  readonly participants = this.participantsSignal.asReadonly();
  readonly revealStatus = this.revealStatusSignal.asReadonly();

  // Reveal computed helpers
  readonly isRevealed = computed(() => this.revealStatusSignal()?.config?.isRevealed ?? false);
  readonly revealedGender = computed(() => this.revealStatusSignal()?.config?.revealedGender ?? null);
  readonly winner = computed(() => this.revealStatusSignal()?.winner ?? null);
  readonly prizeInfo = computed(() => this.revealStatusSignal()?.prizeInfo ?? null);

  // Computed values
  readonly totalPrizePool = computed(() => {
    const s = this.statsSignal();
    return s ? s.boy.totalAmount + s.girl.totalAmount : 0;
  });

  readonly boyPercentage = computed(() => {
    const s = this.statsSignal();
    if (!s) return 50;
    const total = s.boy.totalTickets + s.girl.totalTickets;
    return total > 0 ? Math.round((s.boy.totalTickets / total) * 100) : 50;
  });

  readonly girlPercentage = computed(() => {
    return 100 - this.boyPercentage();
  });

  constructor(private http: HttpClient) {}

  getStats(): Observable<BetStats> {
    return this.http
      .get<BetStats>(`${this.apiUrl}/stats`)
      .pipe(tap((stats) => this.statsSignal.set(stats)));
  }

  getMyBets(): Observable<{ bets: Bet[] }> {
    return this.http
      .get<{ bets: Bet[] }>(`${this.apiUrl}/my-bets`, { withCredentials: true })
      .pipe(tap((response) => this.myBetsSignal.set(response.bets)));
  }

  placeBet(
    gender: 'BOY' | 'GIRL',
    paymentMethod?: string,
  ): Observable<{ message: string; bet: Bet }> {
    return this.http.post<{ message: string; bet: Bet }>(
      this.apiUrl,
      { gender, paymentMethod },
      { withCredentials: true },
    );
  }

  getParticipants(): Observable<{ participants: Participant[] }> {
    return this.http
      .get<{ participants: Participant[] }>(`${this.apiUrl}/participants`)
      .pipe(
        tap((response) => this.participantsSignal.set(response.participants)),
      );
  }

  refreshAll(): void {
    this.getStats().subscribe();
    this.getParticipants().subscribe();
    this.getRevealStatus().subscribe();
  }

  getRevealStatus(): Observable<RevealStatus> {
    return this.http
      .get<RevealStatus>(`${this.adminApiUrl}/reveal-status`)
      .pipe(tap((status) => this.revealStatusSignal.set(status)));
  }
}

