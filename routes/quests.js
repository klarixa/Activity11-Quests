const express = require('express');
const router = express.Router();

// Sample Quest data - in real app, this would come from a database
const questsData = [
  {
    id: 1,
    title: 'Complete Morning Workout',
    description: 'Do 30 minutes of exercise to start the day strong',
    status: 'pending',
    priority: 'medium',
    category: 'health',
    xp_reward: 50,
    deadline: '2024-01-15T09:00:00Z',
    estimated_time: 30,
    created_at: '2024-01-14T06:00:00Z',
    tags: ['exercise', 'health', 'morning'],
    difficulty: 'easy'
  },
  {
    id: 2,
    title: 'Finish Project Report',
    description: 'Write the final report for the quarterly project review',
    status: 'in_progress',
    priority: 'high',
    category: 'work',
    xp_reward: 100,
    deadline: '2024-01-16T17:00:00Z',
    estimated_time: 120,
    created_at: '2024-01-10T09:00:00Z',
    tags: ['work', 'report', 'deadline'],
    difficulty: 'medium'
  },
  {
    id: 3,
    title: 'Learn New Recipe',
    description: 'Try cooking a new dish from the cookbook',
    status: 'completed',
    priority: 'low',
    category: 'personal',
    xp_reward: 25,
    deadline: '2024-01-14T19:00:00Z',
    estimated_time: 60,
    created_at: '2024-01-13T10:00:00Z',
    completed_at: '2024-01-14T18:30:00Z',
    tags: ['cooking', 'learning', 'personal'],
    difficulty: 'easy'
  },
  {
    id: 4,
    title: 'Call Mom',
    description: 'Weekly check-in call with family',
    status: 'pending',
    priority: 'medium',
    category: 'personal',
    xp_reward: 30,
    deadline: '2024-01-17T20:00:00Z',
    estimated_time: 20,
    created_at: '2024-01-14T08:00:00Z',
    tags: ['family', 'communication'],
    difficulty: 'easy'
  },
  {
    id: 5,
    title: 'Debug Login Issue',
    description: 'Fix the authentication bug reported by users',
    status: 'pending',
    priority: 'critical',
    category: 'work',
    xp_reward: 150,
    deadline: '2024-01-15T12:00:00Z',
    estimated_time: 90,
    created_at: '2024-01-14T14:00:00Z',
    tags: ['bug', 'authentication', 'urgent'],
    difficulty: 'hard'
  },
  {
    id: 6,
    title: 'Read Chapter 3',
    description: 'Complete reading assignment for JavaScript course',
    status: 'pending',
    priority: 'medium',
    category: 'learning',
    xp_reward: 40,
    deadline: '2024-01-18T23:59:00Z',
    estimated_time: 45,
    created_at: '2024-01-15T09:00:00Z',
    tags: ['reading', 'javascript', 'course'],
    difficulty: 'easy'
  }
];

// Helper function to calculate quest metadata
function enrichQuestData(quest) {
  const enriched = { ...quest };

  // Calculate days until deadline
  if (quest.deadline) {
    const daysLeft = Math.ceil((new Date(quest.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    enriched.days_until_deadline = daysLeft;
    enriched.is_urgent = daysLeft <= 1 && quest.status !== 'completed';
    enriched.is_overdue = daysLeft < 0 && quest.status !== 'completed';
  }

  // Calculate completion percentage for in_progress quests
  if (quest.status === 'in_progress') {
    enriched.completion_percentage = Math.floor(Math.random() * 80) + 10; // Mock 10-90%
  }

  // Add difficulty indicators
  const difficultyMap = {
    'easy': { icon: '🟢', multiplier: 1.0 },
    'medium': { icon: '🟡', multiplier: 1.2 },
    'hard': { icon: '🔴', multiplier: 1.5 }
  };
  enriched.difficulty_info = difficultyMap[quest.difficulty] || difficultyMap['easy'];

  return enriched;
}

// GET /api/quests/:id
router.get('/:id', (req, res) => {
  try {
    const questId = parseInt(req.params.id);

    if (isNaN(questId)) {
      return res.status(400).json({
        error: 'Invalid quest ID',
        message: 'Quest ID must be a number',
        provided: req.params.id
      });
    }

    // Check if quest exists
    const quest = questsData.find(q => q.id === questId);
    if (!quest) {
      return res.status(404).json({
        error: 'Quest not found',
        message: `Quest with ID ${req.params.id} not found`,
        available_quests: questsData.map(q => ({ id: q.id, title: q.title })),
        suggestion: 'Check the quest ID or browse all quests at /api/quests'
      });
    }

    // Enrich quest data with calculated fields
    const questData = enrichQuestData(quest);

    // Add API metadata
    questData.api_info = {
      endpoint: req.originalUrl,
      response_time: new Date().toISOString(),
      data_source: 'Quest Tracker API v1.0',
      authenticated_with: req.apiKey
    };

    res.json(questData);

  } catch (error) {
    console.error('Quest endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch quest data'
    });
  }
});

// GET /api/quests (list all quests with filtering)
router.get('/', (req, res) => {
  try {
    const { status, priority, category, tags, difficulty, sort_by, order, limit } = req.query;

    let filteredQuests = [...questsData];

    // Apply filters
    if (status) {
      filteredQuests = filteredQuests.filter(quest =>
        quest.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (priority) {
      filteredQuests = filteredQuests.filter(quest =>
        quest.priority.toLowerCase() === priority.toLowerCase()
      );
    }

    if (category) {
      filteredQuests = filteredQuests.filter(quest =>
        quest.category.toLowerCase() === category.toLowerCase()
      );
    }

    // TODO 4: Advanced filtering (IMPLEMENTED)
    // Filter by tags (comma-separated, matches if quest has at least one matching tag)
    if (tags) {
      const searchTags = tags.toLowerCase().split(',').map(t => t.trim());
      filteredQuests = filteredQuests.filter(quest =>
        quest.tags && quest.tags.some(tag => searchTags.includes(tag.toLowerCase()))
      );
    }

    // Filter by difficulty level (easy/medium/hard)
    if (difficulty) {
      const validDifficulties = ['easy', 'medium', 'hard'];
      if (!validDifficulties.includes(difficulty.toLowerCase())) {
        return res.status(400).json({
          error: 'Invalid difficulty value',
          message: `Difficulty must be one of: ${validDifficulties.join(', ')}`,
          provided: difficulty
        });
      }
      filteredQuests = filteredQuests.filter(quest =>
        quest.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }

    // Date range filtering: created_after
    if (req.query.created_after) {
      const createdAfter = new Date(req.query.created_after);
      if (isNaN(createdAfter.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format',
          message: 'created_after must be a valid ISO date string',
          provided: req.query.created_after
        });
      }
      filteredQuests = filteredQuests.filter(quest =>
        new Date(quest.created_at) >= createdAfter
      );
    }

    // Date range filtering: deadline_before
    if (req.query.deadline_before) {
      const deadlineBefore = new Date(req.query.deadline_before);
      if (isNaN(deadlineBefore.getTime())) {
        return res.status(400).json({
          error: 'Invalid date format',
          message: 'deadline_before must be a valid ISO date string',
          provided: req.query.deadline_before
        });
      }
      filteredQuests = filteredQuests.filter(quest =>
        quest.deadline && new Date(quest.deadline) <= deadlineBefore
      );
    }

    // Apply sorting
    const sortBy = sort_by || 'created_at';
    const sortOrder = order === 'asc' ? 1 : -1;

    filteredQuests.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'deadline':
          comparison = new Date(a.deadline || '2099-12-31') - new Date(b.deadline || '2099-12-31');
          break;
        case 'xp_reward':
          comparison = a.xp_reward - b.xp_reward;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at) - new Date(b.created_at);
      }

      return comparison * sortOrder;
    });

    // Apply limit
    const questLimit = limit ? Math.min(parseInt(limit), 50) : filteredQuests.length;
    const limitedQuests = filteredQuests.slice(0, questLimit);

    // Calculate summary stats
    const totalXP = filteredQuests.reduce((sum, quest) => sum + quest.xp_reward, 0);
    const completedQuests = filteredQuests.filter(q => q.status === 'completed').length;
    const urgentQuests = filteredQuests.filter(q => {
      const daysLeft = Math.ceil((new Date(q.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 1 && q.status !== 'completed';
    }).length;

    // Enrich quest data
    const enrichedQuests = limitedQuests.map(quest => {
      const enriched = enrichQuestData(quest);
      return {
        id: enriched.id,
        title: enriched.title,
        status: enriched.status,
        priority: enriched.priority,
        category: enriched.category,
        xp_reward: enriched.xp_reward,
        deadline: enriched.deadline,
        days_until_deadline: enriched.days_until_deadline,
        is_urgent: enriched.is_urgent,
        is_overdue: enriched.is_overdue,
        difficulty: enriched.difficulty,
        difficulty_info: enriched.difficulty_info,
        tags: enriched.tags,
        endpoint: `/api/quests/${enriched.id}`
      };
    });

    res.json({
      total_quests: filteredQuests.length,
      returned_quests: enrichedQuests.length,
      total_xp_available: totalXP,
      completed_count: completedQuests,
      urgent_count: urgentQuests,
      filters_applied: {
        status: status || null,
        priority: priority || null,
        category: category || null,
        tags: tags || null,
        difficulty: difficulty || null,
        created_after: req.query.created_after || null,
        deadline_before: req.query.deadline_before || null
      },
      sorting: {
        sort_by: sortBy,
        order: order || 'desc'
      },
      quests: enrichedQuests,
      pagination: {
        limit: questLimit,
        has_more: filteredQuests.length > questLimit
      },
      usage: 'GET /api/quests/:id for detailed quest data'
    });

  } catch (error) {
    console.error('Quests list endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch quests list'
    });
  }
});

// POST /api/quests/:id/complete
// TODO 1: Quest completion endpoint (IMPLEMENTED)
router.post('/:id/complete', (req, res) => {
  try {
    // 1. Parse and validate quest ID
    const questId = parseInt(req.params.id);

    if (isNaN(questId)) {
      return res.status(400).json({
        error: 'Invalid quest ID',
        message: 'Quest ID must be a number',
        provided: req.params.id
      });
    }

    // 2. Find quest by index so we can update it in place
    const questIndex = questsData.findIndex(q => q.id === questId);

    // 3. Handle not found
    if (questIndex === -1) {
      return res.status(404).json({
        error: 'Quest not found',
        message: `Quest with ID ${questId} not found`,
        available_quests: questsData.map(q => ({ id: q.id, title: q.title })),
        suggestion: 'Check the quest ID or browse all quests at /api/quests'
      });
    }

    const quest = questsData[questIndex];

    // 4. Check if already completed
    if (quest.status === 'completed') {
      return res.status(400).json({
        error: 'Quest already completed',
        message: `Quest "${quest.title}" was already completed on ${quest.completed_at}`,
        quest_id: quest.id
      });
    }

    // 5. Update quest status and timestamp
    quest.status = 'completed';
    quest.completed_at = new Date().toISOString();

    // 6. Calculate XP rewards
    const baseXP = quest.xp_reward;
    let bonusXP = 0;

    // 10% bonus if completed before deadline
    if (quest.deadline) {
      const now = new Date();
      const deadline = new Date(quest.deadline);
      if (now <= deadline) {
        bonusXP = Math.round(baseXP * 0.10);
      }
    }

    // Difficulty multiplier bonus
    const difficultyMap = {
      'easy': 1.0,
      'medium': 1.2,
      'hard': 1.5
    };
    const difficultyMultiplier = difficultyMap[quest.difficulty] || 1.0;
    const totalXP = Math.round((baseXP + bonusXP) * difficultyMultiplier);

    // 7. Return success with enriched quest data and rewards
    const enrichedQuest = enrichQuestData(quest);

    res.json({
      message: 'Quest completed successfully! 🎉',
      quest: enrichedQuest,
      rewards: {
        base_xp: baseXP,
        bonus_xp: bonusXP,
        difficulty_multiplier: difficultyMultiplier,
        total_xp_earned: totalXP,
        early_completion: bonusXP > 0
      },
      api_info: {
        endpoint: req.originalUrl,
        response_time: new Date().toISOString(),
        authenticated_with: req.apiKey
      }
    });

  } catch (error) {
    console.error('Quest completion endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to complete quest'
    });
  }
});

// POST /api/quests
// TODO 2: Quest creation endpoint (IMPLEMENTED)
router.post('/', (req, res) => {
  try {
    // 1. Extract fields from request body
    const { title, description, priority, category, deadline, tags, estimated_time, difficulty } = req.body;

    // 2. Validate required fields
    const errors = [];

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('title is required and must be a non-empty string');
    }

    if (!category || !['work', 'health', 'personal', 'learning', 'creative'].includes(category.toLowerCase())) {
      errors.push('category is required and must be one of: work, health, personal, learning, creative');
    }

    if (!priority || !['low', 'medium', 'high', 'critical'].includes(priority.toLowerCase())) {
      errors.push('priority is required and must be one of: low, medium, high, critical');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please fix the following errors',
        validation_errors: errors,
        required_fields: ['title', 'category', 'priority'],
        optional_fields: ['description', 'deadline', 'tags', 'estimated_time', 'difficulty']
      });
    }

    // Validate optional fields
    if (deadline && isNaN(new Date(deadline).getTime())) {
      return res.status(400).json({
        error: 'Invalid deadline',
        message: 'deadline must be a valid ISO date string (e.g., 2024-01-20T17:00:00Z)',
        provided: deadline
      });
    }

    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid difficulty',
        message: 'difficulty must be one of: easy, medium, hard',
        provided: difficulty
      });
    }

    // 3. Generate unique ID
    const newId = questsData.length > 0 ? Math.max(...questsData.map(q => q.id)) + 1 : 1;

    // 4. Calculate XP reward based on priority and estimated time
    const priorityXP = { low: 25, medium: 50, high: 100, critical: 150 };
    const timeEstimate = parseInt(estimated_time) || 30;
    const xpReward = priorityXP[priority.toLowerCase()] || 50;

    // Create new quest object with defaults
    const newQuest = {
      id: newId,
      title: title.trim(),
      description: description || '',
      status: 'pending',
      priority: priority.toLowerCase(),
      category: category.toLowerCase(),
      xp_reward: xpReward,
      deadline: deadline || null,
      estimated_time: timeEstimate,
      created_at: new Date().toISOString(),
      tags: Array.isArray(tags) ? tags : (tags ? [tags] : []),
      difficulty: (difficulty || 'medium').toLowerCase()
    };

    // 5. Add to questsData array
    questsData.push(newQuest);

    // 6. Return 201 with enriched quest data
    const enrichedQuest = enrichQuestData(newQuest);

    res.status(201).json({
      message: 'Quest created successfully! ⚔️',
      quest: enrichedQuest,
      api_info: {
        endpoint: req.originalUrl,
        response_time: new Date().toISOString(),
        authenticated_with: req.apiKey,
        total_quests: questsData.length
      }
    });

  } catch (error) {
    console.error('Quest creation endpoint error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create quest'
    });
  }
});

module.exports = router;