USE booking_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @va_customer_fk := (
  SELECT CONSTRAINT_NAME
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'customer_id'
    AND REFERENCED_TABLE_NAME IS NOT NULL
  LIMIT 1
);
SET @sql_drop_va_customer_fk := IF(
  @va_customer_fk IS NULL,
  'SELECT ''voucher_assignments.customer_id foreign key not found''',
  CONCAT('ALTER TABLE voucher_assignments DROP FOREIGN KEY `', REPLACE(@va_customer_fk, '`', '``'), '`')
);
PREPARE stmt_drop_va_customer_fk FROM @sql_drop_va_customer_fk;
EXECUTE stmt_drop_va_customer_fk;
DEALLOCATE PREPARE stmt_drop_va_customer_fk;

SET @has_va_customer_id := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'customer_id'
);
SET @has_va_user_id := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'user_id'
);
SET @sql_rename_va_customer_id := IF(
  @has_va_customer_id > 0 AND @has_va_user_id = 0,
  'ALTER TABLE voucher_assignments CHANGE COLUMN customer_id user_id INT NOT NULL',
  'SELECT ''voucher_assignments.user_id already ready'''
);
PREPARE stmt_rename_va_customer_id FROM @sql_rename_va_customer_id;
EXECUTE stmt_rename_va_customer_id;
DEALLOCATE PREPARE stmt_rename_va_customer_id;

SET @has_uniq_voucher_customer := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND INDEX_NAME = 'uniq_voucher_customer'
);
SET @has_uniq_voucher_user := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND INDEX_NAME = 'uniq_voucher_user'
);
SET @sql_drop_uniq_voucher_customer := IF(
  @has_uniq_voucher_customer > 0 AND @has_uniq_voucher_user = 0,
  'ALTER TABLE voucher_assignments DROP INDEX uniq_voucher_customer',
  'SELECT ''uniq_voucher_customer already dropped'''
);
PREPARE stmt_drop_uniq_voucher_customer FROM @sql_drop_uniq_voucher_customer;
EXECUTE stmt_drop_uniq_voucher_customer;
DEALLOCATE PREPARE stmt_drop_uniq_voucher_customer;

SET @has_uniq_voucher_user_after_drop := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND INDEX_NAME = 'uniq_voucher_user'
);
SET @sql_add_uniq_voucher_user := IF(
  @has_va_user_id > 0 AND @has_uniq_voucher_user_after_drop = 0,
  'ALTER TABLE voucher_assignments ADD UNIQUE KEY uniq_voucher_user (voucher_id, user_id)',
  'SELECT ''uniq_voucher_user already ready'''
);
PREPARE stmt_add_uniq_voucher_user FROM @sql_add_uniq_voucher_user;
EXECUTE stmt_add_uniq_voucher_user;
DEALLOCATE PREPARE stmt_add_uniq_voucher_user;

SET @has_idx_voucher_customer := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND INDEX_NAME = 'idx_voucher_assignments_customer'
);
SET @has_idx_voucher_user := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND INDEX_NAME = 'idx_voucher_assignments_user'
);
SET @sql_drop_idx_voucher_customer := IF(
  @has_idx_voucher_customer > 0 AND @has_idx_voucher_user = 0,
  'ALTER TABLE voucher_assignments DROP INDEX idx_voucher_assignments_customer',
  'SELECT ''idx_voucher_assignments_customer already dropped'''
);
PREPARE stmt_drop_idx_voucher_customer FROM @sql_drop_idx_voucher_customer;
EXECUTE stmt_drop_idx_voucher_customer;
DEALLOCATE PREPARE stmt_drop_idx_voucher_customer;

SET @has_idx_voucher_user_after_drop := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND INDEX_NAME = 'idx_voucher_assignments_user'
);
SET @sql_add_idx_voucher_user := IF(
  @has_va_user_id > 0 AND @has_idx_voucher_user_after_drop = 0,
  'ALTER TABLE voucher_assignments ADD INDEX idx_voucher_assignments_user (user_id)',
  'SELECT ''idx_voucher_assignments_user already ready'''
);
PREPARE stmt_add_idx_voucher_user FROM @sql_add_idx_voucher_user;
EXECUTE stmt_add_idx_voucher_user;
DEALLOCATE PREPARE stmt_add_idx_voucher_user;

SET @has_va_user_id_after := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'user_id'
);
SET @has_va_user_fk := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'user_id'
    AND REFERENCED_TABLE_NAME = 'users'
    AND REFERENCED_COLUMN_NAME = 'id'
);
SET @sql_add_va_user_fk := IF(
  @has_va_user_id_after > 0 AND @has_va_user_fk = 0,
  'ALTER TABLE voucher_assignments ADD CONSTRAINT fk_voucher_assignments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE',
  'SELECT ''voucher_assignments.user_id foreign key already ready'''
);
PREPARE stmt_add_va_user_fk FROM @sql_add_va_user_fk;
EXECUTE stmt_add_va_user_fk;
DEALLOCATE PREPARE stmt_add_va_user_fk;
