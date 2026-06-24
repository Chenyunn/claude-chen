// 每日记账 - 参数校验 Schema
// ==========================================

const Joi = require('joi');

// 注册参数校验
const registerSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9]{6,20}$/)
    .required()
    .messages({
      'string.pattern.base': '用户名必须为 6-20 位字母或数字',
      'string.empty': '用户名不能为空',
      'any.required': '用户名不能为空',
    }),

  password: Joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      'string.min': '密码至少 6 位',
      'string.max': '密码最多 20 位',
      'string.empty': '密码不能为空',
      'any.required': '密码不能为空',
    }),

  nickname: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': '昵称最多 50 个字符',
    }),
});

// 登录参数校验
const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'string.empty': '用户名不能为空',
      'any.required': '用户名不能为空',
    }),

  password: Joi.string()
    .required()
    .messages({
      'string.empty': '密码不能为空',
      'any.required': '密码不能为空',
    }),

  rememberMe: Joi.boolean()
    .optional()
    .default(false),
});

module.exports = {
  registerSchema,
  loginSchema,
};
