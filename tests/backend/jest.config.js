/**
 * Jest 配置文件 — 后端接口/集成/安全测试
 *
 * 作用说明：
 * - 指定测试文件匹配规则
 * - 配置测试环境变量（独立测试库）
 * - 配置报告输出路径到 008.项目测试(测试工程师)/测试报告/
 * - setupFilesAfterSetup 在每个测试套件前初始化数据库
 */
module.exports = {
  // 测试文件匹配：unit/ 和 integration/ 下的所有 .test.js 文件
  testMatch: [
    '<rootDir>/unit/**/*.test.js',
    '<rootDir>/integration/**/*.test.js',
  ],

  // 全局setup：初始化测试数据库连接 & 建表
  globalSetup: '<rootDir>/setup.js',

  // 测试环境变量：使用独立测试库，避免污染开发数据
  testEnvironment: 'node',

  // 每个测试文件超时 30s（含数据库操作）
  testTimeout: 30000,

  // 在测试间自动清除 mock
  clearMocks: true,
  restoreMocks: true,

  // 覆盖率配置
  collectCoverageFrom: [
    '../../003.前端代码（前端开发工程师）/backend/src/**/*.js',
    '!**/node_modules/**',
    '!**/server.js',
  ],

  // 报告输出
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: '../../008.项目测试(测试工程师)/测试报告',
      outputName: 'backend-junit.xml',
      suiteName: 'Backend API Tests',
    }],
  ],

  // 覆盖率报告目录
  coverageDirectory: '../../008.项目测试(测试工程师)/测试报告/coverage-backend',

  // 环境变量（测试库）
  testEnvironmentOptions: {},
};
