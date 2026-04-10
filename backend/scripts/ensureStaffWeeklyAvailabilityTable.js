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
    console.log('Done.');
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    connection.end();
  }
}

main();
