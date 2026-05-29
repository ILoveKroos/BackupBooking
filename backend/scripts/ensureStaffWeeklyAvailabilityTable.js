require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'booking_system',
  multipleStatements: true
});

const run = (sql) =>
  new Promise((resolve, reject) => {
    connection.query(sql, (err, results) => (err ? reject(err) : resolve(results)));
  });

async function main() {
  try {
    const rows = await run(
      `SELECT COUNT(*) AS c FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staff_weekly_availability'`
    );
    if (!rows[0].c) {
      await run(`
        CREATE TABLE staff_weekly_availability (
          id INT AUTO_INCREMENT PRIMARY KEY,
          staff_id INT NOT NULL,
          day_of_week TINYINT NOT NULL COMMENT '0=Monday ... 6=Sunday (matches MySQL WEEKDAY)',
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          INDEX idx_staff_week (staff_id, day_of_week),
          CONSTRAINT fk_swa_staff FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log('Created staff_weekly_availability');
    } else {
      console.log('staff_weekly_availability exists');
    }
    await run(`
      INSERT INTO staff_weekly_availability (staff_id, day_of_week, start_time, end_time)
      SELECT
        u.id,
        d.day_of_week,
        CASE WHEN d.day_of_week BETWEEN 0 AND 4 THEN '08:00:00' ELSE '07:00:00' END,
        CASE WHEN d.day_of_week BETWEEN 0 AND 4 THEN '16:00:00' ELSE '15:00:00' END
      FROM users u
      JOIN (
        SELECT 0 AS day_of_week UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3
        UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6
      ) d
      WHERE u.role = 'staff'
        AND NOT EXISTS (
          SELECT 1
          FROM staff_weekly_availability swa
          WHERE swa.staff_id = u.id
            AND swa.day_of_week = d.day_of_week
        )
    `);
    console.log('Backfilled missing default weekly shifts');
    console.log('Done.');
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    connection.end();
  }
}

main();
