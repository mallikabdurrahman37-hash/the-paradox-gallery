import React, { useState, useRef, useEffect } from 'react';
import { askCurator } from '../../services/curatorChat';
import aiLogo from '../../assets/images/ai-logo.png';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: 'I am The Curator. Ask me about art, the gallery, or the nature of things. Or say nothing — silence has its own grammar.',
};

export default function AIChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, thinking, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || thinking) return;

    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);

    // Simulate 600–1400ms "typing" delay for mystery
    const delay = 600 + Math.random() * 800;
    await new Promise((r) => setTimeout(r, delay));

    try {
      const history = messages.filter((m) => m.role !== 'system');
      const reply = await askCurator(history, text);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'The signal was lost. Even I have limits. Try again.' },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-chatbot" role="complementary" aria-label="The Curator AI">
      {open && (
        <div className="ai-chatbot__window" role="dialog" aria-modal="true" aria-label="Chat with The Curator">
          {/* Header */}
          <div className="ai-chatbot__header">
            <img src={aiLogo} alt="The Curator" className="ai-chatbot__header-avatar" />
            <div className="ai-chatbot__header-info">
              <h4>The Curator</h4>
              <span>CJP Intelligence</span>
            </div>
            <button
              className="btn btn--ghost"
              style={{ marginLeft: 'auto', color: 'rgba(249,248,245,0.4)' }}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="ai-chatbot__messages" role="log" aria-live="polite" aria-label="Chat messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`ai-message ai-message--${msg.role === 'user' ? 'user' : 'bot'}`}
              >
                {msg.content}
              </div>
            ))}
            {thinking && (
              <div className="ai-message ai-message--bot">
                <div className="ai-typing" aria-label="The Curator is thinking">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="ai-chatbot__input">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask The Curator…"
              maxLength={280}
              aria-label="Message The Curator"
              disabled={thinking}
            />
            <button
              className="ai-chatbot__send btn btn--ghost"
              onClick={sendMessage}
              disabled={!input.trim() || thinking}
              aria-label="Send message"
            >
              →
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        className="ai-chatbot__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close The Curator' : 'Open The Curator'}
        aria-expanded={open}
      >
        <img src={aiLogo} alt="The Curator" />
      </button>
    </div>
  );
}
