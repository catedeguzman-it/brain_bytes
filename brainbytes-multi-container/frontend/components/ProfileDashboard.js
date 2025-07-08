import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import styles from '../styles/ProfileDashboard.module.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ProfileDashboard() {
  const [timeFilter, setTimeFilter] = useState('all');
  const [user, setUser] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalMessages: 0,
    uniqueSessions: 0,
    mostActiveDay: 'N/A',
    categoryData: []
  });

  const router = useRouter();

  const applyTimeFilter = (messages, filter) => {
    if (filter === 'all') return messages;

    const now = new Date();

    return messages.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      if (isNaN(msgDate)) return false;

      if (filter === 'today') {
        return msgDate.toDateString() === now.toDateString();
      }

      if (filter === 'week') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        return msgDate >= oneWeekAgo;
      }

      if (filter === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        return msgDate >= oneMonthAgo;
      }

      return true;
    });
  };

  const fetchUserAndMessages = () => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!userId) return;

    // Fetch user info
    fetch(`${API_BASE}/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data.user || data));

    // Fetch messages for analytics
    fetch(`${API_BASE}/api/messages/recent/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        let messages = data.messages || [];
        messages = applyTimeFilter(messages, timeFilter);
        setRecentMessages(messages);

        // Analytics
        const totalMessages = messages.length;
        const sessionSet = new Set(messages.map(m => m.sessionId));
        const dateMap = {};
        const categoryMap = {};

        messages.forEach(msg => {
          const date = new Date(msg.timestamp).toLocaleDateString();
          dateMap[date] = (dateMap[date] || 0) + 1;
        if (msg.category) {
          const category = msg.category.trim();
          categoryMap[category] = (categoryMap[category] || 0) + 1;
        }
                });

        const mostActiveDay = Object.entries(dateMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
        const categoryData = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));
        console.log('[Topic Data for Chart]', categoryData);

        setAnalytics({
          totalMessages,
          uniqueSessions: sessionSet.size,
          mostActiveDay,
          categoryData
        });
      });
  };

  useEffect(() => {
    fetchUserAndMessages();
  }, [timeFilter]);

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

        {/* Time Filter Dropdown */}
        <div className={styles.filterContainer}>
          <label htmlFor="timeFilter">Filter by:</label>
        <select
          id="timeFilter"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
        </div>

        {/* Analytics Summary */}
        <h3 className={styles.sectionTitle}>Analytics Summary</h3>
        <ul className={styles.analyticsList}>
          <li>Total Messages: {analytics.totalMessages}</li>
          <li>Unique Sessions: {analytics.uniqueSessions}</li>
          <li>Most Active Day: {analytics.mostActiveDay}</li>
        </ul>

        {/* Topic Bar Chart */}
        <h3 className={styles.sectionTitle}>Most Common Topics</h3>
        {analytics.categoryData.length > 0 ? (
          <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analytics.categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-30}
              textAnchor="end"
            />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>

          </div>
        ) : (
          <p>No topic data available.</p>
        )}

        {/* Recent Messages */}
        <h3 className={styles.sectionTitle}>Recent Messages</h3>
        {recentMessages.length > 0 ? (
          <ul className={styles.messageList}>
            {recentMessages.map((msg) => (
              <li
                key={msg._id}
                className={styles.messageItem}
                onClick={() => router.push(`/chat?sessionid=${msg.sessionId}`)}
                style={{ cursor: 'pointer' }}
              >
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
