USE booking_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

SET @has_users_cancellation_rate := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'cancellation_rate'
);

SET @sql_users_cancellation_rate := IF(
  @has_users_cancellation_rate = 0,
  'ALTER TABLE users ADD COLUMN cancellation_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER cancellation_count',
  'SELECT "users.cancellation_rate already exists"'
);

PREPARE stmt_users_cancellation_rate FROM @sql_users_cancellation_rate;
EXECUTE stmt_users_cancellation_rate;
DEALLOCATE PREPARE stmt_users_cancellation_rate;

UPDATE users u
LEFT JOIN (
  SELECT
    user_id,
    COUNT(*) AS total_bookings,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings
  FROM appointments
  GROUP BY user_id
) stats ON stats.user_id = u.id
SET
  u.cancellation_count = COALESCE(stats.cancelled_bookings, 0),
  u.cancellation_rate = CASE
    WHEN COALESCE(stats.total_bookings, 0) = 0 THEN 0
    ELSE LEAST(100, GREATEST(0, ROUND(COALESCE(stats.cancelled_bookings, 0) * 100.0 / stats.total_bookings, 2)))
  END
WHERE u.role = 'customer';
