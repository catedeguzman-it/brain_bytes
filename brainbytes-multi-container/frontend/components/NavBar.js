import styles from '../styles/NavBar.module.css';

export default function NavBar({ onLogout, onNewChat, onDashboard }) {
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>🧠 BrainBytes</div>
      <div className={styles.links}>
        <button onClick={onNewChat} className={styles.navButton}>New Chat</button>
        {userId && userId !== 'guest' && (
          <button onClick={onDashboard} className={styles.navButton}>Dashboard</button>
        )}
        <button onClick={onLogout} className={styles.navButton}>Logout</button>
      </div>
    </nav>
  );
}
