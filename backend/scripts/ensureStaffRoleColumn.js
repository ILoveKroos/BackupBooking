const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'booking_system'
});

const runQuery = (sql) =>
  new Promise((resolve, reject) => {
    connection.query(sql, (error, results) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });

async function main() {
  try {
    const roleColumn = await runQuery("SHOW COLUMNS FROM users LIKE 'staff_role_id'");
    if (!roleColumn.length) {
      await runQuery('ALTER TABLE users ADD COLUMN staff_role_id INT NULL AFTER role');
      console.log('Added users.staff_role_id');
    } else {
      console.log('users.staff_role_id exists');
    }

    const roleIndex = await runQuery(
      "SELECT COUNT(*) AS c FROM information_schema.STATISTICS WHERE TABLE_SCHEMA='booking_system' AND TABLE_NAME='users' AND INDEX_NAME='idx_users_staff_role_id'"
    );
    if (!roleIndex[0].c) {
      await runQuery('ALTER TABLE users ADD INDEX idx_users_staff_role_id (staff_role_id)');
      console.log('Added idx_users_staff_role_id');
    } else {
      console.log('idx_users_staff_role_id exists');
    }

    const roleFk = await runQuery(
      "SELECT COUNT(*) AS c FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA='booking_system' AND TABLE_NAME='users' AND COLUMN_NAME='staff_role_id' AND REFERENCED_TABLE_NAME='staff_role'"
    );
    if (!roleFk[0].c) {
      await runQuery(
        'ALTER TABLE users ADD CONSTRAINT fk_users_staff_role FOREIGN KEY (staff_role_id) REFERENCES staff_role(id)'
      );
      console.log('Added fk_users_staff_role');
    } else {
      console.log('fk_users_staff_role exists');
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
