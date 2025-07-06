import { useEffect, useState } from 'react';
import styles from '../styles/Sidebar.module.css';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import modalStyles from '../styles/Modal.module.css';

export default function Sidebar({ userId, onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { sessionId, topic }
  const [allMessages, setAllMessages] = useState([]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions/${userId}`)
      .then(res => res.json())
      .then(data => setSessions(data.sessions || []));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/history/user/${userId}`)
      .then(res => res.json())
      .then(data => setAllMessages(data.messages || []));
  }, [userId]);

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete?.sessionId) return;

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat/sessions/${confirmDelete.sessionId}`, {
      method: 'DELETE',
    });

    setSessions(prev =>
      prev.filter(s => (s.sessionId || s._id) !== confirmDelete.sessionId)
    );
    setConfirmDelete(null);
    setOpenMenuId(null);
  };

  const topics = [...new Set(
    sessions.map(s => (s.topic?.split(' – ')[0]) || 'General')
  )];

  const filteredSessions = sessions.filter(s => {
    const sid = s.sessionId || s._id;
    const matchesTopic = filter === 'All' || s.topic?.startsWith(filter);

    const sessionMessages = allMessages.filter(m => m.sessionId === sid);
    const matchesMessageContent = sessionMessages.some(m =>
      m.text?.toLowerCase().includes(search.toLowerCase())
    );

    const matchesSearch = s.topic?.toLowerCase().includes(search.toLowerCase()) || matchesMessageContent;

    return matchesTopic && matchesSearch;
  });

  return (
    <div className={styles.sidebarWrapper}>
      <div className={styles.sidebarTitle}>🧠 Chat History</div>

      <input
        type="text"
        placeholder="Search chats..."
        className={styles.searchInput}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className={styles.topicFilter}
        onChange={(e) => setFilter(e.target.value)}
        value={filter}
      >
        <option value="All">All Topics</option>
        {topics.map((t, i) => (
          <option key={i} value={t}>{t}</option>
        ))}
      </select>

    {filteredSessions.map((session) => {
      const sid = session.sessionId || session._id;

      const preview = allMessages.find(
        (m) =>
          m.sessionId === sid &&
          m.text?.toLowerCase().includes(search.toLowerCase())
      );

      return (
        <div
          key={sid}
          className={styles.sessionItem}
          onMouseLeave={() => setOpenMenuId(null)}
        >
          {/* Whole clickable container */}
          <div
            className={styles.clickableArea}
            onClick={() => onSelectSession(sid)}
          >
            <div className={styles.sessionButton}>
              {session.topic || 'Untitled Chat'}
            </div>

            {search && preview?.text && (
              <div className={styles.previewText}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: preview.text.replace(
                      new RegExp(`(${search})`, 'gi'),
                      '<mark>$1</mark>'
                    ),
                  }}
                />
              </div>
            )}
          </div>

          <div
            className={styles.menuTrigger}
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering session open
              setOpenMenuId((prev) => (prev === sid ? null : sid));
            }}
          >
            ⋮
          </div>

          {openMenuId === sid && (
            <div className={modalStyles.dropdownMenu}>
              <button
                onClick={() =>
                  setConfirmDelete({ sessionId: sid, topic: session.topic })
                }
              >
                Delete
              </button>
            </div>
          )}
        </div>
      );
    })}


      {/* Modal placed outside map */}
      <ConfirmDeleteModal
        visible={!!confirmDelete}
        topic={confirmDelete?.topic}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDeleteConfirmed}
      />
    </div>
  );
}
