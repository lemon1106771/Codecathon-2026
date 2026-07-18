import React, { useState } from 'react';
import Queue from './Queue';
import MatchReveal from './MatchReveal';
import Chat from './Chat';

function App() {
  const [screen, setScreen] = useState('queue');
  const [matchData, setMatchData] = useState(null);
  // Default to a random user ID between 1 and 244 (these exist in the CSV)
  const [myUserId, setMyUserId] = useState(() => {
    const list = [1, 209, 102, 112, 116]; // known active users or just random
    return list[Math.floor(Math.random() * list.length)];
  });
  const [skipCount, setSkipCount] = useState(0);

  const startNewSearch = (changeUser = false) => {
    if (changeUser) {
      // Pick a random user id up to 244
      setMyUserId(Math.floor(Math.random() * 244) + 1);
    }
    setSkipCount(0);
    setMatchData(null);
    setScreen('queue');
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
