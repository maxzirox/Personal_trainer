// =============================================================================
// routes/diets.js - Rutas de dietas
// =============================================================================

const express = require('express');
const db = require('../../config/database');
const { protect, restrictTo } = require('../../middleware/auth');
const AppError = require('../../utils/appError');

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Obtener dietas asignadas al usuario
router.get('/assigned', async (req, res, next) => {
  try {
    const [diets] = await db.execute(
      `SELECT d.*, ud.fecha_asignacion, ud.fecha_vencimiento,
              u.nombre as asignado_por_nombre, u.apellido as asignado_por_apellido
       FROM usuario_dietas ud
       JOIN dietas d ON ud.dieta_id = d.id
       JOIN usuarios u ON ud.asignado_por = u.id
       WHERE ud.usuario_id = ? AND ud.activa = true
       ORDER BY ud.fecha_asignacion DESC`,
      [req.user.id]
    );

    res.status(200).json({
      status: 'success',
      results: diets.length,
      data: {
        diets
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener detalles de una dieta específica
router.get('/:id', async (req, res, next) => {
  try {
    // Verificar acceso a la dieta
    const [diet] = await db.execute(
      `SELECT d.*, ud.fecha_asignacion, ud.fecha_vencimiento,
              u.nombre as creado_por_nombre, u.apellido as creado_por_apellido
       FROM dietas d
       LEFT JOIN usuario_dietas ud ON d.id = ud.dieta_id AND ud.usuario_id = ?
       LEFT JOIN usuarios u ON d.creado_por = u.id
       WHERE d.id = ? AND (ud.activa = true OR ? IN ('entrenador', 'admin'))`,
      [req.user.id, req.params.id, req.user.tipo_usuario]
    );

    if (diet.length === 0) {
      return next(new AppError('Dieta no encontrada o no tienes acceso', 404));
    }

    // Obtener comidas de la dieta
    const [meals] = await db.execute(
      `SELECT dc.*, 
              GROUP_CONCAT(CONCAT(a.nombre, ':', ca.cantidad_gramos) ORDER BY a.nombre SEPARATOR ';') as alimentos
       FROM dieta_comidas dc
       LEFT JOIN comida_alimentos ca ON dc.id = ca.comida_id
       LEFT JOIN alimentos a ON ca.alimento_id = a.id
       WHERE dc.dieta_id = ?
       GROUP BY dc.id
       ORDER BY dc.tipo_comida, dc.orden`,
      [req.params.id]
    );

    // Formatear alimentos por comida
    const formattedMeals = meals.map(meal => {
      let alimentos = [];
      if (meal.alimentos) {
        alimentos = meal.alimentos.split(';').map(item => {
          const [nombre, cantidad] = item.split(':');
          return { nombre, cantidad_gramos: parseFloat(cantidad) };
        });
      }
      return {
        ...meal,
        alimentos
      };
    });

    res.status(200).json({
      status: 'success',
      data: {
        diet: {
          ...diet[0],
          meals: formattedMeals
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Crear dieta (solo entrenadores)
router.post('/', restrictTo('entrenador', 'admin'), async (req, res, next) => {
  try {
    const { nombre, descripcion, calorias_totales, tipo_dieta, meals } = req.body;

    if (!meals || meals.length === 0) {
      return next(new AppError('La dieta debe tener al menos una comida', 400));
    }

    // Crear dieta
    const [dietResult] = await db.execute(
      `INSERT INTO dietas (nombre, descripcion, calorias_totales, tipo_dieta, creado_por)
       VALUES (?, ?, ?, ?, ?)`,
      [nombre, descripcion, calorias_totales, tipo_dieta, req.user.id]
    );

    const dietId = dietResult.insertId;

    // Agregar comidas a la dieta
    for (let i = 0; i < meals.length; i++) {
      const meal = meals[i];
      
      const [mealResult] = await db.execute(
        `INSERT INTO dieta_comidas (dieta_id, tipo_comida, orden)
         VALUES (?, ?, ?)`,
        [dietId, meal.tipo_comida, i + 1]
      );

      const mealId = mealResult.insertId;

      // Agregar alimentos a la comida
      if (meal.alimentos && meal.alimentos.length > 0) {
        for (const alimento of meal.alimentos) {
          await db.execute(
            `INSERT INTO comida_alimentos (comida_id, alimento_id, cantidad_gramos)
             VALUES (?, ?, ?)`,
            [mealId, alimento.alimento_id, alimento.cantidad_gramos]
          );
        }
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        diet: {
          id: dietId,
          nombre,
          descripcion
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Asignar dieta a usuario (solo entrenadores)
router.post('/assign', restrictTo('entrenador', 'admin'), async (req, res, next) => {
  try {
    const { usuario_id, dieta_id, fecha_vencimiento } = req.body;

    // Verificar que la dieta existe
    const [diet] = await db.execute('SELECT id FROM dietas WHERE id = ?', [dieta_id]);
    if (diet.length === 0) {
      return next(new AppError('Dieta no encontrada', 404));
    }

    // Verificar que el usuario existe
    const [user] = await db.execute('SELECT id FROM usuarios WHERE id = ? AND tipo_usuario = "cliente"', [usuario_id]);
    if (user.length === 0) {
      return next(new AppError('Cliente no encontrado', 404));
    }

    const [result] = await db.execute(
      `INSERT INTO usuario_dietas (usuario_id, dieta_id, asignado_por, fecha_asignacion, fecha_vencimiento)
       VALUES (?, ?, ?, CURDATE(), ?)`,
      [usuario_id, dieta_id, req.user.id, fecha_vencimiento]
    );

    res.status(201).json({
      status: 'success',
      data: {
        assignment: {
          id: result.insertId,
          usuario_id,
          dieta_id,
          asignado_por: req.user.id,
          fecha_vencimiento
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener alimentos disponibles
router.get('/foods/search', async (req, res, next) => {
  try {
    const { search, categoria, limit = 20 } = req.query;
    
    let query = 'SELECT * FROM alimentos WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND nombre LIKE ?';
      params.push(`%${search}%`);
    }

    if (categoria) {
      query += ' AND categoria = ?';
      params.push(categoria);
    }

    query += ' ORDER BY nombre ASC LIMIT ?';
    params.push(parseInt(limit));

    const [foods] = await db.execute(query, params);

    res.status(200).json({
      status: 'success',
      results: foods.length,
      data: {
        foods
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;