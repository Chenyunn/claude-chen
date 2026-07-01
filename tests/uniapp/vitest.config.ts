/**
 * Vitest 配置文件 — uni-app 跨端单元/静态测试
 *
 * 作用说明：
 * - 继承 Vite 配置中的 @ 别名
 * - 配置 jsdom 环境（模拟 H5 端）
 * - Mock uni 全局 API
 * - 报告输出到 008.项目测试(测试工程师)/测试报告/
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // 测试文件匹配
    include: [
      'unit/**/*.test.ts',
      'static/**/*.test.ts',
    ],

    // jsdom 环境（模拟浏览器）
    environment: 'jsdom',

    // 全局 setup：mock uni API + 配置 Vue
    setupFiles: ['./setup.ts'],

    // 在测试间恢复 mock
    mockReset: true,
    restoreMocks: true,

    // 超时
    testTimeout: 10000,

    // 报告输出
    reporters: [
      'default',
      ['junit', {
        outputFile: '../../008.项目测试(测试工程师)/测试报告/uniapp-junit.xml',
        suiteName: 'UniApp Unit Tests',
      }],
    ],

    // 覆盖率
    coverage: {
      reportsDirectory: '../../008.项目测试(测试工程师)/测试报告/coverage-uniapp',
      include: [
        '../../007.跨端APP应用(移动端开发工程师)/uniapp-projct/src/**/*.ts',
      ],
    },

    // 全局类型（TypeScript）
    globals: true,
  },

  resolve: {
    alias: {
      // 与 uniapp vite.config.ts 保持一致
      '@': path.resolve(__dirname, '../../007.跨端APP应用(移动端开发工程师)/uniapp-projct/src'),
    },
  },
});
