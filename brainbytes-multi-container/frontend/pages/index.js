import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setTyping(true);
    try {
      await axios.post('http://localhost:3000/api/messages', { text: newMessage });
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error posting message:', error);
    } finally {
      setTyping(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-purple-700 text-center mb-4">🧠 BrainBytes Chat</h1>

        <div className="h-[400px] overflow-y-auto border rounded-lg p-4 bg-gray-50">
          {loading ? (
            <p className="text-center text-gray-500">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-center text-gray-400">No messages yet. Say something! 💬</p>
          ) : (
            <ul className="space-y-3">
              {messages.map((message) => (
                <li
                  key={message._id}
                  className="bg-blue-100 p-3 rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <p className="text-gray-800">{message.text}</p>
                  <small className="text-gray-500 block text-right text-xs">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </small>
                </li>
              ))}
              {typing && (
                <li className="italic text-purple-500 animate-pulse">AI is typing...</li>
              )}
            </ul>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
          <button
            type="submit"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold px-4 py-2 rounded-lg transition duration-200 shadow-md"
          >
            🚀 Send
          </button>
        </form>
      </div>
    </div>
  );
}
