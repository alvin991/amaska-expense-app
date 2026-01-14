import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const demoUsers = [
  { username: 'alvin', label: 'Alvin' },
  { username: 'abbie', label: 'Abbie' },
  { username: 'annabelle', label: 'Annabelle' },
];

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      login(token, user);
      
      // Check if user has a start-page setting
      let startPage = '/';
      if (user.settings) {
        try {
          const settings = JSON.parse(user.settings);
          if (settings['start-page']) {
            startPage = settings['start-page'];
          }
        } catch (err) {
          console.error('Failed to parse user settings:', err);
        }
      }
      
      navigate(startPage, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', marginTop: '5rem' }}>
      <h2 className="mb-4">Sign in</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">User</label>
          <select
            className="form-select"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a user...
            </option>
            {demoUsers.map((u) => (
              <option key={u.username} value={u.username}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
