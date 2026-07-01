/**
 * Vitest 全局 Setup — 前端浏览器环境模拟
 *
 * 作用说明：
 * - 在 jsdom 中模拟浏览器 API（localStorage, fetch, AbortController, location）
 * - 加载前端三个核心 JS 模块到 window 对象
 * - 确保模块间依赖顺序正确（api → toast → auth）
 *
 * 业务源文件路径：003.前端代码（前端开发工程师）/frontend/assets/js/
 */
import { vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

// ==========================================================
// 1. 创建 jsdom 实例 & 注入全局对象
// ==========================================================
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:8081/index.html',
  pretendToBeVisual: true,
  runScripts: 'dangerously',        // 允许执行内联脚本
  resources: 'usable',
});

// 将 jsdom 的 window/document 等注入 Node 全局
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.location = dom.window.location;
global.AbortController = dom.window.AbortController;
global.localStorage = dom.window.localStorage;

// 源文件 IIFE 需要 module.exports 检查（CommonJS detection）
// jsdom 没有 module 对象，所以 IIFE 会把 API 挂到 window 上
// 这是预期行为

// ==========================================================
// 2. Mock fetch（api.js 的核心依赖）
//    源文件 IIFE 在 dom.window 上下文执行，读取 window.fetch
//    设置初始 mock，测试中通过 global.window.fetch = vi.fn() 覆盖
// ==========================================================
dom.window.fetch = vi.fn();

console.log('[setup] dom.window === global.window:', dom.window === global.window);

// ==========================================================
// 3. 加载业务 JS 源文件
// ==========================================================
const frontendJsDir = path.resolve(
  __dirname,
  '../../003.前端代码（前端开发工程师）/frontend/assets/js'
);

/**
 * 通过 dom.window.eval 执行 JS 源文件
 * 源文件使用 IIFE 模式: (function(global) { ... global.xxx = ... })(window)
 * 在 jsdom window 上下文中执行后，会挂载到 window 上
 */
function loadScript(filePath) {
  const code = fs.readFileSync(filePath, 'utf-8');
  try {
    dom.window.eval(code);
  } catch (err) {
    console.warn(`[setup] 执行 ${path.basename(filePath)} 失败: ${err.message}`);
    throw err;
  }
}

// 按依赖顺序加载：api.js 必须先加载（auth.js 依赖 global.api）
// toast.js 独立，auth.js 依赖 api.js
const sourceFiles = ['api.js', 'toast.js', 'auth.js'];

sourceFiles.forEach(file => {
  const filePath = path.join(frontendJsDir, file);
  if (fs.existsSync(filePath)) {
    loadScript(filePath);
  } else {
    console.warn(`[setup] 源文件不存在: ${filePath}`);
  }
});

// ==========================================================
// 4. 暴露全局引用供测试使用
// ==========================================================
// 源文件 IIFE 将模块挂载到 window 上
global.api = dom.window.api;
global.auth = dom.window.auth;
global.Toast = dom.window.Toast;
global.dom = dom; // 方便测试访问 jsdom 实例

// ==========================================================
// 5. 辅助函数：重置状态（不重置mock，避免破坏fetch代理）
// ==========================================================
global.resetAllMocks = () => {
  // 只清除 localStorage，不重置 vi mocks
  // （因为 vi.resetAllMocks/restoreAllMocks 会破坏 global.fetch 的 getter/setter 代理）
  global.localStorage.clear();
  // 清除 fetch mock 的调用记录（保留实现）
  if (dom.window.fetch && dom.window.fetch.mockClear) {
    dom.window.fetch.mockClear();
  }
};

console.log('[setup] 前端测试环境就绪');
console.log('[setup] window.api=' + typeof dom.window.api + ', window.auth=' + typeof dom.window.auth + ', window.Toast=' + typeof dom.window.Toast);
console.log('[setup] global.api=' + typeof global.api + ', global.auth=' + typeof global.auth + ', global.Toast=' + typeof global.Toast);
