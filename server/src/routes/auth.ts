import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { memoryDb } from '../store/memoryDb';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'collabsync_jwt_secret_2026';

// Register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  if (memoryDb.users.has(email)) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    passwordHash: 'hashed_' + password,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
    role: 'Engineer',
    createdAt: new Date().toISOString()
  };

  memoryDb.users.set(newUser.id, newUser);
  memoryDb.users.set(newUser.email, newUser);

  const token = jwt.sign({ userId: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: newUser.id, name: newUser.name, email: newUser.email, avatar: newUser.avatar, role: newUser.role } });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = memoryDb.users.get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } });
});

// Google Login Sim
router.post('/google', (req, res) => {
  const { name, email, avatar } = req.body;
  let user = memoryDb.users.get(email);
  if (!user) {
    user = {
      id: `usr_g_${Date.now()}`,
      name: name || 'Google User',
      email: email || `user_${Date.now()}@gmail.com`,
      passwordHash: 'oauth_authenticated',
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
      role: 'Researcher',
      createdAt: new Date().toISOString()
    };
    memoryDb.users.set(user.id, user);
    memoryDb.users.set(user.email, user);
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } });
});

// Me
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = memoryDb.users.get(decoded.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, role: user.role } });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
