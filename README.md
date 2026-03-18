# Hệ Thống Đặt Lịch Dịch Vụ Làm Đẹp Trực Tuyến

Một ứng dụng web hoàn chỉnh để đặt lịch dịch vụ làm đẹp với phân tích dữ liệu khách hàng.

## 🎯 Tính Năng Chính

### Khách Hàng
- ✅ Đăng ký / Đăng nhập
- ✅ Xem danh sách dịch vụ
- ✅ Đặt lịch hẹn
- ✅ Quản lý lịch hẹn của mình
- ✅ Cập nhật hồ sơ cá nhân

### Quản Trị Viên
- ✅ Dashboard với biểu đồ thống kê
- ✅ Quản lý dịch vụ (CRUD)
- ✅ Quản lý lịch hẹn
- ✅ Phân tích dữ liệu khách hàng
- ✅ Xem tỷ lệ hủy lịch

### Phân Tích Dữ Liệu
- ✅ Phân tích RFM (Recency, Frequency, Monetary)
- ✅ Phân khúc khách hàng
- ✅ Biểu đồ doanh thu
- ✅ Thống kê dịch vụ phổ biến

## 🏗️ Cấu Trúc Dự Án

```
project/
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── config/         # Cấu hình database
│   │   ├── controllers/    # Xử lý logic
│   │   ├── models/         # Truy vấn database
│   │   ├── routes/         # Định tuyến API
│   │   ├── middleware/     # Middleware xác thực
│   │   ├── app.js          # Ứng dụng Express
│   │   └── server.js       # Khởi động server
│   └── package.json
│
├── frontend/                # React.js
│   ├── public/
│   ├── src/
│   │   ├── components/     # Các component
│   │   ├── pages/          # Các trang
│   │   ├── services/       # API services
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── database/                # SQL scripts
│   ├── booking.sql         # Schema database
│   └── seed.sql            # Dữ liệu mẫu
│
└── ml-analysis/             # Python analysis
    ├── rfm_analysis.py     # Phân tích RFM
    └── booking.csv         # Dữ liệu mẫu
```

## 🚀 Hướng Dẫn Cài Đặt

### 1. Chuẩn Bị Môi Trường

**Yêu cầu:**
- Node.js v14+ và npm
- MySQL Server
- Python 3.7+

### 2. Cài Đặt Database

```bash
# Mở MySQL
mysql -u root -p

# Chạy script tạo database
source database/booking.sql
```

### 3. Cài Đặt Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Tạo file .env
cat > .env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=booking_system
JWT_SECRET=your_secret_key
PORT=5000
EOF

# Khởi động server
npm start
```

Server sẽ chạy tại `http://localhost:5000`

### 4. Cài Đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Khởi động development server
npm start
```

Ứng dụng sẽ mở tại `http://localhost:3000`

### 5. Cài Đặt Python Analysis

```bash
cd ml-analysis

# Cài đặt dependencies
pip install pandas numpy

# Chạy phân tích RFM
python rfm_analysis.py
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Lấy profile
- `PUT /api/auth/profile` - Cập nhật profile

### Services
- `GET /api/services` - Lấy tất cả dịch vụ
- `GET /api/services/:id` - Lấy dịch vụ theo ID
- `POST /api/services` - Tạo dịch vụ (admin)
- `PUT /api/services/:id` - Cập nhật dịch vụ (admin)
- `DELETE /api/services/:id` - Xóa dịch vụ (admin)

### Bookings
- `POST /api/bookings` - Tạo lịch hẹn
- `GET /api/bookings/my-bookings` - Lấy lịch của user
- `GET /api/bookings` - Lấy tất cả lịch (admin)
- `PUT /api/bookings/:id/status` - Cập nhật trạng thái (admin)
- `PUT /api/bookings/:id/cancel` - Hủy lịch

### Dashboard
- `GET /api/admin/dashboard/summary` - Tóm tắt
- `GET /api/admin/dashboard/bookings-by-month` - Booking theo tháng
- `GET /api/admin/dashboard/top-services` - Dịch vụ phổ biến
- `GET /api/admin/dashboard/customer-frequency` - Tần suất khách hàng
- `GET /api/admin/dashboard/revenue-by-month` - Doanh thu theo tháng
- `GET /api/admin/dashboard/cancellation-rate` - Tỷ lệ hủy

## 👥 Tài Khoản Demo

### Admin
- Email: `admin@example.com`
- Password: `admin123`

### Customer
- Email: `customer@example.com`
- Password: `customer123`

## 🔐 Bảo Mật

- ✅ Password được hash bằng bcryptjs
- ✅ JWT token cho xác thực
- ✅ CORS được cấu hình
- ✅ Middleware xác thực cho các route nhạy cảm

## 📈 Phân Tích RFM

Hệ thống phân tích khách hàng thành các nhóm:

1. **Champions** - Khách hàng giá trị cao, trung thành
2. **Loyal Customers** - Khách hàng trung thành
3. **Potential Loyalists** - Khách hàng tiềm năng
4. **At Risk** - Khách hàng có nguy cơ rời bỏ
5. **Lost Customers** - Khách hàng đã mất
6. **New Customers** - Khách hàng mới

## 🛠️ Công Nghệ Sử Dụng

### Frontend
- React 18
- React Router v6
- Axios
- Chart.js
- CSS3

### Backend
- Node.js
- Express.js
- MySQL
- JWT
- bcryptjs

### Analysis
- Python
- Pandas
- NumPy

## 📝 Ghi Chú

- Tất cả dữ liệu được lưu trữ an toàn trong MySQL
- API sử dụng JWT token cho xác thực
- Frontend tự động lưu token vào localStorage
- Phân tích RFM có thể chạy hàng ngày để cập nhật phân khúc

## 🤝 Đóng Góp

Nếu bạn muốn đóng góp, vui lòng:
1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

Dự án này được cấp phép dưới MIT License.

## 📧 Liên Hệ

Nếu có câu hỏi, vui lòng liên hệ:
- Email: info@beautybooking.com
- Website: https://beautybooking.com

---

**Phiên bản:** 1.0.0  
**Cập nhật lần cuối:** 2026-03-16
