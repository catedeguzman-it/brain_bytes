import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/ProfileDashboard.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProfileDashboard() {
  const [user, setUser] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const router = useRouter();

  const fetchUserAndMessages = () => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) return;

    fetch(`${API_BASE}/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched user:', data);
        // Use data.user if response is nested
        setUser(data.user || data);
      });

    fetch(`${API_BASE}/api/messages/recent/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched messages:', data);
        setRecentMessages(data.messages || []);
      });
  };

  useEffect(() => {
    fetchUserAndMessages();
  }, []);

  const handleBack = () => {
    fetchUserAndMessages();
    setTimeout(() => router.back(), 200);
  };

  if (!user) {
    return <div className={styles.dashboardWrapper}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.dashboardWrapper}>
      <div className={styles.dashboardCard}>
        <div className={styles.backButtonContainer}>
          <button className={styles.backButton} onClick={handleBack}>
            ← Back
          </button>
        </div>

        <h1 className={styles.header}>Welcome, {user.name || 'User'}</h1>
        <p className={styles.infoText}><strong>Email:</strong> {user.email || 'N/A'}</p>
        <p className={styles.infoText}>
          <strong>Joined:</strong>{' '}
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
        </p>

        <h3 className={styles.sectionTitle}>Recent Messages</h3>
        {recentMessages.length > 0 ? (
          <ul className={styles.messageList}>
            {recentMessages.map((msg) => (
              <li key={msg._id} className={styles.messageItem}>
                <strong>{msg.sender}:</strong> {msg.text}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent messages found.</p>
        )}
      </div>
    </div>
  );
}
