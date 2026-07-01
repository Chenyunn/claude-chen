/**
 * Joi 校验 Schema 单元测试
 *
 * 作用说明：
 * - 纯逻辑测试，无需数据库/网络
 * - 验证 registerSchema 和 loginSchema 的参数校验规则
 * - 覆盖合法/非法输入、边界值、默认值
 *
 * 对应测试计划用例：RG-02, RG-03, RG-05
 */
const { registerSchema, loginSchema } = require(
  '../../../003.前端代码（前端开发工程师）/backend/src/validators/auth.validator'
);

describe('Auth Validators — Joi Schema 单元测试', () => {

  // ==========================================================
  // registerSchema
  // ==========================================================
  describe('registerSchema — 注册参数校验', () => {

    test('合法注册数据应通过校验', () => {
      const { error, value } = registerSchema.validate({
        username: 'testuser',
        password: '123456',
      });
      expect(error).toBeUndefined();
      expect(value.username).toBe('testuser');
      expect(value.password).toBe('123456');
    });

    test('含合法 nickname 应通过', () => {
      const { error } = registerSchema.validate({
        username: 'testuser',
        password: '123456',
        nickname: '测试昵称',
      });
      expect(error).toBeUndefined();
    });

    test('用户名 < 6位应被拒绝', () => {
      const { error } = registerSchema.validate({
        username: 'abc',
        password: '123456',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('username');
    });

    test('用户名 > 20位应被拒绝', () => {
      const { error } = registerSchema.validate({
        username: 'a'.repeat(21),
        password: '123456',
      });
      expect(error).toBeDefined();
    });

    test('用户名含特殊字符应被拒绝', () => {
      const { error } = registerSchema.validate({
        username: 'test@user!',
        password: '123456',
      });
      expect(error).toBeDefined();
      // 正则只允许 [a-zA-Z0-9]
    });

    test('用户名含中文应被拒绝', () => {
      const { error } = registerSchema.validate({
        username: '测试用户abc',
        password: '123456',
      });
      expect(error).toBeDefined();
    });

    test('用户名=6位边界应通过', () => {
      const { error } = registerSchema.validate({
        username: 'abcdef',
        password: '123456',
      });
      expect(error).toBeUndefined();
    });

    test('用户名=20位边界应通过', () => {
      const { error } = registerSchema.validate({
        username: 'a'.repeat(20),
        password: '123456',
      });
      expect(error).toBeUndefined();
    });

    test('密码 < 6位应被拒绝', () => {
      const { error } = registerSchema.validate({
        username: 'testuser',
        password: '12345',
      });
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });

    test('密码 > 20位应被拒绝', () => {
      const { error } = registerSchema.validate({
        username: 'testuser',
        password: '1'.repeat(21),
      });
      expect(error).toBeDefined();
    });

    test('密码=6位边界应通过', () => {
      const { error } = registerSchema.validate({
        username: 'testuser',
        password: '123456',
      });
      expect(error).toBeUndefined();
    });

    test('密码=20位边界应通过', () => {
      const { error } = registerSchema.validate({
        username: 'testuser',
        password: '1'.repeat(20),
      });
      expect(error).toBeUndefined();
    });

    test('缺少 username 应被拒绝', () => {
      const { error } = registerSchema.validate({
        password: '123456',
      });
      expect(error).toBeDefined();
    });

    test('缺少 password 应被拒绝', () => {
      const { error } = registerSchema.validate({
        username: 'testuser',
      });
      expect(error).toBeDefined();
    });

    test('nickname 为空字符串应被接受（allow("")）', () => {
      const { error } = registerSchema.validate({
        username: 'testuser',
        password: '123456',
        nickname: '',
      });
      expect(error).toBeUndefined();
    });

    test('nickname 超过50字符应被拒绝', () => {
      const { error } = registerSchema.validate({
        username: 'testuser',
        password: '123456',
        nickname: 'a'.repeat(51),
      });
      expect(error).toBeDefined();
    });

    test('多余字段应被 strip（stripUnknown）', () => {
      const { error, value } = registerSchema.validate({
        username: 'testuser',
        password: '123456',
        extraField: 'should be removed',
      });
      expect(error).toBeUndefined();
      expect(value.extraField).toBeUndefined();
    });
  });

  // ==========================================================
  // loginSchema
  // ==========================================================
  describe('loginSchema — 登录参数校验', () => {

    test('合法登录数据应通过', () => {
      const { error, value } = loginSchema.validate({
        username: 'testuser',
        password: '123456',
        rememberMe: false,
      });
      expect(error).toBeUndefined();
    });

    test('rememberMe 缺省默认为 false', () => {
      const { error, value } = loginSchema.validate({
        username: 'testuser',
        password: '123456',
      });
      expect(error).toBeUndefined();
      expect(value.rememberMe).toBe(false);
    });

    test('rememberMe=true 应通过', () => {
      const { error, value } = loginSchema.validate({
        username: 'testuser',
        password: '123456',
        rememberMe: true,
      });
      expect(error).toBeUndefined();
      expect(value.rememberMe).toBe(true);
    });

    test('缺少 username 应被拒绝', () => {
      const { error } = loginSchema.validate({
        password: '123456',
      });
      expect(error).toBeDefined();
    });

    test('缺少 password 应被拒绝', () => {
      const { error } = loginSchema.validate({
        username: 'testuser',
      });
      expect(error).toBeDefined();
    });
  });
});
