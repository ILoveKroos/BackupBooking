-- Migration: Add Zalo Notification Logs Table
-- Description: Creates table to store sent and simulated Zalo notifications.

USE booking_system;

CREATE TABLE IF NOT EXISTS zalo_notification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    template_id VARCHAR(100) NOT NULL,
    message_body TEXT NOT NULL,
    status ENUM('sent', 'failed', 'simulated') NOT NULL DEFAULT 'simulated',
    response_payload TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm chỉ mục để tìm kiếm theo số điện thoại nhanh hơn
CREATE INDEX idx_zalo_logs_phone ON zalo_notification_logs(phone);
