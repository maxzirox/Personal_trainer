// =============================================================================
// routes/routines.js - Rutas de rutinas
// =============================================================================

const express = require('express');
const db = require('../../config/database');
const { protect, restrictTo } = require('../../middleware/auth');
const AppError = require('../../utils/appError');

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Obtener rutinas asignadas al usuario
router.get('/assigned', async (req, res, next) => {
  try {
    const [routines] = await db.execute(
      `SELECT r.*, ur.fecha_asignacion, ur.fecha_vencimiento, ur.completada,
              u.nombre as asignado_por_nombre, u.apellido as asignado_por_apellido,
              COUNT(re.id) as total_ejercicios
       FROM usuario_rutinas ur
       JOIN rutinas r ON ur.rutina_id = r.id
       JOIN usuarios u ON ur.asignado_por = u.id
       LEFT JOIN rutina_ejercicios re ON r.id = re.rutina_id
       WHERE ur.usuario_id = ? AND ur.activa = true
       GROUP BY r.id, ur.id
       ORDER BY ur.fecha_asignacion DESC`,
      [req.user.id]
    );

    res.status(200).json({
      status: 'success',
      results: routines.length,
      data: {
        routines
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener detalles de una rutina específica
router.get('/:id', async (req, res, next) => {
  try {
    // Verificar que la rutina está asignada al usuario o es un entrenador
    let accessQuery = `
      SELECT r.*, ur.fecha_asignacion, ur.fecha_vencimiento, ur.completada,
             u.nombre as creado_por_nombre, u.apellido as creado_por_apellido
      FROM rutinas r
      LEFT JOIN usuario_rutinas ur ON r.id = ur.rutina_id AND ur.usuario_id = ?
      LEFT JOIN usuarios u ON r.creado_por = u.id
      WHERE r.id = ? AND (ur.activa = true OR ? IN ('entrenador', 'admin'))
    `;

    const [routine] = await db.execute(accessQuery, [req.user.id, req.params.id, req.user.tipo_usuario]);

    if (routine.length === 0) {
      return next(new AppError('Rutina no encontrada o no tienes acceso', 404));
    }

    // Obtener ejercicios de la rutina
    const [exercises] = await db.execute(
      `SELECT re.*, e.nombre, e.descripcion, e.video_youtube_url, e.instrucciones,
              e.nivel_dificultad, e.puntos_otorgados, c.nombre as categoria_nombre
       FROM rutina_ejercicios re
       JOIN ejercicios e ON re.ejercicio_id = e.id
       LEFT JOIN categorias_ejercicios c ON e.categoria_id = c.id
       WHERE re.rutina_id = ?
       ORDER BY re.orden ASC`,
      [req.params.id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        routine: {
          ...routine[0],
          exercises
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Crear rutina (solo entrenadores)
router.post('/', restrictTo('entrenador', 'admin'), async (req, res, next) => {
  try {
    const { nombre, descripcion, duracion_minutos, nivel_dificultad, puntos_completar, exercises } = req.body;

    if (!exercises || exercises.length === 0) {
      return next(new AppError('La rutina debe tener al menos un ejercicio', 400));
    }

    // Crear rutina
    const [routineResult] = await db.execute(
      `INSERT INTO rutinas (nombre, descripcion, duracion_minutos, nivel_dificultad, puntos_completar, creado_por)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, duracion_minutos, nivel_dificultad, puntos_completar, req.user.id]
    );

    const rutinaId = routineResult.insertId;

    // Agregar ejercicios a la rutina
    for (let i = 0; i < exercises.length; i++) {
      const exercise = exercises[i];
      await db.execute(
        `INSERT INTO rutina_ejercicios (rutina_id, ejercicio_id, orden, series, repeticiones, peso_sugerido, descanso_segundos, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [rutinaId, exercise.ejercicio_id, i + 1, exercise.series, exercise.repeticiones,
         exercise.peso_sugerido, exercise.descanso_segundos, exercise.notas]
      );
    }

    res.status(201).json({
      status: 'success',
      data: {
        routine: {
          id: rutinaId,
          nombre,
          descripcion
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Asignar rutina a usuario (solo entrenadores)
router.post('/assign', restrictTo('entrenador', 'admin'), async (req, res, next) => {
  try {
    const { usuario_id, rutina_id, fecha_vencimiento } = req.body;

    // Verificar que la rutina existe
    const [routine] = await db.execute('SELECT id FROM rutinas WHERE id = ?', [rutina_id]);
    if (routine.length === 0) {
      return next(new AppError('Rutina no encontrada', 404));
    }

    // Verificar que el usuario existe
    const [user] = await db.execute('SELECT id FROM usuarios WHERE id = ? AND tipo_usuario = "cliente"', [usuario_id]);
    if (user.length === 0) {
      return next(new AppError('Cliente no encontrado', 404));
    }

    const [result] = await db.execute(
      `INSERT INTO usuario_rutinas (usuario_id, rutina_id, asignado_por, fecha_asignacion, fecha_vencimiento)
       VALUES (?, ?, ?, CURDATE(), ?)`,
      [usuario_id, rutina_id, req.user.id, fecha_vencimiento]
    );

    res.status(201).json({
      status: 'success',
      data: {
        assignment: {
          id: result.insertId,
          usuario_id,
          rutina_id,
          asignado_por: req.user.id,
          fecha_vencimiento
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;