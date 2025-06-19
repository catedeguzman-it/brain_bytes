import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Emojis instead of icon packages
const Bot = (props) => <span {...props}>🤖</span>;
const User = (props) => <span {...props}>👤</span>;

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/api/messages`);
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setIsTyping(true);
      const userMsg = newMessage;
      setNewMessage('');

      const tempUserMsg = {
        _id: Date.now().toString(),
        text: userMsg,
        isUser: true,
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, tempUserMsg]);

      const response = await axios.post('http://localhost:3000/api/messages', { text: userMsg });

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

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1e2f] to-[#2a2a40] flex flex-col items-center py-10 px-4 font-[Poppins,sans-serif] text-white">
      <div className="w-full max-w-3xl bg-[#2b2b44] shadow-2xl rounded-2xl p-6 space-y-4 border border-purple-500">
        <h1 className="text-3xl font-extrabold text-purple-300 text-center flex items-center justify-center gap-2">
          <span className="text-3xl animate-bounce">🧠</span>
          BrainBytes AI Tutor
        </h1>

        <div className="h-[450px] overflow-y-auto rounded-xl p-4 bg-[#1c1c2e] border border-purple-700">
          {loading ? (
            <p className="text-center text-gray-400">🌀 Loading conversation...</p>
          ) : messages.length === 0 ? (
            <div className="text-center text-gray-400 italic mt-10">
              No messages yet. Be the first to ask something! 🎉
            </div>
          ) : (
            <ul className="space-y-4">
              {messages.map((msg) => (
                <li
                  key={msg._id}
                  className={`p-4 rounded-2xl w-fit max-w-[80%] shadow-md ${
                    msg.isUser
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 ml-auto text-right'
                      : 'bg-gradient-to-br from-green-600 to-emerald-700 mr-auto text-left'
                  }`}
                >
                  <div className={`flex items-center gap-2 mb-1 ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                    {msg.isUser ? <User className="text-blue-300" /> : <Bot className="text-green-300" />}
                    <span className="text-sm text-gray-200 font-semibold">
                      {msg.isUser ? 'You' : 'AI Tutor'}
                    </span>
                  </div>
                  <p className="text-base text-white">{msg.text}</p>
                  <small className="text-gray-300 text-xs block mt-2">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </small>
                </li>
              ))}
              {isTyping && (
                <li className="italic text-purple-300 animate-pulse bg-[#33334d] p-4 rounded-xl w-fit border border-purple-500">
                  ✨ AI is thinking...
                </li>
              )}
              <div ref={messageEndRef} />
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask something fun and smart!"
            className="flex-1 px-4 py-3 rounded-lg border-2 border-purple-500 bg-[#1e1e2f] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={isTyping}
          />
          <button
            type="submit"
            className={`font-bold px-6 py-3 rounded-lg transition duration-300 ${
              isTyping
                ? 'bg-purple-400 cursor-not-allowed text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
            }`}
            disabled={isTyping}
          >
            🚀 {isTyping ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
