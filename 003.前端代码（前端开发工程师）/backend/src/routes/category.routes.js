// 每日记账 - 分类路由
// ==========================================

const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/category.controller');
const authenticate = require('../middleware/authenticate');

router.use(authenticate);

router.get('/', ctrl.list);
router.get('/:id/subcategories', ctrl.subcategories);
router.post('/', ctrl.create);
router.patch('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
