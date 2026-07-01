/**
 * 分类管理接口集成测试
 *
 * 作用说明：
 * - 测试 GET /api/categories（列表 + 过滤）
 * - 测试 GET /api/categories/:id/subcategories（子分类）
 * - 测试 POST /api/categories（创建分类 + 参数校验）
 * - 测试 PATCH /api/categories/:id（修改分类）
 * - 测试 DELETE /api/categories/:id（软删除）
 * - 覆盖鉴权（所有接口需 token）、越权、参数校验
 *
 * 对应测试计划：CAT-01 ~ CAT-13
 */
const request = require('supertest');
const { ensureTestDatabase, truncateTables } = require('../helpers/testDb');
const { TEST_USERS, createTestUser, getAuthToken, createTestCategory, TEST_CATEGORIES } = require('../fixtures/testData');

const app = require(
  '../../../003.前端代码（前端开发工程师）/backend/src/app'
);

describe('Categories API — 分类管理接口集成测试', () => {
  let userA, userB;
  let tokenA, tokenB;

  beforeAll(async () => {
    await ensureTestDatabase();
  });

  beforeEach(async () => {
    await truncateTables();
    // 创建两个用户用于越权测试
    userA = await createTestUser(require('../helpers/testDb').pool, TEST_USERS.alice);
    userB = await createTestUser(require('../helpers/testDb').pool, TEST_USERS.bob);
    tokenA = getAuthToken(userA);
    tokenB = getAuthToken(userB);
  });

  afterAll(async () => {
    const { closePool } = require('../helpers/testDb');
    await closePool();
  });

  // ==========================================================
  // GET /api/categories — 分类列表
  // ==========================================================
  describe('GET /api/categories — 获取分类列表', () => {

    test('CAT-01: 获取列表应返回 200 及分类数据', async () => {
      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(Array.isArray(res.body.data)).toBe(true);
      // 系统应有预设系统分类（如 food, transport 等）
      expect(res.body.data.length).toBeGreaterThan(0);

      // 检查数据结构
      const cat = res.body.data[0];
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('code');
      expect(cat).toHaveProperty('name');
      expect(cat).toHaveProperty('icon');
      expect(cat).toHaveProperty('type');
      expect(cat).toHaveProperty('is_system');
    });

    test('CAT-02: ?type=expense 应仅返回支出类分类', async () => {
      const res = await request(app)
        .get('/api/categories?type=expense')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      res.body.data.forEach(cat => {
        expect(['expense', 'both']).toContain(cat.type);
        expect(cat.type).not.toBe('income');
      });
    });

    test('CAT-02: ?type=income 应仅返回收入类分类', async () => {
      const res = await request(app)
        .get('/api/categories?type=income')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      res.body.data.forEach(cat => {
        expect(['income', 'both']).toContain(cat.type);
      });
    });

    test('CAT-11: 未带 Token 应返回 401', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(401);
    });
  });

  // ==========================================================
  // GET /api/categories/:id/subcategories — 子分类
  // ==========================================================
  describe('GET /api/categories/:id/subcategories — 获取子分类', () => {

    test('CAT-03: 有效分类ID应返回子分类列表', async () => {
      // 使用系统分类 food (id=1) 预设有子分类
      const res = await request(app)
        .get('/api/categories/1/subcategories')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('CAT-03: 无子分类的分类应返回空数组', async () => {
      // salary (id=8) 通常无子分类
      const res = await request(app)
        .get('/api/categories/8/subcategories')
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });

    test('CAT-11: 未带 Token 应返回 401', async () => {
      const res = await request(app).get('/api/categories/1/subcategories');
      expect(res.status).toBe(401);
    });
  });

  // ==========================================================
  // POST /api/categories — 创建分类
  // ==========================================================
  describe('POST /api/categories — 创建分类', () => {

    test('CAT-04: 创建自定义分类应返回 201', async () => {
      const category = TEST_CATEGORIES.customExpense;
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(category);

      expect(res.status).toBe(201);
      expect(res.body.code).toBe(0);
      expect(res.body.message).toContain('创建成功');
      expect(res.body.data).toHaveProperty('id');
    });

    test('CAT-04: 创建后列表应包含新分类', async () => {
      const category = TEST_CATEGORIES.customIncome;
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(category)
        .expect(201);

      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`);

      const created = res.body.data.find(c => c.code === category.code);
      expect(created).toBeDefined();
      expect(created.name).toBe(category.name);
      expect(created.is_system).toBe(0); // 自定义分类
    });

    test('CAT-05: code 为空应返回 422', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ code: '', name: 'Test', type: 'expense' });

      expect(res.status).toBe(422);
    });

    test('CAT-05: name 为空应返回 422', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ code: 'test_code', name: '', type: 'expense' });

      expect(res.status).toBe(422);
    });

    test('CAT-06: code 重复应返回 409', async () => {
      const category = TEST_CATEGORIES.customExpense;
      // 第一次创建
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(category)
        .expect(201);

      // 第二次创建同 code
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send(category);

      expect(res.status).toBe(409);
    });

    test('CAT-11: 未带 Token 应返回 401', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send(TEST_CATEGORIES.customExpense);

      expect(res.status).toBe(401);
    });

    test('CAT-12: A用户的分类不应出现在B用户的列表（数据隔离）', async () => {
      // A 创建分类
      await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ code: 'a_only', name: '仅A可见', icon: '🔒', type: 'expense' });

      // B 获取列表
      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${tokenB}`);

      const aOnly = res.body.data.find(c => c.code === 'a_only');
      expect(aOnly).toBeUndefined();
    });

    test('CAT-13: 分类名含 SQL 注入尝试应安全存储为字符串', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          code: 'safe_code',
          name: "test' OR 1=1 --",
          icon: '🔒',
          type: 'expense',
        });

      expect(res.status).toBe(201);
      // 参数化查询应防止注入
    });
  });

  // ==========================================================
  // PATCH /api/categories/:id — 修改分类
  // ==========================================================
  describe('PATCH /api/categories/:id — 修改分类', () => {
    let customCat;

    beforeEach(async () => {
      customCat = await createTestCategory(
        require('../helpers/testDb').pool,
        userA.id,
        TEST_CATEGORIES.customExpense
      );
    });

    test('CAT-07: 修改自定义分类应返回 200', async () => {
      const res = await request(app)
        .patch(`/api/categories/${customCat.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: '修改后的名称', icon: '🍔' });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
    });

    test('CAT-07: 修改后列表应反映变更', async () => {
      await request(app)
        .patch(`/api/categories/${customCat.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: '新名称' });

      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`);

      const updated = res.body.data.find(c => c.id === customCat.id);
      expect(updated.name).toBe('新名称');
    });

    test('CAT-07: 部分字段更新应仅更新传入字段', async () => {
      // 只更新 name
      await request(app)
        .patch(`/api/categories/${customCat.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: '仅改名' });

      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`);

      const updated = res.body.data.find(c => c.id === customCat.id);
      expect(updated.name).toBe('仅改名');
      expect(updated.code).toBe(customCat.code); // 未变
      expect(updated.icon).toBe(customCat.icon); // 未变
    });

    test('CAT-08: 修改系统分类应被拒绝', async () => {
      // 系统分类 id 通常较小（1-10）
      const res = await request(app)
        .patch('/api/categories/1')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ name: '尝试修改系统分类' });

      // 可能 404（查不到 user_id 匹配的记录）或拒绝
      expect([404, 403]).toContain(res.status);
    });

    test('CAT-11: 未带 Token 应返回 401', async () => {
      const res = await request(app)
        .patch(`/api/categories/${customCat.id}`)
        .send({ name: 'test' });

      expect(res.status).toBe(401);
    });

    test('CAT-12: B用户不能修改A用户的分类（越权）', async () => {
      const res = await request(app)
        .patch(`/api/categories/${customCat.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ name: '越权修改' });

      // 应返回 404（查不到匹配的 user_id）或 403
      expect([404, 403]).toContain(res.status);
    });
  });

  // ==========================================================
  // DELETE /api/categories/:id — 软删除分类
  // ==========================================================
  describe('DELETE /api/categories/:id — 删除分类', () => {
    let customCat;

    beforeEach(async () => {
      customCat = await createTestCategory(
        require('../helpers/testDb').pool,
        userA.id,
        TEST_CATEGORIES.customExpense
      );
    });

    test('CAT-09: 删除自定义分类应返回 200（软删除）', async () => {
      const res = await request(app)
        .delete(`/api/categories/${customCat.id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
    });

    test('CAT-09: 软删除后列表不再返回该分类', async () => {
      await request(app)
        .delete(`/api/categories/${customCat.id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${tokenA}`);

      const deleted = res.body.data.find(c => c.id === customCat.id);
      expect(deleted).toBeUndefined();
    });

    test('CAT-09: 软删除后数据库 deleted_at 应设置', async () => {
      const { query } = require('../helpers/testDb');

      await request(app)
        .delete(`/api/categories/${customCat.id}`)
        .set('Authorization', `Bearer ${tokenA}`);

      const rows = await query(
        'SELECT deleted_at FROM categories WHERE id = ?',
        [customCat.id]
      );
      expect(rows[0].deleted_at).not.toBeNull();
    });

    test('CAT-10: 删除系统分类应被拒绝', async () => {
      const res = await request(app)
        .delete('/api/categories/1')
        .set('Authorization', `Bearer ${tokenA}`);

      // 应为 404（is_system=TRUE 不可删）
      expect(res.status).toBe(404);
    });

    test('CAT-11: 未带 Token 应返回 401', async () => {
      const res = await request(app).delete(`/api/categories/${customCat.id}`);
      expect(res.status).toBe(401);
    });

    test('CAT-12: B用户不能删除A用户的分类（越权）', async () => {
      const res = await request(app)
        .delete(`/api/categories/${customCat.id}`)
        .set('Authorization', `Bearer ${tokenB}`);

      expect([404, 403]).toContain(res.status);
    });
  });
});
