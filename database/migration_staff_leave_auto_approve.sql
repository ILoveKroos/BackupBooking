-- Staff leave is effective immediately. Existing pending leave rows should also block scheduling.
USE booking_system;

SET @staff_leave_table_exists := (
  SELECT COUNT(*)
  FROM information_schema.tables
  WHERE table_schema = DATABASE()
    AND table_name = 'staff_leave_requests'
);

SET @staff_leave_status_column_exists := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'staff_leave_requests'
    AND column_name = 'status'
);

SET @staff_leave_alter_status_sql := IF(
  @staff_leave_status_column_exists > 0,
  'ALTER TABLE staff_leave_requests MODIFY COLUMN status ENUM(''pending'', ''approved'', ''rejected'') NOT NULL DEFAULT ''approved''',
  'SELECT ''staff_leave_requests.status column not found; skipped default update'' AS message'
);

PREPARE staff_leave_alter_status_stmt FROM @staff_leave_alter_status_sql;
EXECUTE staff_leave_alter_status_stmt;
DEALLOCATE PREPARE staff_leave_alter_status_stmt;

SET @staff_leave_promote_pending_sql := IF(
  @staff_leave_table_exists > 0,
  'UPDATE staff_leave_requests SET status = ''approved'' WHERE status = ''pending''',
  'SELECT ''staff_leave_requests table not found; skipped pending leave promotion'' AS message'
);

PREPARE staff_leave_promote_pending_stmt FROM @staff_leave_promote_pending_sql;
EXECUTE staff_leave_promote_pending_stmt;
DEALLOCATE PREPARE staff_leave_promote_pending_stmt;
