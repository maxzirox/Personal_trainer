// =============================================================================
// middleware/auth.js - Middleware de autenticación
// =============================================================================

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const db = require('../config/database');
const AppError = require('../utils/appError');

const protect = async (req, res, next) => {
  try {
    // 1) Obtener token del header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No estás logueado. Por favor inicia sesión.', 401));
    }

    // 2) Verificar token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Verificar si el usuario aún existe
    const [rows] = await db.execute(
      'SELECT id, email, tipo_usuario, activo FROM usuarios WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return next(new AppError('El usuario ya no existe.', 401));
    }

    const currentUser = rows[0];

    if (!currentUser.activo) {
      return next(new AppError('Tu cuenta ha sido desactivada.', 401));
    }

    // 4) Agregar usuario a request
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Token inválido.', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expirado.', 401));
    }
    next(error);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.tipo_usuario)) {
      return next(new AppError('No tienes permisos para realizar esta acción.', 403));
    }
    next();
  };
};

module.exports = { protect, restrictTo };