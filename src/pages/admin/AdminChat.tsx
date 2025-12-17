import { useState, useEffect, useRef } from 'react';
import { Send, Loader, MessageSquare } from 'lucide-react';
import { adminApi, DEFAULT_PHONE_NUMBER } from '../../services/adminApi';
import { useDbName } from '../../hooks/useDbName';

interface Message {
  type: 'user' | 'agent';
  content: string;
  timestamp: string;
  isError?: boolean;
}

const AdminChat = () => {
  const dbName = useDbName();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (dbName) {
      loadConversationHistory();
    }
  }, [dbName]);

  const loadConversationHistory = async () => {
    if (!dbName) {
      setIsLoadingHistory(false);
      return;
    }

    try {
      setIsLoadingHistory(true);
      const response = await adminApi.getConversationHistory(DEFAULT_PHONE_NUMBER, dbName);
      
      if (response.success && response.history) {
        // Group messages by request_id and convert to chat format
        const chatMessages: Message[] = [];
        const grouped: any = {};
        
        response.history.reverse().forEach((log: any) => {
          if (!grouped[log.request_id]) {
            grouped[log.request_id] = {};
          }
          grouped[log.request_id][log.type] = log.message;
        });
        
        Object.values(grouped).forEach((group: any) => {
          if (group.request || group.scheduled_request) {
            chatMessages.push({
              type: 'user',
              content: group.request || group.scheduled_request,
              timestamp: new Date().toISOString(),
            });
          }
          if (group.response || group.scheduled_response) {
            chatMessages.push({
              type: 'agent',
              content: group.response || group.scheduled_response,
              timestamp: new Date().toISOString(),
            });
          }
        });
        
        setMessages(chatMessages);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    if (!dbName) {
      const errorMessage: Message = {
        type: 'agent',
        content: 'Database name not available. Please log in again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const userMessage: Message = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await adminApi.sendMessage(inputMessage, DEFAULT_PHONE_NUMBER, dbName);
      
      if (response.success) {
        const agentMessage: Message = {
          type: 'agent',
          content: response.response,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, agentMessage]);
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage: Message = {
        type: 'agent',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Chat</h1>
        <p className="text-gray-600 mt-2">Talk to your Chief Intelligence Officer</p>
      </div>

      <div className="flex-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
        {/* Messages container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoadingHistory ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="animate-spin text-primary-600" size={32} />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageSquare size={64} className="mb-4" />
              <p className="text-lg">No messages yet. Start a conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.type === 'user'
                        ? 'bg-primary-600 text-white'
                        : message.isError
                        ? 'bg-red-100 text-red-900 border border-red-300'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <Loader className="animate-spin text-gray-600" size={20} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input form */}
        <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your business..."
              className="flex-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send size={20} />
              <span>Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminChat;

