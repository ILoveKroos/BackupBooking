const db = require('../config/db');

// Lấy tóm tắt dashboard
exports.getSummary = (req, res) => {
  const queries = [
    'SELECT COUNT(*) as total_bookings FROM appointments',
    'SELECT SUM(total_amount) as total_revenue FROM appointments WHERE status = "completed"',
    'SELECT COUNT(DISTINCT user_id) as total_customers FROM appointments',
    'SELECT s.name, COUNT(*) as count FROM appointments a JOIN services s ON a.service_id = s.id GROUP BY s.id ORDER BY count DESC LIMIT 1'
  ];
  
  let results = {};
  let completed = 0;
  
  // Query 1: Tổng booking
  db.query(queries[0], (err, data) => {
    if (!err) results.total_bookings = data[0].total_bookings;
    completed++;
    if (completed === 4) sendResponse();
  });
  
  // Query 2: Tổng doanh thu
  db.query(queries[1], (err, data) => {
    if (!err) results.total_revenue = data[0].total_revenue || 0;
    completed++;
    if (completed === 4) sendResponse();
  });
  
  // Query 3: Tổng khách hàng
  db.query(queries[2], (err, data) => {
    if (!err) results.total_customers = data[0].total_customers;
    completed++;
    if (completed === 4) sendResponse();
  });
  
  // Query 4: Dịch vụ phổ biến
  db.query(queries[3], (err, data) => {
    if (!err && data.length > 0) {
      results.top_service = data[0].name;
      results.top_service_count = data[0].count;
    }
    completed++;
    if (completed === 4) sendResponse();
  });
  
  const sendResponse = () => {
    res.status(200).json({ success: true, data: results });
  };
};

// Lấy booking theo tháng
exports.getBookingsByMonth = (req, res) => {
  const query = `
    SELECT MONTH(appointment_date) as month, YEAR(appointment_date) as year, COUNT(*) as total
    FROM appointments
    WHERE status != 'cancelled'
    GROUP BY YEAR(appointment_date), MONTH(appointment_date)
    ORDER BY year DESC, month DESC
    LIMIT 12
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, data: results });
  });
};

// Lấy dịch vụ phổ biến
exports.getTopServices = (req, res) => {
  const query = `
    SELECT s.id, s.name, COUNT(*) as booking_count, SUM(a.total_amount) as revenue
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    WHERE a.status != 'cancelled'
    GROUP BY s.id
    ORDER BY booking_count DESC
    LIMIT 10
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, data: results });
  });
};

// Lấy tần suất khách hàng
exports.getCustomerFrequency = (req, res) => {
  const query = `
    SELECT u.id, u.name, u.email, COUNT(*) as booking_count, SUM(a.total_amount) as total_spent
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    WHERE a.status != 'cancelled'
    GROUP BY u.id
    ORDER BY booking_count DESC
    LIMIT 20
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, data: results });
  });
};

// Lấy trạng thái appointment
exports.getAppointmentStatus = (req, res) => {
  const query = `
    SELECT status, COUNT(*) as count
    FROM appointments
    GROUP BY status
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, data: results });
  });
};

// Lấy doanh thu theo tháng
exports.getRevenueByMonth = (req, res) => {
  const query = `
    SELECT MONTH(appointment_date) as month, YEAR(appointment_date) as year, SUM(total_amount) as revenue
    FROM appointments
    WHERE status = 'completed'
    GROUP BY YEAR(appointment_date), MONTH(appointment_date)
    ORDER BY year DESC, month DESC
    LIMIT 12
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, data: results });
  });
};

// Lấy tỷ lệ hủy lịch
exports.getCancellationRate = (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_appointments,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
      ROUND(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) * 100, 2) as cancellation_rate
    FROM appointments
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }
    res.status(200).json({ success: true, data: results[0] });
  });
};
