const db = require('../config/db');

/** Vai trò không hiển thị / không được chọn khi khách đặt dịch vụ (so khớp không phân biệt hoa thường). */
const CUSTOMER_BOOKING_EXCLUDED_ROLE_NORMALIZED = 'thu ngân';

const customerBookableStaffJoin = `
  LEFT JOIN staff_role sr ON sr.id = u.staff_role_id
`;

const customerBookableStaffRoleFilter = `
  AND (
    sr.role_name IS NULL
    OR LOWER(TRIM(sr.role_name)) <> ?
  )
`;

const getAllStaff = (callback) => {
  const query = `
    SELECT
      u.id,
      u.name,
      u.email,
      u.phone,
      u.staff_role_id,
      sr.role_name,
      u.is_active,
      u.created_at,
      COUNT(a.id) AS total_appointments
    FROM users u
    LEFT JOIN staff_role sr
      ON sr.id = u.staff_role_id
    LEFT JOIN appointments a
      ON a.staff_id = u.id
      AND a.status != 'cancelled'
    WHERE u.role = 'staff'
    GROUP BY u.id, u.name, u.email, u.phone, u.staff_role_id, sr.role_name, u.is_active, u.created_at
    ORDER BY u.is_active DESC, u.name ASC
  `;

  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const getBookableStaff = (callback) => {
  const query = `
    SELECT u.id, u.name, u.email, u.phone
    FROM users u
    ${customerBookableStaffJoin}
    WHERE u.role = 'staff' AND u.is_active = 1
    ${customerBookableStaffRoleFilter}
    ORDER BY u.name ASC
  `;

  db.query(query, [CUSTOMER_BOOKING_EXCLUDED_ROLE_NORMALIZED], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const getStaffById = (id, callback) => {
  const query = `
    SELECT u.id, u.name, u.email, u.phone, u.role, u.is_active, u.created_at, sr.role_name
    FROM users u
    LEFT JOIN staff_role sr ON sr.id = u.staff_role_id
    WHERE u.id = ? AND u.role = 'staff'
  `;

  db.query(query, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
};

const createStaff = (staffData, callback) => {
  const { name, email, password, phone, staff_role_id, is_active } = staffData;
  const query = `
    INSERT INTO users (name, email, password, phone, role, staff_role_id, is_active, created_at)
    VALUES (?, ?, ?, ?, 'staff', ?, ?, NOW())
  `;

  db.query(
    query,
    [name, email, password, phone || '', staff_role_id, is_active ? 1 : 0],
    (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    }
  );
};

const getStaffRoleById = (id, callback) => {
  const query = `
    SELECT id, role_name
    FROM staff_role
    WHERE id = ?
    LIMIT 1
  `;

  db.query(query, [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0] || null);
  });
};

const updateStaff = (id, staffData, callback) => {
  const fields = [];
  const values = [];

  if (typeof staffData.name !== 'undefined') {
    fields.push('name = ?');
    values.push(staffData.name);
  }

  if (typeof staffData.phone !== 'undefined') {
    fields.push('phone = ?');
    values.push(staffData.phone);
  }

  if (typeof staffData.password !== 'undefined') {
    fields.push('password = ?');
    values.push(staffData.password);
  }

  if (typeof staffData.is_active !== 'undefined') {
    fields.push('is_active = ?');
    values.push(staffData.is_active ? 1 : 0);
  }

  if (fields.length === 0) {
    return callback(null, { affectedRows: 0, changedRows: 0 });
  }

  const query = `
    UPDATE users
    SET ${fields.join(', ')}
    WHERE id = ? AND role = 'staff'
  `;
  values.push(id);

  db.query(query, values, (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

const getAvailableStaff = (appointmentDate, appointmentTime, callback) => {
  const query = `
    SELECT u.id, u.name, u.email, u.phone
    FROM users u
    ${customerBookableStaffJoin}
    WHERE u.role = 'staff'
      AND u.is_active = 1
      ${customerBookableStaffRoleFilter}
      AND u.id NOT IN (
        SELECT a.staff_id
        FROM appointments a
        WHERE a.staff_id IS NOT NULL
          AND a.appointment_date = ?
          AND a.appointment_time = ?
          AND a.status != 'cancelled'
      )
      AND (
        (SELECT COUNT(*) FROM staff_weekly_availability swa WHERE swa.staff_id = u.id) = 0
        OR EXISTS (
          SELECT 1
          FROM staff_weekly_availability swa2
          WHERE swa2.staff_id = u.id
            AND swa2.day_of_week = WEEKDAY(?)
            AND TIME(?) >= swa2.start_time
            AND TIME(?) < swa2.end_time
        )
      )
    ORDER BY u.name ASC
  `;

  db.query(
    query,
    [
      CUSTOMER_BOOKING_EXCLUDED_ROLE_NORMALIZED,
      appointmentDate,
      appointmentTime,
      appointmentDate,
      appointmentTime,
      appointmentTime
    ],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
};

const isStaffRoleExcludedFromCustomerBooking = (roleName) => {
  const normalized = (roleName || '').trim().toLowerCase();
  return normalized === CUSTOMER_BOOKING_EXCLUDED_ROLE_NORMALIZED;
};

const getStaffRoleNameByUserId = (userId, callback) => {
  const query = `
    SELECT sr.role_name
    FROM users u
    LEFT JOIN staff_role sr ON sr.id = u.staff_role_id
    WHERE u.id = ? AND u.role = 'staff'
    LIMIT 1
  `;

  db.query(query, [userId], (err, rows) => {
    if (err) return callback(err);
    callback(null, rows[0]?.role_name || null);
  });
};

const getWeeklyAvailabilityByStaffId = (staffId, callback) => {
  const query = `
    SELECT id, staff_id, day_of_week, start_time, end_time
    FROM staff_weekly_availability
    WHERE staff_id = ?
    ORDER BY day_of_week ASC, start_time ASC
  `;

  db.query(query, [staffId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const replaceWeeklyAvailability = (staffId, slots, callback) => {
  db.query('DELETE FROM staff_weekly_availability WHERE staff_id = ?', [staffId], (delErr) => {
    if (delErr) return callback(delErr);
    if (!slots || slots.length === 0) {
      return callback(null, { affectedRows: 0 });
    }

    const values = slots.map((row) => [staffId, row.day_of_week, row.start_time, row.end_time]);
    const insertSql = `
      INSERT INTO staff_weekly_availability (staff_id, day_of_week, start_time, end_time)
      VALUES ?
    `;

    db.query(insertSql, [values], (insErr, result) => {
      if (insErr) return callback(insErr);
      callback(null, result);
    });
  });
};

const isStaffAvailableForWeeklySchedule = (staffId, appointmentDate, appointmentTime, callback) => {
  db.query(
    'SELECT COUNT(*) AS c FROM staff_weekly_availability WHERE staff_id = ?',
    [staffId],
    (countErr, countRows) => {
      if (countErr) return callback(countErr);
      if (!countRows[0] || Number(countRows[0].c) === 0) {
        return callback(null, true);
      }

      const query = `
        SELECT 1
        FROM staff_weekly_availability
        WHERE staff_id = ?
          AND day_of_week = WEEKDAY(?)
          AND TIME(?) >= start_time
          AND TIME(?) < end_time
        LIMIT 1
      `;

      db.query(query, [staffId, appointmentDate, appointmentTime, appointmentTime], (err, rows) => {
        if (err) return callback(err);
        callback(null, rows.length > 0);
      });
    }
  );
};

const getAllStaffRoles = (callback) => {
  const query = `
    SELECT id, role_name
    FROM staff_role
    ORDER BY id ASC
  `;

  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

const createStaffRole = (roleName, callback) => {
  const query = `
    INSERT INTO staff_role (id, role_name)
    SELECT COALESCE(MAX(id), -1) + 1, ?
    FROM staff_role
  `;

  db.query(query, [roleName], (err, result) => {
    if (err) return callback(err);
    callback(null, result);
  });
};

module.exports = {
  getAllStaff,
  getBookableStaff,
  getStaffById,
  createStaff,
  updateStaff,
  getAvailableStaff,
  getStaffRoleById,
  getAllStaffRoles,
  createStaffRole,
  getWeeklyAvailabilityByStaffId,
  replaceWeeklyAvailability,
  isStaffAvailableForWeeklySchedule,
  isStaffRoleExcludedFromCustomerBooking,
  getStaffRoleNameByUserId
};
