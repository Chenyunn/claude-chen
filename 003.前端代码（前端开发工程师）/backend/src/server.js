// 每日记账 - 应用入口
// ==========================================

const app = require('./app');
const config = require('./config');

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`✅ 每日记账 API 服务已启动`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`🌍 环境: ${config.nodeEnv}`);
  console.log(`📦 API 版本: v1`);
});
