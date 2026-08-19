import 'dotenv/config';

import app from './app.js';
import pool from './config/db.js';

const port = Number(process.env.PORT || 5000);

async function start() {
  try {
    await pool.query('SELECT 1');

    app.listen(port, () => {
      console.log(`EthioStays API running at http://localhost:${port}/api`);
    });
  } catch (error) {
    console.error('Failed to connect to PostgreSQL:', error);
    process.exit(1);
  }
}

start();