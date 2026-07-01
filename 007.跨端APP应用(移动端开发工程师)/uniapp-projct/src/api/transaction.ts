import { get, post, patch, del } from '@/utils/api';
import type { Transaction, PagedResponse } from '@/types';

/**
 * 获取交易列表
 */
export function getTransactions(params: {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<{ data: PagedResponse<Transaction> }> {
  return get('/transactions', params);
}

/**
 * 获取单个交易
 */
export function getTransaction(id: number): Promise<{ data: Transaction }> {
  return get(`/transactions/${id}`);
}

/**
 * 创建交易
 */
export function createTransaction(data: Partial<Transaction>): Promise<{ data: Transaction }> {
  return post('/transactions', data);
}

/**
 * 更新交易
 */
export function updateTransaction(id: number, data: Partial<Transaction>): Promise<{ data: Transaction }> {
  return patch(`/transactions/${id}`, data);
}

/**
 * 删除交易
 */
export function deleteTransaction(id: number): Promise<any> {
  return del(`/transactions/${id}`);
}

/**
 * 获取本月统计
 */
export function getMonthlyStats(): Promise<{
  data: {
    totalExpense: number;
    totalIncome: number;
    previousExpense: number;
    previousIncome: number;
  };
}> {
  return get('/transactions/monthly-stats');
}

/**
 * 获取最近交易
 */
export function getRecentTransactions(limit: number = 3): Promise<{ data: Transaction[] }> {
  return get('/transactions/recent', { limit });
}
