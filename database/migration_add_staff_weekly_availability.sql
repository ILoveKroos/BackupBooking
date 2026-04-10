USE booking_system;

CREATE TABLE IF NOT EXISTS staff_weekly_availability (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  day_of_week TINYINT NOT NULL COMMENT '0=Monday ... 6=Sunday (matches MySQL WEEKDAY)',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  INDEX idx_staff_week (staff_id, day_of_week),
  CONSTRAINT fk_swa_staff FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
