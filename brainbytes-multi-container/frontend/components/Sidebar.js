import { useEffect, useState } from 'react';
import styles from '../styles/Sidebar.module.css'; // adjust the path as needed

export default function Sidebar({ userId, onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!userId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions/${userId}`)
      .then(res => res.json())
      .then(data => setSessions(data.sessions || []));
  }, [userId]);

  const topics = [...new Set(sessions.map(s => s.topic || 'Untitled'))];

  const filteredSessions = filter === 'All'
    ? sessions
    : sessions.filter(s => (s.topic || 'Untitled') === filter);

  return (
    <div className={styles.sidebarWrapper}>
      <div className={styles.sidebarTitle}>🧠 Chat History</div>

      <select
        className={styles.topicFilter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option value="All">All Topics</option>
        {topics.map((t, i) => (
          <option key={i} value={t}>{t}</option>
        ))}
      </select>

      {filteredSessions.map((session) => (
        <button
          key={session._id}
          onClick={() => onSelectSession(session.sessionId || session._id)}
          className={styles.sessionButton}
        >
          {session.topic || 'Untitled Chat'}
        </button>
      ))}
    </div>
  );
}
