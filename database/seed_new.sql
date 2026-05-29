USE booking_system;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT IGNORE INTO staff_role (role_name)
VALUES
  ('Nhân viên'),
  ('Thu ngân');

INSERT IGNORE INTO service_category (category_name)
VALUES
  ('Tóc'),
  ('Móng'),
  ('Chăm sóc da'),
  ('Massage'),
  ('Mi & Mày'),
  ('Trang điểm');

DELETE FROM users
WHERE email IN (
  'admin@example.com',
  'customer@example.com',
  'staff1@example.com',
  'staff2@example.com',
  'staff3@example.com'
);
INSERT INTO users (name, email, password, phone, role, created_at)
VALUES
  ('Admin Demo', 'admin@example.com', '$2a$10$h8z47WDz93kpQiWT4WtmFu8ML40EhcWp6cqN2SNxcBOCaQPEJGYFu', '0900000000', 'admin', NOW()),
  ('Customer Demo', 'customer@example.com', '$2a$10$c.w5r4w2oUHeEFKlNHN10uBCLM/k0vP3jTqspYkNYvvfCMNkxN2HO', '0911111111', 'customer', NOW()),
  ('Linh Tran', 'staff1@example.com', 'staff123456', '0922222222', 'staff', NOW()),
  ('Quynh Nguyen', 'staff2@example.com', '$2a$10$h8z47WDz93kpQiWT4WtmFu8ML40EhcWp6cqN2SNxcBOCaQPEJGYFu', '0933333333', 'staff', NOW()),
  ('Thao Le', 'staff3@example.com', '$2a$10$h8z47WDz93kpQiWT4WtmFu8ML40EhcWp6cqN2SNxcBOCaQPEJGYFu', '0944444444', 'staff', NOW());

UPDATE users
SET staff_role_id = (SELECT id FROM staff_role WHERE role_name = 'Nhân viên' LIMIT 1)
WHERE email IN ('staff1@example.com', 'staff2@example.com');

UPDATE users
SET staff_role_id = (SELECT id FROM staff_role WHERE role_name = 'Thu ngân' LIMIT 1)
WHERE email = 'staff3@example.com';

DELETE FROM services
WHERE name IN (
  'Express Blowout',
  'Signature Haircut & Styling',
  'Premium Hair Color',
  'Scalp Detox Therapy',
  'Gel Manicure',
  'Lash Lift & Tint',
  'Brow Lamination',
  'Hydrating Facial Ritual',
  'Deep Tissue Massage',
  'Bridal Makeup Trial',
  'Gội tạo kiểu tóc nhanh',
  'Cắt tóc tạo kiểu cao cấp',
  'Nhuộm tóc cao cấp',
  'Thải độc da đầu thư giãn',
  'Sơn gel chăm sóc móng',
  'Nâng mi và nhuộm mi',
  'Định hình chân mày',
  'Chăm sóc da cấp ẩm chuyên sâu',
  'Massage mô sâu thư giãn',
  'Trang điểm thử cô dâu'
);

INSERT INTO services (name, price, duration, description, category, image_url, status, created_at)
VALUES
  (
    'Gội tạo kiểu tóc nhanh',
    280000,
    30,
    'Gội tạo kiểu tóc nhanh cho lịch họp và sự kiện gấp.',
    'Tóc',
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80',
    'active',
    NOW()
  ),
  (
    'Cắt tóc tạo kiểu cao cấp',
    450000,
    60,
    'Cắt, chăm sóc và tạo kiểu tóc theo phong cách cá nhân.',
    'Tóc',
    'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1200&q=80',
    'active',
    NOW()
  ),
  (
    'Nhuộm tóc cao cấp',
    950000,
    120,
    'Nhuộm tóc và cân bằng tông màu cao cấp, kèm phục hồi nền tóc.',
    'Tóc',
    'https://images.unsplash.com/photo-1487412912498-0447578fcca8?auto=format&fit=crop&w=1200&q=80',
    'active',
    NOW()
  ),
  (
    'Thải độc da đầu thư giãn',
    560000,
    60,
    'Làm sạch sâu da đầu và massage kích thích lưu thông.',
    'Tóc',
    'https://images.unsplash.com/photo-1500840216050-6ffa99d75160?auto=format&fit=crop&w=1200&q=80',
    'active',
    NOW()
  ),
  (
    'Sơn gel chăm sóc móng',
    320000,
    45,
    'Làm sạch móng, tạo form và sơn gel bền màu.',
    'Móng',
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80',
    'active',
    NOW()
  ),
  (
    'Nâng mi và nhuộm mi',
    520000,
    75,
    'Nâng mi và phủ màu tự nhiên theo phong cách boutique.',
    'Mi & Mày',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80',
    'active',
    NOW()
  ),
  (
    'Định hình chân mày',
    480000,
    60,
    'Định hình lông mày, giữ nếp đẹp và gọn gàng.',
    'Mi & Mày',
    'https://images.unsplash.com/photo-1620331311520-246422fd82f9?auto=format&fit=crop&w=1200&q=80',
    'active',
    NOW()
  ),
  (
    'Chăm sóc da cấp ẩm chuyên sâu',
    680000,
    75,
    'Dưỡng ẩm sâu, làm dịu da và phục hồi độ căng bóng.',
    'Chăm sóc da',
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80',
    'active',
    NOW()
  ),
  (
    'Massage mô sâu thư giãn',
    750000,
    90,
    'Massage mô sâu giảm căng cơ và phục hồi năng lượng.',
    'Massage',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    'active',
    NOW()
  ),
  (
    'Trang điểm thử cô dâu',
    1200000,
    120,
    'Trang điểm thử theo concept cho sự kiện cưới.',
    'Trang điểm',
    'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80',
    'active',
    NOW()
  );

-- ===== APPOINTMENT SEED DATA (cho xu hướng) =====
SET @cust_id = (SELECT id FROM users WHERE email = 'customer@example.com' LIMIT 1);
SET @staff_id = (SELECT id FROM users WHERE email = 'staff1@example.com' LIMIT 1);
SET @svc1 = (SELECT id FROM services WHERE name = 'Gội tạo kiểu tóc nhanh' LIMIT 1);
SET @svc2 = (SELECT id FROM services WHERE name = 'Cắt tóc tạo kiểu cao cấp' LIMIT 1);
SET @svc3 = (SELECT id FROM services WHERE name = 'Nhuộm tóc cao cấp' LIMIT 1);
SET @svc4 = (SELECT id FROM services WHERE name = 'Sơn gel chăm sóc móng' LIMIT 1);
SET @svc5 = (SELECT id FROM services WHERE name = 'Nâng mi và nhuộm mi' LIMIT 1);
SET @svc6 = (SELECT id FROM services WHERE name = 'Chăm sóc da cấp ẩm chuyên sâu' LIMIT 1);
SET @svc7 = (SELECT id FROM services WHERE name = 'Massage mô sâu thư giãn' LIMIT 1);
SET @svc8 = (SELECT id FROM services WHERE name = 'Trang điểm thử cô dâu' LIMIT 1);

INSERT INTO appointments (user_id, service_id, staff_id, appointment_date, appointment_time, end_time, status, total_amount, staff_rating, created_at)
VALUES
  -- Tóc: Gội tạo kiểu - 8 lượt
  (@cust_id, @svc1, @staff_id, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '09:00:00', '09:30:00', 'completed', 280000, 5, DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (@cust_id, @svc1, @staff_id, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '10:00:00', '10:30:00', 'completed', 280000, 4, DATE_SUB(NOW(), INTERVAL 7 DAY)),
  (@cust_id, @svc1, @staff_id, DATE_SUB(CURDATE(), INTERVAL 12 DAY), '14:00:00', '14:30:00', 'completed', 280000, 5, DATE_SUB(NOW(), INTERVAL 12 DAY)),
  (@cust_id, @svc1, @staff_id, DATE_SUB(CURDATE(), INTERVAL 18 DAY), '11:00:00', '11:30:00', 'completed', 280000, 5, DATE_SUB(NOW(), INTERVAL 18 DAY)),
  (@cust_id, @svc1, @staff_id, DATE_SUB(CURDATE(), INTERVAL 22 DAY), '15:00:00', '15:30:00', 'completed', 280000, 4, DATE_SUB(NOW(), INTERVAL 22 DAY)),
  (@cust_id, @svc1, @staff_id, DATE_SUB(CURDATE(), INTERVAL 25 DAY), '09:30:00', '10:00:00', 'completed', 280000, 5, DATE_SUB(NOW(), INTERVAL 25 DAY)),
  (@cust_id, @svc1, @staff_id, DATE_SUB(CURDATE(), INTERVAL 28 DAY), '16:00:00', '16:30:00', 'completed', 280000, 4, DATE_SUB(NOW(), INTERVAL 28 DAY)),
  (@cust_id, @svc1, @staff_id, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', '10:30:00', 'confirmed', 280000, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),

  -- Tóc: Cắt tóc tạo kiểu - 6 lượt
  (@cust_id, @svc2, @staff_id, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '13:00:00', '14:00:00', 'completed', 450000, 5, DATE_SUB(NOW(), INTERVAL 5 DAY)),
  (@cust_id, @svc2, @staff_id, DATE_SUB(CURDATE(), INTERVAL 10 DAY), '09:00:00', '10:00:00', 'completed', 450000, 5, DATE_SUB(NOW(), INTERVAL 10 DAY)),
  (@cust_id, @svc2, @staff_id, DATE_SUB(CURDATE(), INTERVAL 15 DAY), '14:00:00', '15:00:00', 'completed', 450000, 4, DATE_SUB(NOW(), INTERVAL 15 DAY)),
  (@cust_id, @svc2, @staff_id, DATE_SUB(CURDATE(), INTERVAL 20 DAY), '10:00:00', '11:00:00', 'completed', 450000, 5, DATE_SUB(NOW(), INTERVAL 20 DAY)),
  (@cust_id, @svc2, @staff_id, DATE_SUB(CURDATE(), INTERVAL 26 DAY), '15:00:00', '16:00:00', 'completed', 450000, 5, DATE_SUB(NOW(), INTERVAL 26 DAY)),
  (@cust_id, @svc2, @staff_id, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '11:00:00', '12:00:00', 'pending', 450000, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY)),

  -- Tóc: Nhuộm tóc - 4 lượt
  (@cust_id, @svc3, @staff_id, DATE_SUB(CURDATE(), INTERVAL 8 DAY), '09:00:00', '11:00:00', 'completed', 950000, 5, DATE_SUB(NOW(), INTERVAL 8 DAY)),
  (@cust_id, @svc3, @staff_id, DATE_SUB(CURDATE(), INTERVAL 16 DAY), '13:00:00', '15:00:00', 'completed', 950000, 4, DATE_SUB(NOW(), INTERVAL 16 DAY)),
  (@cust_id, @svc3, @staff_id, DATE_SUB(CURDATE(), INTERVAL 24 DAY), '10:00:00', '12:00:00', 'completed', 950000, 5, DATE_SUB(NOW(), INTERVAL 24 DAY)),
  (@cust_id, @svc3, @staff_id, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '14:00:00', '16:00:00', 'confirmed', 950000, NULL, DATE_SUB(NOW(), INTERVAL 4 DAY)),

  -- Móng: Sơn gel - 7 lượt
  (@cust_id, @svc4, @staff_id, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '10:00:00', '10:45:00', 'completed', 320000, 5, DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (@cust_id, @svc4, @staff_id, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '14:00:00', '14:45:00', 'completed', 320000, 5, DATE_SUB(NOW(), INTERVAL 6 DAY)),
  (@cust_id, @svc4, @staff_id, DATE_SUB(CURDATE(), INTERVAL 11 DAY), '09:00:00', '09:45:00', 'completed', 320000, 4, DATE_SUB(NOW(), INTERVAL 11 DAY)),
  (@cust_id, @svc4, @staff_id, DATE_SUB(CURDATE(), INTERVAL 17 DAY), '15:00:00', '15:45:00', 'completed', 320000, 5, DATE_SUB(NOW(), INTERVAL 17 DAY)),
  (@cust_id, @svc4, @staff_id, DATE_SUB(CURDATE(), INTERVAL 21 DAY), '11:00:00', '11:45:00', 'completed', 320000, 4, DATE_SUB(NOW(), INTERVAL 21 DAY)),
  (@cust_id, @svc4, @staff_id, DATE_SUB(CURDATE(), INTERVAL 27 DAY), '13:00:00', '13:45:00', 'completed', 320000, 5, DATE_SUB(NOW(), INTERVAL 27 DAY)),
  (@cust_id, @svc4, @staff_id, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '14:00:00', '14:45:00', 'pending', 320000, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),

  -- Mi & Mày: Nâng mi - 5 lượt
  (@cust_id, @svc5, @staff_id, DATE_SUB(CURDATE(), INTERVAL 4 DAY), '10:00:00', '11:15:00', 'completed', 520000, 5, DATE_SUB(NOW(), INTERVAL 4 DAY)),
  (@cust_id, @svc5, @staff_id, DATE_SUB(CURDATE(), INTERVAL 9 DAY), '14:00:00', '15:15:00', 'completed', 520000, 5, DATE_SUB(NOW(), INTERVAL 9 DAY)),
  (@cust_id, @svc5, @staff_id, DATE_SUB(CURDATE(), INTERVAL 14 DAY), '09:00:00', '10:15:00', 'completed', 520000, 4, DATE_SUB(NOW(), INTERVAL 14 DAY)),
  (@cust_id, @svc5, @staff_id, DATE_SUB(CURDATE(), INTERVAL 19 DAY), '13:00:00', '14:15:00', 'completed', 520000, 5, DATE_SUB(NOW(), INTERVAL 19 DAY)),
  (@cust_id, @svc5, @staff_id, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '15:00:00', '16:15:00', 'confirmed', 520000, NULL, DATE_SUB(NOW(), INTERVAL 3 DAY)),

  -- Chăm sóc da - 5 lượt
  (@cust_id, @svc6, @staff_id, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '13:00:00', '14:15:00', 'completed', 680000, 5, DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (@cust_id, @svc6, @staff_id, DATE_SUB(CURDATE(), INTERVAL 8 DAY), '15:00:00', '16:15:00', 'completed', 680000, 5, DATE_SUB(NOW(), INTERVAL 8 DAY)),
  (@cust_id, @svc6, @staff_id, DATE_SUB(CURDATE(), INTERVAL 13 DAY), '10:00:00', '11:15:00', 'completed', 680000, 4, DATE_SUB(NOW(), INTERVAL 13 DAY)),
  (@cust_id, @svc6, @staff_id, DATE_SUB(CURDATE(), INTERVAL 23 DAY), '09:00:00', '10:15:00', 'completed', 680000, 5, DATE_SUB(NOW(), INTERVAL 23 DAY)),
  (@cust_id, @svc6, @staff_id, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '11:00:00', '12:15:00', 'pending', 680000, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY)),

  -- Massage - 6 lượt
  (@cust_id, @svc7, @staff_id, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '09:00:00', '10:30:00', 'completed', 750000, 5, DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (@cust_id, @svc7, @staff_id, DATE_SUB(CURDATE(), INTERVAL 7 DAY), '14:00:00', '15:30:00', 'completed', 750000, 5, DATE_SUB(NOW(), INTERVAL 7 DAY)),
  (@cust_id, @svc7, @staff_id, DATE_SUB(CURDATE(), INTERVAL 12 DAY), '10:00:00', '11:30:00', 'completed', 750000, 4, DATE_SUB(NOW(), INTERVAL 12 DAY)),
  (@cust_id, @svc7, @staff_id, DATE_SUB(CURDATE(), INTERVAL 19 DAY), '15:00:00', '16:30:00', 'completed', 750000, 5, DATE_SUB(NOW(), INTERVAL 19 DAY)),
  (@cust_id, @svc7, @staff_id, DATE_SUB(CURDATE(), INTERVAL 25 DAY), '13:00:00', '14:30:00', 'completed', 750000, 5, DATE_SUB(NOW(), INTERVAL 25 DAY)),
  (@cust_id, @svc7, @staff_id, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '11:00:00', '12:30:00', 'confirmed', 750000, NULL, DATE_SUB(NOW(), INTERVAL 5 DAY)),

  -- Trang điểm - 3 lượt
  (@cust_id, @svc8, @staff_id, DATE_SUB(CURDATE(), INTERVAL 6 DAY), '09:00:00', '10:30:00', 'completed', 1200000, 5, DATE_SUB(NOW(), INTERVAL 6 DAY)),
  (@cust_id, @svc8, @staff_id, DATE_SUB(CURDATE(), INTERVAL 15 DAY), '13:00:00', '14:30:00', 'completed', 1200000, 5, DATE_SUB(NOW(), INTERVAL 15 DAY)),
  (@cust_id, @svc8, @staff_id, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '10:00:00', '11:30:00', 'pending', 1200000, NULL, DATE_SUB(NOW(), INTERVAL 1 DAY));
