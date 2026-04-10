const bcrypt = require('bcryptjs');
const staffModel = require('../models/staffModel');
const userModel = require('../models/userModel');

const parseActiveValue = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === '1' || normalized === 'true') return true;
    if (normalized === '0' || normalized === 'false') return false;
  }
  return null;
};

exports.getAllStaff = (req, res) => {
  staffModel.getAllStaff((err, staffList) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    return res.status(200).json({ success: true, data: staffList });
  });
};

exports.getBookableStaff = (req, res) => {
  staffModel.getBookableStaff((err, staffList) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    return res.status(200).json({ success: true, data: staffList });
  });
};

exports.getAvailableStaff = (req, res) => {
  const { date, time } = req.query;

  if (!date || !time) {
    return res.status(400).json({ message: 'Vui lòng cung cấp ngày và giờ' });
  }

  staffModel.getAvailableStaff(date, time, (err, staffList) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    return res.status(200).json({ success: true, data: staffList });
  });
};

exports.getAllStaffRoles = (req, res) => {
  staffModel.getAllStaffRoles((err, roleList) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    return res.status(200).json({ success: true, data: roleList });
  });
};

exports.createStaffRole = (req, res) => {
  const { role_name } = req.body;
  const normalizedRole = (role_name || '').trim();

  if (!normalizedRole) {
    return res.status(400).json({ message: 'Vui lòng nhập tên vai trò' });
  }

  return staffModel.createStaffRole(normalizedRole, (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    return res.status(201).json({
      success: true,
      message: 'Tạo vai trò thành công',
      roleId: result.insertId
    });
  });
};

exports.createStaff = (req, res) => {
  const { name, email, password, phone, staff_role_id, is_active } = req.body;

  if (!name || !email || !password || typeof staff_role_id === 'undefined') {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin' });
  }

  const parsedRoleId = Number(staff_role_id);
  if (!Number.isInteger(parsedRoleId) || parsedRoleId < 0) {
    return res.status(400).json({ message: 'Vai trò không hợp lệ' });
  }

  userModel.getUserByEmail(email, (err, existingUser) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const activeValue =
      typeof is_active === 'undefined' ? true : parseActiveValue(is_active);

    if (activeValue === null) {
      return res.status(400).json({ message: 'is_active không hợp lệ' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    return staffModel.getStaffRoleById(parsedRoleId, (roleErr, role) => {
      if (roleErr) {
        return res.status(500).json({ message: 'Lỗi server', error: roleErr });
      }

      if (!role) {
        return res.status(400).json({ message: 'Vai trò không tồn tại' });
      }

      return staffModel.createStaff(
        {
          name,
          email,
          password: hashedPassword,
          phone: phone || '',
          staff_role_id: parsedRoleId,
          is_active: activeValue
        },
        (createErr, result) => {
          if (createErr) {
            return res.status(500).json({ message: 'Lỗi server', error: createErr });
          }

          return res.status(201).json({
            success: true,
            message: 'Tạo nhân viên thành công',
            staffId: result.insertId
          });
        }
      );
    });
  });
};

const normalizeTimeString = (value) => {
  if (value === null || typeof value === 'undefined') {
    return null;
  }
  const raw = String(value).trim();
  if (/^\d{1,2}:\d{2}$/.test(raw)) {
    const [h, m] = raw.split(':').map((part) => Number(part));
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`;
    }
  }
  if (/^\d{1,2}:\d{2}:\d{2}$/.test(raw)) {
    return raw;
  }
  return null;
};

exports.getWeeklyAvailability = (req, res) => {
  const { id } = req.params;

  staffModel.getStaffById(id, (err, staff) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    if (!staff) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }

    return staffModel.getWeeklyAvailabilityByStaffId(id, (loadErr, rows) => {
      if (loadErr) {
        return res.status(500).json({ message: 'Lỗi server', error: loadErr });
      }

      return res.status(200).json({ success: true, data: rows });
    });
  });
};

exports.replaceWeeklyAvailability = (req, res) => {
  const { id } = req.params;
  const { slots } = req.body;

  if (!Array.isArray(slots)) {
    return res.status(400).json({ message: 'slots phải là mảng' });
  }

  staffModel.getStaffById(id, (err, staff) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    if (!staff) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }

    const normalized = [];

    for (let i = 0; i < slots.length; i += 1) {
      const row = slots[i] || {};
      const day = Number(row.day_of_week);
      const start = normalizeTimeString(row.start_time);
      const end = normalizeTimeString(row.end_time);

      if (!Number.isInteger(day) || day < 0 || day > 6) {
        return res.status(400).json({ message: 'day_of_week phải từ 0 (Thứ 2) đến 6 (Chủ nhật)' });
      }

      if (!start || !end) {
        return res.status(400).json({ message: 'Giờ bắt đầu / kết thúc không hợp lệ' });
      }

      if (start >= end) {
        return res.status(400).json({ message: 'Giờ kết thúc phải sau giờ bắt đầu' });
      }

      normalized.push({ day_of_week: day, start_time: start, end_time: end });
    }

    return staffModel.replaceWeeklyAvailability(id, normalized, (saveErr) => {
      if (saveErr) {
        return res.status(500).json({ message: 'Lỗi server', error: saveErr });
      }

      return res.status(200).json({
        success: true,
        message: 'Đã lưu lịch làm việc hằng tuần'
      });
    });
  });
};

exports.updateStaff = (req, res) => {
  const { id } = req.params;
  const { name, phone, is_active, password } = req.body;

  if (
    typeof name === 'undefined' &&
    typeof phone === 'undefined' &&
    typeof is_active === 'undefined' &&
    typeof password === 'undefined'
  ) {
    return res.status(400).json({ message: 'Không có dữ liệu để cập nhật' });
  }

  staffModel.getStaffById(id, (err, staff) => {
    if (err) {
      return res.status(500).json({ message: 'Lỗi server', error: err });
    }

    if (!staff) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }

    const payload = {};
    if (typeof name !== 'undefined') payload.name = name;
    if (typeof phone !== 'undefined') payload.phone = phone;

    if (typeof password !== 'undefined') {
      if (typeof password !== 'string' || password.trim().length === 0) {
        return res.status(400).json({ message: 'Mật khẩu mới không được để trống' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu mới phải ít nhất 6 ký tự' });
      }

      payload.password = bcrypt.hashSync(password, 10);
    }

    if (typeof is_active !== 'undefined') {
      const activeValue = parseActiveValue(is_active);
      if (activeValue === null) {
        return res.status(400).json({ message: 'is_active không hợp lệ' });
      }
      payload.is_active = activeValue;
    }

    return staffModel.updateStaff(id, payload, (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: 'Lỗi server', error: updateErr });
      }

      return res.status(200).json({
        success: true,
        message:
          typeof password !== 'undefined'
            ? 'Cập nhật nhân viên và mật khẩu thành công'
            : 'Cập nhật nhân viên thành công'
      });
    });
  });
};
