import PropTypes from 'prop-types';
import styles from '../styles/NavBar.module.css';

export default function NavBar({ onLogout, onNewChat, onDashboard }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} aria-label="BrainBytes Logo">🧠 BrainBytes</div>
      <div className={styles.links}>
        <button
          onClick={onNewChat}
          className={styles.navButton}
          aria-label="Start a new chat session"
        >
          New Chat
        </button>
        <button
          onClick={onDashboard}
          className={styles.navButton}
          aria-label="Go to dashboard"
        >
          Dashboard
        </button>
        <button
          onClick={onLogout}
          className={styles.navButton}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

// Optional: Define prop types
NavBar.propTypes = {
  onLogout: PropTypes.func.isRequired,
  onNewChat: PropTypes.func.isRequired,
  onDashboard: PropTypes.func.isRequired,
};
