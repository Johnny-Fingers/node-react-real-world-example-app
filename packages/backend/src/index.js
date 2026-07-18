const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');

const usersRouter = require('./routes/users');
const profilesRouter = require('./routes/profiles');
const articlesRouter = require('./routes/articles');
const tagsRouter = require('./routes/tags');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api', usersRouter);
app.use('/api', profilesRouter);
app.use('/api', articlesRouter);
app.use('/api', tagsRouter);

app.get('/api', (req, res) => {
  res.json({ message: 'RealWorld API' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ errors: { body: ['Internal server error'] } });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
