import axios from 'axios';

// Fetch functions from fetch-streak.js
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
    // Query LeetCode's GraphQL API directly
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submissionCalendar
        }
      }
    `;

    const response = await axios.post('https://leetcode.com/graphql', {
      query: query,
      variables: { username: username }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      },
      timeout: 10000
    });

    if (response.data.errors) {
      console.error('LeetCode GraphQL errors:', response.data.errors);
      return 0;
    }

    const submissionCalendar = response.data?.data?.matchedUser?.submissionCalendar;

    if (!submissionCalendar) {
      console.log('No submission calendar data found for user:', username);
      return 0;
    }

    // Parse the submission calendar JSON string
    const calendar = JSON.parse(submissionCalendar);

    if (!calendar || Object.keys(calendar).length === 0) {
      console.log('Empty calendar for user:', username);
      return 0;
    }

    // Get all submission timestamps and sort them
    const timestamps = Object.keys(calendar)
      .map(ts => parseInt(ts))
      .filter(ts => calendar[ts] > 0)
      .sort((a, b) => b - a);

    if (timestamps.length === 0) {
      console.log('No submissions found for user:', username);
      return 0;
    }

    // Helper function to get day start timestamp (midnight UTC)
    const getDayStart = (timestamp) => {
      const date = new Date(timestamp * 1000);
      return Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 1000);
    };

    // Get unique days
    const uniqueDays = [...new Set(timestamps.map(ts => getDayStart(ts)))].sort((a, b) => b - a);

    // Get today's start timestamp
    const now = new Date();
    const todayStart = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000);
    const oneDaySeconds = 86400;

    // Check if streak is active (today or yesterday)
    let streakCount = 0;
    let expectedDay = todayStart;

    // If no submission today, check yesterday (grace period)
    if (uniqueDays[0] < todayStart) {
      expectedDay = todayStart - oneDaySeconds;
      if (uniqueDays[0] < expectedDay) {
        // Streak is broken
        return 0;
      }
    }

    // Count consecutive days
    for (const day of uniqueDays) {
      if (day === expectedDay) {
        streakCount++;
        expectedDay -= oneDaySeconds;
      } else if (day < expectedDay) {
        // Gap found, streak ends
        break;
      }
    }

    return streakCount;
  } catch (error) {
    console.error('LeetCode fetch error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
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

async function fetchStreakForPlatform(platform, username) {
  switch(platform) {
    case 'github':
      return await getGitHubStreak(username);
    case 'leetcode':
      return await getLeetCodePOTDStreak(username);
    case 'gfg':
    case 'geeksforgeeks':
      return await getGFGStreak(username);
    default:
      return 0;
  }
}

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

export default async function handler(req, res) {
  const { platforms, name = '', greeting = '', color = '#FF8C42' } = req.query;
  
  if (!platforms) {
    return res.status(400).json({ error: 'Platforms parameter required' });
  }

  const platformList = JSON.parse(decodeURIComponent(platforms));
  
  // Fetch live streak data for all platforms
  const streakPromises = platformList.map(async (platform) => {
    const username = platform.username || 'user';
    const streak = await fetchStreakForPlatform(platform.platform, username);
    return { ...platform, streak };
  });
  
  const platformsWithStreaks = await Promise.all(streakPromises);
  
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
    geeksforgeeks: 'GFG'
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
  const tabsPerRow = Math.min(4, platformsWithStreaks.length);
  const cardWidth = Math.max(300, 20 + (tabsPerRow * 140));
  const headerHeight = showHeader ? 100 : 0;
  const tabHeight = 55;
  const rows = Math.ceil(platformsWithStreaks.length / tabsPerRow);
  const tabsHeight = rows * tabHeight + 20;
  const cardHeight = headerHeight + tabsHeight;

  let tabsHtml = '';
  platformsWithStreaks.forEach((platform, index) => {
    const row = Math.floor(index / tabsPerRow);
    const col = index % tabsPerRow;
    const x = 20 + (col * 140);
    const y = headerHeight + 10 + (row * tabHeight);
    const streak = platform.streak || 0;
    const username = platform.username || 'user';
    const url = getPlatformUrl(platform.platform, username);
    const platformName = platformNames[platform.platform] || platform.platform.toUpperCase();
    
    // Check if it's LeetCode platform to show /365 limitation
    const isLeetCode = platform.platform === 'leetcode';
    const streakText = isLeetCode ? `${streak}/365 days 🔥` : `${streak} days 🔥`;

    tabsHtml += `
      <a href="${url}" target="_blank" rel="noopener noreferrer">
        <g class="tab">
          <rect x="${x}" y="${y}" width="130" height="45" fill="${color}" rx="8" opacity="0.95"/>
          <text x="${x + 10}" y="${y + 20}" fill="white" font-size="13" font-weight="600">
            ${platformName}
          </text>
          <text x="${x + 10}" y="${y + 36}" fill="white" font-size="18" font-weight="700">
            ${streakText}
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
      
      ${headerSvg}
      
      ${tabsHtml}
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=1800');
  res.send(svg);
}