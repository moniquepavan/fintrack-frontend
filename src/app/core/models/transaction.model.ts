export type TransactionType = 'INCOME' | 'EXPENSE';
export type PaymentMethod = 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO' | 'TRANSFERENCIA';

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
  cardId?: string;
  cardName?: string;
  recurring: boolean;
  recurrenceRule?: string;
  paymentMethod?: string;
  installmentNumber?: number;
  installmentTotal?: number;
  installmentGroupId?: string;
}

export interface TransactionRequest {
  description: string;
  amount: number;
  type: TransactionType;
  transactionDate: string;
  categoryId?: string;
  cardId?: string;
  isRecurring: boolean;
  updateFollowing?: boolean;
  recurrenceRule?: string;
  paymentMethod?: string;
  installmentTotal?: number;
}

export interface TransactionFilter {
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: TransactionType;
  search?: string;
}

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  month: number;
  year: number;
}