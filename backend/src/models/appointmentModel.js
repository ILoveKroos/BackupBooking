const db = require('../config/db');

const createAppointment = (appointmentData, callback) => {
  const {
    user_id,
    service_id,
    staff_id,
    appointment_date,
    appointment_time,
    status,
    notes,
    total_amount
  } = appointmentData;

  const query = `
    INSERT INTO appointments
      (user_id, service_id, staff_id, appointment_date, appointment_time, status, notes, total_amount, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  db.query(
    query,
    [
      user_id,
      service_id,
      staff_id || null,
      appointment_date,
      appointment_time,
      status || 'pending',
      notes || '',
      total_amount
    ],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    }
  );
};

const getAllAppointments = (callback) => {
  const query = `
    SELECT
      a.*,
      u.name AS customer_name,
      u.email AS customer_email,
      u.phone AS customer_phone,
      s.name AS service_name,
      s.price AS service_price,
      st.name AS staff_name
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN users st ON a.staff_id = st.id
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const getAppointmentsByUserId = (user_id, callback) => {
  const query = `
    SELECT
      a.*,
      s.name AS service_name,
      s.price AS service_price,
      s.duration,
      st.name AS staff_name
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    LEFT JOIN users st ON a.staff_id = st.id
    WHERE a.user_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  db.query(query, [user_id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const getAppointmentById = (id, callback) => {
  const query = `
    SELECT
      a.*,
      u.name AS customer_name,
      u.email AS customer_email,
      s.name AS service_name,
      s.price AS service_price,
      st.name AS staff_name
    FROM appointments a
    JOIN users u ON a.user_id = u.id
    JOIN services s ON a.service_id = s.id
    LEFT JOIN users st ON a.staff_id = st.id
    WHERE a.id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

const updateAppointmentStatus = (id, status, callback) => {
  const query = 'UPDATE appointments SET status = ? WHERE id = ?';
  db.query(query, [status, id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const cancelAppointment = (id, callback) => {
  const query = 'UPDATE appointments SET status = "cancelled" WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const checkTimeConflict = (staff_id, appointment_date, appointment_time, callback) => {
  const query = `
    SELECT COUNT(*) AS count
    FROM appointments
    WHERE staff_id = ?
      AND appointment_date = ?
      AND appointment_time = ?
      AND status != 'cancelled'
  `;

  db.query(query, [staff_id, appointment_date, appointment_time], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0].count > 0);
  });
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentsByUserId,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
  checkTimeConflict
};
