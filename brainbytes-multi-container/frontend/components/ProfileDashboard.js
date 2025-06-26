import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProfileDashboard() {
  const [user, setUser] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);

  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) return;

    fetch(`${API_BASE}/api/user/${userId}`)
      .then((res) => res.json())
      .then(setUser);

    fetch(`${API_BASE}/api/messages/recent/${userId}`)
      .then((res) => res.json())
      .then(data => setRecentMessages(data.messages));
  }, []);

  if (!user) {
    return <div style={{ padding: '2rem', color: '#2E2E2E' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#f5f5f5',
      color: '#2E2E2E',
      fontFamily: 'sans-serif',
      minHeight: '100vh'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '1.5rem',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#FFC107', marginBottom: '1rem' }}>Welcome, {user.name}</h1>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>

        <h3 style={{ color: '#26C6DA', marginTop: '2rem' }}>Recent Messages</h3>
        <ul style={{ paddingLeft: '1.25rem' }}>
          {recentMessages.map(msg => (
            <li key={msg._id} style={{ marginBottom: '0.5rem' }}>
              <strong>{msg.sender}:</strong> {msg.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
