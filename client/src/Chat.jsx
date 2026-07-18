import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

function Chat({ myUserId, matchData, onBack }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Connect to server (either localhost or deployed host)
    const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    const socketConnection = io(serverUrl);

    setSocket(socketConnection);

    socketConnection.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
      // Join the unique room for this match ID
      socketConnection.emit('join-room', matchData.match_id);
    });

    socketConnection.on('chat-message', (msg) => {
      setMessages((prev) => [...prev, { ...msg, type: 'received' }]);
    });

    socketConnection.on('disconnect', () => {
      setIsConnected(false);
    });

    return () => {
      socketConnection.disconnect();
    };
  }, [matchData.match_id]);

  useEffect(() => {
    // Auto-scroll to bottom of messages
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !socket) return;

    const msgObj = {
      text: inputText,
      sender: myUserId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Emit to server
    socket.emit('chat-message', msgObj);

    // Append to local messages
    setMessages((prev) => [...prev, { ...msgObj, type: 'sent' }]);
    setInputText('');
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.panel}>
        
        {/* Chat Header */}
        <div style={styles.header}>
          <button onClick={onBack} style={styles.backBtn}>
            ← Exit
          </button>
          
          <div style={styles.headerInfo}>
            <h3 style={styles.headerTitle}>Stranger Match</h3>
            <span style={styles.statusLabel}>
              <span style={{ 
                ...styles.statusDot, 
                backgroundColor: isConnected ? '#4caf50' : '#f44336' 
              }} />
              {isConnected ? `Room: ${matchData.user_b}` : 'Connecting...'}
            </span>
          </div>

          <div style={styles.headerBadge}>
            🔥 {matchData.compatibility_pct}%
          </div>
        </div>

        {/* Message Window */}
        <div style={styles.messageBox}>
          {messages.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyTitle}>You're connected!</p>
              <p style={styles.emptySub}>
                Say hello! You both share interest in: <br />
                <span style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>
                  {matchData.shared_interests.join(', ')}
                </span>
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div 
                key={idx} 
                style={{
                  ...styles.messageRow,
                  justifyContent: msg.type === 'sent' ? 'flex-end' : 'flex-start'
                }}
              >
                <div 
                  style={{
                    ...styles.bubble,
                    background: msg.type === 'sent' ? 'var(--accent-gradient)' : 'var(--bg-tertiary)',
                    borderRadius: msg.type === 'sent' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    border: msg.type === 'sent' ? 'none' : '1px solid var(--border-color)',
                  }}
                >
                  <p style={styles.bubbleText}>{msg.text}</p>
                  <span style={styles.bubbleTime}>{msg.timestamp}</span>
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input Bar */}
        <form onSubmit={handleSend} style={styles.inputForm}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            style={styles.textInput}
            disabled={!isConnected}
          />
          <button 
            type="submit" 
            style={{
              ...styles.sendBtn,
              opacity: isConnected && inputText.trim() ? 1 : 0.5,
              cursor: isConnected && inputText.trim() ? 'pointer' : 'default'
            }}
            disabled={!isConnected || !inputText.trim()}
          >
            Send ⚡
          </button>
        </form>

      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    height: '100%',
  },
  panel: {
    width: '100%',
    maxWidth: '640px',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  backBtn: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '13px',
    transition: 'all 0.2s',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: '800',
    color: 'var(--text-primary)',
  },
  statusLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'var(--text-muted)',
    marginTop: '2px',
  },
  statusDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  headerBadge: {
    background: 'rgba(255, 145, 0, 0.1)',
    border: '1px solid var(--border-highlight)',
    color: 'var(--accent-primary)',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
  },
  messageBox: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '8px',
    color: 'var(--text-primary)',
  },
  emptySub: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  bubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    color: 'var(--text-primary)',
    boxShadow: 'var(--shadow-sm)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  bubbleText: {
    fontSize: '14px',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  bubbleTime: {
    fontSize: '9px',
    color: 'rgba(255, 255, 255, 0.5)',
    alignSelf: 'flex-end',
  },
  inputForm: {
    padding: '16px 20px',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    gap: '12px',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  textInput: {
    flex: 1,
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '12px 16px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
  },
  sendBtn: {
    background: 'var(--accent-gradient)',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    padding: '0 20px',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: 'var(--accent-glow)',
  }
};

export default Chat;
