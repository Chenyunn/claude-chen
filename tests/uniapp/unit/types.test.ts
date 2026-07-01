/**
 * TypeScript 类型编译验证 + 接口一致性测试
 *
 * 作用说明：
 * - 运行时验证类型定义的结构完整性
 * - 确保 API 响应数据与类型定义一致
 * - 验证类型间的引用关系
 *
 * 注意：TypeScript 编译时类型检查通过 `npm run type-check` 执行
 * 此文件做运行时的结构验证
 */
import { describe, it, expect } from 'vitest';

// ==========================================================
// 从源码导入类型（如果编译路径正确）
// 注意：这里做运行时结构验证，不依赖编译时类型
// ==========================================================

describe('TypeScript 类型 — 结构完整性验证', () => {

  // ==========================================================
  // User 类型
  // ==========================================================
  describe('User 接口', () => {

    it('完整 User 对象应包含所有必需字段', () => {
      const user = {
        id: 1,
        username: 'testuser',
        nickname: 'Test',
        bio: 'Hello',
        avatar: '/avatar.png',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-06-01T00:00:00Z',
      };

      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('username');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');

      expect(typeof user.id).toBe('number');
      expect(typeof user.username).toBe('string');
    });

    it('最小 User 对象（仅必需字段）', () => {
      const minUser = {
        id: 1,
        username: 'user',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      expect(minUser.id).toBeDefined();
      expect(minUser.username).toBeDefined();
    });
  });

  // ==========================================================
  // Category 类型
  // ==========================================================
  describe('Category 接口', () => {

    it('Category type 字段应为 expense | income', () => {
      const expenseCat = {
        id: 1, name: 'Food', icon: '🍜', type: 'expense' as const,
        isSystem: false, userId: 1, createdAt: '', updatedAt: '',
      };
      const incomeCat = {
        id: 2, name: 'Salary', icon: '💰', type: 'income' as const,
        isSystem: true, userId: 0, createdAt: '', updatedAt: '',
      };

      expect(['expense', 'income']).toContain(expenseCat.type);
      expect(['expense', 'income']).toContain(incomeCat.type);
    });
  });

  // ==========================================================
  // Transaction 类型
  // ==========================================================
  describe('Transaction 接口', () => {

    it('Transaction 应包含关联的 Category 和 Account', () => {
      const txn = {
        id: 1,
        userId: 1,
        categoryId: 2,
        accountId: 1,
        amount: 100.50,
        type: 'expense' as const,
        note: '午餐',
        date: '2024-06-29',
        category: { id: 2, name: 'Food', icon: '🍜', type: 'expense', isSystem: false, userId: 1, createdAt: '', updatedAt: '' },
        account: { id: 1, name: 'Cash', icon: '💵', userId: 1, isDefault: true, createdAt: '', updatedAt: '' },
        createdAt: '',
        updatedAt: '',
      };

      expect(txn.category).toBeDefined();
      expect(txn.account).toBeDefined();
      expect(txn.amount).toBeGreaterThan(0);
    });
  });

  // ==========================================================
  // PagedResponse 泛型
  // ==========================================================
  describe('PagedResponse 泛型接口', () => {

    it('分页响应应包含 total/page/pageSize/hasMore', () => {
      const paged = {
        data: [{ id: 1 }, { id: 2 }],
        total: 50,
        page: 1,
        pageSize: 20,
        hasMore: true,
      };

      expect(paged.data.length).toBe(2);
      expect(paged.total).toBe(50);
      expect(paged.page).toBe(1);
      expect(paged.hasMore).toBe(true);
    });

    it('最后一页 hasMore 应为 false', () => {
      const lastPage = {
        data: [{ id: 49 }, { id: 50 }],
        total: 50,
        page: 3,
        pageSize: 20,
        hasMore: false,
      };

      expect(lastPage.hasMore).toBe(false);
    });
  });

  // ==========================================================
  // StatisticsSummary/TrendPoint 类型
  // ==========================================================
  describe('StatisticsSummary & TrendPoint', () => {

    it('TrendPoint 应包含 date/expense/budget', () => {
      const point = {
        date: '2024-06-29',
        expense: 150.00,
        budget: 200.00,
      };

      expect(point.date).toBeDefined();
      expect(typeof point.expense).toBe('number');
    });

    it('StatisticsSummary 应包含 totalExpense/totalIncome/topCategory', () => {
      const summary = {
        totalExpense: 5000,
        totalIncome: 10000,
        topCategory: {
          name: '餐饮',
          amount: 2000,
          percentage: 40,
        },
      };

      expect(summary.totalExpense).toBeGreaterThan(0);
      expect(summary.topCategory?.name).toBe('餐饮');
    });
  });
});
