import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function UserProfile() {
  const [profile, setProfile] = useState(null);
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

  useEffect(() => {
    if (userId) {
      fetch(`${API_BASE}/api/user/${userId}`)
        .then((res) => res.json())
        .then(setProfile)
        .catch((err) => console.error('Error loading profile:', err));
    }
  }, [userId]);

  if (!profile) return <div>Loading profile...</div>;

  return (
    <div>
      <h2>User Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
    </div>
  );
}
