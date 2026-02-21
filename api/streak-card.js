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
  const { platforms, name = 'User', greeting = 'greets you with Namaste 🙏', color = '#FF8C42' } = req.query;
  
  if (!platforms) {
    return res.status(400).json({ error: 'Platforms parameter required' });
  }

  const platformList = JSON.parse(decodeURIComponent(platforms));
  
  const platformNames = {
    gfg: 'GFG',
    weather: 'Weather',
    github: 'GitHub',
    leetcode: 'LeetCode',
    'leetcode-potd': 'LeetCode POTD',
    'leetcode-submissions': 'LeetCode',
    unstop: 'Unstop',
    microsoft: 'Microsoft',
    puzzles: 'Puzzles',
    codechef: 'CodeChef',
    codeforces: 'Codeforces',
    hackerrank: 'HackerRank',
    geeksforgeeks: 'GFG'
  };

  // Generate lighter and darker shades from the base color
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 140, b: 66 };
  };

  const rgbToHex = (r, g, b) => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
  };

  const baseRgb = hexToRgb(color);
  const lighterColor = rgbToHex(
    Math.min(255, baseRgb.r + 40),
    Math.min(255, baseRgb.g + 40),
    Math.min(255, baseRgb.b + 40)
  );
  const darkerColor = rgbToHex(
    Math.max(0, baseRgb.r - 30),
    Math.max(0, baseRgb.g - 30),
    Math.max(0, baseRgb.b - 30)
  );

  const cardWidth = 600;
  const headerHeight = 100;
  const tabHeight = 55;
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
    const platformName = platformNames[platform.platform] || platform.platform.toUpperCase();

    tabsHtml += `
      <a href="${url}" target="_blank" rel="noopener noreferrer">
        <g class="tab">
          <rect x="${x}" y="${y}" width="130" height="45" fill="${color}" rx="8" opacity="0.95"/>
          <text x="${x + 10}" y="${y + 20}" fill="white" font-size="13" font-weight="600">
            ${platformName}
          </text>
          <text x="${x + 10}" y="${y + 36}" fill="white" font-size="18" font-weight="700">
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
          <stop offset="0%" style="stop-color:${lighterColor};stop-opacity:1" />
          <stop offset="50%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${darkerColor};stop-opacity:1" />
        </linearGradient>
        <style>
          .tab { transition: opacity 0.3s; cursor: pointer; }
          .tab:hover rect { opacity: 1 !important; }
          a { cursor: pointer; }
        </style>
      </defs>
      
      <rect width="${cardWidth}" height="${cardHeight}" fill="#FFF5EB" rx="12"/>
      <rect width="${cardWidth}" height="${cardHeight}" fill="none" stroke="${lighterColor}" stroke-width="3" rx="12"/>
      
      <rect width="${cardWidth}" height="${headerHeight}" fill="url(#bgGrad)" rx="12"/>
      <rect y="12" width="${cardWidth}" height="${headerHeight - 12}" fill="url(#bgGrad)"/>
      
      <text x="30" y="38" fill="white" font-size="32" font-weight="bold">${name}</text>
      <text x="30" y="65" fill="white" font-size="15" opacity="0.95">${greeting}</text>
      
      ${tabsHtml}
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=1800');
  res.send(svg);
}
