import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { TransactionService } from '../../core/services/transaction.service';
import { CategoryService } from '../../core/services/category.service';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { CardService } from '../../core/services/card.service';
import { Transaction } from '../../core/models/transaction.model';
import { Category } from '../../core/models/category.model';
import { PaymentMethod } from '../../core/models/payment-method.model';
import { Card } from '../../core/models/card.model';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-transactions',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
    templateUrl: './transactions.component.html',
    styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
    transactions: Transaction[] = [];
    categories: Category[] = [];
    paymentMethods: PaymentMethod[] = [];
    cards: Card[] = [];
    loading = true;
    showForm = false;
    submitting = false;
    error = '';
    user: { name: string; email: string } | null = null;

    form: FormGroup;
    editingId: string | null = null;
    editingInstallmentGroupId: string | null = null;
    updateFollowing = false;

    amountDisplay = '';

    categorySearch = '';
    selectedCategory: Category | null = null;
    showCategoryDropdown = false;
    showCreateCategory = false;
    newCategoryColor = '#6366f1';
    creatingCategory = false;
    categoryHighlightedIndex = -1;

    readonly presetColors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
        '#f97316', '#eab308', '#22c55e', '#14b8a6',
        '#3b82f6', '#64748b'
    ];

    // Filtro de período
    filterMode: 'month' | 'period' = 'month';
    currentMonth = new Date().getMonth() + 1;
    currentYear = new Date().getFullYear();
    periodStart = '';
    periodEnd = '';

    // Filtros adicionais
    filterCategoryId = '';
    filterPaymentMethod = '';
    filterCardId = '';

    months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

    constructor(
        private transactionService: TransactionService,
        private categoryService: CategoryService,
        private paymentMethodService: PaymentMethodService,
        private cardService: CardService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.user = this.authService.getUser();
        this.form = this.fb.group({
            description: ['', [Validators.required, Validators.minLength(2)]],
            amount: ['', [Validators.required]],
            type: ['EXPENSE', Validators.required],
            transactionDate: [this.todayLocal(), Validators.required],
            isRecurring: [false],
            paymentMethod: [''],
            cardId: [''],
            installmentTotal: ['']
        });
    }

    ngOnInit(): void {
        this.loadTransactions();
        this.loadCategories();
        this.loadPaymentMethods();
        this.loadCards();
    }

    private todayLocal(): string {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    private defaultDateForContext(): string {
        if (this.filterMode === 'period') {
            return this.periodStart || this.todayLocal();
        }
        const today = new Date();
        const isCurrentMonth = this.currentMonth === today.getMonth() + 1
            && this.currentYear === today.getFullYear();
        if (isCurrentMonth) return this.todayLocal();
        return `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-01`;
    }

    loadTransactions(): void {
        this.loading = true;
        if (this.filterMode === 'month') {
            this.transactionService.findByPeriod(this.currentMonth, this.currentYear)
                .subscribe({
                    next: (data) => { this.transactions = data; this.loading = false; },
                    error: () => this.loading = false
                });
        } else {
            this.transactionService.findWithFilters({
                startDate: this.periodStart || undefined,
                endDate: this.periodEnd || undefined
            }).subscribe({
                next: (data) => { this.transactions = data; this.loading = false; },
                error: () => this.loading = false
            });
        }
    }

    loadCategories(): void {
        this.categoryService.findAll().subscribe({
            next: (data) => this.categories = data,
            error: () => { }
        });
    }

    loadPaymentMethods(): void {
        this.paymentMethodService.findAll().subscribe({
            next: (data) => this.paymentMethods = data,
            error: () => { }
        });
    }

    loadCards(): void {
        this.cardService.findAll().subscribe({
            next: (data) => this.cards = data,
            error: () => { }
        });
    }

    // Navegação por mês
    prevMonth(): void {
        if (this.currentMonth > 1) this.currentMonth--;
        else { this.currentMonth = 12; this.currentYear--; }
        this.loadTransactions();
        this.updateFormDateIfNew();
    }

    nextMonth(): void {
        if (this.currentMonth < 12) this.currentMonth++;
        else { this.currentMonth = 1; this.currentYear++; }
        this.loadTransactions();
        this.updateFormDateIfNew();
    }

    private updateFormDateIfNew(): void {
        if (this.showForm && !this.editingId) {
            this.form.patchValue({ transactionDate: this.defaultDateForContext() });
        }
    }

    setFilterMode(mode: 'month' | 'period'): void {
        this.filterMode = mode;
        if (mode === 'period') {
            const today = this.todayLocal();
            const firstDay = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-01`;
            this.periodStart = firstDay;
            this.periodEnd = today;
        }
        this.loadTransactions();
    }

    applyPeriodFilter(): void {
        this.loadTransactions();
    }

    // Formulário
    toggleForm(): void {
        this.showForm = !this.showForm;
        if (!this.showForm) {
            this.resetForm();
        } else {
            this.form.patchValue({ transactionDate: this.defaultDateForContext() });
        }
    }

    editTransaction(tx: Transaction): void {
        this.editingId = tx.id;
        this.editingInstallmentGroupId = tx.installmentGroupId || null;
        this.updateFollowing = false;
        this.showForm = true;

        this.selectedCategory = this.categories.find(c => c.id === tx.categoryId) || null;
        this.categorySearch = this.selectedCategory?.name || '';

        const formatted = tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        this.amountDisplay = formatted;

        this.form.patchValue({
            description: tx.description,
            amount: formatted,
            type: tx.type,
            transactionDate: tx.transactionDate.split('T')[0],
            isRecurring: tx.recurring,
            paymentMethod: tx.paymentMethod || '',
            cardId: tx.cardId || '',
            installmentTotal: tx.installmentTotal?.toString() || ''
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Valor monetário
    onAmountInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/[^\d,]/g, '');
        const parts = value.split(',');
        if (parts.length > 2) value = parts[0] + ',' + parts.slice(1).join('');
        if (parts[1]?.length > 2) value = parts[0] + ',' + parts[1].slice(0, 2);
        input.value = value;
        this.amountDisplay = value;
        this.form.get('amount')?.setValue(value, { emitEvent: false });
    }

    onAmountBlur(): void {
        if (!this.amountDisplay) return;
        let value = this.amountDisplay;
        if (!value.includes(',')) {
            value = value + ',00';
        } else {
            const parts = value.split(',');
            if (!parts[1]) value = parts[0] + ',00';
            else if (parts[1].length === 1) value = parts[0] + ',' + parts[1] + '0';
        }
        this.amountDisplay = value;
        this.form.get('amount')?.setValue(value, { emitEvent: false });
    }

    // Combobox de categoria
    get displayedTransactions(): Transaction[] {
        return this.transactions.filter(tx => {
            if (this.filterCategoryId && tx.categoryId !== this.filterCategoryId) return false;
            if (this.filterPaymentMethod && tx.paymentMethod !== this.filterPaymentMethod) return false;
            if (this.filterCardId && tx.cardId !== this.filterCardId) return false;
            return true;
        });
    }

    get hasActiveFilters(): boolean {
        return !!(this.filterCategoryId || this.filterPaymentMethod || this.filterCardId);
    }

    get totalIncome(): number {
        return this.displayedTransactions
            .filter(t => t.type === 'INCOME')
            .reduce((s, t) => s + t.amount, 0);
    }

    get totalExpense(): number {
        return this.displayedTransactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((s, t) => s + t.amount, 0);
    }

    get balance(): number {
        return this.totalIncome - this.totalExpense;
    }

    clearFilters(): void {
        this.filterCategoryId = '';
        this.filterPaymentMethod = '';
        this.filterCardId = '';
    }

    get filteredCategories(): Category[] {
        if (!this.categorySearch.trim()) return this.categories;
        return this.categories.filter(c =>
            c.name.toLowerCase().includes(this.categorySearch.toLowerCase())
        );
    }

    get showCreateOption(): boolean {
        const search = this.categorySearch.trim();
        if (!search) return false;
        return !this.categories.some(c => c.name.toLowerCase() === search.toLowerCase());
    }

    onCategorySearch(): void {
        this.selectedCategory = null;
        this.showCategoryDropdown = true;
        this.showCreateCategory = false;
        this.categoryHighlightedIndex = -1;
    }

    onCategoryKeydown(event: KeyboardEvent): void {
        if (this.showCreateCategory) return;

        // index 0 = "Sem categoria", 1..n = categorias, n+1 = "+ Criar" (se existir)
        const total = 1 + this.filteredCategories.length + (this.showCreateOption ? 1 : 0);

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.showCategoryDropdown = true;
                this.categoryHighlightedIndex = Math.min(this.categoryHighlightedIndex + 1, total - 1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.categoryHighlightedIndex = Math.max(this.categoryHighlightedIndex - 1, 0);
                break;
            case 'Enter':
                event.preventDefault();
                if (!this.showCategoryDropdown) { this.showCategoryDropdown = true; return; }
                if (this.categoryHighlightedIndex === 0) {
                    this.clearCategory();
                } else if (this.categoryHighlightedIndex >= 1 && this.categoryHighlightedIndex <= this.filteredCategories.length) {
                    this.selectCategory(this.filteredCategories[this.categoryHighlightedIndex - 1]);
                } else if (this.showCreateOption) {
                    this.startCreateCategory();
                }
                break;
            case 'Escape':
                this.showCategoryDropdown = false;
                this.categoryHighlightedIndex = -1;
                break;
        }
    }

    selectCategory(cat: Category): void {
        this.selectedCategory = cat;
        this.categorySearch = cat.name;
        this.showCategoryDropdown = false;
        this.showCreateCategory = false;
        this.categoryHighlightedIndex = -1;
    }

    clearCategory(): void {
        this.selectedCategory = null;
        this.categorySearch = '';
        this.showCategoryDropdown = false;
        this.showCreateCategory = false;
        this.categoryHighlightedIndex = -1;
    }

    onCategoryBlur(): void {
        setTimeout(() => {
            this.showCategoryDropdown = false;
            if (!this.selectedCategory && !this.showCreateCategory) this.categorySearch = '';
        }, 200);
    }

    startCreateCategory(): void {
        this.showCreateCategory = true;
        this.showCategoryDropdown = false;
        this.newCategoryColor = this.presetColors[0];
    }

    confirmCreateCategory(): void {
        const name = this.categorySearch.trim();
        if (!name || this.creatingCategory) return;
        this.creatingCategory = true;
        this.categoryService.create({ name, color: this.newCategoryColor, icon: 'tag' }).subscribe({
            next: (cat) => {
                this.categories = [...this.categories, cat];
                this.selectCategory(cat);
                this.showCreateCategory = false;
                this.creatingCategory = false;
            },
            error: () => this.creatingCategory = false
        });
    }

    cancelCreateCategory(): void {
        this.showCreateCategory = false;
        this.categorySearch = '';
        this.selectedCategory = null;
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.submitting = true;
        this.error = '';

        const amountValue = parseFloat(this.amountDisplay.replace(',', '.'));
        if (isNaN(amountValue) || amountValue <= 0) {
            this.error = 'Informe um valor válido';
            this.submitting = false;
            return;
        }

        const value = this.form.value;
        const payload = {
            description: value.description,
            amount: amountValue,
            type: value.type,
            transactionDate: value.transactionDate,
            categoryId: this.selectedCategory?.id || undefined,
            cardId: value.cardId || undefined,
            isRecurring: value.isRecurring,
            updateFollowing: this.updateFollowing,
            paymentMethod: value.paymentMethod || undefined,
            installmentTotal: value.installmentTotal ? parseInt(value.installmentTotal) : undefined,
        };

        const request$: Observable<unknown> = this.editingId
            ? this.transactionService.update(this.editingId, payload)
            : this.transactionService.create(payload);

        request$.subscribe({
            next: () => {
                this.resetForm();
                this.showForm = false;
                this.submitting = false;
                this.loadTransactions();
            },
            error: (err: { error?: { message?: string } }) => {
                this.error = err.error?.message || 'Erro ao salvar transacao';
                this.submitting = false;
            }
        });
    }

    private resetForm(): void {
        this.form.reset({
            type: 'EXPENSE',
            transactionDate: this.defaultDateForContext(),
            isRecurring: false,
            paymentMethod: '',
            cardId: ''
        });
        this.amountDisplay = '';
        this.selectedCategory = null;
        this.categorySearch = '';
        this.editingId = null;
        this.editingInstallmentGroupId = null;
        this.updateFollowing = false;
        this.showCreateCategory = false;
        this.error = '';
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

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
