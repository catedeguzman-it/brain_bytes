// components/UserProfile.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function UserProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

    if (!userId) {
      router.push('/login');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/user/${userId}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Failed to load user info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) return <p>Loading user profile...</p>;

  if (!user) return <p>User not found.</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Welcome, {user.name}</h2>
      <p><strong>Email:</strong> {user.email}</p>
      {/* Add more fields here as needed */}
    </div>
  );
}
