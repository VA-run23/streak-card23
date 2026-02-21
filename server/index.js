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
    const response = await axios.get(`https://leetcode-stats.tashif.codes/${username}`);
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
    const response = await axios.get(`https://leetcode-stats.tashif.codes/${username}`);
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
  const { platforms, name = 'User' } = req.query;
  
  if (!platforms) {
    return res.status(400).json({ error: 'Platforms parameter required' });
  }

  const platformList = JSON.parse(decodeURIComponent(platforms));
  
  const platformIconMap = {
    gfg: '🔥',
    geeksforgeeks: '🔥',
    weather: '☁️',
    github: '💻',
    'leetcode-potd': '🔥',
    'leetcode-submissions': '💡',
    leetcode: '💡',
    unstop: '🚀',
    microsoft: '🎁',
    puzzles: '🧩',
    codechef: '👨‍🍳',
    codeforces: '🏆',
    hackerrank: '🎯'
  };

  const platformNameMap = {
    gfg: 'GFG',
    geeksforgeeks: 'GFG',
    weather: 'Weather',
    github: 'GitHub',
    'leetcode-potd': 'LC POTD',
    'leetcode-submissions': 'LC Subs',
    leetcode: 'LeetCode',
    unstop: 'Unstop',
    microsoft: 'Microsoft',
    puzzles: 'Puzzles',
    codechef: 'CodeChef',
    codeforces: 'Codeforces',
    hackerrank: 'HackerRank'
  };

  const cardWidth = 600;
  const headerHeight = 120;
  const tabHeight = 50;
  const tabsPerRow = 4;
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

    tabsHtml += `
      <a href="${platformUrl}" target="_blank" rel="noopener noreferrer">
        <g class="tab" style="cursor: pointer;">
          <rect x="${xPos}" y="${yPos}" width="130" height="40" fill="#FF8C42" rx="8" opacity="0.9"/>
          <text x="${xPos + 10}" y="${yPos + 18}" font-size="16">${platformIconMap[platform.platform] || '�'}</text>
          <text x="${xPos + 35}" y="${yPos + 18}" fill="white" font-size="12" font-weight="600">
            ${platformNameMap[platform.platform] || platform.platform.toUpperCase()}
          </text>
          <text x="${xPos + 10}" y="${yPos + 33}" fill="white" font-size="14" font-weight="700">
            ${streakValue} days 🔥
          </text>
        </g>
      </a>
    `;
  });

  const svgContent = `
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
  res.send(svgContent);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
