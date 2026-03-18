const db = require('../config/db');

// Tạo user mới
const createUser = (userData, callback) => {
  const { name, email, password, phone, role } = userData;
  const query = 'INSERT INTO users (name, email, password, phone, role, created_at) VALUES (?, ?, ?, ?, ?, NOW())';
  
  db.query(query, [name, email, password, phone, role || 'customer'], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Lấy user theo email
const getUserByEmail = (email, callback) => {
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// Lấy user theo ID
const getUserById = (id, callback) => {
  const query = 'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

// Lấy tất cả users
const getAllUsers = (callback) => {
  const query = 'SELECT id, name, email, phone, role, created_at FROM users';
  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Cập nhật user
const updateUser = (id, userData, callback) => {
  const { name, email, phone } = userData;
  const query = 'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?';
  
  db.query(query, [name, email, phone, id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

// Xóa user
const deleteUser = (id, callback) => {
  const query = 'DELETE FROM users WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser
};
