import styles from '../styles/NavBar.module.css';

export default function NavBar({ onLogout }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>🧠 BrainBytes</div>
      <div className={styles.links}>
        <a href="/dashboard" className={styles.navLink}>
          Dashboard
        </a>
        <button onClick={onLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </nav>
  );
}export default function NavBar({ onLogout, onNewChat }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>🧠 BrainBytes</div>
      <div className={styles.links}>
        <a href="/dashboard" className={styles.navButton}>
          Dashboard
        </a>
        <button onClick={onNewChat} className={styles.navButton}>
          New Chat
        </button>
        <button onClick={onLogout} className={styles.navButton}>
          Logout
        </button>
      </div>
    </nav>
  );
}

