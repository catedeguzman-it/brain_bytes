import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
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
    


      if (onSuccess) {
        onSuccess(); // Used in Home.js
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server.');
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ width: '100%' }}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        required
        onChange={(e) => setEmail(e.target.value)}
        style={{
          backgroundColor: '#333',
          color: '#fff',
          border: '1px solid #555',
          borderRadius: '6px',
          padding: '10px',
          margin: '10px 0',
          width: '100%',
        }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        required
        onChange={(e) => setPassword(e.target.value)}
        style={{
          backgroundColor: '#333',
          color: '#fff',
          border: '1px solid #555',
          borderRadius: '6px',
          padding: '10px',
          margin: '10px 0',
          width: '100%',
        }}
      />
      <button
        type="submit"
        style={{
          marginTop: '15px',
          width: '100%',
          padding: '12px',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Login
      </button>
      {error && <p style={{ color: 'tomato', marginTop: '15px' }}>{error}</p>}
    </form>
  );
}
