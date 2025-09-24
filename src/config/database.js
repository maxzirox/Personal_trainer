// =============================================================================
// config/database.js - Configuración de base de datos
// =============================================================================

const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rvjs70',
  database: process.env.DB_NAME || 'personal_trainer_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Probar conexión
pool.getConnection()
  .then(connection => {
    logger.info('✅ Conexión a MySQL establecida correctamente');
    connection.release();
  })
  .catch(err => {
    logger.error('❌ Error conectando a MySQL:', err);
    process.exit(1);
  });

module.exports = pool;