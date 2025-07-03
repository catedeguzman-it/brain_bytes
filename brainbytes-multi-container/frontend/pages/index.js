import { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import NavBar from '../components/NavBar';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import styles from '../styles/Index.module.css'; // ✅ Import CSS module

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeForm, setActiveForm] = useState('login');
  const [loginHandler, setLoginHandler] = useState(null);

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated') === 'true';
    setIsAuthenticated(auth);
  }, []);

  const handleLoginSuccess = () => setIsAuthenticated(true);
  const handleRegisterSuccess = () => {
    localStorage.setItem('hasRegistered', 'true');
    setActiveForm('login');
  };
  const handleDashboard = () => window.location.href = '/dashboard';
  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', newSessionId);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('sessionId');
    localStorage.setItem('isAuthenticated', 'false');

    setIsAuthenticated(false); // ✅ Trigger UI logout state
    setActiveForm('login');
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.homeContainer}>
        <div className={styles.authBox}>
          <div className={styles.logoIcon}>🧠</div>
          <h2 className={styles.title}>BrainBytes</h2>

          {activeForm === 'login' ? (
            <LoginForm
              onSuccess={handleLoginSuccess}
              setLoginHandler={setLoginHandler}
            />
          ) : (
            <RegisterForm onSuccess={handleRegisterSuccess} />
          )}

          <div className={styles.buttonGroup}>
            {activeForm === 'register' && (
              <button
                onClick={() => setActiveForm('login')}
                className={`${styles.authButton} ${styles.loginButton}`}
              >
                Login
              </button>
            )}

            {activeForm === 'login' && (
              <>
                <button
                  onClick={() => loginHandler?.()}
                  className={`${styles.authButton} ${styles.loginButton}`}
                >
                  Login
                </button>
                <button
                  onClick={() => setActiveForm('register')}
                  className={`${styles.authButton} ${styles.registerButton}`}
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
      <NavBar
        onLogout={handleLogout}
        onNewChat={handleNewChat}
        onDashboard={handleDashboard}
      />
      <ChatInterface />
    </>
  );
}
