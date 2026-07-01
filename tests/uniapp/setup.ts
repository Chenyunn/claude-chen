/**
 * Vitest 全局 Setup — uni-app 测试环境初始化
 *
 * 作用说明：
 * - Mock uni 全局对象（uni.request, uni.getStorageSync, uni.setStorageSync 等）
 * - 提供模拟的 uni API，供 utils/api.ts 和 store 使用
 * - 配置 Vue Test Utils 全局设置
 */
import { vi } from 'vitest';

// ==========================================================
// 1. Mock uni 全局对象
// ==========================================================

// 创建内存存储，模拟 uni.storage API
const storageMap = new Map<string, string>();

const mockUni = {
  // ---- Storage ----
  getStorageSync: vi.fn((key: string) => {
    return storageMap.get(key) ?? null;
  }),
  setStorageSync: vi.fn((key: string, value: any) => {
    storageMap.set(key, typeof value === 'string' ? value : JSON.stringify(value));
  }),
  removeStorageSync: vi.fn((key: string) => {
    storageMap.delete(key);
  }),
  clearStorageSync: vi.fn(() => {
    storageMap.clear();
  }),

  // ---- Network ----
  request: vi.fn(),

  // ---- Navigation ----
  reLaunch: vi.fn(),
  navigateTo: vi.fn(),
  redirectTo: vi.fn(),
  switchTab: vi.fn(),
  navigateBack: vi.fn(),

  // ---- UI ----
  showToast: vi.fn(),
  showLoading: vi.fn(),
  hideLoading: vi.fn(),
  showModal: vi.fn(),
  showActionSheet: vi.fn(),

  // ---- System ----
  getSystemInfoSync: vi.fn(() => ({
    platform: 'devtools',
    version: '8.0.0',
    model: 'Test Device',
    windowWidth: 375,
    windowHeight: 667,
  })),

  // ---- Network status ----
  getNetworkType: vi.fn(() => ({ networkType: 'wifi' })),
  onNetworkStatusChange: vi.fn(),
};

// 注入到全局
(globalThis as any).uni = mockUni;

// ==========================================================
// 2. Mock @dcloudio/uni-app 生命周期钩子
// ==========================================================
vi.mock('@dcloudio/uni-app', () => ({
  onLaunch: vi.fn((cb: Function) => cb()),
  onShow: vi.fn((cb: Function) => cb()),
  onHide: vi.fn((cb: Function) => cb()),
  onReady: vi.fn(),
  onLoad: vi.fn(),
  onUnload: vi.fn(),
}));

// ==========================================================
// 3. 暴露辅助函数
// ==========================================================

/**
 * 重置所有 uni mock 和存储
 */
(globalThis as any).resetUniMocks = () => {
  vi.resetAllMocks();
  storageMap.clear();
};

/**
 * 模拟 uni.request 成功响应
 */
(globalThis as any).mockUniRequestSuccess = (data: any = {}, code = 0) => {
  mockUni.request.mockImplementation((options: any) => {
    if (options.success) {
      options.success({
        statusCode: code === 0 ? 200 : code,
        data: { code, message: 'ok', data },
      });
    }
    if (options.complete) options.complete({ statusCode: 200 });
  });
};

/**
 * 模拟 uni.request 失败响应
 */
(globalThis as any).mockUniRequestFail = (errMsg = 'request:fail') => {
  mockUni.request.mockImplementation((options: any) => {
    if (options.fail) options.fail({ errMsg });
    if (options.complete) options.complete({ errMsg });
  });
};

/**
 * 模拟 uni.request 401 响应
 */
(globalThis as any).mockUniRequest401 = () => {
  mockUni.request.mockImplementation((options: any) => {
    if (options.success) {
      options.success({
        statusCode: 401,
        data: { code: 401, message: 'Unauthorized' },
      });
    }
  });
};

console.log('[setup] uni-app 测试环境就绪');
console.log('[setup] uni 全局 mock 已注入: request/setStorageSync/reLaunch 等');
