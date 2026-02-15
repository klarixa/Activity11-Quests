const express = require('express');
const router = express.Router();

// Sample player data - in real app, this would come from a database
const playersData = {
  'alex': {
    username: 'alex',
    display_name: 'Alex Chen',
    email: 'alex.chen@example.com',
    level: 15,
    total_xp: 2450,
    xp_to_next_level: 550,
    current_streak: 7,
    longest_streak: 21,
    join_date: '2024-01-01T00:00:00Z',
    last_active: '2024-01-14T18:30:00Z',
    active_quests: [1, 2, 4, 5],
    completed_quests: [3],
    achievements: ['First Week', 'Early Bird', 'Streak Master'],
    preferences: {
      categories: ['work', 'health'],
      difficulty: 'medium',
      notifications: true,
      theme: 'dark'
    },
    stats: {
      total_quests_started: 12,
      completion_rate: 75,
      average_completion_time: 45,
      favorite_category: 'work'
    }
  },
  'jordan': {
    username: 'jordan',
    display_name: 'Jordan Smith',
    email: 'jordan.smith@example.com',
    level: 8,
    total_xp: 890,
    xp_to_next_level: 110,
    current_streak: 3,
    longest_streak: 12,
    join_date: '2024-01-05T00:00:00Z',
    last_active: '2024-01-14T16:45:00Z',
    active_quests: [2, 4],
    completed_quests: [],
    achievements: ['Getting Started'],
    preferences: {
      categories: ['personal', 'learning'],
      difficulty: 'easy',
      notifications: false,
      theme: 'light'
    },
    stats: {
      total_quests_started: 6,
      completion_rate: 50,
      average_completion_time: 60,
      favorite_category: 'personal'
    }
  },
  'sam': {
    username: 'sam',
    display_name: 'Sam Taylor',
    email: 'sam.taylor@example.com',
    level: 22,
    total_xp: 4200,
    xp_to_next_level: 800,
    current_streak: 14,
    longest_streak: 35,
    join_date: '2023-12-15T00:00:00Z',
    last_active: '2024-01-14T20:15:00Z',
    active_quests: [1, 5],
    completed_quests: [3],
    achievements: ['First Week', 'Early Bird', 'Streak Master', 'Veteran', 'XP Hunter'],
    preferences: {
      categories: ['work', 'health', 'personal'],
      difficulty: 'hard',
      notifications: true,
      theme: 'auto'
    },
    stats: {
      total_quests_started: 25,
      completion_rate: 88,
      average_completion_time: 35,
      favorite_category: 'work'
    }
  },
  'demo': {
    username: 'demo',
    display_name: 'Demo User',
    email: 'demo@questtracker.com',
    level: 1,
    total_xp: 0,
    xp_to_next_level: 100,
    current_streak: 0,
    longest_streak: 0,
    join_date: new Date().toISOString(),
    last_active: new Date().toISOString(),
    active_quests: [1],
    completed_quests: [],
    achievements: [],
    preferences: {
      categories: ['personal'],
      difficulty: 'easy',
      notifications: true,
      theme: 'light'
    },
    stats: {
      total_quests_started: 1,
      completion_rate: 0,
      average_completion_time: 0,
      favorite_category: 'personal'
    }
  }
};

// TODO 5: Dynamic player statistics calculation (IMPLEMENTED)
function calculatePlayerStats(player) {
  // 1. Count completed and active quests
  const totalQuestsCompleted = player.completed_quests.length;
  const activeQuestsCount = player.active_quests.length;

  // 2. Calculate total quests (completed + active)
  const totalQuests = totalQuestsCompleted + activeQuestsCount;

  // 3. Completion rate percentage
  const completionRate = totalQuests > 0
    ? Math.round((totalQuestsCompleted / totalQuests) * 100)
    : 0;

  // 4. Average XP per quest
  const averageXpPerQuest = totalQuestsCompleted > 0
    ? Math.round(player.total_xp / totalQuestsCompleted)
    : 0;

  // 5. Streak status based on current streak
  let streakStatus = 'Building';
  if (player.current_streak >= 7) {
    streakStatus = 'Hot Streak! 🔥';
  } else if (player.current_streak >= 3) {
    streakStatus = 'Good 👍';
  }

  // 6. Most active category (from preferences)
  const mostActiveCategory = player.preferences.categories.length > 0
    ? player.preferences.categories[0]
    : 'none';

  // 7. Total estimated time from quest data
  const totalEstimatedTime = player.stats.average_completion_time * totalQuestsCompleted;

  return {
    total_quests_completed: totalQuestsCompleted,
    active_quests_count: activeQuestsCount,
    total_quests: totalQuests,
    completion_rate: completionRate,
    average_xp_per_quest: averageXpPerQuest,
    streak_status: streakStatus,
    current_streak: player.current_streak,
    longest_streak: player.longest_streak,
    most_active_category: mostActiveCategory,
    total_estimated_time_minutes: totalEstimatedTime,
    rank: calculatePlayerRank(player.level),
    activity_score: calculateActivityScore(player)
  };
}

function calculatePlayerRank(level) {
  if (level >= 20) return 'Master';
  if (level >= 15) return 'Expert';
  if (level >= 10) return 'Advanced';
  if (level >= 5) return 'Intermediate';
  return 'Beginner';
}

function calculateActivityScore(player) {
  const daysSinceJoin = Math.floor((new Date() - new Date(player.join_date)) / (1000 * 60 * 60 * 24));
  const daysSinceActive = Math.floor((new Date() - new Date(player.last_active)) / (1000 * 60 * 60 * 24));

  let score = player.level * 10; // Base score from level
  score += player.current_streak * 5; // Streak bonus
  score += player.achievements.length * 20; // Achievement bonus

  // Recency penalty
  if (daysSinceActive > 7) score *= 0.5;
  else if (daysSinceActive > 3) score *= 0.8;

  return Math.round(score);
}

// GET /api/players/:username
router.get('/:username', (req, res) => {
  try {
    const username = req.params.username.toLowerCase();
    const includeQuests = req.query.include_quests === 'true';
    const includeStats = req.query.include_stats !== 'false'; // Default true

    // Check if player exists
    if (!playersData[username]) {
      return res.status(404).json({
        error: 'Player not found',
        message: `Player ${req.params.username} not found`,
        available_players: Object.keys(playersData),
        suggestion: 'Check the username spelling or try: alex, jordan, sam, demo'
      });
    }

    let playerData = { ...playersData[username] };

    // Add calculated stats
    if (includeStats) {
      playerData.calculated_stats = calculatePlayerStats(playerData);
    }

    // Include quest details if requested
    if (includeQuests) {
      playerData.quest_details = {
        active: playerData.active_quests.map(id => ({
          id: id,
          endpoint: `/api/quests/${id}`,
          quick_access: `/api/quests/${id}?api_key=${req.apiKey}`
        })),
        completed: playerData.completed_quests.map(id => ({
          id: id,
          endpoint: `/api/quests/${id}`,
          quick_access: `/api/quests/${id}?api_key=${req.apiKey}`
        }))
      };
    }

    // Add achievement details
    playerData.achievement_details = playerData.achievements.map(achievement => ({
      name: achievement,
      description: getAchievementDescription(achievement),
      rarity: getAchievementRarity(achievement)
    }));

    // Add recommendation
    playerData.recommendations = generatePlayerRecommendations(playerData);

    // Add API metadata
    playerData.api_info = {
      endpoint: req.originalUrl,
      include_quests: includeQuests,
      include_stats: includeStats,
      response_time: new Date().toISOString(),
      data_source: 'Quest Tracker API v1.0',
      authenticated_with: req.apiKey
    };

    res.json(playerData);

  } catch (error) {
    console.error('Player endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch player data'
    });
  }
});

// GET /api/players (list all players with ranking)
router.get('/', (req, res) => {
  try {
    const sortBy = req.query.sort_by || 'level'; // level, xp, streak, activity
    const order = req.query.order || 'desc'; // asc, desc
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const players = Object.keys(playersData).map(key => {
      const data = playersData[key];
      const stats = calculatePlayerStats(data);
      return {
        username: data.username,
        display_name: data.display_name,
        level: data.level,
        total_xp: data.total_xp,
        current_streak: data.current_streak,
        rank: stats.rank,
        completed_quests: stats.total_quests_completed,
        active_quests: stats.active_quests_count,
        completion_rate: stats.completion_rate,
        activity_score: stats.activity_score,
        last_active: data.last_active,
        achievements_count: data.achievements.length,
        endpoint: `/api/players/${key}`
      };
    });

    // Sort players
    players.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'xp':
          comparison = a.total_xp - b.total_xp;
          break;
        case 'streak':
          comparison = a.current_streak - b.current_streak;
          break;
        case 'activity':
          comparison = a.activity_score - b.activity_score;
          break;
        case 'completion_rate':
          comparison = a.completion_rate - b.completion_rate;
          break;
        case 'level':
        default:
          comparison = a.level - b.level;
      }
      return order === 'desc' ? -comparison : comparison;
    });

    // Add rankings
    players.forEach((player, index) => {
      player.leaderboard_position = index + 1;
    });

    const limitedPlayers = players.slice(0, limit);

    // Calculate leaderboard stats
    const leaderboardStats = {
      total_players: players.length,
      average_level: Math.round(players.reduce((sum, p) => sum + p.level, 0) / players.length),
      total_xp_earned: players.reduce((sum, p) => sum + p.total_xp, 0),
      average_completion_rate: Math.round(players.reduce((sum, p) => sum + p.completion_rate, 0) / players.length),
      most_active_player: players.reduce((max, p) => p.activity_score > max.activity_score ? p : max, players[0])
    };

    res.json({
      leaderboard_stats: leaderboardStats,
      sort_applied: { by: sortBy, order: order },
      pagination: {
        limit: limit,
        returned: limitedPlayers.length,
        has_more: players.length > limit
      },
      players: limitedPlayers,
      usage: 'GET /api/players/:username for detailed player data'
    });

  } catch (error) {
    console.error('Players list endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch players list'
    });
  }
});

// PUT /api/players/:username/preferences (update player preferences)
router.put('/:username/preferences', (req, res) => {
  try {
    const username = req.params.username.toLowerCase();

    if (!playersData[username]) {
      return res.status(404).json({
        error: 'Player not found',
        message: `Player ${req.params.username} not found`
      });
    }

    const { categories, difficulty, notifications, theme } = req.body;
    const player = playersData[username];

    // Update preferences
    if (categories) player.preferences.categories = categories;
    if (difficulty) player.preferences.difficulty = difficulty;
    if (notifications !== undefined) player.preferences.notifications = notifications;
    if (theme) player.preferences.theme = theme;

    // Update last active time
    player.last_active = new Date().toISOString();

    res.json({
      message: 'Preferences updated successfully',
      player: {
        username: player.username,
        preferences: player.preferences
      },
      api_info: {
        endpoint: req.originalUrl,
        response_time: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Update preferences endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update preferences'
    });
  }
});

// Helper functions
function getAchievementDescription(achievement) {
  const descriptions = {
    'First Week': 'Completed your first week of quests',
    'Early Bird': 'Completed 5 quests before their deadline',
    'Streak Master': 'Maintained a 7-day quest completion streak',
    'Getting Started': 'Completed your first quest',
    'Veteran': 'Been active for over 30 days',
    'XP Hunter': 'Earned over 3000 XP points'
  };
  return descriptions[achievement] || 'Special achievement unlocked';
}

function getAchievementRarity(achievement) {
  const rarities = {
    'Getting Started': 'Common',
    'First Week': 'Common',
    'Early Bird': 'Uncommon',
    'Streak Master': 'Rare',
    'Veteran': 'Rare',
    'XP Hunter': 'Epic'
  };
  return rarities[achievement] || 'Unknown';
}

function generatePlayerRecommendations(player) {
  const recommendations = [];
  const stats = calculatePlayerStats(player);

  // Low completion rate recommendation
  if (stats.completion_rate < 50) {
    recommendations.push({
      type: 'improvement',
      title: 'Focus on Quest Completion',
      description: 'Try completing more of your active quests to improve your completion rate',
      action: 'Review your active quests and prioritize the easiest ones'
    });
  }

  // Streak building recommendation
  if (player.current_streak < 3) {
    recommendations.push({
      type: 'streak',
      title: 'Build Your Streak',
      description: 'Complete quests daily to build up your completion streak',
      action: 'Set small, achievable daily quests'
    });
  }

  // Category diversity recommendation
  if (player.preferences.categories.length < 2) {
    recommendations.push({
      type: 'variety',
      title: 'Explore New Categories',
      description: 'Try quests in different categories to earn more diverse XP',
      action: 'Browse the categories endpoint for new quest types'
    });
  }

  // Level up recommendation
  if (player.xp_to_next_level < 100) {
    recommendations.push({
      type: 'level_up',
      title: 'Level Up Soon!',
      description: `You're only ${player.xp_to_next_level} XP away from level ${player.level + 1}`,
      action: 'Complete a high-priority quest to level up quickly'
    });
  }

  return recommendations.slice(0, 3); // Return max 3 recommendations
}

module.exports = router;