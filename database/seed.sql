USE booking_system;

-- Optional demo users (password in this script is plain text for quick local testing only).
-- You should register via API in production.
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
  ('Linh Tran', 'staff1@example.com', '$2a$10$h8z47WDz93kpQiWT4WtmFu8ML40EhcWp6cqN2SNxcBOCaQPEJGYFu', '0922222222', 'staff', NOW()),
  ('Quynh Nguyen', 'staff2@example.com', '$2a$10$h8z47WDz93kpQiWT4WtmFu8ML40EhcWp6cqN2SNxcBOCaQPEJGYFu', '0933333333', 'staff', NOW()),
  ('Thao Le', 'staff3@example.com', '$2a$10$h8z47WDz93kpQiWT4WtmFu8ML40EhcWp6cqN2SNxcBOCaQPEJGYFu', '0944444444', 'staff', NOW());

-- Realistic service pricing for a beauty booking product.
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
  'Bridal Makeup Trial'
);

INSERT INTO services (name, price, duration, description, category, status, created_at)
VALUES
  (
    'Express Blowout',
    280000,
    30,
    'Goi tao kieu toc nhanh cho lich hop va su kien gap.',
    'Hair',
    'active',
    NOW()
  ),
  (
    'Signature Haircut & Styling',
    450000,
    60,
    'Cat, cham soc va tao form theo gu ca nhan.',
    'Hair',
    'active',
    NOW()
  ),
  (
    'Premium Hair Color',
    950000,
    120,
    'Nhuom va can bang tone mau cao cap, kem phuc hoi nen toc.',
    'Hair',
    'active',
    NOW()
  ),
  (
    'Scalp Detox Therapy',
    560000,
    60,
    'Lam sach sau da dau sau va massage kich thich luu thong.',
    'Hair',
    'active',
    NOW()
  ),
  (
    'Gel Manicure',
    320000,
    45,
    'Lam sach mong, tao form va son gel ben mau.',
    'Nails',
    'active',
    NOW()
  ),
  (
    'Lash Lift & Tint',
    520000,
    75,
    'Nang mi va phu mau tu nhien theo phong cach boutique.',
    'Lashes & Brows',
    'active',
    NOW()
  ),
  (
    'Brow Lamination',
    480000,
    60,
    'Dinh hinh long may, giu nep dep va gon gang.',
    'Lashes & Brows',
    'active',
    NOW()
  ),
  (
    'Hydrating Facial Ritual',
    680000,
    75,
    'Duong am sau, lam diu da va phuc hoi do cang bong.',
    'Facial',
    'active',
    NOW()
  ),
  (
    'Deep Tissue Massage',
    750000,
    90,
    'Massage mo sau giam cang co va phuc hoi nang luong.',
    'Massage',
    'active',
    NOW()
  ),
  (
    'Bridal Makeup Trial',
    1200000,
    120,
    'Trang diem thu co concept cho su kien cuoi.',
    'Makeup',
    'active',
    NOW()
  );
