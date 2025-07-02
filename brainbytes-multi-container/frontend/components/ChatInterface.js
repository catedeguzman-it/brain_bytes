import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/ChatInterface.module.css';

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
  const messagesEndRef = useRef(null);

  // ✅ Check authentication
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (!storedToken) {
      router.push('/login');
    } else {
      setToken(storedToken);
      setUserId(storedUserId);
      setAuthChecked(true);
    }
  }, [router]);

  // ✅ Setup sessionId once router is ready and auth is checked
  useEffect(() => {
    if (!authChecked || !router.isReady) return;

    let sid = routeSessionId;

    if (!sid) {
      sid = localStorage.getItem('sessionId');
    }

    if (!sid) {
      sid = crypto.randomUUID();
    }

    localStorage.setItem('sessionId', sid);
    setSessionId(sid);
  }, [authChecked, routeSessionId, router.isReady]);

  // ✅ Fetch chat history
    const loadHistory = async (sessionId) => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/chat/history/${sessionId}`);
        const data = await res.json();
        
        console.log('🔁 Raw response:', data);

        if (!Array.isArray(data.messages)) {
        console.warn('⚠️ data.messages is not an array:', data.messages);
    }

      setMessages(Array.isArray(data.messages) ? data.messages : []);

      } catch (err) {
        console.error('Error loading history:', err);
        //Show error message to user
      } finally {
        setIsLoading(false);
      }
    };
  
  // ✅ Load chat history when sessionId changes
  useEffect(() => {
    if (!sessionId) return;
    loadHistory(sessionId);
  }, [sessionId]);

  // ✅ Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

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
        body: JSON.stringify({ message: input, userId }),
      });

      const data = await res.json();

      const aiMessage = {
        id: Date.now() + 1,
        text: data.message,
        sender: 'ai',
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
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

  const handleNewChat = () => {
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', newSessionId);
    router.push(`/chat/${newSessionId}`);
  };

  const goToDashboard = () => {
    router.push('/dashboard');
  };

  if (!authChecked) return null;

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.chatContainer}>
        <div className={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg._id || msg.id}
              className={`${styles.message} ${
                msg.sender === 'user' ? styles.userMessage : styles.aiMessage
              }`}
            >
              <div className={styles.messageContent}>{msg.text}</div>
              <div className={styles.messageTimestamp}>
                {new Date(msg.timestamp).toLocaleTimeString()}
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
          />
          <button type="submit" className={styles.sendButton}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
