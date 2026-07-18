import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

function Queue({ myUserId, skipCount, onMatchFound, setMyUserId }) {
  const [dots, setDots] = useState('');
  const [userVal, setUserVal] = useState(myUserId);
  const [statusText, setStatusText] = useState('Entering live queue');

  useEffect(() => {
    setUserVal(myUserId);
  }, [myUserId]);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    const messages = [
      'Scanning for other online users...',
      'Comparing active taste profiles...',
      'Checking compatible watch history...',
      'Aligning peak active hours...',
      'Searching for live matches...',
      'Waiting for another user to connect...'
    ];

    let msgIndex = 0;
    const msgInterval = setInterval(() => {
      if (msgIndex < messages.length) {
        setStatusText(messages[msgIndex]);
        msgIndex++;
      }
    }, 1200);

    // Setup Socket.io connection for live queueing
    const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    const socket = io(serverUrl);

    let matchReceived = false;

    socket.on('connect', () => {
      console.log(`Connected to server. Joining live queue as User #${myUserId}...`);
      socket.emit('join-queue', { userId: myUserId });
    });

    socket.on('match-found', (payload) => {
      console.log('Live match found via Socket!', payload);
      matchReceived = true;
      onMatchFound(payload);
    });

    // Fallback logic if no real user matches within 8 seconds
    const fallbackTimeout = setTimeout(() => {
      if (!matchReceived) {
        console.log('No online match found. Falling back to simulated match...');
        setStatusText('Searching simulated database');
        
        const fetchUrl = `${serverUrl}/api/match?userId=${myUserId}&skipCount=${skipCount}`;
        fetch(fetchUrl)
          .then((res) => {
            if (!res.ok) throw new Error('Server error');
            return res.json();
          })
          .then((data) => {
            if (!matchReceived) {
              onMatchFound(data);
            }
          })
          .catch((err) => {
            console.error('Fallback fetch error:', err);
            // hard fallback
            const fallbackPayload = {
              match_id: `match_${myUserId}_fallback`,
              user_a: myUserId,
              user_b: '99',
              compatibility_pct: 88,
              shared_interests: ['Shared Genre: Gaming', 'Shared Channel: Lofi Girl'],
              time_alignment: 'Night Owls (active 11 PM - 4 AM)',
              blind_spot_a: ['MrBeast'],
              blind_spot_b: ['PewDiePie'],
              shared_video_count: 12
            };
            if (!matchReceived) {
              onMatchFound(fallbackPayload);
            }
          });
      }
    }, 8000); // Wait 8 seconds before falling back to simulated matching

    return () => {
      clearInterval(dotInterval);
      clearInterval(msgInterval);
      clearTimeout(fallbackTimeout);
      
      // Leave the queue and close connection cleanly
      socket.emit('leave-queue');
      socket.disconnect();
    };
  }, [myUserId, skipCount]);

  const handleUserChange = (e) => {
    e.preventDefault();
    const id = parseInt(userVal);
    if (id >= 1 && id <= 244) {
      setMyUserId(id);
    } else {
      alert('Please enter a valid user ID between 1 and 244.');
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.panel}>
        <div style={styles.header}>
          <span style={styles.logoEgg}>🥚</span>
          <h1 style={styles.title}>tamago</h1>
        </div>

        <div style={styles.radarWrapper}>
          <div style={styles.radarRing1}></div>
          <div style={styles.radarRing2}></div>
          <div style={styles.radarPulse}>
            <span style={styles.radarIcon}>⚡</span>
          </div>
        </div>

        <div style={styles.statusBox}>
          <p style={styles.status}>{statusText}{dots}</p>
          <span style={styles.subtext}>Matchmaking using live Socket queue</span>
        </div>

        <form onSubmit={handleUserChange} style={styles.form}>
          <label style={styles.label}>Simulate as User ID (1-244):</label>
          <div style={styles.inputGroup}>
            <input 
              type="number" 
              min="1" 
              max="244"
              value={userVal} 
              onChange={(e) => setUserVal(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.btn}>Set ID</button>
          </div>
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
  },
  panel: {
    width: '100%',
    maxWidth: '480px',
    padding: '40px 30px',
    textAlign: 'center',
    animation: 'floatUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '40px',
  },
  logoEgg: {
    fontSize: '28px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  radarWrapper: {
    position: 'relative',
    width: '140px',
    height: '140px',
    marginBottom: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRing1: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2px solid rgba(255, 145, 0, 0.15)',
    animation: 'spinSlow 10s linear infinite',
  },
  radarRing2: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: '50%',
    border: '1px dashed rgba(255, 60, 0, 0.25)',
    animation: 'spinSlow 6s linear infinite reverse',
  },
  radarPulse: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    background: 'var(--accent-gradient)',
    boxShadow: 'var(--accent-glow)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pulseGlow 2s infinite ease-in-out',
  },
  radarIcon: {
    fontSize: '28px',
    color: '#fff',
  },
  statusBox: {
    marginBottom: '30px',
  },
  status: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    marginBottom: '8px',
    height: '24px',
  },
  subtext: {
    fontSize: '13px',
    color: 'var(--text-muted)',
  },
  form: {
    width: '100%',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '25px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  label: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginLeft: '35px',
  },
  inputGroup: {
    display: 'flex',
    gap: '8px',
    width: '85%',
  },
  input: {
    flex: 1,
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  btn: {
    background: 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }
};

export default Queue;
