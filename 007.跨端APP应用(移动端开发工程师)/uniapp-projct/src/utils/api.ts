/**
 * 每日记账 - API 客户端 (uni-app 版本)
 * 封装 uni.request 请求，统一处理错误和认证
 */

import type { RequestOptions } from '@dcloudio/types';

const CONFIG = {
  // API 基础地址 - Java 后端运行在 8081 端口
  baseURL: 'http://localhost:8081/api',
  // 请求超时（毫秒）
  timeout: 15000,
};

const TOKEN_KEY = 'daily_expense_token';

/**
 * 获取 Token
 */
export function getToken(): string | null {
  try {
    return uni.getStorageSync(TOKEN_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * 设置 Token
 */
export function setToken(token: string): void {
  try {
    uni.setStorageSync(TOKEN_KEY, token);
  } catch {
    // 存储失败时静默处理
  }
}

/**
 * 移除 Token
 */
export function removeToken(): void {
  try {
    uni.removeStorageSync(TOKEN_KEY);
  } catch {
    // 存储失败时静默处理
  }
}

/**
 * API 响应类型
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  errors?: string[];
}

/**
 * 发起 API 请求
 */
export function request<T = any>(
  path: string,
  options: {
    method?: RequestOptions['method'];
    data?: any;
    header?: any;
  } = {}
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const url = CONFIG.baseURL + path;

    const header: any = {
      'Content-Type': 'application/json',
      ...options.header,
    };

    const token = getToken();
    if (token) {
      header.Authorization = `Bearer ${token}`;
    }

    uni.request({
      url,
      method: options.method || 'GET',
      data: options.data,
      header,
      timeout: CONFIG.timeout,
      success: (response) => {
        const { statusCode, data } = response;
        const res = data as ApiResponse<T>;

        // 业务成功
        if (res.code === 0) {
          resolve(res);
          return;
        }

        // 401 — Token 过期或无效
        if (statusCode === 401) {
          removeToken();
          // 跳转到登录页
          uni.reLaunch({
            url: '/pages/login/login',
          });
          reject(new Error(res.message || '登录已过期，请重新登录'));
          return;
        }

        // 其他业务错误
        const error = new Error(res.message || '请求失败');
        (error as any).code = res.code || statusCode;
        (error as any).errors = res.errors || [];
        reject(error);
      },
      fail: (error) => {
        console.error('API request failed', error);
        let errorMessage = '网络连接失败，请检查网络设置';
        if (error.errMsg.includes('timeout')) {
          errorMessage = '请求超时，请检查网络';
        }
        const netError = new Error(errorMessage);
        (netError as any).code = 0;
        reject(netError);
      },
    });
  });
}

/**
 * GET 请求
 */
export async function get<T = any>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  let url = path;
  if (params) {
    const queryParts: string[] = [];
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
      }
    });
    const qs = queryParts.join('&');
    if (qs) url += '?' + qs;
  }
  return request<T>(url, { method: 'GET' });
}

/**
 * POST 请求
 */
export async function post<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'POST', data: body });
}

/**
 * PATCH 请求
 */
export async function patch<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'PATCH', data: body });
}

/**
 * DELETE 请求
 */
export async function del<T = any>(path: string): Promise<ApiResponse<T>> {
  return request<T>(path, { method: 'DELETE' });
}

export default {
  get,
  post,
  patch,
  del,
  request,
  getToken,
  setToken,
  removeToken,
};
