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

async function getLeetCodeSubmissionStreak(username) {
  // Same as POTD streak - both use submission calendar
  return await getLeetCodePOTDStreak(username);
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
