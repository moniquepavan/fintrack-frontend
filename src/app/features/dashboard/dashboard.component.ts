import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardData, Transaction } from '../../core/models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  dashboard: DashboardData | null = null;
  transactions: Transaction[] = [];
  loading = true;
  user: { name: string; email: string } | null = null;

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  months = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho',
            'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  monthsShort = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  years = [2023, 2024, 2025, 2026, 2027];

  constructor(
    private transactionService: TransactionService,
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.transactionService.getDashboard(this.currentMonth, this.currentYear)
      .subscribe({ next: (data) => this.dashboard = data });

    this.transactionService.findByPeriod(this.currentMonth, this.currentYear)
      .subscribe({
        next: (data) => { this.transactions = data.slice(0, 5); this.loading = false; },
        error: () => this.loading = false
      });
  }

  prevMonth(): void {
    if (this.currentMonth > 1) this.currentMonth--;
    else { this.currentMonth = 12; this.currentYear--; }
    this.load();
  }

  nextMonth(): void {
    if (this.currentMonth < 12) this.currentMonth++;
    else { this.currentMonth = 1; this.currentYear++; }
    this.load();
  }

  selectMonth(month: number): void {
    this.currentMonth = month;
    this.load();
  }

  selectYear(year: number): void {
    this.currentYear = year;
    this.load();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}