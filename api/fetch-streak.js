import axios from 'axios';

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
    
    // Parse the submission calendar (timestamp: count)
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
    hackerrank: `https://www.hackerrank.com/${username}`,
    weather: `#`
  };
  return urlMap[platform] || '#';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  let { platform, username } = req.query;
  
  if (!platform || !username) {
    const urlPath = req.url.split('?')[0];
    const pathParts = urlPath.split('/').filter(p => p);
    if (pathParts.length >= 3) {
      platform = pathParts[pathParts.length - 2];
      username = pathParts[pathParts.length - 1];
    }
  }
  
  if (!platform || !username) {
    return res.status(400).json({ error: 'Platform and username required' });
  }
  
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
    
    res.status(200).json({ 
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
}
