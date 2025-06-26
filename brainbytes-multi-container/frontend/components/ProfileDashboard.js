import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProfileDashboard() {
  const [user, setUser] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE}/api/user/${userId}`)
      .then((res) => res.json())
      .then(setUser);

    fetch(`${API_BASE}/api/messages/recent/${userId}`)
      .then((res) => res.json())
      .then(data => setRecentMessages(data.messages));
  }, [userId]);

  if (!user) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: '2rem', color: '#fff' }}>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>

      <h3>Recent Messages</h3>
      <ul>
        {recentMessages.map(msg => (
          <li key={msg._id}>
            <strong>{msg.sender}</strong>: {msg.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
