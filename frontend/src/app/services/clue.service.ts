import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Clue } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class ClueService {
  private readonly apiUrl = `${environment.apiUrl}/clues`;

  // 使用 Signal 管理狀態
  private cluesSignal = signal<Clue[]>([]);

  readonly clues = this.cluesSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getClues(): Observable<{ clues: Clue[] }> {
    return this.http
      .get<{ clues: Clue[] }>(this.apiUrl)
      .pipe(tap((response) => this.cluesSignal.set(response.clues)));
  }

  getClueById(id: string): Observable<Clue> {
    return this.http.get<Clue>(`${this.apiUrl}/${id}`);
  }
}
