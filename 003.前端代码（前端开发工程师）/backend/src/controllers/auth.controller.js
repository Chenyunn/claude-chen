// 每日记账 - 认证控制器
// ==========================================

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const pool = require('../db');

// ---------- 工具函数 ----------

/**
 * 生成随机 Token 字符串
 */
function generateTokenString() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 对 Token 做 SHA-256 哈希
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * 签发 JWT
 */
function signJwt(user, rememberMe = false) {
  const expiresIn = rememberMe
    ? config.jwt.rememberExpiresIn
    : config.jwt.expiresIn;

  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
    },
    config.jwt.secret,
    { expiresIn },
  );
}

/**
 * 解析 JWT 过期时间为 MySQL DATETIME
 */
function jwtExpiresToDatetime(rememberMe = false) {
  const ms = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms).toISOString().slice(0, 23).replace('T', ' ');
}

// ---------- 控制器 ----------

/**
 * POST /api/auth/register
 * 用户注册
 */
async function register(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { username, password, nickname } = req.body;

    // 1. 检查用户名是否已存在
    const [existing] = await conn.query(
      'SELECT id FROM users WHERE username = ? AND deleted_at IS NULL',
      [username],
    );
    if (existing.length > 0) {
      return res.status(409).json({
        code: 409,
        message: '该用户名已被注册',
      });
    }

    // 2. 哈希密码
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. 开启事务：创建用户 + 用户设置 + 签发 Token
    await conn.beginTransaction();

    // 创建用户
    const [userResult] = await conn.query(
      `INSERT INTO users (username, password_hash, nickname, status, last_login_at)
       VALUES (?, ?, ?, 1, NOW(3))`,
      [username, passwordHash, nickname || username],
    );
    const userId = userResult.insertId;

    // 创建默认用户设置
    await conn.query(
      'INSERT INTO user_settings (user_id) VALUES (?)',
      [userId],
    );

    // 4. 签发 JWT
    const jwtToken = signJwt({ id: userId, username }, false);

    // 5. 保存 Token 记录
    const tokenString = generateTokenString();
    const tokenHash = hashToken(tokenString);
    await conn.query(
      `INSERT INTO auth_tokens (user_id, token_hash, token_type, remember_me, issued_at, expires_at, last_used_at)
       VALUES (?, ?, 'access', FALSE, NOW(3), ?, NOW(3))`,
      [userId, tokenHash, jwtExpiresToDatetime(false)],
    );

    await conn.commit();

    // 6. 返回结果
    res.status(201).json({
      code: 0,
      message: '注册成功',
      data: {
        token: jwtToken,
        user: {
          id: userId,
          username,
          nickname: nickname || username,
          avatarUrl: null,
          signature: null,
        },
      },
    });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * POST /api/auth/login
 * 用户登录
 */
async function login(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { username, password, rememberMe = false } = req.body;

    // 1. 查找用户（包括已锁定用户，以便判断锁定状态）
    const [users] = await conn.query(
      'SELECT id, username, password_hash, nickname, avatar_url, signature, status, failed_login_count, locked_until FROM users WHERE username = ? AND deleted_at IS NULL',
      [username],
    );

    if (users.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    const user = users[0];

    // 2. 检查账号状态
    if (user.status === 9) {
      return res.status(403).json({
        code: 403,
        message: '该账号已被禁用',
      });
    }

    // 3. 检查是否被锁定
    if (user.status === 2 && user.locked_until) {
      const now = new Date();
      const lockUntil = new Date(user.locked_until);
      if (now < lockUntil) {
        const remainMinutes = Math.ceil((lockUntil - now) / 60000);
        return res.status(423).json({
          code: 423,
          message: `账号已被锁定，请 ${remainMinutes} 分钟后再试`,
        });
      }
      // 锁定已过期，解除锁定
      await conn.query(
        'UPDATE users SET status = 1, failed_login_count = 0, locked_until = NULL WHERE id = ?',
        [user.id],
      );
      user.status = 1;
      user.failed_login_count = 0;
    }

    // 4. 验证密码
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      // 增加失败计数
      const newCount = user.failed_login_count + 1;
      if (newCount >= config.login.maxAttempts) {
        // 锁定账号
        const lockUntil = new Date(
          Date.now() + config.login.lockMinutes * 60 * 1000,
        )
          .toISOString()
          .slice(0, 23)
          .replace('T', ' ');
        await conn.query(
          'UPDATE users SET status = 2, failed_login_count = ?, locked_until = ? WHERE id = ?',
          [newCount, lockUntil, user.id],
        );
        return res.status(423).json({
          code: 423,
          message: `密码错误次数过多，账号已锁定 ${config.login.lockMinutes} 分钟`,
        });
      } else {
        await conn.query(
          'UPDATE users SET failed_login_count = ? WHERE id = ?',
          [newCount, user.id],
        );
      }

      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误',
      });
    }

    // 5. 登录成功 - 重置失败计数，更新最后登录时间
    await conn.query(
      'UPDATE users SET status = 1, failed_login_count = 0, locked_until = NULL, last_login_at = NOW(3) WHERE id = ?',
      [user.id],
    );

    // 6. 签发 JWT
    const jwtToken = signJwt(
      { id: user.id, username: user.username },
      rememberMe,
    );

    // 7. 保存 Token 记录
    const tokenString = generateTokenString();
    const tokenHash = hashToken(tokenString);
    await conn.query(
      `INSERT INTO auth_tokens (user_id, token_hash, token_type, remember_me, issued_at, expires_at, last_used_at)
       VALUES (?, ?, 'access', ?, NOW(3), ?, NOW(3))`,
      [user.id, tokenHash, rememberMe, jwtExpiresToDatetime(rememberMe)],
    );

    // 8. 返回结果
    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token: jwtToken,
        user: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatarUrl: user.avatar_url,
          signature: user.signature,
        },
      },
    });
  } catch (err) {
    next(err);
  } finally {
    conn.release();
  }
}

/**
 * POST /api/auth/logout
 * 用户登出（撤销当前 Token 对应的所有会话记录）
 */
async function logout(req, res, next) {
  try {
    const userId = req.user.userId;

    // 撤销该用户所有未过期的 Token
    await pool.query(
      'UPDATE auth_tokens SET revoked_at = NOW(3) WHERE user_id = ? AND revoked_at IS NULL AND expires_at > NOW(3)',
      [userId],
    );

    res.json({
      code: 0,
      message: '已退出登录',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 * 获取当前登录用户信息
 */
async function me(req, res, next) {
  try {
    const userId = req.user.userId;

    const [users] = await pool.query(
      `SELECT u.id, u.username, u.nickname, u.avatar_url, u.signature,
              u.status, u.last_login_at, u.created_at,
              s.currency_code, s.currency_symbol,
              s.notification_enabled, s.dark_mode_enabled, s.biometric_enabled
       FROM users u
       LEFT JOIN user_settings s ON s.user_id = u.id
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [userId],
    );

    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在',
      });
    }

    const user = users[0];

    res.json({
      code: 0,
      data: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        avatarUrl: user.avatar_url,
        signature: user.signature,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at,
        settings: {
          currencyCode: user.currency_code,
          currencySymbol: user.currency_symbol,
          notificationEnabled: user.notification_enabled,
          darkModeEnabled: user.dark_mode_enabled,
          biometricEnabled: user.biometric_enabled,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  me,
};
