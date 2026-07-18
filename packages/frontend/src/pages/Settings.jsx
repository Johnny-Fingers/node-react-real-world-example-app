import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    image: user?.image || '',
    username: user?.username || '',
    bio: user?.bio || '',
    email: user?.email || '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      await updateUser(payload);
      navigate('/');
    } catch (err) {
      setErrors(err.response?.data?.errors || {});
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="settings-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-6 offset-md-3 col-xs-12">
            <h1 className="text-xs-center">Your Settings</h1>
            {Object.keys(errors).length > 0 && (
              <ul className="error-messages">
                {Object.entries(errors).map(([key, msgs]) =>
                  msgs.map((msg, i) => <li key={`${key}-${i}`}>{msg}</li>)
                )}
              </ul>
            )}
            <form onSubmit={handleSubmit}>
              <fieldset>
                <fieldset className="form-group">
                  <input className="form-control" type="text" placeholder="URL of profile picture" value={form.image} onChange={handleChange('image')} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="text" placeholder="Your Name" value={form.username} onChange={handleChange('username')} />
                </fieldset>
                <fieldset className="form-group">
                  <textarea className="form-control form-control-lg" rows="8" placeholder="Short bio about you" value={form.bio} onChange={handleChange('bio')}></textarea>
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="text" placeholder="Email" value={form.email} onChange={handleChange('email')} />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" type="password" placeholder="New Password" value={form.password} onChange={handleChange('password')} />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right" type="submit">Update Settings</button>
              </fieldset>
            </form>
            <hr />
            <button className="btn btn-outline-danger" onClick={handleLogout}>Or click here to logout.</button>
          </div>
        </div>
      </div>
    </div>
  );
}
