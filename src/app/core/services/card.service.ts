import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Card, CardRequest } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private apiUrl = '/api/cards';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Card[]> {
    return this.http.get<Card[]>(this.apiUrl);
  }

  create(request: CardRequest): Observable<Card> {
    return this.http.post<Card>(this.apiUrl, request);
  }

  update(id: string, request: CardRequest): Observable<Card> {
    return this.http.put<Card>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
