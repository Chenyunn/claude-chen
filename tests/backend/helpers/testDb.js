/**
 * 测试数据库工具模块
 *
 * 作用说明：
 * - 管理测试数据库连接池
 * - 执行建表 SQL（从 004.数据库脚本 读取 schema）
 * - 提供表清理函数（truncateTables），在测试间保持数据隔离
 * - 封装常用查询辅助方法
 *
 * 使用方式：
 *   const { ensureTestDatabase, truncateTables, pool, query } = require('../helpers/testDb');
 *   beforeAll(async () => { await ensureTestDatabase(); });
 *   beforeEach(async () => { await truncateTables(); });
 */
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

let pool = null;

/**
 * 读取数据库建表脚本
 */
function readSchemaSQL() {
  const schemaPath = path.resolve(
    __dirname,
    '../../../004.数据库脚本（数据库管理员DBA）/001_daily_expense_schema.sql'
  );
  if (!fs.existsSync(schemaPath)) {
    throw new Error('数据库 Schema 文件不存在: ' + schemaPath);
  }
  return fs.readFileSync(schemaPath, 'utf-8');
}

/**
 * 确保测试数据库存在且表结构就绪
 * 1. 创建测试库（如不存在）
 * 2. 执行建表脚本
 */
async function ensureTestDatabase() {
  // 先用无库连接创建测试数据库
  const initConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  });

  const dbName = process.env.DB_NAME || 'daily_expense_test';
  await initConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await initConn.query(`USE \`${dbName}\``);

  // 执行建表脚本
  const schemaSQL = readSchemaSQL();
  try {
    await initConn.query(schemaSQL);
    console.log('[testDb] 测试数据库表结构就绪: ' + dbName);
  } catch (err) {
    // 表已存在等错误可忽略
    if (!err.message.includes('already exists')) {
      console.warn('[testDb] Schema 执行警告: ' + err.message);
    }
  }

  await initConn.end();

  // 创建连接池
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    multipleStatements: true,
  });

  return pool;
}

/**
 * 清理所有业务表数据（保留表结构）
 * 按外键依赖顺序删除，避免外键约束报错
 */
async function truncateTables() {
  if (!pool) {
    await ensureTestDatabase();
  }
  const tables = [
    'auth_tokens',
    'user_settings',
    'transaction_tags',
    'transactions',
    'budget_settings',
    'category_subcategories',
    'categories',
    'payment_accounts',
    'users',
  ];
  for (const table of tables) {
    try {
      await pool.query('DELETE FROM `' + table + '`');
    } catch (err) {
      // 表可能不存在（未执行 schema），忽略
    }
  }
}

/**
 * 快捷查询（单条）
 */
async function query(sql, params) {
  if (!pool) await ensureTestDatabase();
  const [rows] = await pool.query(sql, params);
  return rows;
}

/**
 * 关闭连接池
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  get pool() { return pool; },
  ensureTestDatabase,
  truncateTables,
  query,
  closePool,
};
