// =============================================================================
// routes/workouts.js - Rutas de entrenamientos
// =============================================================================

const express = require('express');
const db = require('../../config/database');
const { protect, restrictTo } = require('../../middleware/auth');
const AppError = require('../../utils/appError');

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Obtener historial de entrenamientos
router.get('/history', async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const [workouts] = await db.execute(
      `SELECT h.*, r.nombre as rutina_nombre, r.descripcion as rutina_descripcion
       FROM historial_entrenamientos h
       JOIN rutinas r ON h.rutina_id = r.id
       WHERE h.usuario_id = ?
       ORDER BY h.fecha_entrenamiento DESC, h.fecha_registro DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limit), parseInt(offset)]
    );

    res.status(200).json({
      status: 'success',
      results: workouts.length,
      data: {
        workouts
      }
    });
  } catch (error) {
    next(error);
  }
});

// Iniciar entrenamiento
router.post('/start', async (req, res, next) => {
  try {
    const { rutina_id } = req.body;

    if (!rutina_id) {
      return next(new AppError('ID de rutina es requerido', 400));
    }

    // Verificar que la rutina está asignada al usuario
    const [assignedRoutine] = await db.execute(
      `SELECT * FROM usuario_rutinas 
       WHERE usuario_id = ? AND rutina_id = ? AND activa = true`,
      [req.user.id, rutina_id]
    );

    if (assignedRoutine.length === 0) {
      return next(new AppError('Rutina no asignada al usuario', 403));
    }

    const [result] = await db.execute(
      `INSERT INTO historial_entrenamientos (usuario_id, rutina_id, fecha_entrenamiento, hora_inicio)
       VALUES (?, ?, CURDATE(), CURTIME())`,
      [req.user.id, rutina_id]
    );

    const [newWorkout] = await db.execute(
      'SELECT * FROM historial_entrenamientos WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      status: 'success',
      data: {
        workout: newWorkout[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// Finalizar entrenamiento
router.patch('/:workoutId/finish', async (req, res, next) => {
  try {
    const { completado = true, notas } = req.body;
    
    // Verificar que el entrenamiento pertenece al usuario
    const [workout] = await db.execute(
      'SELECT * FROM historial_entrenamientos WHERE id = ? AND usuario_id = ?',
      [req.params.workoutId, req.user.id]
    );

    if (workout.length === 0) {
      return next(new AppError('Entrenamiento no encontrado', 404));
    }

    if (workout[0].completado) {
      return next(new AppError('El entrenamiento ya está completado', 400));
    }

    // Calcular puntos basados en ejercicios completados
    const [exerciseResults] = await db.execute(
      `SELECT SUM(e.puntos_otorgados) as puntos_totales
       FROM historial_ejercicios he
       JOIN ejercicios e ON he.ejercicio_id = e.id
       WHERE he.historial_id = ? AND he.completado = true`,
      [req.params.workoutId]
    );

    const puntosGanados = exerciseResults[0].puntos_totales || 0;

    // Actualizar entrenamiento
    await db.execute(
      `UPDATE historial_entrenamientos 
       SET completado = ?, hora_fin = CURTIME(), puntos_ganados = ?, notas = ?
       WHERE id = ?`,
      [completado, puntosGanados, notas, req.params.workoutId]
    );

    if (completado && puntosGanados > 0) {
      // Actualizar puntos del usuario
      await db.execute(
        'UPDATE usuario_niveles SET puntos_totales = puntos_totales + ? WHERE usuario_id = ?',
        [puntosGanados, req.user.id]
      );

      // Registrar en historial de puntos
      await db.execute(
        `INSERT INTO historial_puntos (usuario_id, puntos_ganados, razon, referencia_id)
         VALUES (?, ?, 'entrenamiento_completado', ?)`,
        [req.user.id, puntosGanados, req.params.workoutId]
      );

      // Verificar si subió de nivel
      const [currentLevel] = await db.execute(
        'SELECT puntos_totales, nivel_actual FROM usuario_niveles WHERE usuario_id = ?',
        [req.user.id]
      );

      const [nextLevel] = await db.execute(
        'SELECT * FROM niveles WHERE puntos_requeridos <= ? ORDER BY nivel DESC LIMIT 1',
        [currentLevel[0].puntos_totales]
      );

      if (nextLevel.length > 0 && nextLevel[0].nivel > currentLevel[0].nivel_actual) {
        await db.execute(
          'UPDATE usuario_niveles SET nivel_actual = ?, fecha_ultimo_nivel = NOW() WHERE usuario_id = ?',
          [nextLevel[0].nivel, req.user.id]
        );
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        message: 'Entrenamiento finalizado exitosamente',
        puntosGanados
      }
    });
  } catch (error) {
    next(error);
  }
});

// Registrar ejercicio completado
router.post('/:workoutId/exercises', async (req, res, next) => {
  try {
    const { ejercicio_id, series_completadas, repeticiones_realizadas, peso_utilizado, completado, notas } = req.body;

    // Verificar que el entrenamiento pertenece al usuario
    const [workout] = await db.execute(
      'SELECT * FROM historial_entrenamientos WHERE id = ? AND usuario_id = ?',
      [req.params.workoutId, req.user.id]
    );

    if (workout.length === 0) {
      return next(new AppError('Entrenamiento no encontrado', 404));
    }

    const [result] = await db.execute(
      `INSERT INTO historial_ejercicios (historial_id, ejercicio_id, series_completadas,
                                        repeticiones_realizadas, peso_utilizado, completado, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.params.workoutId, ejercicio_id, series_completadas, repeticiones_realizadas,
       peso_utilizado, completado, notas]
    );

    res.status(201).json({
      status: 'success',
      data: {
        exerciseRecord: {
          id: result.insertId,
          historial_id: req.params.workoutId,
          ejercicio_id,
          series_completadas,
          repeticiones_realizadas,
          peso_utilizado,
          completado,
          notas
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;