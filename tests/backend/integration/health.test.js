/**
 * 健康检查接口测试
 *
 * 作用说明：
 * - 验证 GET /api/health 基本连通性
 * - 确认 app 正常加载、中间件链完整
 * - 作为测试基础设施的冒烟验证
 */
const request = require('supertest');

// 在导入 app 前已由 setup.js 设置好环境变量
const app = require(
  '../../../003.前端代码（前端开发工程师）/backend/src/app'
);

describe('GET /api/health — 健康检查', () => {

  test('应返回 200 及健康状态信息', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('uptime');
    expect(typeof res.body.uptime).toBe('number');
  });

  test('响应时间应在合理范围内', async () => {
    const start = Date.now();
    await request(app).get('/api/health');
    const elapsed = Date.now() - start;
    // 本地环境应在 500ms 以内
    expect(elapsed).toBeLessThan(500);
  });

  test('错误的路径应返回 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('code', 404);
    expect(res.body).toHaveProperty('message', '接口不存在');
  });
});
