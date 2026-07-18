import React from 'react';

function MatchReveal({ myUserId, matchData, onStartChat, onSkip }) {
  if (!matchData) return null;

  const {
    compatibility_pct,
    user_a,
    user_b,
    shared_interests,
    time_alignment,
    blind_spot_a,
    blind_spot_b,
    shared_video_count,
    user_a_overlap_pct,
    user_b_overlap_pct,
    user_a_peak_hours,
    user_b_peak_hours
  } = matchData;

  const isUserA = String(user_a) === String(myUserId);
  const strangerId = isUserA ? user_b : user_a;
  const myBlindSpot = isUserA ? blind_spot_a : blind_spot_b;
  const theirBlindSpot = isUserA ? blind_spot_b : blind_spot_a;

  const myOverlapPct = isUserA ? user_a_overlap_pct : user_b_overlap_pct;
  const theirOverlapPct = isUserA ? user_b_overlap_pct : user_a_overlap_pct;

  const myPeakHours = isUserA ? user_a_peak_hours : user_b_peak_hours;
  const theirPeakHours = isUserA ? user_b_peak_hours : user_a_peak_hours;

  return (
    <div style={styles.container}>
      <div className="glass-panel" style={styles.panel}>
        
        {/* Compatibility Circle */}
        <div style={styles.matchCircleWrapper}>
          <div style={styles.matchCircleGlow}></div>
          <div style={styles.matchCircle}>
            <span style={styles.pctLabel}>COMPATIBILITY</span>
            <span style={styles.pctNumber}>{compatibility_pct}%</span>
            <span style={styles.matchLabel}>Match Found</span>
          </div>
        </div>

        {/* User identification */}
        <div style={styles.usersBar}>
          <div style={styles.userBadge}>You (User #{myUserId})</div>
          <div style={styles.userConnector}>⇄</div>
          <div style={styles.userBadge}>Stranger (User #{strangerId})</div>
        </div>

        {/* Overlap Summary */}
        <div style={styles.overlapSection}>
          <div style={styles.overlapBadge}>
            🕒 {time_alignment}
          </div>
          <div style={styles.overlapBadge}>
            📺 {shared_video_count} videos ({myOverlapPct}% of your logs, {theirOverlapPct}% of theirs)
          </div>
        </div>

        {/* Shared Interests */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Shared Frequency</h3>
          <div style={styles.interestList}>
            {shared_interests.map((interest, index) => (
              <span key={index} style={styles.interestTag}>
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Active Hours Comparison */}
        <div style={styles.activeHoursContainer}>
          <div style={styles.activeHoursCard}>
            <span style={styles.activeHoursLabel}>Your Peak Hours</span>
            <div style={styles.hoursList}>
              {myPeakHours && myPeakHours.map((h, i) => (
                <span key={i} style={styles.hourTag}>{h}</span>
              ))}
            </div>
          </div>
          <div style={styles.activeHoursCard}>
            <span style={styles.activeHoursLabel}>Stranger's Peak Hours</span>
            <div style={styles.hoursList}>
              {theirPeakHours && theirPeakHours.map((h, i) => (
                <span key={i} style={styles.hourTag}>{h}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Blind Spots side-by-side */}
        <div style={styles.blindSpotsContainer}>
          <div style={styles.blindSpotCard}>
            <h4 style={styles.blindSpotTitle}>Your Blind Spot 🔍</h4>
            <p style={styles.blindSpotDesc}>Channels they watch that you never do:</p>
            <div style={styles.blindSpotList}>
              {myBlindSpot.map((item, index) => (
                <span key={index} style={styles.blindSpotTag}>{item}</span>
              ))}
            </div>
          </div>
          
          <div style={styles.blindSpotCard}>
            <h4 style={styles.blindSpotTitle}>Their Blind Spot 🔍</h4>
            <p style={styles.blindSpotDesc}>Channels you watch that they never do:</p>
            <div style={styles.blindSpotList}>
              {theirBlindSpot.map((item, index) => (
                <span key={index} style={styles.blindSpotTag}>{item}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button 
            onClick={onSkip} 
            className="hover-scale" 
            style={styles.skipBtn}
          >
            Skip Match
          </button>
          
          <button 
            onClick={onStartChat} 
            className="hover-scale" 
            style={styles.chatBtn}
          >
            Start Chatting 💬
          </button>
        </div>

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
    padding: '40px 20px',
    overflowY: 'auto',
    maxHeight: '100vh',
  },
  panel: {
    width: '100%',
    maxWidth: '640px',
    padding: '40px 30px',
    textAlign: 'center',
    animation: 'floatUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  matchCircleWrapper: {
    position: 'relative',
    width: '180px',
    height: '180px',
    marginBottom: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchCircleGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: 'var(--accent-gradient)',
    filter: 'blur(20px)',
    opacity: 0.3,
  },
  matchCircle: {
    position: 'relative',
    width: '160px',
    height: '160px',
    borderRadius: '50%',
    background: 'var(--bg-secondary)',
    border: '3px solid var(--accent-primary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--accent-glow)',
  },
  pctLabel: {
    fontSize: '9px',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    letterSpacing: '0.15em',
    marginBottom: '2px',
  },
  pctNumber: {
    fontSize: '44px',
    fontWeight: '800',
    fontFamily: 'var(--font-display)',
    background: 'var(--accent-gradient)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: '1',
    margin: '2px 0',
  },
  matchLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary)',
  },
  usersBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  userBadge: {
    background: 'var(--bg-tertiary)',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid var(--border-color)',
    color: 'var(--text-primary)',
  },
  userConnector: {
    fontSize: '16px',
    fontWeight: '700',
    color: 'var(--accent-primary)',
  },
  overlapSection: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '30px',
  },
  overlapBadge: {
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid var(--border-color)',
    padding: '8px 16px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
  },
  section: {
    width: '100%',
    marginBottom: '30px',
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '12px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '6px',
  },
  interestList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  interestTag: {
    background: 'linear-gradient(90deg, rgba(255, 145, 0, 0.1) 0%, rgba(255, 60, 0, 0.1) 100%)',
    border: '1px solid var(--border-highlight)',
    padding: '6px 14px',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--accent-primary)',
  },
  blindSpotsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    width: '100%',
    marginBottom: '35px',
  },
  blindSpotCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '14px',
    padding: '16px',
    textAlign: 'left',
  },
  blindSpotTitle: {
    fontSize: '13px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    marginBottom: '6px',
  },
  blindSpotDesc: {
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginBottom: '12px',
  },
  blindSpotList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  blindSpotTag: {
    background: 'var(--bg-tertiary)',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    gap: '15px',
    width: '100%',
  },
  skipBtn: {
    flex: 1,
    background: 'var(--bg-tertiary)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 20px',
    fontSize: '15px',
    fontWeight: '600',
    transition: 'all 0.25s',
  },
  chatBtn: {
    flex: 2,
    background: 'var(--accent-gradient)',
    color: '#fff',
    borderRadius: '12px',
    padding: '14px 20px',
    fontSize: '15px',
    fontWeight: '600',
    boxShadow: 'var(--accent-glow)',
    transition: 'all 0.25s',
  },
  activeHoursContainer: {
    display: 'flex',
    gap: '15px',
    width: '100%',
    marginBottom: '20px',
  },
  activeHoursCard: {
    flex: 1,
    background: 'rgba(255, 140, 0, 0.03)',
    border: '1px solid rgba(255, 140, 0, 0.1)',
    borderRadius: '12px',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  activeHoursLabel: {
    fontSize: '11px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: 'var(--text-secondary)',
  },
  hoursList: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
  },
  hourTag: {
    background: 'var(--bg-tertiary)',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--accent-primary)',
    border: '1px solid var(--border-color)',
  }
};

export default MatchReveal;
