import styles from '../styles/Modal.module.css';

export default function ConfirmDeleteModal({ visible, topic, onCancel, onConfirm }) {
  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h3>Delete chat?</h3>
        <p>
          This will delete <strong>{topic || 'this chat'}</strong>.
        </p>
        <div className={styles.buttonGroup}>
          <button onClick={onCancel} className={styles.cancelButton}>Cancel</button>
          <button onClick={onConfirm} className={styles.deleteButton}>Delete</button>
        </div>
      </div>
    </div>
  );
}