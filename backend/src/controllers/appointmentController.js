const appointmentModel = require('../models/appointmentModel');
const serviceModel = require('../models/serviceModel');
const staffModel = require('../models/staffModel');

exports.createAppointment = (req, res) => {
  const { service_id, staff_id, appointment_date, appointment_time, notes } = req.body;
  const user_id = req.user.id;

  if (!service_id || !staff_id || !appointment_date || !appointment_time) {
    return res.status(400).json({ message: 'vui lòng cung cấp đầy đủ thông tin' });
  }

  const parsedStaffId = Number(staff_id);
  if (!Number.isInteger(parsedStaffId) || parsedStaffId <= 0) {
    return res.status(400).json({ message: 'staff_id không hợp lệ' });
  }

  staffModel.getStaffById(parsedStaffId, (staffErr, staff) => {
    if (staffErr) {
      return res.status(500).json({ message: 'lỗi server', error: staffErr });
    }

    if (!staff || !staff.is_active) {
      return res.status(400).json({ message: 'Nhân viên không tồn tại hoặc đang bị khóa' });
    }

    appointmentModel.checkTimeConflict(
      parsedStaffId,
      appointment_date,
      appointment_time,
      (conflictErr, hasConflict) => {
        if (conflictErr) {
          return res.status(500).json({ message: 'lỗi server', error: conflictErr });
        }

        if (hasConflict) {
          return res.status(400).json({
            message: 'Nhân viên đã có lịch hẹn vào thời gian này, vui lòng chọn thời gian khác hoặc nhân viên khác'
          });
        }

        serviceModel.getServiceById(service_id, (serviceErr, service) => {
          if (serviceErr || !service) {
            return res.status(404).json({ message: 'dịch vụ không tồn tại' });
          }

          const appointmentData = {
            user_id,
            service_id,
            staff_id: parsedStaffId,
            appointment_date,
            appointment_time,
            status: 'pending',
            notes: notes || '',
            total_amount: service.price
          };

          appointmentModel.createAppointment(appointmentData, (createErr, result) => {
            if (createErr) {
              return res.status(500).json({ message: 'lỗi server', error: createErr });
            }

            res.status(201).json({
              success: true,
              message: 'Đặt lịch thành công',
              appointmentId: result.insertId,
              totalAmount: service.price
            });
          });
        });
      }
    );
  });
};

exports.getMyAppointments = (req, res) => {
  const user_id = req.user.id;

  appointmentModel.getAppointmentsByUserId(user_id, (err, appointments) => {
    if (err) {
      return res.status(500).json({ message: 'lỗi server', error: err });
    }
    res.status(200).json({ success: true, data: appointments });
  });
};

exports.getAllAppointments = (req, res) => {
  appointmentModel.getAllAppointments((err, appointments) => {
    if (err) {
      return res.status(500).json({ message: 'lỗi server', error: err });
    }
    res.status(200).json({ success: true, data: appointments });
  });
};

exports.getAppointmentById = (req, res) => {
  const { id } = req.params;

  appointmentModel.getAppointmentById(id, (err, appointment) => {
    if (err) {
      return res.status(500).json({ message: 'lỗi server', error: err });
    }
    if (!appointment) {
      return res.status(404).json({ message: 'lịch hẹn không tồn tại' });
    }
    res.status(200).json({ success: true, data: appointment });
  });
};

exports.updateAppointmentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái' });
  }

  appointmentModel.updateAppointmentStatus(id, status, (err) => {
    if (err) {
      return res.status(500).json({ message: 'lỗi server', error: err });
    }
    res.status(200).json({ success: true, message: 'Cập nhật trạng thái thành công' });
  });
};

exports.cancelAppointment = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  appointmentModel.getAppointmentById(id, (err, appointment) => {
    if (err || !appointment) {
      return res.status(404).json({ message: 'Lịch hẹn không tồn tại' });
    }

    if (Number(appointment.user_id) !== Number(user_id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền hủy lịch này' });
    }

    appointmentModel.cancelAppointment(id, (cancelErr) => {
      if (cancelErr) {
        return res.status(500).json({ message: 'lỗi server', error: cancelErr });
      }
      res.status(200).json({ success: true, message: 'Hủy lịch thành công' });
    });
  });
};
