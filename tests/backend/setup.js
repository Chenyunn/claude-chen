/**
 * Jest Global Setup — 后端测试全局初始化
 *
 * 作用说明：
 * - 在所有测试套件运行前执行一次
 * - 设置环境变量指向独立测试数据库
 * - 引入 dotenv 确保 config.js 能加载配置
 * - 返回 teardown 函数在全部测试结束后清理
 */
const path = require('path');
const fs = require('fs');

// 设置环境变量：覆盖 .env 中的数据库名，使用独立测试库
process.env.NODE_ENV = 'test';
process.env.DB_NAME = process.env.DB_NAME || 'daily_expense_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_for_testing';
process.env.JWT_EXPIRES_IN = '24h';
process.env.JWT_REMEMBER_EXPIRES_IN = '7d';
process.env.LOGIN_MAX_ATTEMPTS = '5';
process.env.LOGIN_LOCK_MINUTES = '1'; // 测试用 1 分钟锁定期
process.env.PORT = process.env.PORT || '0'; // 随机端口，避免冲突

// 指向后端项目根目录的 .env 文件
const backendDir = path.resolve(__dirname, '../../003.前端代码（前端开发工程师）/backend');
require('dotenv').config({ path: path.join(backendDir, '.env') });

// 再次覆盖（dotenv 不会覆盖已有环境变量）
if (!process.env.DB_NAME || process.env.DB_NAME === 'daily_expense') {
  process.env.DB_NAME = 'daily_expense_test';
}
process.env.JWT_SECRET = 'test_secret_key_for_testing';
process.env.LOGIN_LOCK_MINUTES = '1';

module.exports = async () => {
  // 全局 setup 在 jest 子进程中运行，不需要特殊初始化
  // 实际的数据库建表在 testDb.js 的 ensureTestDatabase() 中完成
  console.log('\n[测试环境] 数据库: ' + process.env.DB_NAME);
  console.log('[测试环境] JWT密钥: ' + process.env.JWT_SECRET.substring(0, 10) + '...');

  return async () => {
    // 全局 teardown：测试结束后清理
    console.log('\n[测试环境] 全部测试完成，清理资源...');
  };
};
