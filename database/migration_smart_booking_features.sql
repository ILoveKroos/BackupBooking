-- Migration: Smart Booking Features
-- Adds columns for Customer Clustering, cancellation scoring, sentiment tracking, and appointment reminders

-- 1. Users table: Customer clustering & classification
ALTER TABLE users ADD COLUMN IF NOT EXISTS customer_segment VARCHAR(30) DEFAULT 'New';
ALTER TABLE users ADD COLUMN IF NOT EXISTS rfm_score VARCHAR(10) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rfm_updated_at TIMESTAMP NULL DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cancellation_count INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cancellation_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS noshow_count INT DEFAULT 0;

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

-- 2. Appointments table: reminder tracking
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_sent TINYINT(1) DEFAULT 0;

-- 3. Chat messages: sentiment analysis
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20) DEFAULT NULL;
ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS escalated TINYINT(1) DEFAULT 0;

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_segment ON users(customer_segment);
CREATE INDEX IF NOT EXISTS idx_appointments_reminder ON appointments(appointment_date, appointment_time, reminder_sent);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sentiment ON chat_messages(sentiment);
