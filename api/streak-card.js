// Get platform URL
function getPlatformUrl(platform, username) {
  const urls = {
    gfg: `https://auth.geeksforgeeks.org/user/${username}`,
    weather: `#`,
    github: `https://github.com/${username}`,
    leetcode: `https://leetcode.com/${username}`,
    unstop: `https://unstop.com/u/${username}`,
    microsoft: `https://rewards.microsoft.com/`,
    puzzles: `https://www.chess.com/member/${username}`,
    codechef: `https://www.codechef.com/users/${username}`,
    codeforces: `https://codeforces.com/profile/${username}`,
    hackerrank: `https://www.hackerrank.com/${username}`,
    geeksforgeeks: `https://auth.geeksforgeeks.org/user/${username}`
  };
  return urls[platform] || '#';
}

export default function handler(req, res) {
  const { platforms, name = 'User' } = req.query;
  
  if (!platforms) {
    return res.status(400).json({ error: 'Platforms parameter required' });
  }

  const platformList = JSON.parse(decodeURIComponent(platforms));
  
  const platformIcons = {
    gfg: '🔥',
    weather: '☁️',
    github: '💻',
    leetcode: '💡',
    unstop: '🚀',
    microsoft: '🎁',
    puzzles: '🧩',
    codechef: '👨‍🍳',
    codeforces: '🏆',
    hackerrank: '🎯',
    geeksforgeeks: '🔥'
  };

  const platformNames = {
    gfg: 'GFG',
    weather: 'Weather',
    github: 'GitHub',
    leetcode: 'LeetCode',
    unstop: 'Unstop',
    microsoft: 'Microsoft',
    puzzles: 'Puzzles',
    codechef: 'CodeChef',
    codeforces: 'Codeforces',
    hackerrank: 'HackerRank',
    geeksforgeeks: 'GeeksforGeeks'
  };

  const cardWidth = 600;
  const headerHeight = 120;
  const tabHeight = 50;
  const tabsPerRow = 4;
  const rows = Math.ceil(platformList.length / tabsPerRow);
  const tabsHeight = rows * tabHeight + 20;
  const cardHeight = headerHeight + tabsHeight;

  let tabsHtml = '';
  platformList.forEach((platform, index) => {
    const row = Math.floor(index / tabsPerRow);
    const col = index % tabsPerRow;
    const x = 20 + (col * 140);
    const y = headerHeight + 10 + (row * tabHeight);
    const streak = platform.streak || 0;
    const username = platform.username || 'user';
    const url = getPlatformUrl(platform.platform, username);

    tabsHtml += `
      <a href="${url}" target="_blank" rel="noopener noreferrer">
        <g class="tab" style="cursor: pointer;">
          <rect x="${x}" y="${y}" width="130" height="40" fill="#FF8C42" rx="8" opacity="0.9"/>
          <text x="${x + 10}" y="${y + 18}" font-size="16">${platformIcons[platform.platform] || '�'}</text>
          <text x="${x + 35}" y="${y + 18}" fill="white" font-size="12" font-weight="600">
            ${platformNames[platform.platform] || platform.platform.toUpperCase()}
          </text>
          <text x="${x + 10}" y="${y + 33}" fill="white" font-size="14" font-weight="700">
            ${streak} days 🔥
          </text>
        </g>
      </a>
    `;
  });

  const svg = `
    <svg width="${cardWidth}" height="${cardHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#FFB347;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#FF8C42;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FF6B35;stop-opacity:1" />
        </linearGradient>
        <style>
          .tab { transition: opacity 0.3s; }
          .tab:hover rect { opacity: 1 !important; }
          a { cursor: pointer; }
        </style>
      </defs>
      
      <rect width="${cardWidth}" height="${cardHeight}" fill="#FFF5EB" rx="12"/>
      <rect width="${cardWidth}" height="${cardHeight}" fill="none" stroke="#FFB347" stroke-width="3" rx="12"/>
      
      <rect width="${cardWidth}" height="${headerHeight}" fill="url(#bgGrad)" rx="12"/>
      <rect y="12" width="${cardWidth}" height="${headerHeight - 12}" fill="url(#bgGrad)"/>
      
      <text x="30" y="40" fill="white" font-size="28" font-weight="bold">${name}</text>
      <text x="30" y="65" fill="white" font-size="14" opacity="0.95">greets you with Namaste 🙏</text>
      <text x="30" y="90" fill="white" font-size="12" opacity="0.9" font-style="italic">
        Tracking daily streaks across platforms for career &amp; professional growth
      </text>
      
      ${tabsHtml}
      
      <text x="${cardWidth / 2}" y="${cardHeight - 10}" fill="#FF8C42" font-size="10" text-anchor="middle" opacity="0.7">
        Click any platform to verify streak details
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=1800');
  res.send(svg);
}
