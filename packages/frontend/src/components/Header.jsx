import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  if (!user) {
    return (
      <nav className="navbar navbar-light">
        <div className="container">
          <Link className="navbar-brand" to="/">conduit</Link>
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/login')}`} to="/login">Sign in</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/register')}`} to="/register">Sign up</Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">conduit</Link>
        <ul className="nav navbar-nav pull-xs-right">
          <li className="nav-item">
            <Link className={`nav-link ${isActive('/')}`} to="/">Home</Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${isActive('/editor')}`} to="/editor">
              <i className="ion-compose"></i>&nbsp;New Article
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${isActive('/settings')}`} to="/settings">
              <i className="ion-gear-a"></i>&nbsp;Settings
            </Link>
          </li>
          <li className="nav-item">
            <Link className={`nav-link ${isActive(`/profile/${user.username}`)}`} to={`/profile/${user.username}`}>
              <img src={user.image || 'https://i.stack.imgur.com/xHWG8.jpg'} className="user-pic" alt="" />
              {user.username}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
