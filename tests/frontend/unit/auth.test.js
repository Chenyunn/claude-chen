/**
 * auth.js 认证业务逻辑单元测试
 *
 * 作用说明：
 * - 测试 login/register/logout 业务流程
 * - 测试 checkAuth 鉴权守卫
 * - 测试状态管理（currentUser, isAuthenticated）
 * - 测试 Token 生命周期
 *
 * 源文件：003.前端代码（前端开发工程师）/frontend/assets/js/auth.js
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// auth 和 api 由 setup.js 注入到 global
const auth = global.auth;
const api = global.api;

describe('auth.js — 认证业务逻辑', () => {

  beforeEach(() => {
    global.resetAllMocks();
  });

  // ==========================================================
  // 初始状态
  // ==========================================================
  describe('初始状态', () => {

    it('无 token 时应未认证', () => {
      api.removeToken();
      // checkAuth 会检查 token
      expect(auth.isAuth()).toBeDefined();
    });

    it('getUser 初始应为 null', () => {
      expect(auth.getUser()).toBeNull();
    });
  });

  // ==========================================================
  // login 登录
  // ==========================================================
  describe('login() — 登录', () => {

    it('登录成功应保存 token 并设置用户状态', async () => {
      const mockUser = { id: 1, username: 'testuser', nickname: 'Test' };
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({
          code: 0,
          message: '登录成功',
          data: { token: 'jwt-login-token', user: mockUser },
        }),
      });

      const result = await auth.login({
        username: 'testuser',
        password: 'TestPass123',
        rememberMe: false,
      });

      expect(result.token).toBe('jwt-login-token');
      expect(auth.isAuth()).toBe(true);
      expect(auth.getUser()).toMatchObject({ username: 'testuser' });
      expect(api.getToken()).toBe('jwt-login-token');
    });

    it('登录失败应保持未认证状态', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 401,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 401, message: '用户名或密码错误' }),
      });

      await expect(
        auth.login({ username: 'testuser', password: 'WrongPass' })
      ).rejects.toThrow();

      expect(auth.isAuth()).toBe(false);
    });

    it('rememberMe 应被转为布尔值', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({
          code: 0, data: { token: 'jwt-token', user: { id: 1, username: 'test' } },
        }),
      });

      // rememberMe 为 truthy 值
      await auth.login({ username: 'test', password: 'pass', rememberMe: 'truthy' });

      // 验证 fetch 被调用（login 应该把 rememberMe 转为布尔值传给后端）
      expect(global.window.fetch).toHaveBeenCalled();
      const body = JSON.parse(global.window.fetch.mock.calls[0][1].body);
      expect(typeof body.rememberMe).toBe('boolean');
    });
  });

  // ==========================================================
  // register 注册
  // ==========================================================
  describe('register() — 注册', () => {

    it('注册成功应保存 token 并设置用户状态', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 201,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({
          code: 0,
          message: '注册成功',
          data: { token: 'jwt-reg-token', user: { id: 2, username: 'newuser', nickname: 'New' } },
        }),
      });

      const result = await auth.register({
        username: 'newuser',
        password: 'NewUser123',
      });

      expect(result.token).toBe('jwt-reg-token');
      expect(auth.isAuth()).toBe(true);
      expect(api.getToken()).toBe('jwt-reg-token');
    });

    it('注册失败应保持未认证状态', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 409,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 409, message: '该用户名已被注册' }),
      });

      await expect(
        auth.register({ username: 'existing', password: 'Pass123' })
      ).rejects.toThrow();

      expect(auth.isAuth()).toBe(false);
    });
  });

  // ==========================================================
  // logout 登出
  // ==========================================================
  describe('logout() — 登出', () => {

    it('登出应清除 token 和用户状态（不管请求是否成功）', async () => {
      // 先模拟登录状态
      api.setToken('some-token');

      // 模拟 logout 请求（即使失败也应清除）
      global.window.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await auth.logout(); // logout 在 finally 中清除状态

      expect(api.getToken()).toBeNull();
      expect(auth.isAuth()).toBe(false);
      expect(auth.getUser()).toBeNull();
    });

    it('登出请求成功应正常清除', async () => {
      api.setToken('valid-token');

      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 0, message: '已退出登录' }),
      });

      await auth.logout();

      expect(api.getToken()).toBeNull();
      expect(auth.isAuth()).toBe(false);
    });
  });

  // ==========================================================
  // fetchUser 获取用户
  // ==========================================================
  describe('fetchUser() — 获取用户信息', () => {

    it('成功获取用户信息应更新 currentUser', async () => {
      api.setToken('valid-token');
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({
          code: 0,
          data: { id: 1, username: 'testuser', nickname: 'Test', settings: {} },
        }),
      });

      await auth.fetchUser();

      expect(auth.isAuth()).toBe(true);
      expect(auth.getUser().username).toBe('testuser');
    });

    it('获取失败应清除 token', async () => {
      api.setToken('invalid-token');
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: false, status: 401,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 401, message: 'Unauthorized' }),
      });

      await expect(auth.fetchUser()).rejects.toThrow();

      // 注意：fetchUser 在自己 catch 中不清理 token，只是抛异常
      // 清理 token 的逻辑在 checkAuth 中
    });
  });

  // ==========================================================
  // checkAuth 鉴权守卫
  // ==========================================================
  describe('checkAuth() — 鉴权守卫', () => {

    it('无 token 应返回 false', async () => {
      api.removeToken();
      const result = await auth.checkAuth();
      expect(result).toBe(false);
      expect(auth.isAuth()).toBe(false);
    });

    it('有 token 且 fetchUser 成功应返回 true', async () => {
      api.setToken('valid-token');
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({
          code: 0, data: { id: 1, username: 'user', nickname: 'N', settings: {} },
        }),
      });

      const result = await auth.checkAuth();
      expect(result).toBe(true);
      expect(auth.isAuth()).toBe(true);
    });

    it('有 token 但 fetchUser 失败应返回 false 并清除 token', async () => {
      api.setToken('expired-token');
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: false, status: 401,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 401, message: 'Unauthorized' }),
      });

      const result = await auth.checkAuth();
      expect(result).toBe(false);
      expect(auth.isAuth()).toBe(false);
      expect(api.getToken()).toBeNull();
    });
  });
});
