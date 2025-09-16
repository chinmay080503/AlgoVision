import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm CHATUR-BOT 🤓 Your AI Teaching Assistant. I can help you with algorithms and computer science related queries. How can I assist you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Check Ollama connection on component mount
  useEffect(() => {
    checkOllamaConnection();
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkOllamaConnection = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Ollama connection error:', error);
      setConnectionStatus('error');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: "llama2",
          messages: [...messages, userMessage],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.message.content }]);
    } catch (error) {
      console.error('Error sending message to Ollama:', error);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm having trouble connecting to the AI service. Please make sure Ollama is running on your computer with the Llama2 model installed." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-assistant-header">
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>
        <h1>AI Teaching Assistant</h1>
        <div className={`connection-status ${connectionStatus}`}>
          {connectionStatus === 'connected' ? 'Connected to Ollama' : 
           connectionStatus === 'checking' ? 'Checking connection...' : 
           'Not connected to Ollama'}
        </div>
      </div>

      <div className="chat-container">
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'assistant' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="input-area">
          <div className="input-container">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about algorithms..."
              disabled={isLoading}
              rows="1"
            />
            <button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
          <div className="suggestion-text">
            Try asking: "Explain bubble sort algorithm" or "What is time complexity?"
          </div>
        </form>
      </div>

      <div className="ai-assistant-info">
        <h3>About this AI Assistant</h3>
        <p>
          This assistant uses Ollama with the Llama2 model running locally on your computer.
          Your data never leaves your machine, ensuring complete privacy. The assistant can
          help with algorithm explanations, code examples, and computer science concepts.
        </p>
        <div className="troubleshooting">
          <h4>Having connection issues?</h4>
          <ol>
            <li>Make sure Ollama is installed on your system</li>
            <li>Start Ollama service (usually runs on port 11434)</li>
            <li>Ensure the Llama2 model is installed: <code>ollama pull llama2</code></li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;