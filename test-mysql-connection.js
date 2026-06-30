// Quick MySQL connectivity test
(async () => {
  try {
    const db = require('./db-mysql');
    const pool = db.pool;

    console.log('DB config:');
    console.log('  DB_HOST =', process.env.DB_HOST || 'localhost');
    console.log('  DB_USER =', process.env.DB_USER || 'root');
    console.log('  DB_NAME =', process.env.DB_NAME || 'kidney_monitoring');

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query('SELECT 1 AS ok');
      console.log('Query successful:', rows);
      process.exit(0);
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error('MySQL connectivity test failed:');
    console.error(err.message || err);
    process.exit(2);
  }
})();
