// =============================================================================
// middleware/validation.js - Validación de datos
// =============================================================================

const Joi = require('joi');
const AppError = require('../utils/appError');

const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const message = error.details.map(detail => detail.message).join(', ');
      return next(new AppError(message, 400));
    }
    next();
  };
};

// Esquemas de validación
const schemas = {
  register: Joi.object({
    nombre: Joi.string().min(2).max(100).required(),
    apellido: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required(),
    telefono: Joi.string().pattern(/^[0-9+\-\s]+$/),
    fecha_nacimiento: Joi.date().max('now'),
    genero: Joi.string().valid('M', 'F', 'Otro')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  exercise: Joi.object({
    nombre: Joi.string().min(2).max(150).required(),
    descripcion: Joi.string(),
    categoria_id: Joi.number().integer().positive(),
    meta_id: Joi.number().integer().positive(),
    video_youtube_url: Joi.string().uri(),
    instrucciones: Joi.string(),
    nivel_dificultad: Joi.string().valid('principiante', 'intermedio', 'avanzado'),
    puntos_otorgados: Joi.number().integer().min(1).max(100)
  }),

  measurement: Joi.object({
    peso: Joi.number().positive().max(500),
    altura: Joi.number().positive().max(300),
    porcentaje_grasa: Joi.number().min(0).max(100),
    masa_muscular: Joi.number().positive(),
    circunferencia_cintura: Joi.number().positive(),
    circunferencia_cadera: Joi.number().positive(),
    circunferencia_brazo: Joi.number().positive(),
    circunferencia_pierna: Joi.number().positive(),
    notas: Joi.string()
  })
};

module.exports = { validateBody, schemas };