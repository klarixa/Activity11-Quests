const express = require('express');
const router = express.Router();

// Quest categories data with rich metadata
const categories = [
  {
    id: 'work',
    name: 'Work & Career',
    description: 'Professional development and work-related tasks',
    color: '#3B82F6',
    icon: '💼',
    emoji: '💼',
    default_xp_multiplier: 1.2,
    common_priorities: ['high', 'critical'],
    suggested_time_blocks: [30, 60, 120],
    popular_tags: ['meetings', 'projects', 'deadlines', 'learning'],
    difficulty_distribution: {
      easy: 20,
      medium: 50,
      hard: 30
    },
    tips: [
      'Break large projects into smaller, manageable tasks',
      'Set realistic deadlines to avoid burnout',
      'Use high-priority for urgent work items'
    ]
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    description: 'Physical and mental wellness activities',
    color: '#10B981',
    icon: '🏃',
    emoji: '🏃‍♂️',
    default_xp_multiplier: 1.1,
    common_priorities: ['medium', 'high'],
    suggested_time_blocks: [20, 30, 45, 60],
    popular_tags: ['exercise', 'meditation', 'nutrition', 'sleep'],
    difficulty_distribution: {
      easy: 40,
      medium: 40,
      hard: 20
    },
    tips: [
      'Start with small, achievable goals',
      'Consistency is more important than intensity',
      'Track your progress to stay motivated'
    ]
  },
  {
    id: 'personal',
    name: 'Personal Life',
    description: 'Family, friends, hobbies, and personal growth',
    color: '#8B5CF6',
    icon: '🌟',
    emoji: '🌟',
    default_xp_multiplier: 1.0,
    common_priorities: ['low', 'medium'],
    suggested_time_blocks: [15, 30, 60],
    popular_tags: ['family', 'friends', 'hobbies', 'self-care'],
    difficulty_distribution: {
      easy: 60,
      medium: 30,
      hard: 10
    },
    tips: [
      'Schedule personal time just like work meetings',
      'Small gestures often have the biggest impact',
      'Remember to celebrate personal achievements'
    ]
  },
  {
    id: 'learning',
    name: 'Learning & Skills',
    description: 'Education, skill development, and knowledge acquisition',
    color: '#F59E0B',
    icon: '📚',
    emoji: '📚',
    default_xp_multiplier: 1.3,
    common_priorities: ['medium', 'high'],
    suggested_time_blocks: [45, 60, 90],
    popular_tags: ['courses', 'reading', 'practice', 'research'],
    difficulty_distribution: {
      easy: 30,
      medium: 50,
      hard: 20
    },
    tips: [
      'Set specific learning goals for each session',
      'Apply what you learn through practice projects',
      'Join communities related to your learning topics'
    ]
  },
  {
    id: 'creative',
    name: 'Creative Projects',
    description: 'Art, writing, music, and other creative endeavors',
    color: '#EF4444',
    icon: '🎨',
    emoji: '🎨',
    default_xp_multiplier: 1.1,
    common_priorities: ['low', 'medium'],
    suggested_time_blocks: [30, 60, 120],
    popular_tags: ['art', 'writing', 'music', 'design'],
    difficulty_distribution: {
      easy: 35,
      medium: 45,
      hard: 20
    },
    tips: [
      'Embrace the creative process, not just the outcome',
      'Set aside regular time for creative exploration',
      'Share your work to get feedback and motivation'
    ]
  },
  {
    id: 'finance',
    name: 'Finance & Money',
    description: 'Budgeting, investing, and financial planning',
    color: '#059669',
    icon: '💰',
    emoji: '💰',
    default_xp_multiplier: 1.2,
    common_priorities: ['medium', 'high'],
    suggested_time_blocks: [30, 45, 60],
    popular_tags: ['budgeting', 'investing', 'savings', 'planning'],
    difficulty_distribution: {
      easy: 25,
      medium: 55,
      hard: 20
    },
    tips: [
      'Start with small, consistent financial habits',
      'Automate savings and investments when possible',
      'Review and adjust your financial goals regularly'
    ]
  }
];

// Mock quest statistics per category (in real app, this would be calculated from actual quest data)
const categoryStats = {
  'work': { total_quests: 12, completed: 8, avg_completion_time: 65, active_users: 45 },
  'health': { total_quests: 18, completed: 14, avg_completion_time: 35, active_users: 38 },
  'personal': { total_quests: 15, completed: 12, avg_completion_time: 40, active_users: 42 },
  'learning': { total_quests: 20, completed: 15, avg_completion_time: 75, active_users: 35 },
  'creative': { total_quests: 10, completed: 7, avg_completion_time: 85, active_users: 25 },
  'finance': { total_quests: 8, completed: 5, avg_completion_time: 50, active_users: 20 }
};

// GET /api/categories
router.get('/', (req, res) => {
  try {
    const includeStats = req.query.include_stats === 'true';
    const search = req.query.search?.toLowerCase();
    const sortBy = req.query.sort_by || 'name'; // name, popularity, xp_multiplier
    const order = req.query.order || 'asc';

    let filteredCategories = [...categories];

    // Filter by search term
    if (search) {
      filteredCategories = filteredCategories.filter(category =>
        category.name.toLowerCase().includes(search) ||
        category.description.toLowerCase().includes(search) ||
        category.popular_tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Sort categories
    filteredCategories.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'popularity':
          const aPopularity = categoryStats[a.id]?.active_users || 0;
          const bPopularity = categoryStats[b.id]?.active_users || 0;
          comparison = aPopularity - bPopularity;
          break;
        case 'xp_multiplier':
          comparison = a.default_xp_multiplier - b.default_xp_multiplier;
          break;
        case 'name':
        default:
          comparison = a.name.localeCompare(b.name);
      }
      return order === 'desc' ? -comparison : comparison;
    });

    // Add quest statistics if requested
    if (includeStats) {
      filteredCategories = filteredCategories.map(category => {
        const stats = categoryStats[category.id] || {
          total_quests: 0,
          completed: 0,
          avg_completion_time: 0,
          active_users: 0
        };

        return {
          ...category,
          stats: {
            total_quests_available: stats.total_quests,
            total_completed: stats.completed,
            completion_rate: stats.total_quests > 0 ? Math.round((stats.completed / stats.total_quests) * 100) : 0,
            avg_completion_time_minutes: stats.avg_completion_time,
            active_users: stats.active_users,
            difficulty_level: category.default_xp_multiplier > 1.2 ? 'challenging' : 'moderate',
            trending: stats.active_users > 30 ? 'high' : stats.active_users > 20 ? 'medium' : 'low'
          }
        };
      });
    }

    // Calculate overall category insights
    const insights = {
      most_popular: filteredCategories.reduce((max, cat) => {
        const maxUsers = categoryStats[max.id]?.active_users || 0;
        const catUsers = categoryStats[cat.id]?.active_users || 0;
        return catUsers > maxUsers ? cat : max;
      }, filteredCategories[0]),
      highest_xp: filteredCategories.reduce((max, cat) =>
        cat.default_xp_multiplier > max.default_xp_multiplier ? cat : max
      ),
      best_for_beginners: filteredCategories.filter(cat => cat.difficulty_distribution.easy >= 50),
      quick_wins: filteredCategories.filter(cat => cat.suggested_time_blocks[0] <= 20)
    };

    res.json({
      total_categories: filteredCategories.length,
      categories: filteredCategories,
      filters_applied: {
        search: search || null,
        include_stats: includeStats,
        sort_by: sortBy,
        order: order
      },
      insights: includeStats ? insights : null,
      usage_tips: [
        'Use include_stats=true to see quest statistics per category',
        'Search by category name, description, or tags',
        'Sort by popularity to see trending categories'
      ],
      api_info: {
        endpoint: req.originalUrl,
        response_time: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Categories endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch categories'
    });
  }
});

// GET /api/categories/:id
router.get('/:id', (req, res) => {
  try {
    const categoryId = req.params.id.toLowerCase();
    const includeQuests = req.query.include_quests === 'true';
    const includeTips = req.query.include_tips !== 'false'; // Default true

    const category = categories.find(c => c.id === categoryId);

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        message: `Category with ID '${req.params.id}' not found`,
        available_categories: categories.map(c => ({ id: c.id, name: c.name })),
        suggestion: 'Try: work, health, personal, learning, creative, finance'
      });
    }

    // Get category statistics
    const stats = categoryStats[categoryId] || {
      total_quests: 0,
      completed: 0,
      avg_completion_time: 0,
      active_users: 0
    };

    // Enrich category data
    const enrichedCategory = {
      ...category,
      stats: {
        total_quests_available: stats.total_quests,
        total_completed: stats.completed,
        completion_rate: stats.total_quests > 0 ? Math.round((stats.completed / stats.total_quests) * 100) : 0,
        avg_completion_time_minutes: stats.avg_completion_time,
        active_users: stats.active_users,
        difficulty_breakdown: category.difficulty_distribution,
        trending_score: calculateTrendingScore(stats),
        recommended_for: getRecommendedFor(category)
      },
      related_endpoints: {
        quests: `/api/quests?category=${category.id}`,
        pending_quests: `/api/quests?category=${category.id}&status=pending`,
        completed_quests: `/api/quests?category=${category.id}&status=completed`,
        high_priority: `/api/quests?category=${category.id}&priority=high`
      }
    };

    // Include sample quest IDs if requested
    if (includeQuests) {
      enrichedCategory.sample_quests = generateSampleQuests(category);
    }

    // Include actionable tips unless explicitly disabled
    if (includeTips) {
      enrichedCategory.actionable_tips = category.tips;
      enrichedCategory.getting_started = getGettingStartedGuide(category);
    }

    enrichedCategory.api_info = {
      endpoint: req.originalUrl,
      include_quests: includeQuests,
      include_tips: includeTips,
      response_time: new Date().toISOString()
    };

    res.json(enrichedCategory);

  } catch (error) {
    console.error('Category endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch category data'
    });
  }
});

// GET /api/categories/:id/suggestions (get quest suggestions for a category)
router.get('/:id/suggestions', (req, res) => {
  try {
    const categoryId = req.params.id.toLowerCase();
    const difficulty = req.query.difficulty || 'any';
    const timeAvailable = parseInt(req.query.time_available) || null;

    const category = categories.find(c => c.id === categoryId);

    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
        message: `Category with ID '${req.params.id}' not found`
      });
    }

    const suggestions = generateQuestSuggestions(category, difficulty, timeAvailable);

    res.json({
      category: {
        id: category.id,
        name: category.name,
        icon: category.icon
      },
      filters: {
        difficulty: difficulty,
        time_available_minutes: timeAvailable
      },
      suggestions: suggestions,
      total_suggestions: suggestions.length,
      tips: [
        'Start with easier quests to build momentum',
        'Match quest difficulty to your current energy level',
        'Consider grouping similar quests together'
      ],
      api_info: {
        endpoint: req.originalUrl,
        response_time: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Category suggestions endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate quest suggestions'
    });
  }
});

// Helper functions
function calculateTrendingScore(stats) {
  // Simple trending algorithm based on active users and completion rate
  const userScore = Math.min(stats.active_users / 50, 1) * 50; // Max 50 points
  const completionScore = (stats.total_quests > 0 ? (stats.completed / stats.total_quests) : 0) * 30; // Max 30 points
  const activityScore = Math.min(stats.total_quests / 20, 1) * 20; // Max 20 points

  return Math.round(userScore + completionScore + activityScore);
}

function getRecommendedFor(category) {
  const recommendations = [];

  if (category.difficulty_distribution.easy >= 50) {
    recommendations.push('Beginners');
  }
  if (category.default_xp_multiplier > 1.2) {
    recommendations.push('XP Hunters');
  }
  if (category.suggested_time_blocks[0] <= 20) {
    recommendations.push('Busy Schedules');
  }
  if (category.id === 'health' || category.id === 'personal') {
    recommendations.push('Work-Life Balance');
  }
  if (category.id === 'learning' || category.id === 'creative') {
    recommendations.push('Skill Development');
  }

  return recommendations.length > 0 ? recommendations : ['Everyone'];
}

function generateSampleQuests(category) {
  const questTemplates = {
    work: [
      { title: 'Review project documentation', time: 30, difficulty: 'easy' },
      { title: 'Attend team standup meeting', time: 15, difficulty: 'easy' },
      { title: 'Complete code review', time: 45, difficulty: 'medium' }
    ],
    health: [
      { title: '20-minute morning walk', time: 20, difficulty: 'easy' },
      { title: 'Prepare healthy lunch', time: 30, difficulty: 'easy' },
      { title: '45-minute workout session', time: 45, difficulty: 'medium' }
    ],
    personal: [
      { title: 'Call a family member', time: 15, difficulty: 'easy' },
      { title: 'Organize desk workspace', time: 30, difficulty: 'easy' },
      { title: 'Plan weekend activities', time: 20, difficulty: 'easy' }
    ],
    learning: [
      { title: 'Read one chapter of programming book', time: 60, difficulty: 'medium' },
      { title: 'Complete online course module', time: 45, difficulty: 'medium' },
      { title: 'Practice coding exercises', time: 30, difficulty: 'easy' }
    ],
    creative: [
      { title: 'Write in journal for 15 minutes', time: 15, difficulty: 'easy' },
      { title: 'Sketch or draw for 30 minutes', time: 30, difficulty: 'easy' },
      { title: 'Work on creative project', time: 60, difficulty: 'medium' }
    ],
    finance: [
      { title: 'Review monthly budget', time: 30, difficulty: 'easy' },
      { title: 'Research investment options', time: 45, difficulty: 'medium' },
      { title: 'Update expense tracking', time: 20, difficulty: 'easy' }
    ]
  };

  return (questTemplates[category.id] || []).map((template, index) => ({
    id: `sample_${category.id}_${index + 1}`,
    title: template.title,
    estimated_time: template.time,
    difficulty: template.difficulty,
    xp_reward: Math.round(template.time * category.default_xp_multiplier),
    create_endpoint: '/api/quests',
    note: 'This is a sample quest - create similar ones via POST /api/quests'
  }));
}

function getGettingStartedGuide(category) {
  const guides = {
    work: {
      step1: 'Start by listing your current work priorities',
      step2: 'Break large projects into smaller, manageable tasks',
      step3: 'Set realistic deadlines and track your progress'
    },
    health: {
      step1: 'Choose one small health habit to focus on',
      step2: 'Schedule it at a consistent time each day',
      step3: 'Track your progress and celebrate small wins'
    },
    personal: {
      step1: 'Identify what personal areas need attention',
      step2: 'Start with quick, easy wins to build momentum',
      step3: 'Schedule personal time like any other important appointment'
    },
    learning: {
      step1: 'Choose a specific skill or topic to focus on',
      step2: 'Set aside dedicated learning time each day',
      step3: 'Apply what you learn through practice or projects'
    },
    creative: {
      step1: 'Set aside regular time for creative exploration',
      step2: 'Start with small, low-pressure creative exercises',
      step3: 'Share your work to get feedback and stay motivated'
    },
    finance: {
      step1: 'Start by tracking your current spending for one week',
      step2: 'Set one specific financial goal to work towards',
      step3: 'Automate one financial habit (savings, bill payment, etc.)'
    }
  };

  return guides[category.id] || {
    step1: 'Identify what you want to achieve in this category',
    step2: 'Start with small, achievable goals',
    step3: 'Track your progress and adjust as needed'
  };
}

function generateQuestSuggestions(category, difficulty, timeAvailable) {
  const suggestions = [];
  const templates = [
    {
      title: `Review ${category.name.toLowerCase()} goals`,
      time: 20,
      difficulty: 'easy',
      description: `Take time to review and adjust your ${category.name.toLowerCase()} objectives`
    },
    {
      title: `Complete a ${category.name.toLowerCase()} task`,
      time: 30,
      difficulty: 'medium',
      description: `Work on an important task in the ${category.name.toLowerCase()} category`
    },
    {
      title: `Plan ${category.name.toLowerCase()} activities`,
      time: 15,
      difficulty: 'easy',
      description: `Plan upcoming activities and priorities for ${category.name.toLowerCase()}`
    }
  ];

  templates.forEach((template, index) => {
    // Filter by difficulty if specified
    if (difficulty !== 'any' && template.difficulty !== difficulty) {
      return;
    }

    // Filter by time if specified
    if (timeAvailable && template.time > timeAvailable) {
      return;
    }

    suggestions.push({
      id: `suggestion_${category.id}_${index + 1}`,
      title: template.title,
      description: template.description,
      estimated_time: template.time,
      difficulty: template.difficulty,
      xp_reward: Math.round(template.time * category.default_xp_multiplier),
      priority: template.difficulty === 'easy' ? 'low' : 'medium',
      tags: category.popular_tags.slice(0, 2)
    });
  });

  return suggestions;
}

module.exports = router;