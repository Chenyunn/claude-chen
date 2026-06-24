// 每日记账 - JWT 认证中间件
// ==========================================

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * 验证请求头中的 Bearer Token
 * 验证通过后将解码后的用户信息附加到 req.user
 */
function authenticate(req, res, next) {
  // 1. 获取 Authorization 头
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      code: 401,
      message: '未提供认证令牌',
    });
  }

  // 2. 解析 Bearer Token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      code: 401,
      message: '认证令牌格式错误',
    });
  }

  const token = parts[1];

  // 3. 验证 JWT
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded; // { userId, username, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        code: 401,
        message: '登录已过期，请重新登录',
      });
    }
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌',
    });
  }
}

module.exports = authenticate;
