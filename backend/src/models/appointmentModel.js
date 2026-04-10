const db = require('../config/db');

const APPOINTMENT_SELECT = `
  SELECT
    a.*,
    u.name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    s.name AS service_name,
    s.price AS service_price,
    s.duration,
    st.name AS staff_name
  FROM appointments a
  JOIN users u ON a.user_id = u.id
  JOIN services s ON a.service_id = s.id
  LEFT JOIN users st ON a.staff_id = st.id
`;

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

  // Get service duration to calculate end_time
  const serviceQuery = `
    SELECT duration 
    FROM services 
    WHERE id = ?
  `;

  db.query(serviceQuery, [service_id], (serviceErr, serviceResults) => {
    if (serviceErr) return callback(serviceErr);
    
    const serviceDuration = serviceResults[0] ? serviceResults[0].duration : 0;
    
    // Calculate end time
    const [hours, minutes] = appointment_time.split(':').map(Number);
    const startTimeMinutes = hours * 60 + minutes;
    const endTimeMinutes = startTimeMinutes + serviceDuration;
    
    const endHours = Math.floor(endTimeMinutes / 60);
    const endMinutes = endTimeMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    const query = `
      INSERT INTO appointments
        (user_id, service_id, staff_id, appointment_date, appointment_time, end_time, status, notes, total_amount, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    db.query(
      query,
      [
        user_id,
        service_id,
        staff_id || null,
        appointment_date,
        appointment_time,
        endTime,
        status || 'pending',
        notes || '',
        total_amount
      ],
      (err, result) => {
        if (err) return callback(err);
        callback(null, result);
      });
  });
};

const getAllAppointments = (callback) => {
  const query = `
    ${APPOINTMENT_SELECT}
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const getAppointmentsByStaffId = (staff_id, callback) => {
  const query = `
    ${APPOINTMENT_SELECT}
    WHERE a.staff_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `;

  db.query(query, [staff_id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const getAppointmentsByUserId = (user_id, callback) => {
  const query = `
    ${APPOINTMENT_SELECT}
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
    ${APPOINTMENT_SELECT}
    WHERE a.id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

const updateAppointmentStatus = (id, status, callback) => {
  const query = `
    UPDATE appointments
    SET status = ?,
        cancellation_requested = 0,
        cancellation_requested_at = NULL
    WHERE id = ?
  `;

  db.query(query, [status, id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const requestAppointmentCancellation = (id, callback) => {
  const query = `
    UPDATE appointments
    SET cancellation_requested = 1,
        cancellation_requested_at = NOW()
    WHERE id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const clearAppointmentCancellationRequest = (id, callback) => {
  const query = `
    UPDATE appointments
    SET cancellation_requested = 0,
        cancellation_requested_at = NULL
    WHERE id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const cancelAppointment = (id, callback) => {
  const query = `
    UPDATE appointments
    SET status = 'cancelled',
        cancellation_requested = 0,
        cancellation_requested_at = NULL
    WHERE id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const addStaffReview = (id, user_id, staff_rating, staff_review, callback) => {
  const query = `
    UPDATE appointments
    SET staff_rating = ?, staff_review = ?, reviewed_at = NOW()
    WHERE id = ?
      AND user_id = ?
      AND status = 'completed'
      AND staff_id IS NOT NULL
      AND (staff_rating IS NULL)
  `;

  db.query(query, [staff_rating, staff_review || '', id, user_id], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const checkTimeConflict = (staff_id, appointment_date, appointment_time, service_id, callback) => {
  console.log('=== checkTimeConflict CALLED ===');
  console.log(`staff_id: ${staff_id}, date: ${appointment_date}, time: ${appointment_time}, service_id: ${service_id}`);
  
  // Get service duration first
  const serviceQuery = `
    SELECT duration 
    FROM services 
    WHERE id = ?
  `;

  db.query(serviceQuery, [service_id], (serviceErr, serviceResults) => {
    if (serviceErr) return callback(serviceErr);
    
    const serviceDuration = serviceResults[0] ? serviceResults[0].duration : 0;
    
    // Calculate end time for new appointment
    const [hours, minutes] = appointment_time.split(':').map(Number);
    const startTimeMinutes = hours * 60 + minutes;
    const endTimeMinutes = startTimeMinutes + serviceDuration;
    
    const endHours = Math.floor(endTimeMinutes / 60);
    const endMinutes = endTimeMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    console.log(`Checking conflict: staff=${staff_id}, date=${appointment_date}, time=${appointment_time}, endTime=${endTime}, duration=${serviceDuration}`);
    
    // Check for time conflicts using end_time column (simpler logic)
    const conflictQuery = `
      SELECT COUNT(*) AS count
      FROM appointments
      WHERE staff_id = ?
        AND appointment_date = ?
        AND status = 'confirmed'
        AND (
          (appointment_time <= ? AND end_time > ?) OR
          (appointment_time < ? AND appointment_time > ?)
        )
    `;

    db.query(conflictQuery, [staff_id, appointment_date, appointment_time, appointment_time, endTime, appointment_time], (err, results) => {
      if (err) return callback(err);
      
      const hasConflict = results[0].count > 0;
      console.log(`Conflict result: count=${results[0].count}, hasConflict=${hasConflict}`);
      
      callback(null, hasConflict);
    });
  });
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentsByStaffId,
  getAppointmentsByUserId,
  getAppointmentById,
  updateAppointmentStatus,
  requestAppointmentCancellation,
  clearAppointmentCancellationRequest,
  cancelAppointment,
  addStaffReview,
  checkTimeConflict
};