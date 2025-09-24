// =============================================================================
// middleware/security.js - Middlewares adicionales de seguridad
// =============================================================================

const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Rate limiting más específico para diferentes endpoints
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, // máximo 3 cuentas por IP por hora
  message: {
    error: 'Demasiadas cuentas creadas desde esta IP, intenta nuevamente en una hora.'
  },
  skipSuccessfulRequests: true
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 intentos de reset por IP por hora
  message: {
    error: 'Demasiadas solicitudes de cambio de contraseña, intenta nuevamente en una hora.'
  }
});

// Slow down para endpoints sensibles
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 2, // después de 2 requests, comenzar a retrasar
  delayMs: 500 // retrasar 500ms por cada request después del límite
});

// Middleware para validar IDs numéricos
const validateNumericId = (req, res, next) => {
  const { id, clientId, workoutId } = req.params;
  const idToValidate = id || clientId || workoutId;
  
  if (idToValidate && (!Number.isInteger(parseInt(idToValidate)) || parseInt(idToValidate) <= 0)) {
    return res.status(400).json({
      status: 'fail',
      message: 'ID inválido proporcionado'
    });
  }
  next();
};

// Middleware para sanitizar entrada de usuario
const sanitizeInput = (req, res, next) => {
  // Limpiar espacios en blanco de strings
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

module.exports = {
  createAccountLimiter,
  passwordResetLimiter,
  speedLimiter,
  validateNumericId,
  sanitizeInput
};
