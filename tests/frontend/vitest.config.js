/**
 * Vitest 配置文件 — 前端 Web 单元/安全测试
 *
 * 作用说明：
 * - 配置 jsdom 浏览器模拟环境
 * - 设置测试文件匹配规则
 * - 配置报告输出到 008.项目测试(测试工程师)/测试报告/
 * - setup 文件预加载浏览器 API mock
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // 测试文件匹配
    include: [
      'unit/**/*.test.js',
      'security/**/*.test.js',
    ],

    // jsdom 浏览器环境
    environment: 'jsdom',

    // 全局 setup：mock 浏览器 API + 加载源文件
    setupFiles: ['./setup.js'],

    // 在测试间自动恢复 mock
    mockReset: true,
    restoreMocks: true,

    // 超时
    testTimeout: 10000,

    // 报告输出（JUnit 格式）
    reporters: [
      'default',
      ['junit', {
        outputFile: '../../008.项目测试(测试工程师)/测试报告/frontend-junit.xml',
        suiteName: 'Frontend Unit Tests',
      }],
    ],

    // 覆盖率
    coverage: {
      reportsDirectory: '../../008.项目测试(测试工程师)/测试报告/coverage-frontend',
      include: [
        '../../003.前端代码（前端开发工程师）/frontend/assets/js/*.js',
      ],
    },
  },

  resolve: {
    alias: {
      '@frontend': path.resolve(__dirname, '../../003.前端代码（前端开发工程师）/frontend'),
    },
  },
});
