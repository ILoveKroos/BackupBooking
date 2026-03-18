const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Đăng ký
exports.register = (req, res) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
  }

  // Kiểm tra email đã tồn tại
  userModel.getUserByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    if (user) {
      return res.status(400).json({ message: 'Email đã được đăng ký' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: 'customer'
    };

    userModel.createUser(userData, (err, result) => {
      if (err) {
        return res.status(500).json({ message: 'Lỗi server', error: err });
      }

      res.status(201).json({ success: true, message: 'Đăng ký thành công' });
    });
  });
};

// Đăng nhập
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Vui lòng cung cấp email và password' });
  }

  userModel.getUserByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    if (!user) {
      return res.status(401).json({ message: 'Email hoặc password không đúng' });
    }

    // So sánh password
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email hoặc password không đúng' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
};

// Lấy thông tin profile
exports.getProfile = (req, res) => {
  const user_id = req.user.id;

  userModel.getUserById(user_id, (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    res.status(200).json({ success: true, data: user });
  });
};

// Cập nhật profile
exports.updateProfile = (req, res) => {
  const user_id = req.user.id;
  const { name, email, phone } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
  }

  const userData = {
    name,
    email,
    phone: phone || ''
  };

  userModel.updateUser(user_id, userData, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    res.status(200).json({ success: true, message: 'Cập nhật profile thành công' });
  });
};
