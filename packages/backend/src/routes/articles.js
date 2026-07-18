const { Router } = require('express');
const slugify = require('slugify');
const db = require('../db');
const { optionalAuth, requireAuth } = require('../middleware/auth');

const router = Router();

function makeSlug(title) {
  let slug = slugify(title, { lower: true, strict: true });
  const suffix = Math.random().toString(36).substring(2, 8);
  slug = `${slug}-${suffix}`;
  return slug;
}

function toISO(dateStr) {
  if (!dateStr) return dateStr;
  return dateStr.replace(' ', 'T') + '.000Z';
}

function nullable(val) {
  return val || null;
}

function articleResponse(article, currentUserId) {
  let favorited = false;
  let following = false;

  if (currentUserId) {
    const fav = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND article_id = ?').get(currentUserId, article.id);
    favorited = !!fav;

    const follow = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(currentUserId, article.author_id);
    following = !!follow;
  }

  const favoritesCount = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE article_id = ?').get(article.id).count;

  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    body: article.body,
    tagList: JSON.parse(article.tag_list || '[]'),
    createdAt: toISO(article.created_at),
    updatedAt: toISO(article.updated_at),
    favorited,
    favoritesCount,
    author: {
      username: article.author_username,
      bio: nullable(article.author_bio),
      image: nullable(article.author_image),
      following,
    },
  };
}

function listArticleResponse(article, currentUserId) {
  let favorited = false;
  let following = false;

  if (currentUserId) {
    const fav = db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND article_id = ?').get(currentUserId, article.id);
    favorited = !!fav;

    const follow = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(currentUserId, article.author_id);
    following = !!follow;
  }

  const favoritesCount = db.prepare('SELECT COUNT(*) as count FROM favorites WHERE article_id = ?').get(article.id).count;

  return {
    slug: article.slug,
    title: article.title,
    description: article.description,
    tagList: JSON.parse(article.tag_list || '[]'),
    createdAt: toISO(article.created_at),
    updatedAt: toISO(article.updated_at),
    favorited,
    favoritesCount,
    author: {
      username: article.author_username,
      bio: nullable(article.author_bio),
      image: nullable(article.author_image),
      following,
    },
  };
}

const ARTICLE_SELECT = `
  SELECT a.*, u.username AS author_username, u.bio AS author_bio, u.image AS author_image
  FROM articles a
  JOIN users u ON a.author_id = u.id
`;

router.get('/articles', optionalAuth, (req, res) => {
  const { tag, author, favorited, limit = 20, offset = 0 } = req.query;
  let query = ARTICLE_SELECT;
  const conditions = [];
  const params = [];

  if (tag) {
    conditions.push("a.tag_list LIKE ?");
    params.push(`%"${tag}"%`);
  }
  if (author) {
    conditions.push("u.username = ?");
    params.push(author);
  }
  if (favorited) {
    conditions.push("a.id IN (SELECT article_id FROM favorites WHERE user_id = (SELECT id FROM users WHERE username = ?))");
    params.push(favorited);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY a.created_at DESC';

  const countQuery = query.replace(/SELECT a\.\*.*FROM/, 'SELECT COUNT(*) as count FROM');
  const totalCount = db.prepare(countQuery).get(...params).count;

  query += ' LIMIT ? OFFSET ?';
  params.push(Number(limit), Number(offset));

  const articles = db.prepare(query).all(...params);
  const currentUserId = req.user?.id || null;

  res.json({
    articles: articles.map(a => listArticleResponse(a, currentUserId)),
    articlesCount: totalCount,
  });
});

router.get('/articles/feed', requireAuth, (req, res) => {
  const { limit = 20, offset = 0 } = req.query;

  const articles = db.prepare(`
    ${ARTICLE_SELECT}
    WHERE a.author_id IN (SELECT followee_id FROM follows WHERE follower_id = ?)
    ORDER BY a.created_at DESC
    LIMIT ? OFFSET ?
  `).all(req.user.id, Number(limit), Number(offset));

  const countResult = db.prepare(`
    SELECT COUNT(*) as count FROM articles a
    WHERE a.author_id IN (SELECT followee_id FROM follows WHERE follower_id = ?)
  `).get(req.user.id);

  res.json({
    articles: articles.map(a => listArticleResponse(a, req.user.id)),
    articlesCount: countResult.count,
  });
});

router.get('/articles/:slug', optionalAuth, (req, res) => {
  const article = db.prepare(`${ARTICLE_SELECT} WHERE a.slug = ?`).get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['Article not found'] } });
  }

  const currentUserId = req.user?.id || null;
  res.json({ article: articleResponse(article, currentUserId) });
});

router.post('/articles', requireAuth, (req, res) => {
  const { title, description, body, tagList } = req.body?.article || {};

  if (!title || !description || !body) {
    return res.status(422).json({ errors: { body: ['title, description, and body are required'] } });
  }

  const slug = makeSlug(title);
  const tags = JSON.stringify(tagList || []);

  const result = db.prepare(
    'INSERT INTO articles (slug, title, description, body, tag_list, author_id) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(slug, title, description, body, tags, req.user.id);

  const article = db.prepare(`${ARTICLE_SELECT} WHERE a.id = ?`).get(result.lastInsertRowid);
  res.status(201).json({ article: articleResponse(article, req.user.id) });
});

router.put('/articles/:slug', requireAuth, (req, res) => {
  const article = db.prepare(`${ARTICLE_SELECT} WHERE a.slug = ?`).get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['Article not found'] } });
  }

  if (article.author_id !== req.user.id) {
    return res.status(403).json({ errors: { body: ['Not authorized'] } });
  }

  const { title, description, body } = req.body?.article || {};
  const updates = [];
  const values = [];

  if (title !== undefined) {
    const newSlug = makeSlug(title);
    updates.push('slug = ?');
    values.push(newSlug);
    updates.push('title = ?');
    values.push(title);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (body !== undefined) {
    updates.push('body = ?');
    values.push(body);
  }

  if (updates.length > 0) {
    updates.push("updated_at = datetime('now')");
    values.push(article.id);
    db.prepare(`UPDATE articles SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }

  const updated = db.prepare(`${ARTICLE_SELECT} WHERE a.id = ?`).get(article.id);
  res.json({ article: articleResponse(updated, req.user.id) });
});

router.delete('/articles/:slug', requireAuth, (req, res) => {
  const article = db.prepare('SELECT * FROM articles WHERE slug = ?').get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['Article not found'] } });
  }

  if (article.author_id !== req.user.id) {
    return res.status(403).json({ errors: { body: ['Not authorized'] } });
  }

  db.prepare('DELETE FROM comments WHERE article_id = ?').run(article.id);
  db.prepare('DELETE FROM favorites WHERE article_id = ?').run(article.id);
  db.prepare('DELETE FROM articles WHERE id = ?').run(article.id);

  res.status(204).send();
});

router.post('/articles/:slug/favorite', requireAuth, (req, res) => {
  const article = db.prepare(`${ARTICLE_SELECT} WHERE a.slug = ?`).get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['Article not found'] } });
  }

  db.prepare('INSERT OR IGNORE INTO favorites (user_id, article_id) VALUES (?, ?)').run(req.user.id, article.id);

  const updated = db.prepare(`${ARTICLE_SELECT} WHERE a.id = ?`).get(article.id);
  res.json({ article: articleResponse(updated, req.user.id) });
});

router.delete('/articles/:slug/favorite', requireAuth, (req, res) => {
  const article = db.prepare(`${ARTICLE_SELECT} WHERE a.slug = ?`).get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['Article not found'] } });
  }

  db.prepare('DELETE FROM favorites WHERE user_id = ? AND article_id = ?').run(req.user.id, article.id);

  const updated = db.prepare(`${ARTICLE_SELECT} WHERE a.id = ?`).get(article.id);
  res.json({ article: articleResponse(updated, req.user.id) });
});

router.post('/articles/:slug/comments', requireAuth, (req, res) => {
  const { body } = req.body?.comment || {};
  const article = db.prepare(`${ARTICLE_SELECT} WHERE a.slug = ?`).get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['Article not found'] } });
  }

  if (!body) {
    return res.status(422).json({ errors: { body: ['body is required'] } });
  }

  const result = db.prepare('INSERT INTO comments (body, article_id, author_id) VALUES (?, ?, ?)').run(body, article.id, req.user.id);
  const comment = db.prepare(`
    SELECT c.*, u.username AS author_username, u.bio AS author_bio, u.image AS author_image
    FROM comments c
    JOIN users u ON c.author_id = u.id
    WHERE c.id = ?
  `).get(result.lastInsertRowid);

  let following = false;
  const follow = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(req.user.id, comment.author_id);
  following = !!follow;

  res.status(201).json({
    comment: {
      id: comment.id,
      createdAt: toISO(comment.created_at),
      updatedAt: toISO(comment.updated_at),
      body: comment.body,
      author: {
        username: comment.author_username,
        bio: nullable(comment.author_bio),
        image: nullable(comment.author_image),
        following,
      },
    },
  });
});

router.get('/articles/:slug/comments', optionalAuth, (req, res) => {
  const article = db.prepare('SELECT id FROM articles WHERE slug = ?').get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['Article not found'] } });
  }

  const comments = db.prepare(`
    SELECT c.*, u.username AS author_username, u.bio AS author_bio, u.image AS author_image
    FROM comments c
    JOIN users u ON c.author_id = u.id
    WHERE c.article_id = ?
    ORDER BY c.created_at ASC
  `).all(article.id);

  const currentUserId = req.user?.id || null;

  res.json({
    comments: comments.map(c => {
      let following = false;
      if (currentUserId) {
        const follow = db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(currentUserId, c.author_id);
        following = !!follow;
      }

      return {
        id: c.id,
        createdAt: toISO(c.created_at),
        updatedAt: toISO(c.updated_at),
        body: c.body,
        author: {
          username: c.author_username,
          bio: nullable(c.author_bio),
          image: nullable(c.author_image),
          following,
        },
      };
    }),
  });
});

router.delete('/articles/:slug/comments/:id', requireAuth, (req, res) => {
  const article = db.prepare('SELECT id FROM articles WHERE slug = ?').get(req.params.slug);

  if (!article) {
    return res.status(404).json({ errors: { body: ['Article not found'] } });
  }

  const comment = db.prepare('SELECT * FROM comments WHERE id = ? AND article_id = ?').get(req.params.id, article.id);

  if (!comment) {
    return res.status(404).json({ errors: { body: ['Comment not found'] } });
  }

  if (comment.author_id !== req.user.id) {
    return res.status(403).json({ errors: { body: ['Not authorized'] } });
  }

  db.prepare('DELETE FROM comments WHERE id = ?').run(comment.id);
  res.json({ message: 'Comment deleted' });
});

module.exports = router;
