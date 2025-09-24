// =============================================================================
// routes/measurements.js - Rutas de mediciones
// =============================================================================

const express = require('express');
const db = require('../../config/database');
const { protect, restrictTo } = require('../../middleware/auth');
const { validateBody, schemas } = require('../../middleware/validation');
const AppError = require('../../utils/appError');

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Obtener mediciones del usuario
router.get('/', async (req, res, next) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    
    const [measurements] = await db.execute(
      `SELECT m.*, u.nombre, u.apellido
       FROM mediciones m
       LEFT JOIN usuarios u ON m.registrado_por = u.id
       WHERE m.usuario_id = ?
       ORDER BY m.fecha_medicion DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    res.status(200).json({
      status: 'success',
      results: measurements.length,
      data: {
        measurements
      }
    });
  } catch (error) {
    next(error);
  }
});

// Crear nueva medición
router.post('/', validateBody(schemas.measurement), async (req, res, next) => {
  try {
    const {
      peso,
      altura,
      porcentaje_grasa,
      masa_muscular,
      circunferencia_cintura,
      circunferencia_cadera,
      circunferencia_brazo,
      circunferencia_pierna,
      notas
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO mediciones (usuario_id, fecha_medicion, peso, altura, porcentaje_grasa,
                               masa_muscular, circunferencia_cintura, circunferencia_cadera,
                               circunferencia_brazo, circunferencia_pierna, notas, registrado_por)
       VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, peso, altura, porcentaje_grasa, masa_muscular,
       circunferencia_cintura, circunferencia_cadera, circunferencia_brazo,
       circunferencia_pierna, notas, req.user.id]
    );

    const [newMeasurement] = await db.execute(
      'SELECT * FROM mediciones WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      status: 'success',
      data: {
        measurement: newMeasurement[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener estadísticas de progreso
router.get('/stats', async (req, res, next) => {
  try {
    const [stats] = await db.execute(
      `SELECT 
         COUNT(*) as total_mediciones,
         MIN(peso) as peso_minimo,
         MAX(peso) as peso_maximo,
         AVG(peso) as peso_promedio,
         MIN(imc) as imc_minimo,
         MAX(imc) as imc_maximo,
         AVG(imc) as imc_promedio
       FROM mediciones 
       WHERE usuario_id = ?`,
      [req.user.id]
    );

    // Obtener progreso de peso (últimos 6 meses)
    const [weightProgress] = await db.execute(
      `SELECT fecha_medicion, peso, imc
       FROM mediciones 
       WHERE usuario_id = ? AND fecha_medicion >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       ORDER BY fecha_medicion ASC`,
      [req.user.id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        stats: stats[0],
        weightProgress
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
