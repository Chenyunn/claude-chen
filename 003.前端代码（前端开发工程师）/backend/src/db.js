// 每日记账 - 数据库连接池
// ==========================================

const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool(config.db);

// 测试连接
pool.getConnection()
  .then((conn) => {
    console.log('✅ MySQL 数据库连接成功');
    console.log(`📊 数据库: ${config.db.database}`);
    conn.release();
  })
  .catch((err) => {
    console.error('❌ MySQL 数据库连接失败:', err.message);
    console.error('请确认:');
    console.error('  1. MySQL 服务已启动');
    console.error('  2. 已执行数据库初始化脚本 (004.数据库脚本/001_daily_expense_schema.sql)');
    console.error('  3. .env 中的数据库配置正确');
  });

module.exports = pool;
