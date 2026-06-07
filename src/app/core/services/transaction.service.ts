import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Transaction, TransactionRequest, TransactionFilter, DashboardData } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = '/api/transactions';

  constructor(private http: HttpClient) {}

  findAll(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.apiUrl);
  }

  findByPeriod(month: number, year: number): Observable<Transaction[]> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<Transaction[]>(`${this.apiUrl}/period`, { params });
  }

  findWithFilters(filter: TransactionFilter): Observable<Transaction[]> {
    let params = new HttpParams();
    if (filter.month) params = params.set('month', filter.month);
    if (filter.year) params = params.set('year', filter.year);
    if (filter.startDate) params = params.set('startDate', filter.startDate);
    if (filter.endDate) params = params.set('endDate', filter.endDate);
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId);
    if (filter.type) params = params.set('type', filter.type);
    if (filter.search) params = params.set('search', filter.search);
    return this.http.get<Transaction[]>(`${this.apiUrl}/filter`, { params });
  }

  getDashboard(month: number, year: number): Observable<DashboardData> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard`, { params });
  }

  create(request: TransactionRequest): Observable<Transaction[]> {
    return this.http.post<Transaction[]>(this.apiUrl, request);
  }

  update(id: string, request: TransactionRequest): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}