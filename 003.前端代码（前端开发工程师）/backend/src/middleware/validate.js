// 每日记账 - 参数校验中间件
// ==========================================

const Joi = require('joi');

/**
 * Express 中间件工厂：使用 Joi Schema 校验请求体
 * @param {Joi.ObjectSchema} schema - Joi 校验 Schema
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,    // 返回所有错误，而非遇到第一个就停止
      stripUnknown: true,   // 移除未定义的字段
      allowUnknown: false,  // 不允许未知字段
    });

    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));

      return res.status(422).json({
        code: 422,
        message: '参数校验失败',
        errors: details,
      });
    }

    // 用校验后的值替换 req.body（已 strip 和转换）
    req.body = value;
    next();
  };
}

module.exports = { validate };
