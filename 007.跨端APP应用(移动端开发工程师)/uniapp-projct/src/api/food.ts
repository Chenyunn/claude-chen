import { get } from '@/utils/api';
import type { Transaction, FoodCategoryStats } from '@/types';

/**
 * 获取餐饮统计
 */
export function getFoodStats(): Promise<{
  data: {
    totalAmount: number;
    totalCount: number;
    averageAmount: number;
    previousAmount: number;
    categoryStats: FoodCategoryStats[];
  };
}> {
  return get('/food/stats');
}

/**
 * 获取餐饮交易列表
 */
export function getFoodTransactions(params: {
  page?: number;
  pageSize?: number;
  subCategory?: string;
  orderBy?: 'date' | 'amount';
  orderDirection?: 'asc' | 'desc';
}): Promise<{ data: { transactions: Transaction[]; hasMore: boolean } }> {
  return get('/food/transactions', params);
}
