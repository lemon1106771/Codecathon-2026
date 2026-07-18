import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

function Dashboard({ myUserId, onProceed }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const serverUrl = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';
    fetch(`${serverUrl}/api/profile/${myUserId}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching profile:", err);
        setLoading(false);
      });
  }, [myUserId]);

  if (loading) {
    return (
      <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="radar-circle" style={{ position: 'relative', margin: '0 auto' }}></div>
        <p style={{ marginTop: '120px', color: 'var(--accent-primary)', fontWeight: 'bold' }}>Analyzing your Digital Aura...</p>
      </div>
    );
  }

  if (!profile || profile.error) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Profile Not Found</h2>
        <button onClick={onProceed} className="primary-btn hover-scale" style={{ padding: '12px 24px', background: 'var(--accent-gradient)', color: '#fff', border: 'none', borderRadius: '12px', marginTop: '20px', cursor: 'pointer' }}>Go to Matchmaking Anyway</button>
      </div>
    );
  }

  // Colors for Donut Chart (Warm, vibrant orange gradient)
  const COLORS = ['#FF6B00', '#FF8C00', '#FFA500', '#FFB732', '#FFC966'];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Your Digital Aura</h1>
        <p className="subtitle">Based on your {profile.totalVideos} watched videos</p>
      </div>

      <div className="mbti-card glass-panel">
        <div className="mbti-glow"></div>
        <h2 className="mbti-type">{profile.mbti}</h2>
        <h3 className="mbti-title">{profile.title}</h3>
      </div>

      <div className="charts-grid">
        <div className="chart-card glass-panel">
          <h3>Top Content Genres</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={profile.topGenres}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {profile.topGenres.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)' }} 
                  itemStyle={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card glass-panel">
          <h3>Daily Activity Rhythm</h3>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={profile.activityRhythm}>
                <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fontSize: 10}} interval={3} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'rgba(255,140,0,0.05)'}} 
                  contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '12px' }} 
                  itemStyle={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}
                />
                <Bar dataKey="watches" fill="url(#colorOrange)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF8C00" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#FFA500" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="creators-card glass-panel">
        <h3>Top 3 Creators</h3>
        <div className="creators-list">
          {profile.topCreators.map((creator, idx) => (
            <div key={idx} className="creator-badge">
              <span className="creator-rank">#{idx + 1}</span> {creator.name}
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-action">
        <button onClick={onProceed} className="match-button hover-scale">
          Find My Match 🚀
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
