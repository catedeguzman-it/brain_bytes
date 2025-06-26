import { useState, useEffect } from 'react';


const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginForm({ onSuccess, setLoginHandler }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ✅ Login function
  const handleLogin = async (e) => {
  if (e?.preventDefault) e.preventDefault(); // ✅ only call if event exists
  setError('');

    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('sessionId', data.sessionId);
      localStorage.setItem('userId', data.userId); 
      localStorage.setItem('isAuthenticated', 'true');
      onSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server.');
    }
  };

  // ✅ Expose login handler to parent
  useEffect(() => {
    if (typeof setLoginHandler === 'function') {
      setLoginHandler(() => handleLogin);
    }
  }, [email, password, setLoginHandler]);
  
  return (
    <div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '16px',
          borderRadius: '8px',
          border: '1px solid #555',
          backgroundColor: '#1e1e1e',
          color: '#f5f5f5',
          fontSize: '16px',
          outline: 'none',
          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)',
          }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '16px',
          borderRadius: '8px',
          border: '1px solid #555',
          backgroundColor: '#1e1e1e',
          color: '#f5f5f5',
          fontSize: '16px',
          outline: 'none',
          boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)',
        }}
      />
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
    </div>
  );
}