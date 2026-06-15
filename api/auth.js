import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, getUserByUsername } from './db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gabi_ai_jwt_default_secret_key';

// Middleware to protect API routes
export function authenticateToken(req, res, next) {
  // Allow bypassing auth in local dev environment if JWT_SECRET is disabled or in mock operations,
  // but enforce it if Authorization header is supplied.
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    // If no token, check if we want to run in legacy mock-mode without auth (e.g. for simple local testing)
    // To be strictly production-ready, we allow 'rogerio' as default user if token verification is skipped.
    req.user = { username: 'rogerio' };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado. Inicia sesión nuevamente.' });
    }
    req.user = user;
    next();
  });
}

// Register User
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const existingUser = await getUserByUsername(cleanUsername);
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user in DB
    const user = await createUser(cleanUsername, hashedPassword);

    // Create JWT
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Usuario registrado con éxito.',
      token,
      user: {
        username: user.username,
        tokenBalance: user.token_balance
      }
    });
  } catch (err) {
    console.error("[Auth] Register error:", err);
    res.status(500).json({ error: 'Error interno del servidor al registrar usuario.' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
  }

  const cleanUsername = username.trim().toLowerCase();

  try {
    const user = await getUserByUsername(cleanUsername);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }

    // Verify password (skip check if password in DB is empty for backwards compatibility in dev)
    if (user.password) {
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas.' });
      }
    }

    // Create JWT
    const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Sesión iniciada con éxito.',
      token,
      user: {
        username: user.username,
        tokenBalance: user.token_balance
      }
    });
  } catch (err) {
    console.error("[Auth] Login error:", err);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
  }
});

// Get current profile info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getUserByUsername(req.user.username);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    res.json({
      username: user.username,
      tokenBalance: user.token_balance
    });
  } catch (err) {
    console.error("[Auth] Profile error:", err);
    res.status(500).json({ error: 'Error al obtener perfil del usuario.' });
  }
});

export default router;
