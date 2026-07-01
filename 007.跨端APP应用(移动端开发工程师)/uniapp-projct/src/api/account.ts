import { get, post, patch, del } from '@/utils/api';
import type { Account } from '@/types';

/**
 * 获取账户列表
 */
export function getAccounts(): Promise<{ data: Account[] }> {
  return get('/accounts');
}

/**
 * 创建账户
 */
export function createAccount(data: Partial<Account>): Promise<{ data: Account }> {
  return post('/accounts', data);
}

/**
 * 更新账户
 */
export function updateAccount(id: number, data: Partial<Account>): Promise<{ data: Account }> {
  return patch(`/accounts/${id}`, data);
}

/**
 * 删除账户
 */
export function deleteAccount(id: number): Promise<any> {
  return del(`/accounts/${id}`);
}

/**
 * 设置默认账户
 */
export function setDefaultAccount(id: number): Promise<any> {
  return patch(`/accounts/${id}/default`);
}
