import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { Transaction } from '../../core/models/transaction.model';
import { Category } from '../../core/models/category.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-transactions',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './transactions.component.html',
    styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
    transactions: Transaction[] = [];
    categories: Category[] = [];
    loading = true;
    showForm = false;
    submitting = false;
    error = '';
    user: { name: string; email: string } | null = null;

    form: FormGroup;

    currentMonth = new Date().getMonth() + 1;
    currentYear = new Date().getFullYear();
    months = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    constructor(
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.user = this.authService.getUser();
        this.form = this.fb.group({
            description: ['', [Validators.required, Validators.minLength(2)]],
            amount: ['', [Validators.required, Validators.min(0.01)]],
            type: ['EXPENSE', Validators.required],
            transactionDate: [new Date().toISOString().split('T')[0], Validators.required],
            categoryId: [''],
            isRecurring: [false],
            paymentMethod: [''],
            installmentTotal: ['']
        });
    }

    ngOnInit(): void {
        this.loadTransactions();
        this.loadCategories();
    }

    loadTransactions(): void {
        this.transactionService.findByPeriod(this.currentMonth, this.currentYear)
            .subscribe({
                next: (data) => { this.transactions = data; this.loading = false; },
                error: () => this.loading = false
            });
    }

    prevMonth(): void {
        if (this.currentMonth > 1) this.currentMonth--;
        else { this.currentMonth = 12; this.currentYear--; }
        this.loadTransactions();
    }

    nextMonth(): void {
        if (this.currentMonth < 12) this.currentMonth++;
        else { this.currentMonth = 1; this.currentYear++; }
        this.loadTransactions();
    }

    loadCategories(): void {
        this.categoryService.findAll().subscribe({
            next: (data) => this.categories = data,
            error: () => { }
        });
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.submitting = true;
        this.error = '';

        const value = this.form.value;
        this.transactionService.create({
            description: value.description,
            amount: parseFloat(value.amount),
            type: value.type,
            transactionDate: value.transactionDate,
            categoryId: value.categoryId || undefined,
            isRecurring: value.isRecurring,
            paymentMethod: value.paymentMethod || undefined,
            installmentTotal: value.installmentTotal ? parseInt(value.installmentTotal) : undefined,
        }).subscribe({
            next: () => {
                this.form.reset({
                    type: 'EXPENSE',
                    transactionDate: new Date().toISOString().split('T')[0],
                    isRecurring: false
                });
                this.showForm = false;
                this.submitting = false;
                this.loadTransactions();
            },
            error: (err) => {
                this.error = err.error?.message || 'Erro ao salvar transacao';
                this.submitting = false;
            }
        });
    }

    delete(id: string): void {
        if (!confirm('Excluir esta transação?')) return;
        this.transactionService.delete(id).subscribe({
            next: () => this.loadTransactions(),
            error: () => { }
        });
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    getMonthName(): string {
        return new Date(this.currentYear, this.currentMonth - 1)
            .toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}