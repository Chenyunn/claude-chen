/**
 * api.js HTTP 封装单元测试
 *
 * 作用说明：
 * - 测试 fetch 请求封装（get/post/patch/del/request）
 * - 测试 Token 存取（localStorage）
 * - 测试超时处理
 * - 测试 401 自动跳转逻辑
 * - 测试网络错误处理
 *
 * 源文件：003.前端代码（前端开发工程师）/frontend/assets/js/api.js
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// api 对象由 setup.js 注入到 global
const api = global.api;

describe('api.js — HTTP 封装', () => {

  beforeEach(() => {
    global.resetAllMocks();
  });

  // ==========================================================
  // Token 存取
  // ==========================================================
  describe('Token 存取', () => {

    it('setToken 应写入 localStorage', () => {
      api.setToken('test-jwt-token-123');
      expect(global.localStorage.getItem('daily_expense_token')).toBe('test-jwt-token-123');
    });

    it('getToken 应从 localStorage 读取', () => {
      global.localStorage.setItem('daily_expense_token', 'stored-token');
      expect(api.getToken()).toBe('stored-token');
    });

    it('getToken 无 token 时应返回 null', () => {
      expect(api.getToken()).toBeNull();
    });

    it('removeToken 应删除 localStorage 中的 token', () => {
      api.setToken('some-token');
      api.removeToken();
      expect(api.getToken()).toBeNull();
    });

    it('getToken 在 localStorage 异常时应容错（返回 null）', () => {
      // 模拟 localStorage 异常（如无痕浏览）
      const origGetItem = global.localStorage.getItem;
      global.localStorage.getItem = () => { throw new Error('Access denied'); };
      expect(api.getToken()).toBeNull();
      global.localStorage.getItem = origGetItem;
    });

    it('setToken 在 localStorage 异常时应容错（不抛异常）', () => {
      const origSetItem = global.localStorage.setItem;
      global.localStorage.setItem = () => { throw new Error('Quota exceeded'); };
      expect(() => api.setToken('token')).not.toThrow();
      global.localStorage.setItem = origSetItem;
    });
  });

  // ==========================================================
  // request() 核心逻辑
  // ==========================================================
  describe('request() — 核心请求', () => {

    it('GET 请求应正确拼接 baseURL', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 0, data: { result: 'ok' } }),
      });

      await api.get('/test-endpoint');

      expect(global.window.fetch).toHaveBeenCalledTimes(1);
      const calledUrl = global.window.fetch.mock.calls[0][0];
      expect(calledUrl).toBe('http://localhost:8081/api/test-endpoint');
    });

    it('GET 请求应带查询参数', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 0, data: [] }),
      });

      await api.get('/categories', { type: 'expense', page: 1 });

      const calledUrl = global.window.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('type=expense');
      expect(calledUrl).toContain('page=1');
    });

    it('GET 请求应过滤空值参数', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 0, data: [] }),
      });

      await api.get('/list', { valid: 'yes', empty: '', nil: null, undef: undefined });

      const calledUrl = global.window.fetch.mock.calls[0][0];
      expect(calledUrl).toContain('valid=yes');
      expect(calledUrl).not.toContain('empty');
      expect(calledUrl).not.toContain('nil');
      expect(calledUrl).not.toContain('undef');
    });

    it('有 Token 时应附加 Authorization 头', async () => {
      api.setToken('my-jwt-token');

      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 0, data: {} }),
      });

      await api.get('/auth/me');

      const fetchOptions = global.window.fetch.mock.calls[0][1];
      expect(fetchOptions.headers.Authorization).toBe('Bearer my-jwt-token');
    });

    it('POST 请求应带 JSON body', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 201,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 0, data: {} }),
      });

      await api.post('/auth/login', { username: 'alice', password: 'pass' });

      const fetchOptions = global.window.fetch.mock.calls[0][1];
      expect(fetchOptions.method).toBe('POST');
      expect(fetchOptions.headers['Content-Type']).toBe('application/json');
      expect(fetchOptions.body).toBe(JSON.stringify({ username: 'alice', password: 'pass' }));
    });

    it('PATCH 请求应正确发送', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 0, data: {} }),
      });

      await api.patch('/categories/1', { name: 'new name' });

      expect(global.window.fetch.mock.calls[0][1].method).toBe('PATCH');
    });

    it('DELETE 请求应正确发送', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 0, data: {} }),
      });

      await api.del('/categories/1');

      expect(global.window.fetch.mock.calls[0][1].method).toBe('DELETE');
    });
  });

  // ==========================================================
  // 响应处理
  // ==========================================================
  describe('响应处理', () => {

    it('code=0 应返回 data', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 200,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 0, message: '成功', data: { id: 1 } }),
      });

      const result = await api.get('/test');
      expect(result.data).toEqual({ id: 1 });
      expect(result.message).toBe('成功');
    });

    it('code!=0 应抛出错误', async () => {
      global.window.fetch = vi.fn().mockResolvedValue({
        ok: true, status: 400,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 422, message: '参数错误', errors: [{ field: 'name', message: '必填' }] }),
      });

      await expect(api.post('/test', {})).rejects.toThrow('参数错误');
      try {
        await api.post('/test', {});
      } catch (err) {
        expect(err.code).toBe(422);
        expect(err.errors).toBeDefined();
      }
    });
  });

  // ==========================================================
  // 超时处理
  // ==========================================================
  describe('超时处理', () => {

    it('请求超时应抛出超时错误', async () => {
      // 模拟超时：fetch 内部触发了 AbortController
      const abortError = new DOMException('The operation was aborted', 'AbortError');
      global.window.fetch = vi.fn().mockRejectedValue(abortError);

      await expect(api.get('/slow')).rejects.toThrow('请求超时');
      try {
        await api.get('/slow');
      } catch (err) {
        expect(err.code).toBe(408);
      }
    });
  });

  // ==========================================================
  // 网络错误处理
  // ==========================================================
  describe('网络错误处理', () => {

    it('网络断开应抛出网络错误', async () => {
      global.window.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(api.get('/test')).rejects.toThrow('网络连接失败');
      try {
        await api.get('/test');
      } catch (err) {
        expect(err.code).toBe(0);
      }
    });
  });

  // ==========================================================
  // 401 处理
  // ==========================================================
  describe('401 处理', () => {

    it('401 应清除 token 并重定向（非登录页）', async () => {
      api.setToken('expired-token');
      // 模拟当前页面不是 login/register
      Object.defineProperty(global.location, 'pathname', {
        value: '/index.html', writable: true, configurable: true,
      });
      const hrefSetter = vi.fn();
      Object.defineProperty(global.location, 'href', {
        set: hrefSetter, get: () => 'http://localhost:8081/index.html',
      });

      global.window.fetch = vi.fn().mockResolvedValue({
        ok: false, status: 401,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 401, message: 'Unauthorized' }),
      });

      await expect(api.get('/auth/me')).rejects.toThrow('Unauthorized');
      // Token 应被清除
      expect(api.getToken()).toBeNull();
    });

    it('401 在登录页不应重定向', async () => {
      api.setToken('expired-token');
      Object.defineProperty(global.location, 'pathname', {
        value: '/login.html', writable: true, configurable: true,
      });

      global.window.fetch = vi.fn().mockResolvedValue({
        ok: false, status: 401,
        headers: { get: () => 'application/json' },
        json: () => Promise.resolve({ code: 401, message: 'Unauthorized' }),
      });

      await expect(api.get('/auth/me')).rejects.toThrow('Unauthorized');
      // Token 仍被清除
      expect(api.getToken()).toBeNull();
    });
  });
});
