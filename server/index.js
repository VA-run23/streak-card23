import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

async function getGitHubStreak(username) {
  try {
    const response = await axios.get(`https://streak-stats.demolab.com/?user=${username}&type=json`);
    return response.data?.currentStreak?.length || 0;
  } catch (error) {
    console.error('GitHub fetch error:', error.message);
    return 0;
  }
}

async function getLeetCodePOTDStreak(username) {
  try {
    const response = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/calendar`);
    const submissionCalendar = response.data?.submissionCalendar;
    
    if (!submissionCalendar) return 0;
    
    const timestamps = Object.keys(submissionCalendar).map(ts => parseInt(ts)).sort((a, b) => b - a);
    if (timestamps.length === 0) return 0;
    
    const oneDaySeconds = 86400;
    const todayStart = Math.floor(Date.now() / 1000 / oneDaySeconds) * oneDaySeconds;
    
    const uniqueDays = new Set();
    timestamps.forEach(ts => {
      const dayStart = Math.floor(ts / oneDaySeconds) * oneDaySeconds;
      uniqueDays.add(dayStart);
    });
    
    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);
    
    let streakCount = 0;
    let expectedDay = todayStart;
    
    for (let i = 0; i < sortedDays.length; i++) {
      const currentDay = sortedDays[i];
      
      if (currentDay === expectedDay) {
        streakCount++;
        expectedDay -= oneDaySeconds;
      } else if (currentDay === expectedDay + oneDaySeconds && streakCount === 0) {
        streakCount++;
        expectedDay = currentDay - oneDaySeconds;
      } else {
        break;
      }
    }
    
    return streakCount;
  } catch (error) {
    console.error('LeetCode POTD fetch error:', error.message);
    return 0;
  }
}

async function getLeetCodeSubmissionStreak(username) {
  try {
    const response = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/calendar`);
    const submissionCalendar = response.data?.submissionCalendar;
    
    if (!submissionCalendar) return 0;
    
    const timestamps = Object.keys(submissionCalendar).map(ts => parseInt(ts)).sort((a, b) => b - a);
    if (timestamps.length === 0) return 0;
    
    const oneDaySeconds = 86400;
    const todayStart = Math.floor(Date.now() / 1000 / oneDaySeconds) * oneDaySeconds;
    
    const uniqueDays = new Set();
    timestamps.forEach(ts => {
      const dayStart = Math.floor(ts / oneDaySeconds) * oneDaySeconds;
      uniqueDays.add(dayStart);
    });
    
    const sortedDays = Array.from(uniqueDays).sort((a, b) => b - a);
    
    let streakCount = 0;
    let expectedDay = todayStart;
    
    for (let i = 0; i < sortedDays.length; i++) {
      const currentDay = sortedDays[i];
      
      if (currentDay === expectedDay) {
        streakCount++;
        expectedDay -= oneDaySeconds;
      } else if (currentDay === expectedDay + oneDaySeconds && streakCount === 0) {
        streakCount++;
        expectedDay = currentDay - oneDaySeconds;
      } else {
        break;
      }
    }
    
    return streakCount;
  } catch (error) {
    console.error('LeetCode submission fetch error:', error.message);
    return 0;
  }
}

async function getGFGStreak(username) {
  try {
    const response = await axios.get(`https://gfgstatscard.vercel.app/${username}`);
    
    const streakPattern = /<text id="total-streak-text">(\d+)/;
    const match = response.data.match(streakPattern);
    
    if (match && match[1]) {
      return parseInt(match[1]);
    }
    
    return 0;
  } catch (error) {
    console.error('GFG fetch error:', error.message);
    return 0;
  }
}

async function getUnstopStreak(username) {
  console.log('⚠️ UNSTOP API REQUIRED: Please check your browser Network tab when visiting https://unstop.com/u/' + username);
  console.log('Look for API calls containing streak data and provide the exact API URL');
  return 0;
}

function getPlatformUrl(platform, username) {
  const urlMap = {
    gfg: `https://auth.geeksforgeeks.org/user/${username}`,
    geeksforgeeks: `https://auth.geeksforgeeks.org/user/${username}`,
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
  return urlMap[platform] || '#';
}

app.get('/api/fetch-streak/:platform/:username', async (req, res) => {
  const { platform, username } = req.params;
  
  try {
    let streakCount = 0;
    let dataSource = 'api';
    
    switch(platform) {
      case 'github':
        streakCount = await getGitHubStreak(username);
        dataSource = 'api';
        break;
      case 'leetcode-potd':
        streakCount = await getLeetCodePOTDStreak(username);
        dataSource = 'api';
        break;
      case 'leetcode-submissions':
        streakCount = await getLeetCodeSubmissionStreak(username);
        dataSource = 'api';
        break;
      case 'leetcode':
        streakCount = await getLeetCodePOTDStreak(username);
        dataSource = 'api';
        break;
      case 'gfg':
      case 'geeksforgeeks':
        streakCount = await getGFGStreak(username);
        dataSource = 'api';
        break;
      case 'unstop':
        streakCount = await getUnstopStreak(username);
        dataSource = 'manual';
        break;
      default:
        streakCount = 0;
        dataSource = 'manual';
    }
    
    res.json({ 
      platform, 
      username, 
      streak: streakCount,
      source: dataSource,
      url: getPlatformUrl(platform, username)
    });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Failed to fetch streak data', details: error.message });
  }
});

app.get('/api/streak-card', (req, res) => {
  const { platforms, name = '', greeting = '', color = '#FF8C42' } = req.query;
  
  if (!platforms) {
    return res.status(400).json({ error: 'Platforms parameter required' });
  }

  const platformList = JSON.parse(decodeURIComponent(platforms));
  
  const platformNameMap = {
    gfg: 'GFG',
    geeksforgeeks: 'GFG',
    weather: 'Weather',
    github: 'GitHub',
    'leetcode-potd': 'LeetCode POTD',
    'leetcode-submissions': 'LeetCode',
    leetcode: 'LeetCode',
    unstop: 'Unstop',
    microsoft: 'Microsoft',
    puzzles: 'Puzzles',
    codechef: 'CodeChef',
    codeforces: 'Codeforces',
    hackerrank: 'HackerRank'
  };

  // Check if header should be shown
  const showHeader = name.trim() !== '' || greeting.trim() !== '';

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

  // Dynamic width based on number of platforms
  const tabsPerRow = Math.min(4, platformList.length);
  const cardWidth = Math.max(300, 20 + (tabsPerRow * 140));
  const headerHeight = showHeader ? 100 : 0;
  const tabHeight = 55;
  const rowCount = Math.ceil(platformList.length / tabsPerRow);
  const tabsHeight = rowCount * tabHeight + 20;
  const cardHeight = headerHeight + tabsHeight;

  let tabsHtml = '';
  platformList.forEach((platform, index) => {
    const rowIndex = Math.floor(index / tabsPerRow);
    const colIndex = index % tabsPerRow;
    const xPos = 20 + (colIndex * 140);
    const yPos = headerHeight + 10 + (rowIndex * tabHeight);
    const streakValue = platform.streak || 0;
    const usernameValue = platform.username || 'user';
    const platformUrl = getPlatformUrl(platform.platform, usernameValue);
    const platformName = platformNameMap[platform.platform] || platform.platform.toUpperCase();

    tabsHtml += `
      <a href="${platformUrl}" target="_blank" rel="noopener noreferrer">
        <g class="tab">
          <rect x="${xPos}" y="${yPos}" width="130" height="45" fill="${color}" rx="8" opacity="0.95"/>
          <text x="${xPos + 10}" y="${yPos + 20}" fill="white" font-size="13" font-weight="600">
            ${platformName}
          </text>
          <text x="${xPos + 10}" y="${yPos + 36}" fill="white" font-size="18" font-weight="700">
            ${streakValue} days 🔥
          </text>
        </g>
      </a>
    `;
  });

  const headerSvg = showHeader ? `
    <rect width="${cardWidth}" height="${headerHeight}" fill="url(#bgGrad)" rx="12"/>
    <rect y="12" width="${cardWidth}" height="${headerHeight - 12}" fill="url(#bgGrad)"/>
    ${name.trim() !== '' ? `<text x="30" y="38" fill="white" font-size="32" font-weight="bold">${name}</text>` : ''}
    ${greeting.trim() !== '' ? `<text x="30" y="${name.trim() !== '' ? '65' : '50'}" fill="white" font-size="15" opacity="0.95">${greeting}</text>` : ''}
  ` : '';

  const svgContent = `
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
      
      ${headerSvg}
      
      ${tabsHtml}
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=1800');
  res.send(svgContent);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
