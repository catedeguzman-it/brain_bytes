import { useState } from 'react';
import styles from '../styles/Modal.module.css';

// Updated K–12 curriculum-aligned subject domains
const SUBJECT_MATERIALS = {
  Math: [
    'Arithmetic and Number Theory',
    'Geometry',
    'Measurement',
    'Algebra',
    'Statistics and Probability',
    'Functions and Graphs',
    'Consumer Math'
  ],
  Science: [
    'Biology – Life Processes and Heredity',
    'Biology – Ecosystems and Biodiversity',
    'Chemistry – Properties of Matter',
    'Chemistry – Chemical Reactions',
    'Physics – Force, Motion, and Energy',
    'Physics – Waves, Light, and Sound',
    'Earth Science – Weather, Climate, and Natural Disasters',
    'Earth Science – Rocks, Soil, and Solar System',
    'Environmental Science'
  ],
  English: [
    'Grammar and Usage',
    'Reading Comprehension',
    'Literature and Literary Devices',
    'Writing and Composition',
    'Public Speaking and Oral Communication',
    'Media and Information Literacy',
    'Vocabulary Development'
  ]
};

export default function AddMaterialModal({ visible, onCancel, onSubmit }) {
  const [subject, setSubject] = useState('Math');
  const [material, setMaterial] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !material) {
      alert('⚠️ Please fill out all fields.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, material }),
      });

      const data = await res.json();

      if (res.status === 409) {
        alert('⚠️ This material already exists.');
        return;
      }

      if (!res.ok) {
        console.error('❌ API error response:', data);
        throw new Error(data.error || 'Failed to add material');
      }

      onSubmit({ subject, material });
    } catch (err) {
      console.error('❌ Material submission error:', err);
      alert('Error saving material. Please try again.');
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>Add New Material</h3>
        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <label>
            Subject:
            <select
              name="subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setMaterial('');
              }}
            >
              {Object.keys(SUBJECT_MATERIALS).map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>
          </label>

          <label>
            Material Name:
            <select
              name="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              required
            >
              <option value="">-- Select Material --</option>
              {(SUBJECT_MATERIALS[subject] || []).map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.modalActions}>
            <button type="submit">Add</button>
            <button type="button" onClick={onCancel} className={styles.cancelBtn}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
