/**
 * 测试数据工厂
 *
 * 作用说明：
 * - 提供预置的测试用户、分类等数据
 * - 封装 bcrypt 密码哈希，避免测试中重复计算
 * - 提供 JWT Token 生成函数（使用测试密钥）
 * - 所有数据为纯函数，每次调用返回新对象
 *
 * 使用方式：
 *   const { createTestUser, getAuthToken } = require('../fixtures/testData');
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_for_testing';
const BCRYPT_ROUNDS = 12;

// ============================================================
// 预置用户数据
// ============================================================

const TEST_USERS = {
  alice: {
    username: 'testuser01',
    password: 'TestPass123',
    nickname: 'Alice',
  },
  bob: {
    username: 'testuser02',
    password: 'TestPass456',
    nickname: 'Bob',
  },
  locked: {
    username: 'lockeduser',
    password: 'LockedPass1',
    nickname: 'Locked',
  },
};

// ============================================================
// 预置分类数据
// ============================================================

const TEST_CATEGORIES = {
  customExpense: {
    code: 'custom_food',
    name: '自定义餐饮',
    icon: '🍕',
    color: '#FF6B6B',
    type: 'expense',
    sortOrder: 1,
  },
  customIncome: {
    code: 'custom_bonus',
    name: '自定义收入',
    icon: '💰',
    color: '#4CAF50',
    type: 'income',
    sortOrder: 2,
  },
  noCode: {
    code: '',
    name: '',
    icon: '📦',
    type: 'expense',
  },
};

// ============================================================
// 工厂函数
// ============================================================

/**
 * 生成 bcrypt 密码哈希
 */
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  return bcrypt.hash(password, salt);
}

/**
 * 在数据库中创建测试用户
 * @param {object} pool - mysql2 连接池
 * @param {object} user - { username, password, nickname }
 * @param {object} overrides - 可选覆盖字段 { status, failed_login_count, locked_until }
 * @returns {object} { id, username, nickname, password (明文) }
 */
async function createTestUser(pool, user = TEST_USERS.alice, overrides = {}) {
  const passwordHash = await hashPassword(user.password);
  const [result] = await pool.query(
    `INSERT INTO users (username, password_hash, nickname, status, failed_login_count, locked_until, last_login_at)
     VALUES (?, ?, ?, ?, ?, ?, NOW(3))`,
    [
      user.username,
      passwordHash,
      user.nickname || user.username,
      overrides.status !== undefined ? overrides.status : 1,
      overrides.failed_login_count || 0,
      overrides.locked_until || null,
    ]
  );
  // 创建关联的 user_settings
  await pool.query('INSERT INTO user_settings (user_id) VALUES (?)', [result.insertId]);

  return {
    id: result.insertId,
    username: user.username,
    nickname: user.nickname,
    password: user.password, // 明文，用于登录测试
  };
}

/**
 * 生成 JWT Token（用于鉴权测试）
 * @param {object} user - { id, username }
 * @param {boolean} rememberMe
 * @returns {string} JWT token
 */
function getAuthToken(user, rememberMe = false) {
  return jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: rememberMe ? '7d' : '1h' }
  );
}

/**
 * 在数据库中创建自定义分类
 */
async function createTestCategory(pool, userId, category = TEST_CATEGORIES.customExpense) {
  const [result] = await pool.query(
    `INSERT INTO categories (user_id, code, name, icon, color, type, sort_order, is_system, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, TRUE)`,
    [userId, category.code, category.name, category.icon, category.color, category.type, category.sortOrder]
  );
  return {
    id: result.insertId,
    userId,
    ...category,
  };
}

module.exports = {
  TEST_USERS,
  TEST_CATEGORIES,
  JWT_SECRET,
  hashPassword,
  createTestUser,
  getAuthToken,
  createTestCategory,
};
