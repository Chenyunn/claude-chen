// 每日记账 - 认证路由
// ==========================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
} = require('../validators/auth.validator');
const authenticate = require('../middleware/authenticate');

// POST /api/auth/register - 用户注册
router.post('/register', validate(registerSchema), authController.register);

// POST /api/auth/login - 用户登录
router.post('/login', validate(loginSchema), authController.login);

// POST /api/auth/logout - 用户登出
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/me - 获取当前用户信息
router.get('/me', authenticate, authController.me);

module.exports = router;
