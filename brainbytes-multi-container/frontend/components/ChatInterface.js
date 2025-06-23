import { useState, useEffect, useRef } from 'react';
import styles from '../styles/ChatInterface.module.css';

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);


  // ✅ UseEffect to load chat history and manage session ID
  useEffect(() => {
    const fetchHistory = async () => {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        try {
          const response = await fetch(`http://localhost:4000/api/chat/history/${sessionId}`);
          const data = await response.json();
          setMessages(data.messages.map(msg => ({
            id: Date.now() + Math.random(),
            text: msg.text,
            sender: msg.sender,
            timestamp: msg.timestamp || msg.createdAt
          })));
        } catch (err) {
          console.error('Error fetching history:', err);
        }
      }
    };

    if (!localStorage.getItem('sessionId')) {
      localStorage.setItem('sessionId', crypto.randomUUID());
    }

    fetchHistory();
  }, []);

  
  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to backend API
     const sessionId = localStorage.getItem('sessionId') || crypto.randomUUID();
     localStorage.setItem('sessionId', sessionId); // Ensure it's stored. Persist it if newly created

     const response = await fetch('http://localhost:4000/api/chat', {
       method: 'POST',
       headers: {
        'Content-Type': 'application/json',
        'sessionid': sessionId
       },
       body: JSON.stringify({ message: input }),
    });

      const data = await response.json();

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        text: data.message,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {messages.map(msg => (
          <div 
            key={msg.id} 
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
  );
}
