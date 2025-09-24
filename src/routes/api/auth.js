// =============================================================================
// routes/auth.js - Rutas de autenticación
// =============================================================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const db = require('../../config/database');
const AppError = require('../../utils/appError');
const { protect } = require('../../middleware/auth');
const { validateBody, schemas } = require('../../middleware/validation');
const logger = require('../../utils/logger');

const router = express.Router();

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  
  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remover password del output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// Registro
router.post('/register', validateBody(schemas.register), async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, telefono, fecha_nacimiento, genero } = req.body;

    // Verificar si el email ya existe
    const [existingUser] = await db.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return next(new AppError('El email ya está registrado', 400));
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const [result] = await db.execute(
      `INSERT INTO usuarios (nombre, apellido, email, password, telefono, fecha_nacimiento, genero)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, email, hashedPassword, telefono, fecha_nacimiento, genero]
    );

    // Crear registro de niveles para el usuario
    await db.execute(
      'INSERT INTO usuario_niveles (usuario_id, puntos_totales, nivel_actual) VALUES (?, 0, 1)',
      [result.insertId]
    );

    // Obtener usuario creado
    const [newUser] = await db.execute(
      'SELECT id, nombre, apellido, email, tipo_usuario FROM usuarios WHERE id = ?',
      [result.insertId]
    );

    logger.info(`Nuevo usuario registrado: ${email}`);
    createSendToken(newUser[0], 201, res);
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', validateBody(schemas.login), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verificar que el usuario existe y la contraseña es correcta
    const [users] = await db.execute(
      'SELECT id, nombre, apellido, email, password, tipo_usuario, activo FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0 || !await bcrypt.compare(password, users[0].password)) {
      return next(new AppError('Email o contraseña incorrectos', 401));
    }

    const user = users[0];

    if (!user.activo) {
      return next(new AppError('Tu cuenta ha sido desactivada', 401));
    }

    logger.info(`Usuario logueado: ${email}`);
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
});

// Obtener usuario actual
router.get('/me', protect, async (req, res, next) => {
  try {
    const [user] = await db.execute(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.telefono, u.fecha_nacimiento, 
              u.genero, u.tipo_usuario, un.puntos_totales, un.nivel_actual, n.nombre as nivel_nombre
       FROM usuarios u
       LEFT JOIN usuario_niveles un ON u.id = un.usuario_id
       LEFT JOIN niveles n ON un.nivel_actual = n.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: user[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;