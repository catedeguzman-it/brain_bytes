import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/ChatInterface.module.css';
import Sidebar from '../components/Sidebar';
import MaterialSelectionModal from '../components/MaterialSelectionModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function ChatInterface() {
  const router = useRouter();
  const { sessionId: routeSessionId } = router.query;

  const [sessionId, setSessionId] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [materialModalVisible, setMaterialModalVisible] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (!storedToken) {
      setUserId('guest');
    } else {
      setToken(storedToken);
      setUserId(storedUserId);
    }
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    if (!authChecked || !router.isReady) return;
    let sid = routeSessionId || localStorage.getItem('sessionId');
    if (!sid) sid = crypto.randomUUID();
    localStorage.setItem('sessionId', sid);
    setSessionId(sid);
  }, [authChecked, routeSessionId, router.isReady]);

  useEffect(() => {
    if (!sessionId) return;
    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/chat/history/${sessionId}`);
        const data = await res.json();
        setMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch (err) {
        console.error('Error loading history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return alert('Please enter a message.');
    if (!selectedSubject || !selectedTopic) return alert('Please select a subject and material.');

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          sessionid: sessionId,
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: input,
          userId,
          subject: selectedSubject,
          material: selectedTopic,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('❌ Chat API error:', data.error || data);
        alert(data.error || 'An error occurred while processing your message.');
        return;
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: data.message,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('❌ Network error sending message:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          text: 'Sorry, something went wrong. Please try again later.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaterialSelected = (subject, topic) => {
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    setMaterialModalVisible(false);
  };

  const handleNewChat = () => {
    const newId = crypto.randomUUID();
    localStorage.setItem('sessionId', newId);
    setSessionId(newId);
    setMessages([]);
    setSelectedSubject('');
    setSelectedTopic('');
    setMaterialModalVisible(true);
  };

  if (!authChecked) return null;

  return (
    <>
      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        <Sidebar
          userId={userId}
          onSelectSession={(id) => {
            localStorage.setItem('sessionId', id);
            router.push(`/chat?sessionId=${id}`);
          }}
        />
        <div className={styles.chatWrapper} style={{ flex: 1 }}>
          <div className={styles.chatContainer}>
            <div className={styles.materialHeader}>
              {selectedSubject && selectedTopic && (
                <span>📚 {selectedSubject} – {selectedTopic}</span>
              )}
            </div>

            <div className={styles.messagesContainer}>
              {messages.map((msg) => (
                <div
                  key={msg._id || msg.id}
                  className={`${styles.message} ${msg.sender === 'user' ? styles.userMessage : styles.aiMessage}`}
                >
                  <div className={styles.messageContent}>{msg.text}</div>
                  <div className={styles.messageTimestamp}>
                    {new Date(msg.timestamp).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className={`${styles.message} ${styles.aiMessage}`}>
                  <div className={styles.typingIndicator}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={styles.inputContainer}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className={styles.messageInput}
                disabled={materialModalVisible}
              />
              <button type="submit" className={styles.sendButton} disabled={materialModalVisible}>
                Send
              </button>
            </form>
          </div>
        </div>
      </div>

      <MaterialSelectionModal
        visible={materialModalVisible}
        onSelect={handleMaterialSelected}
        onCancel={() => setMaterialModalVisible(false)}
      />
    </>
  );
}
