export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  categoryId?: string;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  recurring: boolean;
  recurrenceRule?: string;
}

export interface TransactionRequest {
  description: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  categoryId?: string;
  isRecurring: boolean;
  recurrenceRule?: string;
}

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  month: number;
  year: number;
}