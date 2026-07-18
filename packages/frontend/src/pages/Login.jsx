import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setErrors(err.response?.data?.errors || { body: ['Login failed'] });
    }
  };

  return (
    <div className="auth-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Sign in</h1>
            <p className="text-xs-center">
              <Link to="/register">Need an account?</Link>
            </p>
            {Object.keys(errors).length > 0 && (
              <ul className="error-messages">
                {Object.entries(errors).map(([key, msgs]) =>
                  msgs.map((msg, i) => <li key={`${key}-${i}`}>{msg}</li>)
                )}
              </ul>
            )}
            <form onSubmit={handleSubmit}>
              <fieldset className="form-group">
                <input className="form-control form-control-lg" type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </fieldset>
              <fieldset className="form-group">
                <input className="form-control form-control-lg" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </fieldset>
              <button className="btn btn-lg btn-primary pull-xs-right" type="submit">Sign in</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
