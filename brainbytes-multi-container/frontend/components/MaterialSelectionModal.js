import { useEffect, useState } from 'react';
import styles from '../styles/Modal.module.css';

export default function MaterialSelectionModal({ visible, onSelect, onCancel }) {
  const [materials, setMaterials] = useState([]);
  const [subject, setSubject] = useState('');
  const [material, setMaterial] = useState('');

  useEffect(() => {
    if (!visible) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/materials`)
      .then(res => res.json())
      .then(data => {
        setMaterials(data || []);
        const first = data[0];
        if (first) {
          setSubject(first.subject);
          setMaterial(first.material);
        }
      });
  }, [visible]);

  const grouped = materials.reduce((acc, m) => {
    if (!acc[m.subject]) acc[m.subject] = [];
    acc[m.subject].push(m.material);
    return acc;
  }, {});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !material) return alert("Please select both subject and material.");
    onSelect(subject, material);
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Select a Material</h3>

        {materials.length === 0 ? (
          <div>
            <p style={{ padding: '10px', color: '#555' }}>
              🚫 No materials available yet.<br />
              Please click "➕ Add Material" in the sidebar before starting a new chat.
            </p>
            <div className={styles.modalActions}>
              <button type="button" onClick={onCancel} className={styles.cancelBtn}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <label>
              Subject:
              <select value={subject} onChange={e => {
                setSubject(e.target.value);
                setMaterial('');
              }}>
                {Object.keys(grouped).map((subj, i) => (
                  <option key={i} value={subj}>{subj}</option>
                ))}
              </select>
            </label>

            <label>
              Material:
              <select value={material} onChange={e => setMaterial(e.target.value)}>
                <option value="">-- Select --</option>
                {(grouped[subject] || []).map((mat, i) => (
                  <option key={i} value={mat}>{mat}</option>
                ))}
              </select>
            </label>

            <div className={styles.modalActions}>
              <button type="submit">Start Chat</button>
              <button type="button" onClick={onCancel} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
