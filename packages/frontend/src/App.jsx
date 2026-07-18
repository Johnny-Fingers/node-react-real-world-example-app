import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import Editor from './pages/Editor';
import Article from './pages/Article';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/editor/:slug" element={<Editor />} />
        <Route path="/article/:slug" element={<Article />} />
        <Route path="/profile/:username" element={<Profile />} />
      </Routes>
      <footer>
        <div className="container">
          <a href="/" className="logo-font">conduit</a>
          <span className="attribution">
            An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design licensed under MIT.
          </span>
        </div>
      </footer>
    </AuthProvider>
  );
}
