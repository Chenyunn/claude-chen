/**
 * 用户信息
 */
export interface User {
  id: number;
  username: string;
  nickname?: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 分类
 */
export interface Category {
  id: number;
  name: string;
  icon: string;
  code?: string;
  type: 'expense' | 'income';
  isSystem: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 支付账户
 */
export interface Account {
  id: number;
  name: string;
  icon: string;
  userId: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 交易记录
 */
export interface Transaction {
  id: number;
  userId: number;
  categoryId: number;
  accountId: number;
  amount: number;
  type: 'expense' | 'income';
  note?: string;
  date: string;
  subCategory?: string;
  category?: Category;
  account?: Account;
  createdAt: string;
  updatedAt: string;
}

/**
 * 统计数据
 */
export interface StatisticsSummary {
  totalExpense: number;
  totalIncome: number;
  topCategory: {
    name: string;
    amount: number;
    percentage: number;
  } | null;
}

/**
 * 趋势数据点
 */
export interface TrendPoint {
  date: string;
  expense: number;
  budget?: number;
}

/**
 * 分类占比
 */
export interface CategoryShare {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
}

/**
 * 餐饮分类统计
 */
export interface FoodCategoryStats {
  subCategory: string;
  amount: number;
  count: number;
  percentage: number;
}

/**
 * API 分页响应
 */
export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
