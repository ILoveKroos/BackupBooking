USE booking_system;

SET @has_staff_role_table := (
  SELECT COUNT(*)
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'staff_role'
);
SET @sql_create_staff_role_table := IF(
  @has_staff_role_table = 0,
  'CREATE TABLE staff_role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci',
  'SELECT "staff_role table already exists"'
);
PREPARE stmt_create_staff_role_table FROM @sql_create_staff_role_table;
EXECUTE stmt_create_staff_role_table;
DEALLOCATE PREPARE stmt_create_staff_role_table;

SET @has_users_staff_role_id := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'staff_role_id'
);
SET @sql_users_staff_role_id := IF(
  @has_users_staff_role_id = 0,
  'ALTER TABLE users ADD COLUMN staff_role_id INT NULL AFTER role',
  'SELECT "users.staff_role_id already exists"'
);
PREPARE stmt_users_staff_role_id FROM @sql_users_staff_role_id;
EXECUTE stmt_users_staff_role_id;
DEALLOCATE PREPARE stmt_users_staff_role_id;

SET @has_users_staff_role_fk := (
  SELECT COUNT(*)
  FROM information_schema.KEY_COLUMN_USAGE
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'staff_role_id'
    AND REFERENCED_TABLE_NAME = 'staff_role'
);
SET @sql_users_staff_role_fk := IF(
  @has_users_staff_role_fk = 0,
  'ALTER TABLE users ADD CONSTRAINT fk_users_staff_role FOREIGN KEY (staff_role_id) REFERENCES staff_role(id)',
  'SELECT "fk_users_staff_role already exists"'
);
PREPARE stmt_users_staff_role_fk FROM @sql_users_staff_role_fk;
EXECUTE stmt_users_staff_role_fk;
DEALLOCATE PREPARE stmt_users_staff_role_fk;
