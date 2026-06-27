// 每日记账 - 分类管理控制器
// ==========================================

const pool = require('../db');

/**
 * GET /api/categories
 * 获取用户可用分类（系统分类 + 用户自定义分类）
 */
async function list(req, res, next) {
  try {
    const userId = req.user.userId;
    const { type } = req.query;

    let where = 'WHERE (user_id IS NULL OR user_id = ?) AND is_active = TRUE AND deleted_at IS NULL';
    const params = [userId];

    if (type) {
      where += ' AND (type = ? OR type = \'both\')';
      params.push(type);
    }

    const [rows] = await pool.query(
      `SELECT id, user_id, code, name, icon, color, type, sort_order, is_system
       FROM categories ${where}
       ORDER BY type, sort_order`,
      params,
    );

    res.json({ code: 0, data: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/categories/:id/subcategories
 * 获取子分类
 */
async function subcategories(req, res, next) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT id, code, name, icon, sort_order
       FROM category_subcategories
       WHERE category_id = ? AND is_active = TRUE AND deleted_at IS NULL
       ORDER BY sort_order`,
      [id],
    );

    res.json({ code: 0, data: rows });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/categories
 * 创建自定义分类
 */
async function create(req, res, next) {
  try {
    const userId = req.user.userId;
    const { code, name, icon, color, type = 'expense', sortOrder = 999 } = req.body;

    if (!code || !name) {
      return res.status(422).json({ code: 422, message: '分类编码和名称不能为空' });
    }

    // 检查编码是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE (user_id = ? OR user_id IS NULL) AND code = ? AND deleted_at IS NULL',
      [userId, code],
    );
    if (existing.length > 0) {
      return res.status(409).json({ code: 409, message: '该分类编码已存在' });
    }

    const [result] = await pool.query(
      `INSERT INTO categories (user_id, code, name, icon, color, type, sort_order, is_system, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, TRUE)`,
      [userId, code, name, icon || '📦', color || '#E5E5EA', type, sortOrder],
    );

    res.status(201).json({
      code: 0,
      message: '分类创建成功',
      data: { id: result.insertId },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/categories/:id
 * 修改自定义分类
 */
async function update(req, res, next) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { name, icon, color, sortOrder, isActive } = req.body;

    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
      [id, userId],
    );
    if (existing.length === 0) {
      return res.status(404).json({ code: 404, message: '分类不存在或不可修改' });
    }

    const fields = [];
    const params = [];
    if (name !== undefined) { fields.push('name = ?'); params.push(name); }
    if (icon !== undefined) { fields.push('icon = ?'); params.push(icon); }
    if (color !== undefined) { fields.push('color = ?'); params.push(color); }
    if (sortOrder !== undefined) { fields.push('sort_order = ?'); params.push(sortOrder); }
    if (isActive !== undefined) { fields.push('is_active = ?'); params.push(isActive); }

    if (fields.length === 0) {
      return res.status(422).json({ code: 422, message: '没有要修改的字段' });
    }

    params.push(id);
    await pool.query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, params);

    res.json({ code: 0, message: '修改成功' });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/categories/:id
 * 软删除自定义分类
 */
async function remove(req, res, next) {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const [result] = await pool.query(
      'UPDATE categories SET deleted_at = NOW(3) WHERE id = ? AND user_id = ? AND is_system = FALSE AND deleted_at IS NULL',
      [id, userId],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '分类不存在或不可删除（系统分类不可删除）' });
    }

    res.json({ code: 0, message: '删除成功' });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, subcategories, create, update, remove };
