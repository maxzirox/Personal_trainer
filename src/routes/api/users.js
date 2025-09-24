// =============================================================================
// routes/users.js - Rutas de usuarios
// =============================================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/database');
const { protect, restrictTo } = require('../../middleware/auth');
const AppError = require('../../utils/appError');

const router = express.Router();

// Proteger todas las rutas
router.use(protect);

// Obtener perfil del usuario
router.get('/profile', async (req, res, next) => {
  try {
    const [user] = await db.execute(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.fecha_nacimiento,
              u.genero, u.tipo_usuario, u.fecha_registro,
              un.puntos_totales, un.nivel_actual, n.nombre as nivel_nombre, n.recompensa
       FROM usuarios u
       LEFT JOIN usuario_niveles un ON u.id = un.usuario_id
       LEFT JOIN niveles n ON un.nivel_actual = n.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    // Obtener suscripción activa
    const [subscription] = await db.execute(
      `SELECT us.*, s.nombre as plan_nombre, s.descripcion as plan_descripcion, s.precio
       FROM usuario_suscripciones us
       JOIN suscripciones s ON us.suscripcion_id = s.id
       WHERE us.usuario_id = ? AND us.activa = true AND us.fecha_fin >= CURDATE()
       ORDER BY us.fecha_fin DESC LIMIT 1`,
      [req.user.id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: user[0],
        subscription: subscription[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
});

// Actualizar perfil
router.patch('/profile', async (req, res, next) => {
  try {
    const { nombre, apellido, telefono, fecha_nacimiento, genero } = req.body;
    
    const fieldsToUpdate = [];
    const values = [];

    if (nombre) {
      fieldsToUpdate.push('nombre = ?');
      values.push(nombre);
    }
    if (apellido) {
      fieldsToUpdate.push('apellido = ?');
      values.push(apellido);
    }
    if (telefono) {
      fieldsToUpdate.push('telefono = ?');
      values.push(telefono);
    }
    if (fecha_nacimiento) {
      fieldsToUpdate.push('fecha_nacimiento = ?');
      values.push(fecha_nacimiento);
    }
    if (genero) {
      fieldsToUpdate.push('genero = ?');
      values.push(genero);
    }

    if (fieldsToUpdate.length === 0) {
      return next(new AppError('No hay campos para actualizar', 400));
    }

    values.push(req.user.id);

    await db.execute(
      `UPDATE usuarios SET ${fieldsToUpdate.join(', ')}, fecha_actualizacion = NOW() WHERE id = ?`,
      values
    );

    res.status(200).json({
      status: 'success',
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// Cambiar contraseña
router.patch('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new AppError('Se requiere la contraseña actual y la nueva contraseña', 400));
    }

    // Validar nueva contraseña
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/;
    if (newPassword.length < 8 || !passwordRegex.test(newPassword)) {
      return next(new AppError('La nueva contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos', 400));
    }

    // Verificar contraseña actual
    const [user] = await db.execute('SELECT password FROM usuarios WHERE id = ?', [req.user.id]);
    
    if (!await bcrypt.compare(currentPassword, user[0].password)) {
      return next(new AppError('Contraseña actual incorrecta', 400));
    }

    // Actualizar contraseña
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await db.execute('UPDATE usuarios SET password = ? WHERE id = ?', [hashedNewPassword, req.user.id]);

    res.status(200).json({
      status: 'success',
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

// Obtener dashboard del usuario
router.get('/dashboard', async (req, res, next) => {
  try {
    // Estadísticas generales
    const [workoutStats] = await db.execute(
      `SELECT 
         COUNT(*) as total_entrenamientos,
         COUNT(CASE WHEN completado = true THEN 1 END) as entrenamientos_completados,
         SUM(puntos_ganados) as puntos_totales_ganados
       FROM historial_entrenamientos 
       WHERE usuario_id = ?`,
      [req.user.id]
    );

    // Rutinas activas
    const [activeRoutines] = await db.execute(
      `SELECT COUNT(*) as rutinas_activas
       FROM usuario_rutinas 
       WHERE usuario_id = ? AND activa = true AND (fecha_vencimiento IS NULL OR fecha_vencimiento >= CURDATE())`,
      [req.user.id]
    );

    // Progreso de la semana actual
    const [weekProgress] = await db.execute(
      `SELECT DATE(fecha_entrenamiento) as fecha, COUNT(*) as entrenamientos
       FROM historial_entrenamientos 
       WHERE usuario_id = ? AND fecha_entrenamiento >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY DATE(fecha_entrenamiento)
       ORDER BY fecha ASC`,
      [req.user.id]
    );

    // Nivel actual y progreso
    const [levelInfo] = await db.execute(
      `SELECT un.puntos_totales, un.nivel_actual, n.nombre as nivel_actual_nombre,
              n.puntos_requeridos as puntos_nivel_actual,
              n2.nivel as siguiente_nivel, n2.nombre as siguiente_nivel_nombre,
              n2.puntos_requeridos as puntos_siguiente_nivel
       FROM usuario_niveles un
       JOIN niveles n ON un.nivel_actual = n.id
       LEFT JOIN niveles n2 ON n2.nivel = n.nivel + 1
       WHERE un.usuario_id = ?`,
      [req.user.id]
    );

    // Próximos entrenamientos (rutinas asignadas)
    const [upcomingWorkouts] = await db.execute(
      `SELECT r.id, r.nombre, r.descripcion, r.duracion_minutos, ur.fecha_vencimiento
       FROM usuario_rutinas ur
       JOIN rutinas r ON ur.rutina_id = r.id
       WHERE ur.usuario_id = ? AND ur.activa = true 
       AND (ur.fecha_vencimiento IS NULL OR ur.fecha_vencimiento >= CURDATE())
       ORDER BY ur.fecha_asignacion DESC
       LIMIT 5`,
      [req.user.id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          ...workoutStats[0],
          rutinas_activas: activeRoutines[0].rutinas_activas
        },
        weekProgress,
        levelInfo: levelInfo[0] || null,
        upcomingWorkouts
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener clientes (solo entrenadores)
router.get('/clients', restrictTo('entrenador', 'admin'), async (req, res, next) => {
  try {
    const { search, limit = 20, offset = 0 } = req.query;
    
    let query = `
      SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.fecha_registro,
             un.puntos_totales, un.nivel_actual, n.nombre as nivel_nombre,
             COUNT(DISTINCT ur.id) as rutinas_asignadas,
             COUNT(DISTINCT ud.id) as dietas_asignadas,
             MAX(he.fecha_entrenamiento) as ultimo_entrenamiento
      FROM usuarios u
      LEFT JOIN usuario_niveles un ON u.id = un.usuario_id
      LEFT JOIN niveles n ON un.nivel_actual = n.id
      LEFT JOIN usuario_rutinas ur ON u.id = ur.usuario_id AND ur.activa = true
      LEFT JOIN usuario_dietas ud ON u.id = ud.usuario_id AND ud.activa = true
      LEFT JOIN historial_entrenamientos he ON u.id = he.usuario_id
      WHERE u.tipo_usuario = 'cliente' AND u.activo = true
    `;
    
    const params = [];

    if (search) {
      query += ' AND (u.nombre LIKE ? OR u.apellido LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` GROUP BY u.id ORDER BY u.nombre ASC, u.apellido ASC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const [clients] = await db.execute(query, params);

    res.status(200).json({
      status: 'success',
      results: clients.length,
      data: {
        clients
      }
    });
  } catch (error) {
    next(error);
  }
});

// Obtener detalles de un cliente específico (solo entrenadores)
router.get('/clients/:clientId', restrictTo('entrenador', 'admin'), async (req, res, next) => {
  try {
    const [client] = await db.execute(
      `SELECT u.*, un.puntos_totales, un.nivel_actual, n.nombre as nivel_nombre
       FROM usuarios u
       LEFT JOIN usuario_niveles un ON u.id = un.usuario_id
       LEFT JOIN niveles n ON un.nivel_actual = n.id
       WHERE u.id = ? AND u.tipo_usuario = 'cliente'`,
      [req.params.clientId]
    );

    if (client.length === 0) {
      return next(new AppError('Cliente no encontrado', 404));
    }

    // Obtener últimas mediciones
    const [measurements] = await db.execute(
      `SELECT * FROM mediciones WHERE usuario_id = ? ORDER BY fecha_medicion DESC LIMIT 5`,
      [req.params.clientId]
    );

    // Obtener rutinas asignadas
    const [routines] = await db.execute(
      `SELECT ur.*, r.nombre, r.descripcion, r.duracion_minutos
       FROM usuario_rutinas ur
       JOIN rutinas r ON ur.rutina_id = r.id
       WHERE ur.usuario_id = ? AND ur.activa = true
       ORDER BY ur.fecha_asignacion DESC`,
      [req.params.clientId]
    );

    // Obtener estadísticas de entrenamientos
    const [workoutStats] = await db.execute(
      `SELECT 
         COUNT(*) as total_entrenamientos,
         COUNT(CASE WHEN completado = true THEN 1 END) as entrenamientos_completados,
         AVG(CASE WHEN completado = true THEN puntos_ganados ELSE NULL END) as promedio_puntos
       FROM historial_entrenamientos 
       WHERE usuario_id = ?`,
      [req.params.clientId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        client: client[0],
        measurements,
        routines,
        workoutStats: workoutStats[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;