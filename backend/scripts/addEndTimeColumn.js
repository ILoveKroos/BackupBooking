const db = require('../src/config/db');

const addEndTimeColumn = () => {
  console.log('Adding end_time column to appointments table...');
  
  // Add end_time column after appointment_time
  const alterQuery = `
    ALTER TABLE appointments 
    ADD COLUMN end_time TIME AFTER appointment_time
  `;
  
  db.query(alterQuery, (err, result) => {
    if (err) {
      console.error('Error adding end_time column:', err);
      process.exit(1);
    }
    
    console.log('✅ end_time column added successfully');
    
    // Update existing records to calculate end_time based on service duration
    const updateQuery = `
      UPDATE appointments a
      JOIN services s ON a.service_id = s.id
      SET a.end_time = ADDTIME(a.appointment_time, SEC_TO_TIME(s.duration * 60))
      WHERE a.end_time IS NULL
    `;
    
    db.query(updateQuery, (updateErr, updateResult) => {
      if (updateErr) {
        console.error('Error updating existing records:', updateErr);
        process.exit(1);
      }
      
      console.log(`✅ Updated ${updateResult.affectedRows} existing records with end_time`);
      console.log('✅ Migration completed successfully');
      process.exit(0);
    });
  });
};

// Run migration
addEndTimeColumn();
