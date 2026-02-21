import { useState } from 'react';
import axios from 'axios';
import './index.css';

const platforms = [
  { value: 'gfg', label: 'GeeksforGeeks', icon: '🔥', hasApi: true, enabled: true },
  { value: 'github', label: 'GitHub', icon: '💻', hasApi: true, enabled: true },
  { value: 'leetcode-potd', label: 'LeetCode (POTD)', icon: '🔥', hasApi: true, enabled: true },
  { value: 'leetcode-submissions', label: 'LeetCode (Submissions)', icon: '💡', hasApi: true, enabled: true },
  { value: 'unstop', label: 'Unstop', icon: '🚀', hasApi: false, enabled: false },
  { value: 'codechef', label: 'CodeChef', icon: '👨‍🍳', hasApi: false, enabled: false },
  { value: 'codeforces', label: 'Codeforces', icon: '🏆', hasApi: false, enabled: false },
  { value: 'hackerrank', label: 'HackerRank', icon: '🎯', hasApi: false, enabled: false }
];

function App() {
  const [name, setName] = useState('VARUN D MAGAR');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [currentPlatform, setCurrentPlatform] = useState('github');
  const [currentUsername, setCurrentUsername] = useState('');
  const [fetching, setFetching] = useState(false);

  const addPlatform = async () => {
    if (!currentUsername.trim()) {
      alert('Please enter a username');
      return;
    }

    if (selectedPlatforms.find(p => p.platform === currentPlatform)) {
      alert('Platform already added');
      return;
    }

    setFetching(true);
    
    try {
      // Fetch streak automatically for all platforms
      const apiUrl = `/api/fetch-streak/${currentPlatform}/${currentUsername}`;
      const response = await axios.get(apiUrl);
      
      const newPlatform = {
        platform: currentPlatform,
        username: currentUsername,
        streak: response.data.streak,
        source: response.data.source
      };

      setSelectedPlatforms([...selectedPlatforms, newPlatform]);
      setCurrentUsername('');
      
      // Show message based on source
      if (response.data.source === 'api' || response.data.source === 'scrape') {
        alert(`✓ Fetched real streak: ${response.data.streak} days`);
      } else {
        alert(`✓ Added ${currentUsername} with estimated streak: ${response.data.streak} days\n\nNote: This platform doesn't have a public API. Visitors can verify by clicking the platform.`);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      alert('Failed to add platform. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  const removePlatform = (platform) => {
    setSelectedPlatforms(selectedPlatforms.filter(p => p.platform !== platform));
  };

  const getCardUrl = () => {
    const encodedPlatforms = encodeURIComponent(JSON.stringify(selectedPlatforms));
    return `/api/streak-card?platforms=${encodedPlatforms}&name=${encodeURIComponent(name)}`;
  };

  const getFullCardUrl = () => {
    const encodedPlatforms = encodeURIComponent(JSON.stringify(selectedPlatforms));
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/streak-card?platforms=${encodedPlatforms}&name=${encodeURIComponent(name)}`;
  };

  const getEmbedCode = () => {
    return `![Coding Streaks](${getFullCardUrl()})`;
  };

  const getHtmlEmbedCode = () => {
    return `<img src="${getFullCardUrl()}" alt="Coding Streaks" />`;
  };

  const getPlatformUrl = (platform, username) => {
    const urls = {
      gfg: `https://auth.geeksforgeeks.org/user/${username}`,
      weather: `#`,
      github: `https://github.com/${username}`,
      'leetcode-potd': `https://leetcode.com/${username}`,
      'leetcode-submissions': `https://leetcode.com/${username}`,
      leetcode: `https://leetcode.com/${username}`,
      unstop: `https://unstop.com/u/${username}`,
      microsoft: `https://rewards.microsoft.com/`,
      puzzles: `https://www.chess.com/member/${username}`,
      codechef: `https://www.codechef.com/users/${username}`,
      codeforces: `https://codeforces.com/profile/${username}`,
      hackerrank: `https://www.hackerrank.com/${username}`
    };
    return urls[platform] || '#';
  };

  return (
    <div className="app">
      <div className="header">
        <div className="brand">
          <h1>🔥 Streak Card Generator</h1>
          <p className="brand-subtitle">A project by <span className="brand-name">NeuroBytes</span></p>
        </div>
        <p>Just enter your username - we'll fetch the streak automatically!</p>
      </div>

      <div className="container">
        {/* Name Input */}
        <div className="section">
          <label>Your Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>

        {/* Add Platform */}
        <div className="section">
          <h3>Add Platform</h3>
          <p className="info-text">
            {platforms.find(p => p.value === currentPlatform)?.hasApi 
              ? '✓ This platform supports real-time data fetching' 
              : 'ℹ️ This platform will show estimated data (visitors can verify by clicking)'}
          </p>
          <div className="add-platform-form">
            <div className="form-row">
              <div className="form-col">
                <label>Platform</label>
                <select value={currentPlatform} onChange={(e) => setCurrentPlatform(e.target.value)}>
                  {platforms.map(p => (
                    <option key={p.value} value={p.value} disabled={!p.enabled}>
                      {p.icon} {p.label} {p.enabled ? (p.hasApi ? '(Real-time ✓)' : '') : '(Coming Soon)'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-col">
                <label>Username</label>
                <input
                  type="text"
                  value={currentUsername}
                  onChange={(e) => setCurrentUsername(e.target.value)}
                  placeholder="Your username"
                  onKeyPress={(e) => e.key === 'Enter' && addPlatform()}
                />
              </div>
            </div>
            <button 
              onClick={addPlatform} 
              disabled={fetching}
              className="add-btn"
            >
              {fetching ? '⏳ Adding...' : '➕ Add Platform (Auto-fetch streak)'}
            </button>
          </div>
        </div>

        {/* Selected Platforms */}
        {selectedPlatforms.length > 0 && (
          <div className="section">
            <h3>Selected Platforms ({selectedPlatforms.length})</h3>
            <div className="streak-summary">
              <div className="streak-stat">
                <div className="stat-value">{selectedPlatforms.reduce((sum, p) => sum + p.streak, 0)}</div>
                <div className="stat-label">Total Days</div>
              </div>
              <div className="streak-stat">
                <div className="stat-value">{Math.max(...selectedPlatforms.map(p => p.streak))}</div>
                <div className="stat-label">Longest Streak</div>
              </div>
              <div className="streak-stat">
                <div className="stat-value">{Math.round(selectedPlatforms.reduce((sum, p) => sum + p.streak, 0) / selectedPlatforms.length)}</div>
                <div className="stat-label">Average Streak</div>
              </div>
            </div>
            <div className="platform-chips">
              {selectedPlatforms.map(p => {
                const platform = platforms.find(pl => pl.value === p.platform);
                return (
                  <div key={p.platform} className="chip">
                    <a 
                      href={getPlatformUrl(p.platform, p.username)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="chip-link"
                      title="Click to verify on actual profile"
                    >
                      <span>{platform?.icon} {platform?.label}</span>
                      <span className="chip-username">@{p.username}</span>
                      <span className="chip-streak">{p.streak} days 🔥</span>
                      {p.source === 'api' && <span className="chip-badge">✓ Live</span>}
                    </a>
                    <button onClick={() => removePlatform(p.platform)}>×</button>
                  </div>
                );
              })}
            </div>
            <p className="hint">
              💡 Click any chip to verify the profile | ✓ = Real-time data
            </p>
          </div>
        )}

        {/* Preview */}
        {selectedPlatforms.length > 0 && (
          <>
            <div className="section">
              <h3>Preview (Click platforms to verify)</h3>
              <div className="preview">
                <img src={getCardUrl()} alt="Streak Card" />
              </div>
              <p className="hint">
                💡 Each platform in the card is clickable and opens the profile for verification
              </p>
            </div>

            {/* Embed Code */}
            <div className="section">
              <h3>Embed Code for GitHub README</h3>
              <p className="hint">📝 Markdown format (recommended for GitHub)</p>
              <textarea
                readOnly
                value={getEmbedCode()}
                onClick={(e) => e.target.select()}
                rows={3}
              />
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(getEmbedCode());
                  alert('✓ Markdown code copied to clipboard!');
                }}
              >
                📋 Copy Markdown Code
              </button>
              
              <p className="hint" style={{ marginTop: '20px' }}>🔧 HTML format (alternative)</p>
              <textarea
                readOnly
                value={getHtmlEmbedCode()}
                onClick={(e) => e.target.select()}
                rows={3}
              />
              <button
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(getHtmlEmbedCode());
                  alert('✓ HTML code copied to clipboard!');
                }}
              >
                📋 Copy HTML Code
              </button>
            </div>
          </>
        )}

        {/* Instructions */}
        {selectedPlatforms.length > 0 && (
          <div className="section">
            <h3>📖 How to Add to GitHub Profile</h3>
            <ol style={{ textAlign: 'left', lineHeight: '1.8' }}>
              <li>Copy the Markdown code above</li>
              <li>Go to your GitHub profile repository (usually <code>username/username</code>)</li>
              <li>Edit the <code>README.md</code> file</li>
              <li>Paste the code where you want the card to appear</li>
              <li>Commit the changes</li>
              <li>Your streak card will appear on your profile! 🎉</li>
            </ol>
          </div>
          </>
        )}
      </div>

      <div className="footer">
        <a 
          className="github-btn" 
          href="https://github.com/VA-run23/Streak_Card" 
          rel="noopener" 
          target="_blank" 
          aria-label="View VA-run23/Streak_Card on GitHub"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" className="octicon" aria-hidden="true">
            <path d="M6.766 11.695C4.703 11.437 3.25 9.904 3.25 7.92c0-.806.281-1.677.75-2.258-.203-.532-.172-1.662.062-2.129.626-.081 1.469.258 1.969.726.594-.194 1.219-.291 1.985-.291.765 0 1.39.097 1.953.274.484-.451 1.343-.79 1.969-.709.218.435.25 1.564.046 2.113.5.613.766 1.436.766 2.274 0 1.984-1.453 3.485-3.547 3.759.531.355.891 1.129.891 2.016v1.678c0 .484.39.758.859.564C13.781 14.824 16 11.905 16 8.291 16 3.726 12.406 0 7.984 0 3.562 0 0 3.726 0 8.291c0 3.581 2.203 6.55 5.172 7.663A.595.595 0 0 0 6 15.389v-1.291c-.219.097-.5.162-.75.162-1.031 0-1.641-.581-2.078-1.662-.172-.435-.36-.693-.719-.742-.187-.016-.25-.097-.25-.193 0-.194.313-.339.625-.339.453 0 .844.29 1.25.887.313.468.641.678 1.031.678.391 0 .641-.146 1-.516.266-.275.469-.517.657-.678Z"></path>
          </svg>
          <span>View on GitHub</span>
        </a>
      </div>
    </div>
  );
}

export default App;
