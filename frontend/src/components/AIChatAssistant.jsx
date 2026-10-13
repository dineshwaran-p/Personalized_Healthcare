import { useState, useEffect } from 'react';
import { MessageSquare, Send, X, Maximize2, Minimize2, Loader, Bot, User } from 'lucide-react';
import { trackPendoEvent } from '../utils/pendo';

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI health assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);

  // inputMethod: 'enter_key' | 'send_button'
  const handleSend = (inputMethod) => {
    if (!message.trim()) return;

    // Add user message
    const newMessage = {
      id: messages.length + 1,
      text: message,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);

    // Pendo: user sent a chat message. Never send the message text (may contain health information).
    trackPendoEvent('ai_chat_message_sent', {
      messageLength: message.trim().length,
      conversationTurn: messages.filter(msg => msg.isUser).length + 1,
      inputMethod
    });
    setMessage('');

    // Add typing indicator
    const typingMessage = {
      id: messages.length + 2,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, typingMessage]);

    // Simulate AI response with typing animation
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => !msg.isTyping));
      
      const aiResponse = {
        id: messages.length + 2,
        text: "I'm analyzing your question and will provide personalized health recommendations shortly.",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 2000);
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 bg-teal-600 text-white p-4 rounded-full shadow-lg 
          hover:bg-teal-700 transition-all duration-300 transform hover:scale-110 animate-bounce"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed right-6 ${isMinimized ? 'bottom-24' : 'bottom-6'} w-[95vw] md:w-96 bg-white rounded-t-xl 
        shadow-xl transition-all duration-300 transform ${isOpen ? 'translate-y-0' : 'translate-y-full'} z-40`}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 animate-pulse" />
          <span className="font-medium">AI Health Assistant</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-teal-500/50 rounded transition-colors duration-200"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-teal-500/50 rounded transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div id="message-container" className="h-[60vh] md:h-96 overflow-y-auto p-4 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'} animate-slideIn`}
                style={{ animationDuration: '0.3s' }}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.isUser
                      ? 'bg-teal-600 text-white transform hover:scale-[1.02] transition-transform'
                      : 'bg-gray-100 text-gray-800 transform hover:scale-[1.02] transition-transform'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {msg.isUser ? (
                      <User className="w-4 h-4 opacity-70" />
                    ) : (
                      <Bot className="w-4 h-4 opacity-70" />
                    )}
                    <span className="text-xs opacity-70">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {msg.isTyping ? (
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm loading-dots">Typing</span>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-gray-50">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend('enter_key')}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                  focus:ring-teal-500 focus:border-transparent transition-all duration-200"
              />
              <button
                onClick={() => handleSend('send_button')}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 
                  transition-all duration-200 transform hover:scale-105 focus:ring-2 
                  focus:ring-teal-500 focus:ring-offset-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatAssistant;