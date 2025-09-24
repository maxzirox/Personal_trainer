// =============================================================================
// tests/auth.test.js - Ejemplo de tests (opcional)
// =============================================================================

const request = require('supertest');
const app = require('../server'); // Ajustar la ruta según tu estructura

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    test('Should register a new user', async () => {
      const userData = {
        nombre: 'Test',
        apellido: 'User',
        email: 'test@example.com',
        password: 'TestPassword123!',
        telefono: '+1234567890',
        fecha_nacimiento: '1990-01-01',
        genero: 'M'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
    });

    test('Should not register user with invalid email', async () => {
      const userData = {
        nombre: 'Test',
        apellido: 'User',
        email: 'invalid-email',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('fail');
    });
  });

  describe('POST /api/auth/login', () => {
    test('Should login existing user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
    });

    test('Should not login with wrong password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.status).toBe('fail');
    });
  });
});
