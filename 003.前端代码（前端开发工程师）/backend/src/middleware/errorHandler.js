// 每日记账 - 全局错误处理中间件
// ==========================================

const config = require('../config');

/**
 * 全局错误处理中间件
 * 捕获所有未处理的异常，返回统一的错误格式
 */
function errorHandler(err, _req, res, _next) {
  // 记录错误日志
  console.error(`[ERROR] ${err.message}`);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  // 数据库错误
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      code: 409,
      message: '数据已存在，请勿重复提交',
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      code: 400,
      message: '关联数据不存在',
    });
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: '无效的认证令牌',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: '登录已过期，请重新登录',
    });
  }

  // 默认 500
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    code: statusCode,
    message: config.nodeEnv === 'production'
      ? '服务器内部错误'
      : err.message || '服务器内部错误',
  });
}

module.exports = errorHandler;
