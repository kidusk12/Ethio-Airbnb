process.env.JWT_SECRET = 'test-secret';

const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

const db = require('../config/db');
const authRouter = require('../routes/auth');
jest.mock('../config/db'); // ← add this line

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
}

const app = makeApp();

const validUser = {
  name: 'Kidus Kidanewold',
  email: 'kidus@example.com',
  password: 'strongpass123',
  role: 'guest',
};

beforeEach(() => {
  db.__reset();
});

describe('POST /api/auth/register', () => {
  test('creates an account and returns 201 with user + token', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toMatchObject({
      name: validUser.name,
      email: validUser.email,
      role: validUser.role,
    });
    expect(res.body.data.user.password_hash).toBeUndefined();
    expect(typeof res.body.data.token).toBe('string');

    const decoded = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
    expect(decoded).toMatchObject({ id: res.body.data.user.id, role: 'guest' });
  });

  test('stores a bcrypt hash, not the plaintext password', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const stored = db.__users()[0];
    expect(stored.password_hash).not.toBe(validUser.password);
    expect(stored.password_hash).toMatch(/^\$2[aby]\$/); // bcrypt hash prefix
  });

  test('400 when name is missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, name: undefined });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'name' })])
    );
  });

  test('400 when password is under 8 chars', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, password: 'short' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'password' })])
    );
  });

  test('400 when role is invalid', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, role: 'admin' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'role' })])
    );
  });

  test('409 when email is already registered', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'email' })])
    );
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(validUser);
  });

  test('200 with user + token on correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: validUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(validUser.email);
    expect(res.body.data.user.password_hash).toBeUndefined();
    expect(typeof res.body.data.token).toBe('string');
  });

  test('400 when email or password missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: validUser.email });
    expect(res.status).toBe(400);
  });

  test('401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: validUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  test('401 on unknown email (and does not leak whether the email exists)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: validUser.password });
    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });
});

describe('POST /api/auth/logout', () => {
  test('200 regardless of auth state (stateless JWT)', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/auth/me', () => {
  async function registerAndGetToken(overrides = {}) {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validUser, ...overrides });
    return res.body.data.token;
  }

  test('401 when no Authorization header is sent', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test('401 when Authorization header is malformed (no Bearer prefix)', async () => {
    const token = await registerAndGetToken();
    const res = await request(app).get('/api/auth/me').set('Authorization', token);
    expect(res.status).toBe(401);
  });

  test('401 when token is invalid/garbage', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-token');
    expect(res.status).toBe(401);
  });

  test('401 when token is expired', async () => {
    const expiredToken = jwt.sign({ id: '1', role: 'guest' }, process.env.JWT_SECRET, {
      expiresIn: -10, // already expired
    });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
  });

  test('401 when token is valid but signed with the wrong secret', async () => {
    const wrongSecretToken = jwt.sign({ id: '1', role: 'guest' }, 'someone-elses-secret', {
      expiresIn: '7d',
    });
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${wrongSecretToken}`);
    expect(res.status).toBe(401);
  });

  test('200 with the current user when token is valid', async () => {
    const token = await registerAndGetToken();
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: validUser.name,
      email: validUser.email,
      role: validUser.role,
    });
    expect(res.body.data.password_hash).toBeUndefined();
  });

  test('401 when token is valid but the user no longer exists', async () => {
    const token = await registerAndGetToken();
    db.__reset(); // simulate the account being deleted after the token was issued

    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
  });
});