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
    // Try primary API
    let response;
    try {
      response = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/calendar`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
    } catch (primaryError) {
      console.log('Primary LeetCode API failed, trying alternative...');
      // Try alternative endpoint
      response = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`, {
        timeout: 10000
      });
    }
    
    const submissionCalendar = response.data?.submissionCalendar;
    
    if (!submissionCalendar || Object.keys(submissionCalendar).length === 0) {
      console.log('No submission calendar data found');
      return 0;
    }
    
    // Convert timestamps to dates (UTC)
    const submissions = Object.entries(submissionCalendar)
      .map(([timestamp, count]) => ({
        timestamp: parseInt(timestamp),
        count: parseInt(count),
        date: new Date(parseInt(timestamp) * 1000)
      }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (submissions.length === 0) return 0;
    
    // Get unique days (normalize to UTC midnight)
    const uniqueDays = new Set();
    submissions.forEach(sub => {
      const date = new Date(sub.timestamp * 1000);
      const dayKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
      uniqueDays.add(dayKey);
    });
    
    // Convert back to sorted array of date strings
    const sortedDays = Array.from(uniqueDays).sort().reverse();
    
    // Get today's date (UTC)
    const now = new Date();
    const today = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth()}-${yesterday.getUTCDate()}`;
    
    // Calculate streak
    let streakCount = 0;
    let currentCheckDate = new Date(now);
    
    // Start from today or yesterday (grace period)
    if (sortedDays[0] === today) {
      streakCount = 1;
      currentCheckDate.setUTCDate(currentCheckDate.getUTCDate() - 1);
    } else if (sortedDays[0] === yesterdayKey) {
      streakCount = 1;
      currentCheckDate = new Date(yesterday);
      currentCheckDate.setUTCDate(currentCheckDate.getUTCDate() - 1);
    } else {
      // No recent activity
      return 0;
    }
    
    // Count consecutive days backwards
    for (let i = 1; i < sortedDays.length; i++) {
      const expectedDay = `${currentCheckDate.getUTCFullYear()}-${currentCheckDate.getUTCMonth()}-${currentCheckDate.getUTCDate()}`;
      
      if (sortedDays[i] === expectedDay) {
        streakCount++;
        currentCheckDate.setUTCDate(currentCheckDate.getUTCDate() - 1);
      } else {
        break;
      }
    }
    
    return streakCount;
  } catch (error) {
    console.error('LeetCode fetch error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return 0;
  }
}

async function getLeetCodeSubmissionStreak(username) {
  try {
    // Try primary API
    let response;
    try {
      response = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/calendar`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0'
        }
      });
    } catch (primaryError) {
      console.log('Primary LeetCode API failed, trying alternative...');
      // Try alternative endpoint
      response = await axios.get(`https://leetcode-stats-api.herokuapp.com/${username}`, {
        timeout: 10000
      });
    }
    
    const submissionCalendar = response.data?.submissionCalendar;
    
    if (!submissionCalendar || Object.keys(submissionCalendar).length === 0) {
      console.log('No submission calendar data found');
      return 0;
    }
    
    // Convert timestamps to dates (UTC)
    const submissions = Object.entries(submissionCalendar)
      .map(([timestamp, count]) => ({
        timestamp: parseInt(timestamp),
        count: parseInt(count),
        date: new Date(parseInt(timestamp) * 1000)
      }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (submissions.length === 0) return 0;
    
    // Get unique days (normalize to UTC midnight)
    const uniqueDays = new Set();
    submissions.forEach(sub => {
      const date = new Date(sub.timestamp * 1000);
      const dayKey = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
      uniqueDays.add(dayKey);
    });
    
    // Convert back to sorted array of date strings
    const sortedDays = Array.from(uniqueDays).sort().reverse();
    
    // Get today's date (UTC)
    const now = new Date();
    const today = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}`;
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth()}-${yesterday.getUTCDate()}`;
    
    // Calculate streak
    let streakCount = 0;
    let currentCheckDate = new Date(now);
    
    // Start from today or yesterday (grace period)
    if (sortedDays[0] === today) {
      streakCount = 1;
      currentCheckDate.setUTCDate(currentCheckDate.getUTCDate() - 1);
    } else if (sortedDays[0] === yesterdayKey) {
      streakCount = 1;
      currentCheckDate = new Date(yesterday);
      currentCheckDate.setUTCDate(currentCheckDate.getUTCDate() - 1);
    } else {
      // No recent activity
      return 0;
    }
    
    // Count consecutive days backwards
    for (let i = 1; i < sortedDays.length; i++) {
      const expectedDay = `${currentCheckDate.getUTCFullYear()}-${currentCheckDate.getUTCMonth()}-${currentCheckDate.getUTCDate()}`;
      
      if (sortedDays[i] === expectedDay) {
        streakCount++;
        currentCheckDate.setUTCDate(currentCheckDate.getUTCDate() - 1);
      } else {
        break;
      }
    }
    
    return streakCount;
  } catch (error) {
    console.error('LeetCode submission fetch error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
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
