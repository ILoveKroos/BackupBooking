USE booking_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE vouchers
  MODIFY COLUMN customer_type ENUM('regular', 'vip', 'vvip', 'vvvip', 'both') NOT NULL DEFAULT 'both';

SET @has_va_source := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'source'
);
SET @sql_va_source := IF(
  @has_va_source = 0,
  'ALTER TABLE voucher_assignments ADD COLUMN source ENUM(''admin'', ''system'', ''bot'') NOT NULL DEFAULT ''admin'' AFTER status',
  'SELECT ''voucher_assignments.source already exists'''
);
PREPARE stmt_va_source FROM @sql_va_source;
EXECUTE stmt_va_source;
DEALLOCATE PREPARE stmt_va_source;

SET @has_va_reason := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'reason'
);
SET @sql_va_reason := IF(
  @has_va_reason = 0,
  'ALTER TABLE voucher_assignments ADD COLUMN reason VARCHAR(255) NULL AFTER source',
  'SELECT ''voucher_assignments.reason already exists'''
);
PREPARE stmt_va_reason FROM @sql_va_reason;
EXECUTE stmt_va_reason;
DEALLOCATE PREPARE stmt_va_reason;

SET @has_va_confidence_score := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'confidence_score'
);
SET @sql_va_confidence_score := IF(
  @has_va_confidence_score = 0,
  'ALTER TABLE voucher_assignments ADD COLUMN confidence_score FLOAT NULL AFTER reason',
  'SELECT ''voucher_assignments.confidence_score already exists'''
);
PREPARE stmt_va_confidence_score FROM @sql_va_confidence_score;
EXECUTE stmt_va_confidence_score;
DEALLOCATE PREPARE stmt_va_confidence_score;

SET @has_va_shown_date := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'shown_date'
);
SET @sql_va_shown_date := IF(
  @has_va_shown_date = 0,
  'ALTER TABLE voucher_assignments ADD COLUMN shown_date TIMESTAMP NULL AFTER confidence_score',
  'SELECT ''voucher_assignments.shown_date already exists'''
);
PREPARE stmt_va_shown_date FROM @sql_va_shown_date;
EXECUTE stmt_va_shown_date;
DEALLOCATE PREPARE stmt_va_shown_date;

SET @has_va_clicked := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'clicked'
);
SET @sql_va_clicked := IF(
  @has_va_clicked = 0,
  'ALTER TABLE voucher_assignments ADD COLUMN clicked TINYINT(1) NOT NULL DEFAULT 0 AFTER shown_date',
  'SELECT ''voucher_assignments.clicked already exists'''
);
PREPARE stmt_va_clicked FROM @sql_va_clicked;
EXECUTE stmt_va_clicked;
DEALLOCATE PREPARE stmt_va_clicked;

SET @has_va_applied := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'applied'
);
SET @sql_va_applied := IF(
  @has_va_applied = 0,
  'ALTER TABLE voucher_assignments ADD COLUMN applied TINYINT(1) NOT NULL DEFAULT 0 AFTER clicked',
  'SELECT ''voucher_assignments.applied already exists'''
);
PREPARE stmt_va_applied FROM @sql_va_applied;
EXECUTE stmt_va_applied;
DEALLOCATE PREPARE stmt_va_applied;

SET @has_va_last_appointment_id := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'last_appointment_id'
);
SET @sql_va_last_appointment_id := IF(
  @has_va_last_appointment_id = 0,
  'ALTER TABLE voucher_assignments ADD COLUMN last_appointment_id INT NULL AFTER applied',
  'SELECT ''voucher_assignments.last_appointment_id already exists'''
);
PREPARE stmt_va_last_appointment_id FROM @sql_va_last_appointment_id;
EXECUTE stmt_va_last_appointment_id;
DEALLOCATE PREPARE stmt_va_last_appointment_id;

SET @has_va_last_discount_applied := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'last_discount_applied'
);
SET @sql_va_last_discount_applied := IF(
  @has_va_last_discount_applied = 0,
  'ALTER TABLE voucher_assignments ADD COLUMN last_discount_applied DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER last_appointment_id',
  'SELECT ''voucher_assignments.last_discount_applied already exists'''
);
PREPARE stmt_va_last_discount_applied FROM @sql_va_last_discount_applied;
EXECUTE stmt_va_last_discount_applied;
DEALLOCATE PREPARE stmt_va_last_discount_applied;

SET @has_va_total_discount_applied := (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND COLUMN_NAME = 'total_discount_applied'
);
SET @sql_va_total_discount_applied := IF(
  @has_va_total_discount_applied = 0,
  'ALTER TABLE voucher_assignments ADD COLUMN total_discount_applied DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER last_discount_applied',
  'SELECT ''voucher_assignments.total_discount_applied already exists'''
);
PREPARE stmt_va_total_discount_applied FROM @sql_va_total_discount_applied;
EXECUTE stmt_va_total_discount_applied;
DEALLOCATE PREPARE stmt_va_total_discount_applied;

SET @has_idx_va_source := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND INDEX_NAME = 'idx_voucher_assignments_source'
);
SET @sql_idx_va_source := IF(
  @has_idx_va_source = 0,
  'ALTER TABLE voucher_assignments ADD INDEX idx_voucher_assignments_source (source)',
  'SELECT ''idx_voucher_assignments_source already exists'''
);
PREPARE stmt_idx_va_source FROM @sql_idx_va_source;
EXECUTE stmt_idx_va_source;
DEALLOCATE PREPARE stmt_idx_va_source;

SET @has_idx_va_shown_date := (
  SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_assignments'
    AND INDEX_NAME = 'idx_voucher_assignments_shown_date'
);
SET @sql_idx_va_shown_date := IF(
  @has_idx_va_shown_date = 0,
  'ALTER TABLE voucher_assignments ADD INDEX idx_voucher_assignments_shown_date (shown_date)',
  'SELECT ''idx_voucher_assignments_shown_date already exists'''
);
PREPARE stmt_idx_va_shown_date FROM @sql_idx_va_shown_date;
EXECUTE stmt_idx_va_shown_date;
DEALLOCATE PREPARE stmt_idx_va_shown_date;

SET @has_voucher_usage_history := (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_usage_history'
);
SET @migrate_usage_sql := IF(
  @has_voucher_usage_history > 0,
  'UPDATE voucher_assignments va
   JOIN (
     SELECT
       assignment_id,
       COUNT(*) AS history_usage_count,
       MAX(used_date) AS history_last_used_date,
       COALESCE(SUM(discount_applied), 0) AS history_total_discount
     FROM voucher_usage_history
     WHERE assignment_id IS NOT NULL
     GROUP BY assignment_id
   ) h ON h.assignment_id = va.id
   SET
     va.usage_count = GREATEST(va.usage_count, h.history_usage_count),
     va.last_used_date = COALESCE(va.last_used_date, h.history_last_used_date),
     va.total_discount_applied = GREATEST(va.total_discount_applied, h.history_total_discount),
     va.applied = IF(h.history_usage_count > 0, 1, va.applied),
     va.is_used = CASE
       WHEN GREATEST(va.usage_count, h.history_usage_count) >= va.max_usage_customer THEN 1
       ELSE va.is_used
     END,
     va.status = CASE
       WHEN GREATEST(va.usage_count, h.history_usage_count) >= va.max_usage_customer THEN ''used''
       ELSE va.status
     END',
  'SELECT ''voucher_usage_history not found'''
);
PREPARE migrate_usage_stmt FROM @migrate_usage_sql;
EXECUTE migrate_usage_stmt;
DEALLOCATE PREPARE migrate_usage_stmt;

SET @has_voucher_suggestions := (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'voucher_suggestions'
);
SET @migrate_suggestions_sql := IF(
  @has_voucher_suggestions > 0,
  'UPDATE voucher_assignments va
   JOIN (
     SELECT
       customer_id,
       voucher_id,
       MAX(reason) AS reason,
       MAX(confidence_score) AS confidence_score,
       MAX(shown_date) AS shown_date,
       MAX(clicked) AS clicked,
       MAX(applied) AS applied
     FROM voucher_suggestions
     GROUP BY customer_id, voucher_id
   ) s ON s.customer_id = va.customer_id AND s.voucher_id = va.voucher_id
   SET
     va.source = IF(va.source = ''admin'', ''bot'', va.source),
     va.reason = COALESCE(va.reason, s.reason),
     va.confidence_score = COALESCE(va.confidence_score, s.confidence_score),
     va.shown_date = COALESCE(va.shown_date, s.shown_date),
     va.clicked = GREATEST(va.clicked, s.clicked),
     va.applied = GREATEST(va.applied, s.applied)',
  'SELECT ''voucher_suggestions not found'''
);
PREPARE migrate_suggestions_stmt FROM @migrate_suggestions_sql;
EXECUTE migrate_suggestions_stmt;
DEALLOCATE PREPARE migrate_suggestions_stmt;

UPDATE vouchers v
LEFT JOIN (
  SELECT voucher_id, COALESCE(SUM(usage_count), 0) AS total_usage
  FROM voucher_assignments
  GROUP BY voucher_id
) va ON va.voucher_id = v.id
SET v.current_usage = COALESCE(va.total_usage, 0);

DROP TABLE IF EXISTS voucher_suggestions;
DROP TABLE IF EXISTS voucher_usage_history;
