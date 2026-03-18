const db = require('../config/db');

// Tạo dịch vụ mới
const createService = (serviceData, callback) => {
  const { name, description, price, duration, status } = serviceData;
  const query = 'INSERT INTO services (name, description, price, duration, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
  
  db.query(query, [name, description, price, duration, status || 'active'], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Lấy tất cả dịch vụ
const getAllServices = (callback) => {
  const query = 'SELECT * FROM services WHERE status = "active" ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Lấy dịch vụ theo ID
const getServiceById = (id, callback) => {
  const query = 'SELECT * FROM services WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// Cập nhật dịch vụ
const updateService = (id, serviceData, callback) => {
  const { name, description, price, duration, status } = serviceData;
  const query = 'UPDATE services SET name = ?, description = ?, price = ?, duration = ?, status = ? WHERE id = ?';
  
  db.query(query, [name, description, price, duration, status, id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Xóa dịch vụ
const deleteService = (id, callback) => {
  const query = 'DELETE FROM services WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService
};
