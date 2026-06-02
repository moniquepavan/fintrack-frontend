import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentMethod, PaymentMethodRequest } from '../models/payment-method.model';

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private apiUrl = '/api/payment-methods';

  constructor(private http: HttpClient) {}

  findAll(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(this.apiUrl);
  }

  create(request: PaymentMethodRequest): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(this.apiUrl, request);
  }

  update(id: string, request: PaymentMethodRequest): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
