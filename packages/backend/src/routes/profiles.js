const { Router } = require('express');
const db = require('../db');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = Router();

router.get('/profiles/:username', optionalAuth, (req, res) => {
  const user = db.prepare('SELECT id, username, bio, image FROM users WHERE username = ?').get(req.params.username);

  if (!user) {
    return res.status(404).json({ errors: { body: ['User not found'] } });
  }

  let following = false;
  if (req.user) {
    const follow = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(req.user.id, user.id);
    following = !!follow;
  }

  res.json({
    profile: {
      username: user.username,
      bio: user.bio || null,
      image: user.image || null,
      following,
    },
  });
});

router.post('/profiles/:username/follow', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, username, bio, image FROM users WHERE username = ?').get(req.params.username);

  if (!user) {
    return res.status(404).json({ errors: { body: ['User not found'] } });
  }

  if (user.id === req.user.id) {
    return res.status(422).json({ errors: { body: ['Cannot follow yourself'] } });
  }

  db.prepare('INSERT OR IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)').run(req.user.id, user.id);

  res.json({
    profile: {
      username: user.username,
      bio: user.bio || null,
      image: user.image || null,
      following: true,
    },
  });
});

router.delete('/profiles/:username/follow', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, username, bio, image FROM users WHERE username = ?').get(req.params.username);

  if (!user) {
    return res.status(404).json({ errors: { body: ['User not found'] } });
  }

  db.prepare('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?').run(req.user.id, user.id);

  res.json({
    profile: {
      username: user.username,
      bio: user.bio || null,
      image: user.image || null,
      following: false,
    },
  });
});

module.exports = router;
