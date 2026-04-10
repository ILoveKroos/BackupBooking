require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'booking_system'
});

const runQuery = (sql, params = []) =>
  new Promise((resolve, reject) => {
    connection.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });

async function main() {
  try {
    let r = await runQuery(
      `SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='appointments' AND COLUMN_NAME='cancellation_requested'`
    );
    if (!r[0].c) {
      await runQuery(
        'ALTER TABLE appointments ADD COLUMN cancellation_requested TINYINT(1) NOT NULL DEFAULT 0 AFTER status'
      );
      console.log('Added appointments.cancellation_requested');
    } else {
      console.log('appointments.cancellation_requested exists');
    }

    r = await runQuery(
      `SELECT COUNT(*) AS c FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME='appointments' AND COLUMN_NAME='cancellation_requested_at'`
    );
    if (!r[0].c) {
      await runQuery(
        'ALTER TABLE appointments ADD COLUMN cancellation_requested_at DATETIME NULL AFTER cancellation_requested'
      );
      console.log('Added appointments.cancellation_requested_at');
    } else {
      console.log('appointments.cancellation_requested_at exists');
    }

    console.log('Done.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    connection.end();
  }
}

main();
