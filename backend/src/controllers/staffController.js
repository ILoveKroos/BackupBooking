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
      return res.status(500).json({ message: 'Loi server', error: err });
    }

    res.status(200).json({ success: true, data: staffList });
  });
};

exports.getAvailableStaff = (req, res) => {
  const { date, time } = req.query;

  if (!date || !time) {
    return res.status(400).json({ message: 'Vui long cung cap date va time' });
  }

  staffModel.getAvailableStaff(date, time, (err, staffList) => {
    if (err) {
      return res.status(500).json({ message: 'Loi server', error: err });
    }

    res.status(200).json({ success: true, data: staffList });
  });
};

exports.createStaff = (req, res) => {
  const { name, email, password, phone, is_active } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Vui long cung cap day du thong tin' });
  }

  userModel.getUserByEmail(email, (err, existingUser) => {
    if (err) {
      return res.status(500).json({ message: 'Loi server', error: err });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'Email da ton tai' });
    }

    const activeValue =
      typeof is_active === 'undefined' ? true : parseActiveValue(is_active);

    if (activeValue === null) {
      return res.status(400).json({ message: 'is_active khong hop le' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    staffModel.createStaff(
      {
        name,
        email,
        password: hashedPassword,
        phone: phone || '',
        is_active: activeValue
      },
      (createErr, result) => {
        if (createErr) {
          return res.status(500).json({ message: 'Loi server', error: createErr });
        }

        res.status(201).json({
          success: true,
          message: 'Tao nhan vien thanh cong',
          staffId: result.insertId
        });
      }
    );
  });
};

exports.updateStaff = (req, res) => {
  const { id } = req.params;
  const { name, phone, is_active } = req.body;

  if (
    typeof name === 'undefined' &&
    typeof phone === 'undefined' &&
    typeof is_active === 'undefined'
  ) {
    return res.status(400).json({ message: 'Khong co du lieu de cap nhat' });
  }

  staffModel.getStaffById(id, (err, staff) => {
    if (err) {
      return res.status(500).json({ message: 'Loi server', error: err });
    }

    if (!staff) {
      return res.status(404).json({ message: 'Nhan vien khong ton tai' });
    }

    const payload = {};
    if (typeof name !== 'undefined') payload.name = name;
    if (typeof phone !== 'undefined') payload.phone = phone;

    if (typeof is_active !== 'undefined') {
      const activeValue = parseActiveValue(is_active);
      if (activeValue === null) {
        return res.status(400).json({ message: 'is_active khong hop le' });
      }
      payload.is_active = activeValue;
    }

    staffModel.updateStaff(id, payload, (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: 'Loi server', error: updateErr });
      }

      res.status(200).json({
        success: true,
        message: 'Cap nhat nhan vien thanh cong'
      });
    });
  });
};
