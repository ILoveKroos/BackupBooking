const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// FIX 1: Load JWT_SECRET from environment
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

if (!JWT_SECRET) {
  throw new Error('ERROR: JWT_SECRET must be set in environment variables');
}

// Đăng ký
exports.register = (req, res) => {
  const { name, email, password, phone } = req.body;
  const normalizedName = (name || '').trim();
  const normalizedEmail = (email || '').trim();
  const normalizedPhone = (phone || '').trim();

  if (!normalizedName || !normalizedEmail || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Vui lòng cung cấp đầy đủ thông tin' 
    });
  }

  // Kiểm tra email đã tồn tại
  userModel.getUserByEmail(normalizedEmail, (err, user) => {
    if (err) {
      console.error('[REGISTER_ERROR]', err);
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi server khi kiểm tra email' 
      });
    }

    if (user) {
      return res.status(400).json({ 
        success: false,
        message: 'Email đã được đăng ký' 
      });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    const userData = {
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: normalizedPhone,
      role: 'customer'
    };

    userModel.createUser(userData, (err, result) => {
      if (err) {
        console.error('[REGISTER_CREATE_ERROR]', err);
        return res.status(500).json({ 
          success: false,
          message: 'Lỗi server khi tạo người dùng' 
        });
      }

      res.status(201).json({ 
        success: true, 
        message: 'Đăng ký thành công' 
      });
    });
  });
};

// Đăng nhập
exports.login = (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = (email || '').trim();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ 
      success: false,
      message: 'Vui lòng cung cấp email và mật khẩu' 
    });
  }

  userModel.getUserByEmail(normalizedEmail, (err, user) => {
    if (err) {
      console.error('[LOGIN_ERROR]', err);
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi server khi xác thực' 
      });
    }

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    // So sánh password
    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    // FIX 2: Use JWT_SECRET from environment (no fallback)
    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
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
      console.error('[GET_PROFILE_ERROR]', err);
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi server' 
      });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Người dùng không tồn tại' 
      });
    }

    res.status(200).json({ 
      success: true, 
      data: user 
    });
  });
};

// Cập nhật profile
exports.updateProfile = (req, res) => {
  const user_id = req.user.id;
  const { name, email, phone } = req.body;

  if (!name || !email) {
    return res.status(400).json({ 
      success: false,
      message: 'Vui lòng cung cấp đầy đủ thông tin' 
    });
  }

  const userData = {
    name,
    email,
    phone: phone || ''
  };

  userModel.updateUser(user_id, userData, (err, result) => {
    if (err) {
      console.error('[UPDATE_PROFILE_ERROR]', err);
      return res.status(500).json({ 
        success: false,
        message: 'Lỗi server khi cập nhật profile' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Cập nhật profile thành công' 
    });
  });
};
