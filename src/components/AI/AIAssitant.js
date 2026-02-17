import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showInfo, setShowInfo] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const navigate = useNavigate();

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const bodyHasDark = document.body.classList.contains('dark');
      const htmlHasDark = document.documentElement.classList.contains('dark');
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(bodyHasDark || htmlHasDark || savedTheme === 'dark' || (!savedTheme && prefersDark));
    };
    checkDarkMode();
    const bodyObs = new MutationObserver(checkDarkMode);
    bodyObs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const htmlObs = new MutationObserver(checkDarkMode);
    htmlObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', checkDarkMode);
    window.addEventListener('themeChange', checkDarkMode);
    return () => {
      bodyObs.disconnect(); htmlObs.disconnect();
      window.removeEventListener('storage', checkDarkMode);
      window.removeEventListener('themeChange', checkDarkMode);
    };
  }, []);

  useEffect(() => { checkOllamaConnection(); }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [input]);

  const checkOllamaConnection = async () => {
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      setConnectionStatus(response.ok ? 'connected' : 'error');
    } catch {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama2",
          messages: [...messages, userMessage],
          stream: false,
        }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.message.content }]);
    } catch {
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

  const suggestions = [
    "Explain bubble sort",
    "What is Big O notation?",
    "Explain binary search",
    "What is a linked list?"
  ];

  const statusConfig = {
    connected: { label: 'Connected to Ollama', dot: '#22c55e', bg: 'rgba(34,197,94,0.12)', color: '#16a34a' },
    error:     { label: 'Ollama not connected', dot: '#ef4444', bg: 'rgba(239,68,68,0.12)', color: '#dc2626' },
    checking:  { label: 'Checking connection…', dot: '#f59e0b', bg: 'rgba(245,158,11,0.12)', color: '#d97706' },
  };
  const status = statusConfig[connectionStatus];

  return (
    <div className={`ai-wrap ${isDarkMode ? 'dark' : ''}`}>

      {/* Header */}
      <motion.header
        className="ai-header"
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Left: Title */}
        <div className="ai-header-left">
          <h1 className="ai-title">AI Teaching Assistant</h1>
        </div>

        {/* Right: Back button on top, status below */}
        <div className="ai-header-right">
          <motion.button
            className="ai-back-btn"
            onClick={() => navigate('/dashboard')}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Dashboard
          </motion.button>

          <motion.div
            className="ai-status"
            style={{ background: status.bg }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.span
              className="status-dot"
              style={{ background: status.dot }}
              animate={connectionStatus === 'connected' ? { scale: [1, 1.3, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <span style={{ color: status.color, fontWeight: 600, fontSize: '0.85rem' }}>
              {status.label}
            </span>
          </motion.div>
        </div>
      </motion.header>

      {/* Chat area */}
      <div className="ai-body">
        <motion.div
          className="ai-chat-panel"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Messages */}
          <div className="ai-messages">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`ai-msg ai-msg--${msg.role}`}
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div className="ai-msg-avatar">
                    {msg.role === 'assistant' ? '🤖' : '👤'}
                  </div>
                  <div className="ai-msg-bubble">
                    <div className="ai-msg-text">{msg.content}</div>
                    <div className="ai-msg-time">
                      {msg.role === 'assistant' ? 'CHATUR-BOT' : 'You'} · just now
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isLoading && (
                <motion.div
                  className="ai-msg ai-msg--assistant"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                >
                  <div className="ai-msg-avatar">🤖</div>
                  <div className="ai-msg-bubble">
                    <div className="typing-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion chips */}
          {messages.length === 1 && (
            <motion.div
              className="ai-suggestions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  className="ai-chip"
                  onClick={() => setInput(s)}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.07 }}
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="ai-input-bar">
            <div className="ai-input-inner">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about algorithms…"
                disabled={isLoading}
                rows={1}
                className="ai-textarea"
              />
              <motion.button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="ai-send-btn"
                whileHover={!isLoading && input.trim() ? { scale: 1.07 } : {}}
                whileTap={!isLoading && input.trim() ? { scale: 0.95 } : {}}
              >
                {isLoading ? (
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ display: 'inline-block' }}
                  >
                    ⟳
                  </motion.span>
                ) : '↑'}
              </motion.button>
            </div>
            <p className="ai-hint">Press Enter to send · Shift+Enter for new line</p>
          </form>
        </motion.div>
      </div>

      {/* Info button — bottom left */}
      <motion.button
        className="ai-info-btn"
        onClick={() => setShowInfo(true)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
      >
        ℹ️ About this Assistant
      </motion.button>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <>
            <motion.div
              className="ai-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
            />
            <motion.div
              className="ai-modal"
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 30 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            >
              <div className="ai-modal-header">
                <h3>🤖 About CHATUR-BOT</h3>
                <motion.button
                  className="ai-modal-close"
                  onClick={() => setShowInfo(false)}
                  whileHover={{ scale: 1.15, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
              <div className="ai-modal-body">
                <p>
                  This assistant uses <strong>Ollama</strong> with the <strong>Llama2</strong> model
                  running <em>locally</em> on your computer. Your data never leaves your machine,
                  ensuring complete privacy.
                </p>
                <p>
                  The assistant specialises in <strong>algorithm explanations</strong>, code examples,
                  time complexity, data structures, and broader computer science concepts.
                </p>
                <div className="ai-modal-trouble">
                  <h4>⚠️ Connection issues?</h4>
                  <ol>
                    <li>Install Ollama from <strong>ollama.ai</strong></li>
                    <li>Start the Ollama service (port 11434)</li>
                    <li>Pull the model: <code>ollama pull llama2</code></li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
                <div className="ai-modal-status">
                  <span className="modal-dot" style={{ background: status.dot }} />
                  <span style={{ color: status.color }}>{status.label}</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistant;