# RealWorld Example App

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=black)](https://ecma-international.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A full-stack Medium clone built with **React** + **Express**, following the [RealWorld](https://github.com/gothinkster/realworld) spec. Users can create articles, follow authors, favorite posts, and comment — all powered by a RESTful JSON API.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Vite, Axios |
| Backend  | Express.js, SQLite (`node:sqlite`), JWT, bcryptjs |
| Tooling  | npm workspaces (monorepo), concurrently |

## Features

- **Authentication** — Register, login, and manage your profile (JWT-based)
- **Articles** — Create, edit, delete, and browse articles with rich content
- **Comments** — Post and delete comments on any article
- **Favorites** — Favorite/unfavorite articles
- **Follow System** — Follow and unfollow other users
- **Tags** — Filter articles by popular tags
- **Feed** — Personalized feed of articles from followed authors
- **Responsive UI** — Clean, mobile-friendly design with Ion icons

## Quick Start

```bash
# Install dependencies
npm install

# Start both frontend and backend in development mode
npm run dev
```

- Backend runs on `http://localhost:3001`
- Frontend runs on `http://localhost:5173` (proxies `/api` to backend)

### Run individually

```bash
npm run dev:backend   # Express backend with file watching
npm run dev:frontend  # Vite dev server with HMR
```

### Production

```bash
npm run build         # Build frontend
npm start             # Serve backend (serves built frontend if configured)
```

## Project Structure

```
├── package.json              # Monorepo root (npm workspaces)
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.js          # Express app entry
│   │   │   ├── db.js             # SQLite setup + schema
│   │   │   ├── middleware/
│   │   │   │   └── auth.js       # JWT auth middleware
│   │   │   └── routes/
│   │   │       ├── users.js      # Login, register, profile
│   │   │       ├── articles.js   # CRUD, comments, favorites
│   │   │       ├── profiles.js   # Follow/unfollow
│   │   │       └── tags.js       # Tag listing
│   │   ├── data/                 # SQLite database file (auto-created)
│   │   └── .env                  # Environment variables
│   └── frontend/
│       ├── src/
│       │   ├── main.jsx          # React entry point
│       │   ├── App.jsx           # Router + layout
│       │   ├── api/client.js     # Axios instance
│       │   ├── context/          # Auth context
│       │   ├── components/       # Reusable UI components
│       │   └── pages/            # Route pages
│       └── vite.config.js        # Vite config with API proxy
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Register |
| POST | `/api/users/login` | Login |
| GET | `/api/user` | Get current user |
| PUT | `/api/user` | Update user |
| GET | `/api/profiles/:username` | Get profile |
| POST | `/api/profiles/:username/follow` | Follow user |
| DELETE | `/api/profiles/:username/follow` | Unfollow user |
| GET | `/api/articles` | List articles |
| GET | `/api/articles/feed` | Feed from followed authors |
| GET | `/api/articles/:slug` | Get article |
| POST | `/api/articles` | Create article |
| PUT | `/api/articles/:slug` | Update article |
| DELETE | `/api/articles/:slug` | Delete article |
| POST | `/api/articles/:slug/favorite` | Favorite article |
| DELETE | `/api/articles/:slug/favorite` | Unfavorite article |
| GET | `/api/articles/:slug/comments` | Get comments |
| POST | `/api/articles/:slug/comments` | Create comment |
| DELETE | `/api/articles/:slug/comments/:id` | Delete comment |
| GET | `/api/tags` | List tags |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `JWT_SECRET` | *(required)* | Secret key for signing JWT tokens |
| `DATABASE_PATH` | `./data/realworld.db` | Path to SQLite database file |

## License

This project is licensed under the [MIT License](LICENSE).
