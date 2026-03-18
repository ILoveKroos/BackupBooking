USE booking_system;

-- Add users.is_active if missing
SET @has_users_is_active := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'is_active'
);
SET @sql_users_is_active := IF(
  @has_users_is_active = 0,
  'ALTER TABLE users ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1 AFTER role',
  'SELECT "users.is_active already exists"'
);
PREPARE stmt_users_is_active FROM @sql_users_is_active;
EXECUTE stmt_users_is_active;
DEALLOCATE PREPARE stmt_users_is_active;

-- Add appointments.staff_id if missing
SET @has_appointments_staff_id := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND COLUMN_NAME = 'staff_id'
);
SET @sql_appointments_staff_id := IF(
  @has_appointments_staff_id = 0,
  'ALTER TABLE appointments ADD COLUMN staff_id INT NULL AFTER service_id',
  'SELECT "appointments.staff_id already exists"'
);
PREPARE stmt_appointments_staff_id FROM @sql_appointments_staff_id;
EXECUTE stmt_appointments_staff_id;
DEALLOCATE PREPARE stmt_appointments_staff_id;

-- Add index for fast availability lookup
SET @has_staff_slot_index := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND INDEX_NAME = 'idx_appointments_staff_slot'
);
SET @sql_staff_slot_index := IF(
  @has_staff_slot_index = 0,
  'ALTER TABLE appointments ADD INDEX idx_appointments_staff_slot (staff_id, appointment_date, appointment_time, status)',
  'SELECT "idx_appointments_staff_slot already exists"'
);
PREPARE stmt_staff_slot_index FROM @sql_staff_slot_index;
EXECUTE stmt_staff_slot_index;
DEALLOCATE PREPARE stmt_staff_slot_index;

-- Add FK from appointments.staff_id -> users.id if missing
SET @has_staff_fk := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'appointments'
    AND COLUMN_NAME = 'staff_id'
    AND REFERENCED_TABLE_NAME = 'users'
);
SET @sql_staff_fk := IF(
  @has_staff_fk = 0,
  'ALTER TABLE appointments ADD CONSTRAINT fk_appointments_staff FOREIGN KEY (staff_id) REFERENCES users(id)',
  'SELECT "fk_appointments_staff already exists"'
);
PREPARE stmt_staff_fk FROM @sql_staff_fk;
EXECUTE stmt_staff_fk;
DEALLOCATE PREPARE stmt_staff_fk;
