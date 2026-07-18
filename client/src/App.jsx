import React, { useState } from 'react';
import Queue from './Queue';
import MatchReveal from './MatchReveal';
import Chat from './Chat';
import Dashboard from './Dashboard';

function App() {
  const [screen, setScreen] = useState('login');
  const [matchData, setMatchData] = useState(null);
  // Default to a random user ID between 1 and 244 (these exist in the CSV)
  const [myUserId, setMyUserId] = useState(() => {
    const list = [1, 209, 102, 112, 116]; // known active users or just random
    return list[Math.floor(Math.random() * list.length)];
  });
  const [skipCount, setSkipCount] = useState(0);

  const startNewSearch = (changeUser = false) => {
    setSkipCount(0);
    setMatchData(null);
    if (changeUser) {
      setScreen('login');
    } else {
      setScreen('dashboard');
    }
  };

  const handleMatchFound = (data) => {
    setMatchData(data);
    setScreen('reveal');
  };

  const handleSkip = () => {
    setSkipCount(prev => prev + 1);
    setScreen('queue');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {screen === 'login' && (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          <h1 style={{ color: 'var(--accent-primary)', fontSize: '48px', marginBottom: '10px' }}>Tamago</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Enter your User ID (1-244)</p>
          <input 
            type="number" 
            value={myUserId} 
            onChange={(e) => setMyUserId(Number(e.target.value))}
            style={{ padding: '15px', fontSize: '24px', width: '150px', textAlign: 'center', borderRadius: '12px', border: '2px solid var(--accent-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <button 
            onClick={() => setScreen('dashboard')}
            className="hover-scale"
            style={{ marginTop: '30px', padding: '15px 30px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', boxShadow: 'var(--accent-glow)' }}
          >
            View My Aura
          </button>
        </div>
      )}
      {screen === 'dashboard' && (
        <Dashboard 
          myUserId={myUserId}
          onProceed={() => setScreen('queue')}
        />
      )}
      {screen === 'queue' && (
        <Queue 
          myUserId={myUserId} 
          skipCount={skipCount} 
          onMatchFound={handleMatchFound} 
          setMyUserId={setMyUserId}
        />
      )}
      {screen === 'reveal' && (
        <MatchReveal 
          myUserId={myUserId}
          matchData={matchData} 
          onStartChat={() => setScreen('chat')} 
          onSkip={handleSkip}
        />
      )}
      {screen === 'chat' && (
        <Chat 
          myUserId={myUserId}
          matchData={matchData} 
          onBack={() => startNewSearch(true)} 
        />
      )}
    </div>
  );
}

export default App;
