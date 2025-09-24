require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');

// Importar rutas
const authRoutes = require('./src/routes/api/auth');
const userRoutes = require('./src/routes/api/users');
const exerciseRoutes = require('./src/routes/api/excercises');
const routineRoutes = require('./src/routes/api/routines');
const dietRoutes = require('./src/routes/api/diets');
const measurementRoutes = require('./src/routes/api/measurements');
const workoutRoutes = require('./src/routes/api/workouts');

// Importar middlewares
const errorHandler = require('./src/middleware/errorHandler');
const { sanitizeInput } = require('./src/middleware/security');
const logger = require('./src/utils/logger');

const app = express();

// =============================================================================
// CONFIGURACIÓN DE SEGURIDAD
// =============================================================================

// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configurado
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por IP
  message: {
    error: 'Demasiadas peticiones desde esta IP, intenta nuevamente en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo 5 intentos de login por IP
  skipSuccessfulRequests: true,
  message: {
    error: 'Demasiados intentos de login, intenta nuevamente en 15 minutos.'
  }
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(mongoSanitize()); // NoSQL injection
app.use(xss()); // XSS attacks
app.use(hpp()); // HTTP Parameter Pollution
app.use(sanitizeInput); // Sanitización personalizada

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { 
    stream: { 
      write: message => logger.info(message.trim()) 
    }
  }));
}

// Sessions (opcional - usando solo memoria para simplificar)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 horas
  }
}));

// Si quieres usar Redis, descomenta esto y ajusta la configuración:
/*
if (process.env.REDIS_HOST) {
  const RedisStore = require('connect-redis').default;
  const { createClient } = require('redis');
  
  const redisClient = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    }
  });
  
  redisClient.connect().catch(console.error);

  app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24
    }
  }));
}
*/

// =============================================================================
// RUTAS
// =============================================================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/diets', dietRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/workouts', workoutRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Personal Trainer API',
    version: '1.0.0',
    status: 'running'
  });
});

// Manejo de rutas no encontradas
app.all('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `No se puede encontrar ${req.originalUrl} en este servidor`
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// =============================================================================
// INICIO DEL SERVIDOR
// =============================================================================

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
  logger.info(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Cerrando servidor...');
  logger.error(err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Cerrando servidor...');
  logger.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM recibido. Cerrando servidor gracefully...');
  server.close(() => {
    logger.info('💥 Proceso terminado!');
  });
});

module.exports = app;