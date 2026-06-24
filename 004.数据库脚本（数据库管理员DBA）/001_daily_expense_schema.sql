-- =========================================================
-- 每日记账数据库初始化脚本
-- Target: MySQL 9.7.0
-- Database: daily_expense
--
-- 说明：
-- 1. 本脚本用于开发环境初始化，可重复执行。
-- 2. 密码、Token 等敏感信息仅保存哈希值，不保存明文。
-- 3. 统计数据优先通过视图由 transactions 聚合得到。
-- =========================================================

SET NAMES utf8mb4;
SET time_zone = '+08:00';

CREATE DATABASE IF NOT EXISTS daily_expense
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE daily_expense;

SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS v_monthly_user_summary;
DROP VIEW IF EXISTS v_monthly_category_summary;
DROP VIEW IF EXISTS v_daily_transaction_summary;

DROP TABLE IF EXISTS export_tasks;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS payment_accounts;
DROP TABLE IF EXISTS payment_account_types;
DROP TABLE IF EXISTS category_subcategories;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS auth_tokens;
DROP TABLE IF EXISTS user_settings;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 1. 用户账号表
-- =========================================================
CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  username VARCHAR(20) NOT NULL COMMENT '用户名，6-20位字母或数字，由应用层校验格式',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希，不保存明文密码',
  nickname VARCHAR(50) NULL COMMENT '昵称',
  avatar_url VARCHAR(500) NULL COMMENT '头像地址',
  signature VARCHAR(200) NULL COMMENT '个性签名',
  status TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '状态：1正常，2锁定，9禁用/注销',
  failed_login_count INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '连续登录失败次数',
  locked_until DATETIME(3) NULL COMMENT '锁定截止时间',
  last_login_at DATETIME(3) NULL COMMENT '最近登录时间',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_username (username),
  KEY idx_users_status_deleted (status, deleted_at),
  KEY idx_users_locked_until (locked_until),
  CONSTRAINT chk_users_status CHECK (status IN (1, 2, 9))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户账号表';

-- =========================================================
-- 2. 用户设置表
-- =========================================================
CREATE TABLE user_settings (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '设置ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  currency_code VARCHAR(8) NOT NULL DEFAULT 'CNY' COMMENT '币种代码',
  currency_symbol VARCHAR(8) NOT NULL DEFAULT '¥' COMMENT '币种符号',
  notification_enabled BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否开启消息提醒',
  dark_mode_enabled BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否开启深色模式',
  biometric_enabled BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否开启指纹/面容解锁',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_user_settings_user_id (user_id),
  CONSTRAINT fk_user_settings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户设置表';

-- =========================================================
-- 3. 登录 Token 表
-- =========================================================
CREATE TABLE auth_tokens (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT 'Token ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  token_hash CHAR(64) NOT NULL COMMENT 'Token 的 SHA-256 哈希值',
  token_type VARCHAR(20) NOT NULL DEFAULT 'access' COMMENT 'Token 类型',
  remember_me BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否7天免登录',
  issued_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '签发时间',
  expires_at DATETIME(3) NOT NULL COMMENT '过期时间',
  revoked_at DATETIME(3) NULL COMMENT '撤销时间',
  last_used_at DATETIME(3) NULL COMMENT '最近使用时间',
  created_ip VARCHAR(45) NULL COMMENT '创建时IP，兼容IPv4/IPv6',
  user_agent VARCHAR(500) NULL COMMENT '客户端User-Agent',
  PRIMARY KEY (id),
  UNIQUE KEY uk_auth_tokens_token_hash (token_hash),
  KEY idx_auth_tokens_user_expires (user_id, expires_at),
  KEY idx_auth_tokens_valid (expires_at, revoked_at),
  CONSTRAINT fk_auth_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='登录Token表';

-- =========================================================
-- 4. 主分类表
-- =========================================================
CREATE TABLE categories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '分类ID',
  user_id BIGINT UNSIGNED NULL COMMENT '用户ID；NULL表示系统内置分类',
  code VARCHAR(50) NOT NULL COMMENT '分类编码',
  name VARCHAR(50) NOT NULL COMMENT '分类名称',
  icon VARCHAR(16) NOT NULL COMMENT '分类图标',
  color VARCHAR(20) NULL COMMENT '展示颜色',
  type ENUM('expense', 'income', 'both') NOT NULL DEFAULT 'expense' COMMENT '分类类型',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值',
  is_system BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否系统内置',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_user_code (user_id, code),
  KEY idx_categories_user_type (user_id, type, is_active, sort_order),
  KEY idx_categories_code (code),
  CONSTRAINT fk_categories_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='主分类表';

-- =========================================================
-- 5. 子分类表
-- =========================================================
CREATE TABLE category_subcategories (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '子分类ID',
  category_id BIGINT UNSIGNED NOT NULL COMMENT '主分类ID',
  code VARCHAR(50) NOT NULL COMMENT '子分类编码',
  name VARCHAR(50) NOT NULL COMMENT '子分类名称',
  icon VARCHAR(16) NULL COMMENT '子分类图标',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_subcategories_category_code (category_id, code),
  KEY idx_subcategories_category_active (category_id, is_active, sort_order),
  CONSTRAINT fk_subcategories_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='子分类表';

-- =========================================================
-- 6. 支付账户类型字典表
-- =========================================================
CREATE TABLE payment_account_types (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '支付账户类型ID',
  code VARCHAR(50) NOT NULL COMMENT '类型编码',
  name VARCHAR(50) NOT NULL COMMENT '类型名称',
  icon VARCHAR(50) NULL COMMENT '类型图标',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  PRIMARY KEY (id),
  UNIQUE KEY uk_payment_account_types_code (code),
  KEY idx_payment_account_types_active_sort (is_active, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='支付账户类型字典表';

-- =========================================================
-- 7. 用户支付账户表
-- =========================================================
CREATE TABLE payment_accounts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '支付账户ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  account_type_id BIGINT UNSIGNED NOT NULL COMMENT '支付账户类型ID',
  name VARCHAR(80) NOT NULL COMMENT '账户展示名称',
  masked_identifier VARCHAR(50) NULL COMMENT '脱敏标识，如银行卡尾号8888',
  is_default BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否默认账户',
  is_active BOOLEAN NOT NULL DEFAULT TRUE COMMENT '是否启用',
  sort_order INT NOT NULL DEFAULT 0 COMMENT '排序值',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  PRIMARY KEY (id),
  KEY idx_payment_accounts_user_active (user_id, is_active, sort_order),
  KEY idx_payment_accounts_type (account_type_id),
  CONSTRAINT fk_payment_accounts_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_payment_accounts_type
    FOREIGN KEY (account_type_id) REFERENCES payment_account_types(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户支付账户表';

-- =========================================================
-- 8. 核心账目流水表
-- =========================================================
CREATE TABLE transactions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '交易ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  type ENUM('expense', 'income') NOT NULL DEFAULT 'expense' COMMENT '收支类型',
  amount DECIMAL(12,2) NOT NULL COMMENT '金额，始终存正数',
  category_id BIGINT UNSIGNED NOT NULL COMMENT '主分类ID',
  subcategory_id BIGINT UNSIGNED NULL COMMENT '子分类ID',
  payment_account_id BIGINT UNSIGNED NULL COMMENT '支付账户ID',
  transaction_date DATE NOT NULL COMMENT '交易日期',
  transaction_time TIME NULL COMMENT '交易时间',
  occurred_at DATETIME(3) NOT NULL COMMENT '交易发生时间',
  merchant VARCHAR(100) NULL COMMENT '商户名称',
  title VARCHAR(100) NULL COMMENT '交易标题',
  note VARCHAR(500) NULL COMMENT '备注',
  source VARCHAR(30) NOT NULL DEFAULT 'manual' COMMENT '来源：manual/import/sync等',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  PRIMARY KEY (id),
  KEY idx_transactions_user_occurred (user_id, occurred_at DESC),
  KEY idx_transactions_user_date (user_id, transaction_date),
  KEY idx_transactions_user_type_date (user_id, type, transaction_date),
  KEY idx_transactions_user_category_date (user_id, category_id, transaction_date),
  KEY idx_transactions_user_subcategory_date (user_id, subcategory_id, transaction_date),
  KEY idx_transactions_payment_account (payment_account_id),
  KEY idx_transactions_deleted (deleted_at),
  CONSTRAINT fk_transactions_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_transactions_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT fk_transactions_subcategory
    FOREIGN KEY (subcategory_id) REFERENCES category_subcategories(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_transactions_payment_account
    FOREIGN KEY (payment_account_id) REFERENCES payment_accounts(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT chk_transactions_amount_positive CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='核心账目流水表';

-- =========================================================
-- 9. 数据导出任务表
-- =========================================================
CREATE TABLE export_tasks (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '导出任务ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  export_type VARCHAR(30) NOT NULL DEFAULT 'transactions' COMMENT '导出类型',
  file_format VARCHAR(20) NOT NULL DEFAULT 'xlsx' COMMENT '文件格式',
  status ENUM('pending', 'processing', 'success', 'failed', 'expired') NOT NULL DEFAULT 'pending' COMMENT '任务状态',
  date_from DATE NULL COMMENT '导出开始日期',
  date_to DATE NULL COMMENT '导出结束日期',
  file_name VARCHAR(255) NULL COMMENT '文件名',
  file_url VARCHAR(500) NULL COMMENT '文件地址',
  error_message VARCHAR(500) NULL COMMENT '失败原因',
  requested_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '请求时间',
  completed_at DATETIME(3) NULL COMMENT '完成时间',
  expires_at DATETIME(3) NULL COMMENT '文件过期时间',
  created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) COMMENT '创建时间',
  updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3) COMMENT '更新时间',
  deleted_at DATETIME(3) NULL COMMENT '软删除时间',
  PRIMARY KEY (id),
  KEY idx_export_tasks_user_requested (user_id, requested_at DESC),
  KEY idx_export_tasks_status (status),
  CONSTRAINT fk_export_tasks_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='数据导出任务表';

-- =========================================================
-- 初始化数据：系统分类
-- =========================================================
INSERT INTO categories (user_id, code, name, icon, color, type, sort_order, is_system, is_active) VALUES
(NULL, 'food', '餐饮', '🍜', '#FFB6C1', 'expense', 10, TRUE, TRUE),
(NULL, 'transport', '交通', '🚗', '#B5EAD7', 'expense', 20, TRUE, TRUE),
(NULL, 'shopping', '购物', '🛒', '#FFF0F5', 'expense', 30, TRUE, TRUE),
(NULL, 'entertainment', '娱乐', '🎮', '#E2D1F9', 'expense', 40, TRUE, TRUE),
(NULL, 'living', '居住', '🏠', '#FFF8DC', 'expense', 50, TRUE, TRUE),
(NULL, 'communication', '通讯', '📱', '#A8D8EA', 'expense', 60, TRUE, TRUE),
(NULL, 'medical', '医疗', '💊', '#FFB7A5', 'expense', 70, TRUE, TRUE),
(NULL, 'other', '其他', '📦', '#E5E5EA', 'expense', 80, TRUE, TRUE),
(NULL, 'salary', '工资收入', '💰', '#B5EAD7', 'income', 110, TRUE, TRUE),
(NULL, 'other_income', '其他收入', '✨', '#FFF8DC', 'income', 120, TRUE, TRUE);

-- =========================================================
-- 初始化数据：餐饮子分类
-- =========================================================
INSERT INTO category_subcategories (category_id, code, name, icon, sort_order, is_active)
SELECT id, 'breakfast', '早餐', '🥐', 10, TRUE FROM categories WHERE user_id IS NULL AND code = 'food';

INSERT INTO category_subcategories (category_id, code, name, icon, sort_order, is_active)
SELECT id, 'lunch', '午餐', '🍱', 20, TRUE FROM categories WHERE user_id IS NULL AND code = 'food';

INSERT INTO category_subcategories (category_id, code, name, icon, sort_order, is_active)
SELECT id, 'dinner', '晚餐', '🍲', 30, TRUE FROM categories WHERE user_id IS NULL AND code = 'food';

INSERT INTO category_subcategories (category_id, code, name, icon, sort_order, is_active)
SELECT id, 'takeout', '外卖', '🥡', 40, TRUE FROM categories WHERE user_id IS NULL AND code = 'food';

INSERT INTO category_subcategories (category_id, code, name, icon, sort_order, is_active)
SELECT id, 'snack', '零食', '🍿', 50, TRUE FROM categories WHERE user_id IS NULL AND code = 'food';

INSERT INTO category_subcategories (category_id, code, name, icon, sort_order, is_active)
SELECT id, 'drink', '饮品', '🧋', 60, TRUE FROM categories WHERE user_id IS NULL AND code = 'food';

INSERT INTO category_subcategories (category_id, code, name, icon, sort_order, is_active)
SELECT id, 'social', '聚餐', '🥂', 70, TRUE FROM categories WHERE user_id IS NULL AND code = 'food';

-- =========================================================
-- 初始化数据：支付账户类型
-- =========================================================
INSERT INTO payment_account_types (code, name, icon, sort_order, is_active) VALUES
('wechat', '微信支付', '💬', 10, TRUE),
('alipay', '支付宝', '🔵', 20, TRUE),
('bank_card', '银行卡', '💳', 30, TRUE),
('cash', '现金', '💵', 40, TRUE),
('credit_card', '信用卡', '💳', 50, TRUE),
('bank_transfer', '银行转账', '🏦', 60, TRUE),
('other', '其他', '📦', 90, TRUE);

-- =========================================================
-- 统计视图：每日收支汇总
-- =========================================================
CREATE VIEW v_daily_transaction_summary AS
SELECT
  user_id,
  transaction_date,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense_amount,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income_amount,
  SUM(CASE WHEN type = 'expense' THEN 1 ELSE 0 END) AS expense_count,
  SUM(CASE WHEN type = 'income' THEN 1 ELSE 0 END) AS income_count,
  COUNT(*) AS transaction_count
FROM transactions
WHERE deleted_at IS NULL
GROUP BY user_id, transaction_date;

-- =========================================================
-- 统计视图：月度分类汇总
-- =========================================================
CREATE VIEW v_monthly_category_summary AS
SELECT
  t.user_id,
  DATE_SUB(t.transaction_date, INTERVAL DAYOFMONTH(t.transaction_date) - 1 DAY) AS month_start,
  t.type,
  t.category_id,
  c.code AS category_code,
  c.name AS category_name,
  c.icon AS category_icon,
  c.color AS category_color,
  SUM(t.amount) AS total_amount,
  COUNT(*) AS transaction_count,
  ROUND(AVG(t.amount), 2) AS avg_amount
FROM transactions t
JOIN categories c ON c.id = t.category_id
WHERE t.deleted_at IS NULL
GROUP BY
  t.user_id,
  DATE_SUB(t.transaction_date, INTERVAL DAYOFMONTH(t.transaction_date) - 1 DAY),
  t.type,
  t.category_id,
  c.code,
  c.name,
  c.icon,
  c.color;

-- =========================================================
-- 统计视图：月度用户汇总
-- =========================================================
CREATE VIEW v_monthly_user_summary AS
SELECT
  user_id,
  DATE_SUB(transaction_date, INTERVAL DAYOFMONTH(transaction_date) - 1 DAY) AS month_start,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense_amount,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income_amount,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)
    - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance_amount,
  COUNT(*) AS transaction_count
FROM transactions
WHERE deleted_at IS NULL
GROUP BY
  user_id,
  DATE_SUB(transaction_date, INTERVAL DAYOFMONTH(transaction_date) - 1 DAY);

-- =========================================================
-- 验证建议：
-- SHOW FULL TABLES;
-- SELECT code, name, icon, type, sort_order FROM categories ORDER BY sort_order;
-- SELECT s.code, s.name, s.icon FROM category_subcategories s JOIN categories c ON s.category_id = c.id WHERE c.code = 'food' ORDER BY s.sort_order;
-- SELECT code, name, sort_order FROM payment_account_types ORDER BY sort_order;
-- =========================================================
