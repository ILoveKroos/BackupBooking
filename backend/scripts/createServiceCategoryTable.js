const db = require('../src/config/db');

const createServiceCategoryTable = () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS service_category (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  db.query(createTableQuery, (err, result) => {
    if (err) {
      console.error('Error creating service_category table:', err);
      process.exit(1);
    }
    
    console.log('service_category table created successfully or already exists');
    
    // Insert some default categories
    const insertDefaultCategories = `
      INSERT IGNORE INTO service_category (category_name) VALUES 
      ('Tóc'),
      ('Móng'),
      ('Chăm sóc da'),
      ('Massage'),
      ('Mi & Mày'),
      ('Trang điểm');
    `;

    db.query(insertDefaultCategories, (insertErr, insertResult) => {
      if (insertErr) {
        console.error('Error inserting default categories:', insertErr);
      } else {
        console.log('Default categories inserted successfully');
      }
      
      db.end();
    });
  });
};

// Run the migration
createServiceCategoryTable();
