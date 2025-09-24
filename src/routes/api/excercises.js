const express = require('express');
const db = require('../../config/database');
const { protect, restrictTo } = require('../../middleware/auth');
const { validateBody, schemas } = require('../../middleware/validation');
const AppError = require('../../utils/appError');

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Obtener todos los ejercicios
router.get('/', async (req, res, next) => {
  try {
    const { categoria_id, meta_id, nivel, search } = req.query;
    let query = `
      SELECT e.*, c.nombre as categoria_nombre, m.nombre as meta_nombre
      FROM ejercicios e
      LEFT JOIN categorias_ejercicios c ON e.categoria_id = c.id
      LEFT JOIN metas m ON e.meta_id = m.id
      WHERE e.activo = true
    `;
    const params = [];

    if (categoria_id) {
      query += ' AND e.categoria_id = ?';
      params.push(categoria_id);
    }

    if (meta_id) {
      query += ' AND e.meta_id = ?';
      params.push(meta_id);
    }

    if (nivel) {
      query += ' AND e.nivel_dificultad = ?';
      params.push(nivel);
    }

    if (search) {
      query += ' AND (e.nombre LIKE ? OR e.descripcion LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY e.nombre ASC';

    const [exercises] = await db.execute(query, params);

    res.status(200).json({
      status: 'success',
      results: exercises.length,
      data: {
        exercises
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener ejercicio por ID
router.get('/:id', async (req, res, next) => {
  try {
    const [exercises] = await db.execute(
      `SELECT e.*, c.nombre as categoria_nombre, m.nombre as meta_nombre
       FROM ejercicios e
       LEFT JOIN categorias_ejercicios c ON e.categoria_id = c.id
       LEFT JOIN metas m ON e.meta_id = m.id
       WHERE e.id = ? AND e.activo = true`,
      [req.params.id]
    );

    if (exercises.length === 0) {
      return next(new AppError('Ejercicio no encontrado', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        exercise: exercises[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// Crear ejercicio (solo entrenadores)
router.post('/', restrictTo('entrenador', 'admin'), validateBody(schemas.exercise), async (req, res, next) => {
  try {
    const {
      nombre,
      descripcion,
      categoria_id,
      meta_id,
      video_youtube_url,
      instrucciones,
      nivel_dificultad,
      puntos_otorgados
    } = req.body;

    const [result] = await db.execute(
      `INSERT INTO ejercicios (nombre, descripcion, categoria_id, meta_id, video_youtube_url, 
                               instrucciones, nivel_dificultad, puntos_otorgados)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, descripcion, categoria_id, meta_id, video_youtube_url, instrucciones, nivel_dificultad, puntos_otorgados]
    );

    const [newExercise] = await db.execute(
      'SELECT * FROM ejercicios WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      status: 'success',
      data: {
        exercise: newExercise[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener categorías de ejercicios
router.get('/categories/all', async (req, res, next) => {
  try {
    const [categories] = await db.execute('SELECT * FROM categorias_ejercicios ORDER BY nombre ASC');

    res.status(200).json({
      status: 'success',
      data: {
        categories
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener metas
router.get('/goals/all', async (req, res, next) => {
  try {
    const [goals] = await db.execute('SELECT * FROM metas WHERE activa = true ORDER BY nombre ASC');

    res.status(200).json({
      status: 'success',
      data: {
        goals
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
