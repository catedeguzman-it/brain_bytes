import { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import NavBar from '../components/NavBar';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeForm, setActiveForm] = useState('login'); // 'login' or 'register'
  const [loginHandler, setLoginHandler] = useState(null); // ✅ State-based login handler

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(auth);
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = () => {
    localStorage.setItem('hasRegistered', 'true');
    setActiveForm('login');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setActiveForm('login');
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0f0f0f',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontFamily: 'Segoe UI, sans-serif',
          padding: '20px',
        }}
      >
        <div
          style={{
            backgroundColor: '#1e1e1e',
            padding: '40px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center',
          }}
        >
          {/* 🧠 Logo and Title */}
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🧠</div>
          <h2 style={{ color: '#fff', marginBottom: '20px' }}>BrainBytes</h2>


          {activeForm === 'login' ? (
            <LoginForm
              onSuccess={handleLoginSuccess}
              setLoginHandler={setLoginHandler} // ✅ Correct handler
            />
          ) : (
            <RegisterForm onSuccess={handleRegisterSuccess} />
          )}

          <div style={{ marginTop: '30px' }}>
            {activeForm === 'register' && (
              <button
                onClick={() => setActiveForm('login')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4f46e5',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = '#4338ca')}
                onMouseOut={(e) => (e.target.style.backgroundColor = '#4f46e5')}
              >
                Login
              </button>
            )}

            {activeForm === 'login' && (
              <>
                <button
                  onClick={() => {
                    if (typeof loginHandler === 'function') {
                      loginHandler();
                    }
                  }}
                  style={{
                    marginRight: '10px',
                    padding: '10px 20px',
                    backgroundColor: '#4f46e5',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveForm('register')}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#444',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar onLogout={handleLogout} />
      <ChatInterface />
    </>
  );
}
