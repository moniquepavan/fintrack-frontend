import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { CardService } from '../../core/services/card.service';
import { AuthService } from '../../core/services/auth.service';
import { Transaction } from '../../core/models/transaction.model';
import { Category } from '../../core/models/category.model';
import { PaymentMethod } from '../../core/models/payment-method.model';
import { Card } from '../../core/models/card.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  categories: Category[] = [];
  paymentMethods: PaymentMethod[] = [];
  cards: Card[] = [];
  loading = true;
  user: { name: string; email: string } | null = null;

  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  filterCategoryId = '';
  filterPaymentMethod = '';
  filterCardId = '';

  months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
            'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  monthsShort = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  years = [2023, 2024, 2025, 2026, 2027];

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private paymentMethodService: PaymentMethodService,
    private cardService: CardService,
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.load();
    this.categoryService.findAll().subscribe({ next: d => this.categories = d, error: () => {} });
    this.paymentMethodService.findAll().subscribe({ next: d => this.paymentMethods = d, error: () => {} });
    this.cardService.findAll().subscribe({ next: d => this.cards = d, error: () => {} });
  }

  load(): void {
    this.loading = true;
    this.transactionService.findByPeriod(this.currentMonth, this.currentYear).subscribe({
      next: (data) => { this.transactions = data; this.loading = false; },
      error: () => this.loading = false
    });
  }

  get displayed(): Transaction[] {
    return this.transactions.filter(tx => {
      if (this.filterCategoryId && tx.categoryId !== this.filterCategoryId) return false;
      if (this.filterPaymentMethod && tx.paymentMethod !== this.filterPaymentMethod) return false;
      if (this.filterCardId && tx.cardId !== this.filterCardId) return false;
      return true;
    });
  }

  get recent(): Transaction[] {
    return this.displayed.slice(0, 5);
  }

  get totalIncome(): number {
    return this.displayed.filter(t => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0);
  }

  get totalExpense(): number {
    return this.displayed.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0);
  }

  get balance(): number {
    return this.totalIncome - this.totalExpense;
  }

  get hasActiveFilters(): boolean {
    return !!(this.filterCategoryId || this.filterPaymentMethod || this.filterCardId);
  }

  clearFilters(): void {
    this.filterCategoryId = '';
    this.filterPaymentMethod = '';
    this.filterCardId = '';
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
