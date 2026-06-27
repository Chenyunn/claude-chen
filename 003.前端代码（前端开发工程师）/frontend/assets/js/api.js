/**
 * 每日记账 - API 客户端
 * 封装 fetch 请求，统一处理错误和认证
 *
 * 使用方式：
 *   import { api } from './api.js';        // ES Module
 *   const { api } = await import('./api.js');
 *
 *   或直接在 HTML 中以 script 标签引入（全局变量 api）
 */

(function (global) {
  'use strict';

  // ============================================================
  // 配置
  // ============================================================

  const CONFIG = {
    // API 基础地址 — 与后端同源时使用相对路径，跨域时改为完整 URL
    // Java后端运行在 localhost:8080
    baseURL: 'http://localhost:8081/api',
    // 请求超时（毫秒）
    timeout: 15000,
  };

  // ============================================================
  // 状态
  // ============================================================

  // 是否正在刷新 Token（防止并发刷新）
  let isRefreshing = false;

  // ============================================================
  // Token 管理
  // ============================================================

  const TOKEN_KEY = 'daily_expense_token';

  function getToken() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  function setToken(token) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch { /* 无痕浏览等场景 */ }
  }

  function removeToken() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch { /* 无痕浏览等场景 */ }
  }

  // ============================================================
  // 请求核心
  // ============================================================

  /**
   * 发起 API 请求
   * @param {string} path    - 接口路径（不含 /api 前缀），如 '/auth/login'
   * @param {object} options - fetch 选项
   * @returns {Promise<object>} 解析后的响应体
   */
  async function request(path, options = {}) {
    const url = CONFIG.baseURL + path;

    // 默认配置
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // 自动附加 Token
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 解析响应体
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = { code: response.status, message: await response.text() };
      }

      // 业务成功 (code === 0)
      if (data.code === 0) {
        return data;
      }

      // 401 — Token 过期或无效
      if (response.status === 401) {
        removeToken();
        // 不在登录页/注册页才跳转
        const pathname = window.location.pathname.replace(/\\/g, '/');
        const isAuthPage =
          pathname.endsWith('/login.html') ||
          pathname.endsWith('/register.html');

        if (!isAuthPage) {
          window.location.href = 'pages/login.html';
        }
      }

      // 其他业务错误
      const error = new Error(data.message || '请求失败');
      error.code = data.code || response.status;
      error.errors = data.errors || [];
      throw error;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err.name === 'AbortError') {
        const timeoutError = new Error('请求超时，请检查网络');
        timeoutError.code = 408;
        throw timeoutError;
      }

      // 网络错误
      if (err.message === 'Failed to fetch' || err.message === 'NetworkError') {
        const netError = new Error('网络连接失败，请检查网络设置');
        netError.code = 0;
        throw netError;
      }

      throw err;
    }
  }

  // ============================================================
  // 便捷方法
  // ============================================================

  /** GET 请求 */
  async function get(path, params) {
    let url = path;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value);
        }
      });
      const qs = searchParams.toString();
      if (qs) url += '?' + qs;
    }
    return request(url, { method: 'GET' });
  }

  /** POST 请求 */
  async function post(path, body) {
    return request(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /** PATCH 请求 */
  async function patch(path, body) {
    return request(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /** DELETE 请求 */
  async function del(path) {
    return request(path, { method: 'DELETE' });
  }

  // ============================================================
  // 导出
  // ============================================================

  const api = {
    CONFIG,
    get,
    post,
    patch,
    del,
    request,
    getToken,
    setToken,
    removeToken,
  };

  // 支持 ES Module 和全局变量两种方式
  global.api = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof window !== 'undefined' ? window : this);
