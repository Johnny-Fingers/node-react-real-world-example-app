const { Router } = require('express');
const db = require('../db');

const router = Router();

router.get('/tags', (req, res) => {
  const articles = db.prepare('SELECT tag_list FROM articles').all();
  const tagSet = new Set();

  for (const article of articles) {
    const tags = JSON.parse(article.tag_list || '[]');
    for (const tag of tags) {
      tagSet.add(tag);
    }
  }

  res.json({ tags: Array.from(tagSet) });
});

module.exports = router;
