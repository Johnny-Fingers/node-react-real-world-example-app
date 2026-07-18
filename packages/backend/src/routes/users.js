const { Router } = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken, requireAuth } = require('../middleware/auth');

const router = Router();

router.post('/users/login', (req, res) => {
  const { email, password } = req.body?.user || {};

  if (!email || !password) {
    return res.status(422).json({ errors: { body: ['email and password are required'] } });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ errors: { credentials: ['email or password is invalid'] } });
  }

  const token = generateToken(user.id);
  res.json({
    user: {
      email: user.email,
      token,
      username: user.username,
      bio: user.bio || null,
      image: user.image || null,
    },
  });
});

router.post('/users', (req, res) => {
  const { username, email, password } = req.body?.user || {};

  if (!username || !email || !password) {
    return res.status(422).json({ errors: { body: ['username, email, and password are required'] } });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR username = ?').get(email, username);
  if (existing) {
    return res.status(422).json({ errors: { body: ['email or username already taken'] } });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)').run(username, email, hashedPassword);
  const token = generateToken(result.lastInsertRowid);

  res.status(201).json({
    user: {
      email,
      token,
      username,
      bio: null,
      image: null,
    },
  });
});

router.get('/user', requireAuth, (req, res) => {
  res.json({
    user: {
      email: req.user.email,
      token: generateToken(req.user.id),
      username: req.user.username,
      bio: req.user.bio || null,
      image: req.user.image || null,
    },
  });
});

router.put('/user', requireAuth, (req, res) => {
  const { email, username, password, image, bio } = req.body?.user || {};
  const updates = [];
  const values = [];

  if (email !== undefined) { updates.push('email = ?'); values.push(email); }
  if (username !== undefined) { updates.push('username = ?'); values.push(username); }
  if (password !== undefined) { updates.push('password = ?'); values.push(bcrypt.hashSync(password, 10)); }
  if (image !== undefined) { updates.push('image = ?'); values.push(image); }
  if (bio !== undefined) { updates.push('bio = ?'); values.push(bio); }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(req.user.id);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  res.json({
    user: {
      email: user.email,
      token: generateToken(user.id),
      username: user.username,
      bio: user.bio || null,
      image: user.image || null,
    },
  });
});

module.exports = router;
