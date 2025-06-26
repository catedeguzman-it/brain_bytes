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
}
