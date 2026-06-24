/**
 * 每日记账 - 认证模块
 * 封装登录、注册、登出、获取当前用户等业务逻辑
 *
 * 依赖：api.js（需先加载）
 */

(function (global) {
  'use strict';

  const { get, post } = global.api;

  // ============================================================
  // 用户状态
  // ============================================================

  let currentUser = null;
  let isAuthenticated = false;

  // ============================================================
  // API 方法
  // ============================================================

  /**
   * 用户注册
   * @param {object} params
   * @param {string} params.username - 用户名 (6-20位字母或数字)
   * @param {string} params.password - 密码 (6-20位)
   * @param {string} [params.nickname] - 昵称（可选）
   * @returns {Promise<object>} { token, user }
   */
  async function register({ username, password, nickname }) {
    const result = await post('/auth/register', { username, password, nickname });

    // 保存 Token
    if (result.data && result.data.token) {
      global.api.setToken(result.data.token);
      currentUser = result.data.user;
      isAuthenticated = true;
    }

    return result;
  }

  /**
   * 用户登录
   * @param {object} params
   * @param {string} params.username - 用户名
   * @param {string} params.password - 密码
   * @param {boolean} [params.rememberMe] - 是否记住登录 (7天)
   * @returns {Promise<object>} { token, user }
   */
  async function login({ username, password, rememberMe }) {
    const result = await post('/auth/login', {
      username,
      password,
      rememberMe: !!rememberMe,
    });

    // 保存 Token
    if (result.data && result.data.token) {
      global.api.setToken(result.data.token);
      currentUser = result.data.user;
      isAuthenticated = true;
    }

    return result;
  }

  /**
   * 用户登出
   * @returns {Promise<void>}
   */
  async function logout() {
    try {
      await post('/auth/logout');
    } catch {
      // 即使后端请求失败，也要清除本地状态
    } finally {
      global.api.removeToken();
      currentUser = null;
      isAuthenticated = false;
    }
  }

  /**
   * 获取当前登录用户信息
   * 同时更新本地缓存的用户状态
   * @returns {Promise<object>} 用户信息
   */
  async function fetchUser() {
    const result = await get('/auth/me');
    if (result.data) {
      currentUser = result.data;
      isAuthenticated = true;
    }
    return result;
  }

  /**
   * 检查登录状态（从 localStorage 恢复 Token）
   * 如果有 Token 则尝试获取用户信息
   * @returns {Promise<boolean>} 是否已登录
   */
  async function checkAuth() {
    const token = global.api.getToken();
    if (!token) {
      isAuthenticated = false;
      currentUser = null;
      return false;
    }

    try {
      await fetchUser();
      return true;
    } catch {
      // Token 无效或过期
      global.api.removeToken();
      isAuthenticated = false;
      currentUser = null;
      return false;
    }
  }

  /**
   * 获取当前用户（同步，从缓存读取）
   */
  function getUser() {
    return currentUser;
  }

  /**
   * 检查是否已认证（同步，从缓存读取）
   */
  function isAuth() {
    return isAuthenticated;
  }

  // ============================================================
  // 导出
  // ============================================================

  const auth = {
    register,
    login,
    logout,
    fetchUser,
    checkAuth,
    getUser,
    isAuth,
  };

  global.auth = auth;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = auth;
  }
})(typeof window !== 'undefined' ? window : this);
