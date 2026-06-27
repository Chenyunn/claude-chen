// 每日记账 - Express 应用
// ==========================================

const express = require('express');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ---------- 中间件 ----------

// CORS — 开发环境允许所有来源，生产环境限制为配置的 clientUrl
app.use(cors({
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（如 Postman、curl、同源请求）
    if (!origin) return callback(null, true);
    // 开发环境允许所有来源
    if (config.nodeEnv === 'development') return callback(null, true);
    // 生产环境检查白名单
    if (origin === config.clientUrl) return callback(null, true);
    callback(new Error('不允许的跨域来源: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 解析 JSON 请求体
app.use(express.json({ limit: '1mb' }));

// 解析 URL 编码请求体
app.use(express.urlencoded({ extended: false }));

// 请求日志（开发环境）
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ---------- 健康检查 ----------
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ---------- 路由 ----------
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

// ---------- 404 ----------
app.use((_req, res) => {
  res.status(404).json({ code: 404, message: '接口不存在' });
});

// ---------- 全局错误处理 ----------
app.use(errorHandler);

module.exports = app;
