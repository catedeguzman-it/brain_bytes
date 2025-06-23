// pages/login.js
import { useRouter } from 'next/router';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    router.push('/');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2>🔐 Login to BrainBytes</h2>
      <button
        style={{
          padding: '12px 24px',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          marginTop: '20px',
          cursor: 'pointer',
        }}
        onClick={handleLogin}
      >
        Login (Mock)
      </button>
    </div>
  );
}
