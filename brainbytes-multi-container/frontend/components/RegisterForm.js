import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function RegisterForm({ onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('sessionId', data.sessionId);
      localStorage.setItem('hasRegistered', 'true');
      localStorage.setItem('isAuthenticated', 'true');

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ width: '100%' }}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        required
        onChange={(e) => setName(e.target.value)}
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
          backgroundColor: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Register
      </button>
      {error && <p style={{ color: 'tomato', marginTop: '15px' }}>{error}</p>}
    </form>
  );
}
