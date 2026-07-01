import { get, post, patch, del } from '@/utils/api';
import type { Category } from '@/types';

/**
 * 获取分类列表
 */
export function getCategories(type?: 'expense' | 'income'): Promise<{ data: Category[] }> {
  return get('/categories', type ? { type } : undefined);
}

/**
 * 创建分类
 */
export function createCategory(data: Partial<Category>): Promise<{ data: Category }> {
  return post('/categories', data);
}

/**
 * 更新分类
 */
export function updateCategory(id: number, data: Partial<Category>): Promise<{ data: Category }> {
  return patch(`/categories/${id}`, data);
}

/**
 * 删除分类
 */
export function deleteCategory(id: number): Promise<any> {
  return del(`/categories/${id}`);
}
