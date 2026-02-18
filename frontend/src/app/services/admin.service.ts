import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Bet, Clue, RevealConfig, User } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly apiUrl = `${environment.apiUrl}/admin`;

  // 使用 Signal 管理狀態
  private allBetsSignal = signal<Bet[]>([]);
  private revealConfigSignal = signal<RevealConfig | null>(null);
  private winnerSignal = signal<{ id: string; name: string; avatarUrl?: string } | null>(null);
  private prizeInfoSignal = signal<{ totalPool: number; fee: number; winnerPrize: number } | null>(null);

  readonly allBets = this.allBetsSignal.asReadonly();
  readonly revealConfig = this.revealConfigSignal.asReadonly();
  readonly winner = this.winnerSignal.asReadonly();
  readonly prizeInfo = this.prizeInfoSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getAllBets(): Observable<{ bets: Bet[] }> {
    return this.http
      .get<{ bets: Bet[] }>(`${this.apiUrl}/all-bets`, { withCredentials: true })
      .pipe(tap((response) => this.allBetsSignal.set(response.bets)));
  }

  confirmPayment(betId: string): Observable<{ message: string; bet: Bet }> {
    return this.http.patch<{ message: string; bet: Bet }>(
      `${this.apiUrl}/confirm-payment/${betId}`,
      {},
      { withCredentials: true },
    );
  }

  getRevealConfig(): Observable<{ config: RevealConfig; winner: any; prizeInfo: any }> {
    return this.http
      .get<{ config: RevealConfig; winner: any; prizeInfo: any }>(`${this.apiUrl}/reveal-status`, {
        withCredentials: true,
      })
      .pipe(tap((res) => {
        this.revealConfigSignal.set(res.config);
        this.winnerSignal.set(res.winner);
        this.prizeInfoSignal.set(res.prizeInfo);
      }));
  }

  revealGender(
    gender: 'BOY' | 'GIRL',
  ): Observable<{ message: string; config: RevealConfig }> {
    return this.http.post<{ message: string; config: RevealConfig }>(
      `${this.apiUrl}/reveal`,
      { gender },
      { withCredentials: true },
    );
  }

  drawWinner(): Observable<{
    message: string;
    winner: User;
    config: RevealConfig;
  }> {
    return this.http.post<{
      message: string;
      winner: User;
      config: RevealConfig;
    }>(`${this.apiUrl}/draw-winner`, {}, { withCredentials: true });
  }

  // Clue management
  createClue(clue: Partial<Clue>): Observable<{ message: string; clue: Clue }> {
    return this.http.post<{ message: string; clue: Clue }>(
      `${environment.apiUrl}/clues`,
      clue,
      { withCredentials: true },
    );
  }

  updateClue(
    id: string,
    clue: Partial<Clue>,
  ): Observable<{ message: string; clue: Clue }> {
    return this.http.patch<{ message: string; clue: Clue }>(
      `${environment.apiUrl}/clues/${id}`,
      clue,
      { withCredentials: true },
    );
  }

  deleteClue(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/clues/${id}`,
      { withCredentials: true },
    );
  }

  clearData(): Observable<{ message: string; deleted: { bets: number; revealConfig: number; symptoms: number; users: number } }> {
    return this.http.post<{ message: string; deleted: { bets: number; revealConfig: number; symptoms: number; users: number } }>(
      `${this.apiUrl}/clear-data`,
      {},
      { withCredentials: true },
    );
  }

  updatePredictions(dadPrediction: string | null, momPrediction: string | null): Observable<{ message: string; config: any }> {
    return this.http.patch<{ message: string; config: any }>(
      `${this.apiUrl}/predictions`,
      { dadPrediction, momPrediction },
      { withCredentials: true },
    );
  }
}
