import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Clue, Symptom } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class ClueService {
  private readonly apiUrl = `${environment.apiUrl}/clues`;
  private readonly symptomUrl = `${environment.apiUrl}/symptoms`;

  // 使用 Signal 管理狀態
  private cluesSignal = signal<Clue[]>([]);
  private symptomsSignal = signal<Symptom[]>([]);

  readonly clues = this.cluesSignal.asReadonly();
  readonly symptoms = this.symptomsSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getClues(): Observable<{ clues: Clue[] }> {
    return this.http
      .get<{ clues: Clue[] }>(this.apiUrl)
      .pipe(tap((response) => this.cluesSignal.set(response.clues)));
  }

  getClueById(id: string): Observable<Clue> {
    return this.http.get<Clue>(`${this.apiUrl}/${id}`);
  }

  // Symptoms
  getSymptoms(): Observable<{ symptoms: Symptom[] }> {
    return this.http
      .get<{ symptoms: Symptom[] }>(this.symptomUrl)
      .pipe(tap((response) => this.symptomsSignal.set(response.symptoms)));
  }

  initSymptoms(): Observable<{ message: string; symptoms: Symptom[] }> {
    return this.http
      .post<{ message: string; symptoms: Symptom[] }>(`${this.symptomUrl}/init`, {}, { withCredentials: true })
      .pipe(tap((response) => this.symptomsSignal.set(response.symptoms)));
  }

  toggleSymptom(id: string, gender: 'BOY' | 'GIRL' | null): Observable<{ message: string; symptom: Symptom }> {
    return this.http.patch<{ message: string; symptom: Symptom }>(
      `${this.symptomUrl}/toggle/${id}`,
      { gender },
      { withCredentials: true },
    );
  }

  createSymptom(data: Partial<Symptom>): Observable<{ message: string; symptom: Symptom }> {
    return this.http.post<{ message: string; symptom: Symptom }>(
      this.symptomUrl,
      data,
      { withCredentials: true },
    );
  }

  deleteSymptom(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.symptomUrl}/${id}`,
      { withCredentials: true },
    );
  }

  clearAllSymptoms(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      this.symptomUrl,
      { withCredentials: true },
    );
  }
}
