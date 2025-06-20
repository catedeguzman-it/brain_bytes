import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);

  // Fetch messages from the API
  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/messages');
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  // Submit a new message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsTyping(true); // Show typing indicator
      const userMsg = newMessage;
      setNewMessage('');

      // Optimistically add the user's message to the chat
      const tempUserMsg = {
        _id: Date.now().toString(),
        text: userMsg,
        isUser: true,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);

      // Send the message to the API (backend) and get AI response
      const response = await axios.post('http://localhost:3000/api/messages', {
        text: userMsg
      });
     
      // Update the chat with the AI response
      setMessages(prev => {
        const filtered = prev.filter(msg => msg._id !== tempUserMsg._id);
        return [...filtered, response.data.userMessage, response.data.aiMessage];
      });
    } catch (error) {
      console.error('Message failed:', error);
      setMessages(prev => [...prev, {
        _id: Date.now().toString(),
        text: "⚠️ Oops! Something went wrong.",
        isUser: false,
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Scroll to the bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch messages on component mount
  useEffect(() => {
    (async () => {
      await fetchMessages();
    })();
  }, []);

  
  return (
    <div style={{ backgroundColor: '#1a1a2e', padding: '18px', borderRadius: '12px' }}>
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Poppins, sans-serif', color: '#f9fafb' }}>
      <div className="bg-gradient-to-br from-[#1e1e2f] to-[#2a2a40] flex flex-col items-center py-10 px-4 font-[Poppins,sans-serif] text-white">
        <div className="w-full max-w-3xl bg-[#2b2b44] shadow-2xl rounded-2xl p-6 space-y-4 border border-purple-500">
          <h1 className="text-3xl font-extrabold text-purple-300 text-center flex items-center justify-center gap-2">
            <span className="text-3xl animate-bounce">🧠</span>
            BrainBytes AI Tutor
          </h1>

        <div className="h-[400px] overflow-y-auto bg-purple-50 border border-pink-200 rounded-xl p-4">
          {loading ? (
            <p className="text-center text-pink-400">⏳ Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center italic text-pink-400">No messages yet. Be the first to ask something! 🎉</p>
          ) : (
            <ul className="space-y-4">
              {messages.map((message) => (
                <li
                  key={message._id}
                  style={{ 
                      padding: '12px 16px', 
                      margin: '8px 0', 
                      backgroundColor: message.isUser ? '#374151' : '#4B5563',
                      color: '#f9fafb',
                      fontFamily: 'Inter, sans-serif',
                      borderRadius: '12px',
                      maxWidth: '80%',
                      wordBreak: 'break-word',
                      marginLeft: message.isUser ? 'auto' : '0',
                      marginRight: message.isUser ? '0' : 'auto',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}

                  className={`p-4 rounded-2xl max-w-[80%] shadow-md ${
                    message.isUser
                      ? 'ml-auto bg-gradient-to-br from-blue-200 to-indigo-200 text-right'
                      : 'mr-auto bg-gradient-to-br from-green-200 to-emerald-200 text-left'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{message.isUser ? '🙋‍♂️' : '🤖'}</span>
                    <span className="text-sm font-semibold text-gray-600">
                      {message.isUser ? 'You' : 'AI Tutor'}
                    </span>
                  </div>
                  <p className="text-base text-gray-800">{message.text}</p>
                  <small className="text-gray-500 text-xs block mt-1">
                    {new Date(message.createdAt).toLocaleString()}
                  </small>
                </li>
              ))}
              {isTyping && (
                <li className="italic text-pink-500 animate-pulse bg-pink-200 p-4 rounded-xl w-fit border border-pink-300">
                  ✨ AI is thinking...
                </li>
              )}
              <div ref={messageEndRef} />
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex w-full max-w-3xl mt-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your question here..."
            disabled={isTyping}
            className="flex-1 bg-[#1e1e2f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            style={{
              flex: '1',
              padding: '12px 16px',
              borderRadius: '12px 0 0 12px',
              border: '1px solid #26C6DA',
              fontSize: '16px',
              transition: 'border-color 0.3s ease',
              width: '80%',
            }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 16px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '0 12px 12px 0',
            fontSize: '16px',
          }}
          disabled={isTyping}
        >
          🚀 {isTyping ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
      </div>
    </div>
    </div>
  );
}