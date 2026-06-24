// 每日记账 - 应用配置
// ==========================================

require('dotenv').config();

module.exports = {
  // 服务
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // 数据库
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'daily_expense',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    rememberExpiresIn: process.env.JWT_REMEMBER_EXPIRES_IN || '7d',
  },

  // 登录安全
  login: {
    maxAttempts: parseInt(process.env.LOGIN_MAX_ATTEMPTS, 10) || 5,
    lockMinutes: parseInt(process.env.LOGIN_LOCK_MINUTES, 10) || 15,
  },

  // CORS
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};
