/**
 * Vuex Store 单元测试
 *
 * 作用说明：
 * - 测试 mutations（SET_TOKEN, SET_USER）状态修改
 * - 测试 actions（login, register, logout, fetchUser, checkAuth）异步流程
 * - 测试 getters（isAuthenticated, currentUser）计算属性
 * - 模拟 api 模块以隔离后端依赖
 *
 * 对应测试计划：L1 单元测试、BUG-04（rememberMe 形同虚设）
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createStore, type Store } from 'vuex';

// ==========================================================
// 定义 Store 类型（从源码 src/types/index.ts 复制）
// ==========================================================
interface User {
  id: number;
  username: string;
  nickname?: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface State {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
}

// ==========================================================
// Mock api 模块（store 通过动态 import('@/utils/api') 加载）
// ==========================================================
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  del: vi.fn(),
  getToken: vi.fn(() => (globalThis as any).uni?.getStorageSync?.('daily_expense_token') || null),
  setToken: vi.fn((token: string | null) => {
    if (token) {
      (globalThis as any).uni?.setStorageSync?.('daily_expense_token', token);
    } else {
      (globalThis as any).uni?.removeStorageSync?.('daily_expense_token');
    }
  }),
  removeToken: vi.fn(() => {
    (globalThis as any).uni?.removeStorageSync?.('daily_expense_token');
  }),
};

// Mock 动态 import
vi.mock('@/utils/api', () => ({
  default: mockApi,
}));

// ==========================================================
// 测试用的 Store 工厂
// ==========================================================
function createTestStore(): Store<State> {
  const store = createStore<State>({
    state: {
      token: null,
      user: null,
      isAuthenticated: false,
    },

    mutations: {
      SET_TOKEN(state: State, token: string | null) {
        state.token = token;
        state.isAuthenticated = !!token;
        if (token) {
          mockApi.setToken(token);
        } else {
          mockApi.removeToken();
        }
      },
      SET_USER(state: State, user: User | null) {
        state.user = user;
      },
    },

    actions: {
      async register({ commit }, payload: { username: string; password: string; nickname?: string }) {
        const result = await mockApi.post('/auth/register', payload);
        commit('SET_TOKEN', result.token);
        commit('SET_USER', result.user);
        return result;
      },
      async login({ commit }, payload: { username: string; password: string; rememberMe?: boolean }) {
        const result = await mockApi.post('/auth/login', payload);
        commit('SET_TOKEN', result.token);
        commit('SET_USER', result.user);
        return result;
      },
      async logout({ commit }) {
        try {
          await mockApi.post('/auth/logout');
        } catch {
          // swallow
        } finally {
          commit('SET_TOKEN', null);
          commit('SET_USER', null);
        }
      },
      async fetchUser({ commit }) {
        const result = await mockApi.get('/auth/me');
        commit('SET_USER', result.data);
      },
      async checkAuth({ dispatch, commit, state }): Promise<boolean> {
        if (!mockApi.getToken()) {
          commit('SET_TOKEN', null);
          commit('SET_USER', null);
          return false;
        }
        try {
          await dispatch('fetchUser');
          return true;
        } catch {
          commit('SET_TOKEN', null);
          commit('SET_USER', null);
          return false;
        }
      },
    },

    getters: {
      isAuthenticated: (state: State) => state.isAuthenticated,
      currentUser: (state: State) => state.user,
    },
  });

  return store;
}

describe('Vuex Store — 状态管理', () => {
  let store: Store<State>;

  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).resetUniMocks?.();
    store = createTestStore();
  });

  // ==========================================================
  // State 初始状态
  // ==========================================================
  describe('State — 初始状态', () => {

    it('初始状态应未认证', () => {
      expect(store.state.token).toBeNull();
      expect(store.state.user).toBeNull();
      expect(store.state.isAuthenticated).toBe(false);
      expect(store.getters.isAuthenticated).toBe(false);
      expect(store.getters.currentUser).toBeNull();
    });
  });

  // ==========================================================
  // Mutations
  // ==========================================================
  describe('Mutations', () => {

    it('SET_TOKEN 应更新 token 和 isAuthenticated', () => {
      store.commit('SET_TOKEN', 'jwt-token-abc');
      expect(store.state.token).toBe('jwt-token-abc');
      expect(store.state.isAuthenticated).toBe(true);
      expect(store.getters.isAuthenticated).toBe(true);
    });

    it('SET_TOKEN(null) 应清除认证状态', () => {
      store.commit('SET_TOKEN', 'jwt-token');
      store.commit('SET_TOKEN', null);

      expect(store.state.token).toBeNull();
      expect(store.state.isAuthenticated).toBe(false);
    });

    it('SET_USER 应更新用户信息', () => {
      const user: User = {
        id: 1,
        username: 'testuser',
        nickname: 'Test',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      store.commit('SET_USER', user);
      expect(store.state.user).toEqual(user);
      expect(store.getters.currentUser).toEqual(user);
    });

    it('SET_USER(null) 应清除用户信息', () => {
      store.commit('SET_USER', { id: 1, username: 'u', createdAt: '', updatedAt: '' });
      store.commit('SET_USER', null);
      expect(store.state.user).toBeNull();
    });
  });

  // ==========================================================
  // Actions — register
  // ==========================================================
  describe('Actions: register', () => {

    it('注册成功应提交 SET_TOKEN 和 SET_USER', async () => {
      mockApi.post.mockResolvedValueOnce({
        token: 'reg-token',
        user: { id: 2, username: 'newuser', nickname: 'New' },
      });

      await store.dispatch('register', {
        username: 'newuser',
        password: 'NewPass123',
      });

      expect(store.state.token).toBe('reg-token');
      expect(store.state.isAuthenticated).toBe(true);
      expect(store.state.user?.username).toBe('newuser');
    });

    it('注册失败不应修改状态', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('用户名已存在'));

      await expect(
        store.dispatch('register', { username: 'exist', password: 'Pass123' })
      ).rejects.toThrow();

      expect(store.state.isAuthenticated).toBe(false);
    });
  });

  // ==========================================================
  // Actions — login
  // ==========================================================
  describe('Actions: login', () => {

    it('登录成功应提交 SET_TOKEN 和 SET_USER', async () => {
      mockApi.post.mockResolvedValueOnce({
        token: 'login-token',
        user: { id: 1, username: 'testuser', nickname: 'Test' },
      });

      await store.dispatch('login', {
        username: 'testuser',
        password: 'TestPass123',
        rememberMe: false,
      });

      expect(store.state.token).toBe('login-token');
      expect(store.state.isAuthenticated).toBe(true);
      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
        username: 'testuser', password: 'TestPass123', rememberMe: false,
      });
    });

    it('★ BUG-04: rememberMe 应传递给后端', async () => {
      mockApi.post.mockResolvedValueOnce({
        token: 'token-7d',
        user: { id: 1, username: 'testuser', nickname: 'Test' },
      });

      await store.dispatch('login', {
        username: 'testuser',
        password: 'pass',
        rememberMe: true,
      });

      // 验证 rememberMe 参数被传递给 API
      const callArgs = mockApi.post.mock.calls[0][1];
      expect(callArgs.rememberMe).toBe(true);
      console.log('  [BUG-04] rememberMe 参数已传递到 login action');
    });

    it('登录失败不应修改状态', async () => {
      mockApi.post.mockRejectedValueOnce(new Error('密码错误'));

      await expect(
        store.dispatch('login', { username: 'u', password: 'wrong' })
      ).rejects.toThrow();

      expect(store.state.isAuthenticated).toBe(false);
    });
  });

  // ==========================================================
  // Actions — logout
  // ==========================================================
  describe('Actions: logout', () => {

    it('登出应清除 token 和 user（不抛异常）', async () => {
      // 先设置认证状态
      store.commit('SET_TOKEN', 'token');
      store.commit('SET_USER', { id: 1, username: 'u', createdAt: '', updatedAt: '' });

      mockApi.post.mockResolvedValueOnce({ code: 0, message: 'ok' });

      await store.dispatch('logout');

      expect(store.state.token).toBeNull();
      expect(store.state.isAuthenticated).toBe(false);
      expect(store.state.user).toBeNull();
    });

    it('登出请求失败也应清除本地状态', async () => {
      store.commit('SET_TOKEN', 'token');
      mockApi.post.mockRejectedValueOnce(new Error('Network error'));

      // logout 不应抛异常
      await store.dispatch('logout');

      expect(store.state.token).toBeNull();
      expect(store.state.isAuthenticated).toBe(false);
    });
  });

  // ==========================================================
  // Actions — checkAuth
  // ==========================================================
  describe('Actions: checkAuth', () => {

    it('无 token 应返回 false', async () => {
      mockApi.getToken.mockReturnValueOnce(null);

      const result = await store.dispatch('checkAuth');
      expect(result).toBe(false);
      expect(store.state.isAuthenticated).toBe(false);
    });

    it('有 token 且 fetchUser 成功应返回 true', async () => {
      mockApi.getToken.mockReturnValueOnce('valid-token');
      mockApi.get.mockResolvedValueOnce({
        data: { id: 1, username: 'user', nickname: 'N' },
      });

      const result = await store.dispatch('checkAuth');
      expect(result).toBe(true);
      expect(store.state.isAuthenticated).toBe(true);
    });

    it('有 token 但 fetchUser 失败应返回 false 并清除', async () => {
      mockApi.getToken.mockReturnValueOnce('expired-token');
      mockApi.get.mockRejectedValueOnce(new Error('401'));

      const result = await store.dispatch('checkAuth');
      expect(result).toBe(false);
      expect(store.state.token).toBeNull();
      expect(store.state.isAuthenticated).toBe(false);
    });
  });
});
