import mongoose from 'mongoose';
import { 
  Lab, 
  Session, 
  FlagSubmission, 
  Badge, 
  UserExtension 
} from '../models/index.js';
import { UserBadge } from '../models/UserExtension.js';
import { logger } from '../utils/logger.js';
import flagService from '../services/flag.service.js';
import scoringService from '../services/scoringService.js';

/**
 * Submit flag for validation and scoring
 */
export const submitFlag = async (req, res) => {
  try {
    const { sessionId, flagType, flag } = req.body;
    const userId = req.user.id;
    
    // Validate inputs
    if (!sessionId || !flagType || !flag) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, flagType, flag'
      });
    }
    
    if (!['user', 'root'].includes(flagType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid flag type. Must be "user" or "root"'
      });
    }
    
    // Find and validate session
    const session = await Session.findOne({ 
      _id: sessionId, 
      userId,
      status: { $in: ['running', 'starting'] }
    }).populate('labId');
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Active session not found'
      });
    }
    
    // Check if flag already submitted correctly for this type
    if (session.flags[flagType].submitted && session.flags[flagType].isCorrect) {
      return res.status(400).json({
        success: false,
        error: `${flagType} flag already submitted correctly`
      });
    }
    
    // Validate flag
    const expectedFlag = session.flags[flagType].value;
    const isCorrect = flag.trim() === expectedFlag.trim();
    
    // Calculate points
    const pointsAwarded = isCorrect ? session.labId.flags[flagType].points : 0;
    
    // Create flag submission record
    const flagSubmission = new FlagSubmission({
      userId,
      sessionId,
      labId: session.labId._id,
      flagType,
      submittedFlag: flag,
      expectedFlag,
      isCorrect,
      pointsAwarded,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        attemptNumber: await FlagSubmission.countDocuments({ 
          sessionId, 
          flagType 
        }) + 1
      }
    });
    
    await flagSubmission.save();
    
    // Update session
    await session.submitFlag(flagType, isCorrect, pointsAwarded);
    
    // Update lab statistics
    await session.labId.incrementFlagSubmission(flagType);
    
    // Get or create user stats
    const userStats = await UserExtension.findOrCreate(userId);
    
    // Update user flag statistics
    await userStats.updateFlagStats(isCorrect);
    
    let newBadges = [];
    let levelUp = false;
    let previousLevel = null;
    
    if (isCorrect) {
      // Store previous level for comparison
      previousLevel = userStats.level;
      
      // Check if session is now completed
      const sessionCompleted = session.isCompleted;
      if (sessionCompleted) {
        // Update user stats after completed session
        await userStats.updateAfterSession(session, session.labId);
        
        // Update lab completion stats
        const sessionDuration = session.duration;
        await session.labId.incrementCompletion(sessionDuration);
        
        // Mark session as completed
        await session.complete();
      }
      
      // Check for new badges
      newBadges = await userStats.checkForNewBadges();
      
      // Check for level up
      const currentLevel = userStats.level;
      levelUp = currentLevel.level > previousLevel?.level;
    }
    
    // Prepare response data
    const responseData = {
      isCorrect,
      pointsAwarded,
      message: isCorrect 
        ? `Correct! You earned ${pointsAwarded} points.`
        : 'Incorrect flag. Keep trying!',
      sessionProgress: {
        userFlag: {
          submitted: session.flags.user.submitted,
          correct: session.flags.user.isCorrect
        },
        rootFlag: {
          submitted: session.flags.root.submitted,
          correct: session.flags.root.isCorrect
        },
        totalPoints: session.stats.totalPoints,
        completionPercentage: session.stats.completionPercentage,
        isCompleted: session.isCompleted
      },
      newBadges: newBadges.map(nb => ({
        badge: nb.badgeId,
        earnedAt: nb.earnedAt,
        context: nb.context
      })),
      levelUp: levelUp ? {
        previousLevel: previousLevel,
        currentLevel: userStats.level
      } : false
    };
    
    res.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    logger.error('Flag submission error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit flag'
    });
  }
};

/**
 * Get user's complete profile and statistics
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's lab statistics
    const userStats = await UserExtension.findOne({ userId })
      .populate('activeSession.sessionId')
      .populate('activeSession.labId');
    
    if (!userStats) {
      // Create initial stats for new users
      const newStats = await UserExtension.findOrCreate(userId);
      return res.json({
        success: true,
        data: {
          user: req.user,
          labStats: newStats.labStats,
          currentLevel: newStats.level,
          leaderboardPosition: { rank: 0, totalUsers: 1 },
          recentActivity: [],
          badges: { earned: [], total: 0 }
        }
      });
    }
    
    // Get user's badges
    const badges = await userStats.getBadges();
    
    // Get leaderboard position
    const leaderboardPosition = await getUserRanking(userId, userStats.labStats.totalPoints);
    
    // Get recent activity
    const recentActivity = await getRecentActivity(userId);
    
    res.json({
      success: true,
      data: {
        user: req.user,
        labStats: userStats.labStats,
        currentLevel: userStats.level,
        leaderboardPosition,
        recentActivity,
        badges: {
          earned: badges,
          total: badges.length
        },
        activity: userStats.activity,
        preferences: userStats.preferences,
        activeSession: userStats.activeSession
      }
    });
    
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};

/**
 * Update user profile preferences
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;
    
    if (!preferences) {
      return res.status(400).json({
        success: false,
        error: 'Preferences data required'
      });
    }
    
    // Get or create user stats
    const userStats = await UserExtension.findOrCreate(userId);
    
    // Update preferences
    if (preferences.difficulty) {
      userStats.preferences.difficulty = preferences.difficulty;
    }
    
    if (preferences.favoriteCategory) {
      userStats.preferences.favoriteCategory = preferences.favoriteCategory;
    }
    
    if (preferences.notifications) {
      userStats.preferences.notifications = {
        ...userStats.preferences.notifications,
        ...preferences.notifications
      };
    }
    
    await userStats.save();
    
    res.json({
      success: true,
      data: {
        message: 'Profile updated successfully',
        preferences: userStats.preferences
      }
    });
    
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

/**
 * Get user's lab progress and statistics
 */
export const getUserProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, timeframe = 'all' } = req.query;
    
    const userStats = await UserExtension.findOne({ userId });
    
    if (!userStats) {
      return res.json({
        success: true,
        data: {
          overview: getEmptyOverview(),
          categoryProgress: [],
          recentLabs: [],
          achievements: {}
        }
      });
    }
    
    // Build time filter
    let dateFilter = {};
    const now = new Date();
    
    if (timeframe === 'week') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
    } else if (timeframe === 'month') {
      dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
    }
    
    // Get recent sessions
    const recentSessions = await Session.find({
      userId,
      status: 'stopped',
      ...dateFilter
    })
    .populate('labId', 'name difficulty category')
    .sort({ createdAt: -1 })
    .limit(10);
    
    // Prepare category progress
    const categoryProgress = Object.keys(userStats.labStats.categoriesCompleted).map(category => ({
      category,
      completed: userStats.labStats.categoriesCompleted[category],
      totalAvailable: 0 // Will be calculated
    }));
    
    // Get total labs per category
    const categoryTotals = await Lab.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', total: { $sum: 1 } } }
    ]);
    
    categoryTotals.forEach(ct => {
      const catProgress = categoryProgress.find(cp => cp.category === ct._id);
      if (catProgress) {
        catProgress.totalAvailable = ct.total;
        catProgress.progressPercentage = catProgress.totalAvailable > 0 
          ? ((catProgress.completed / catProgress.totalAvailable) * 100).toFixed(1)
          : 0;
      }
    });
    
    res.json({
      success: true,
      data: {
        overview: {
          totalPoints: userStats.labStats.totalPoints,
          totalLabs: userStats.labStats.labsCompleted,
          completionRate: userStats.completionRate,
          accuracy: userStats.accuracy,
          currentStreak: userStats.labStats.currentStreak,
          longestStreak: userStats.labStats.longestStreak,
          fastestCompletion: userStats.labStats.fastestCompletion === Infinity 
            ? null : userStats.labStats.fastestCompletion
        },
        categoryProgress: categoryProgress.filter(cp => cp.totalAvailable > 0),
        recentLabs: recentSessions.map(session => ({
          sessionId: session._id,
          lab: {
            id: session.labId._id,
            name: session.labId.name,
            difficulty: session.labId.difficulty,
            category: session.labId.category
          },
          completedAt: session.stoppedAt,
          points: session.stats.totalPoints,
          duration: session.stats.durationMinutes,
          flagsFound: session.stats.flagsFound
        })),
        achievements: {
          perfectRuns: userStats.labStats.perfectRuns,
          categoriesExplored: userStats.labStats.categoriesExplored,
          totalSessionTime: userStats.activity.totalSessionTime,
          averageSessionTime: userStats.activity.averageSessionTime
        }
      }
    });
    
  } catch (error) {
    logger.error('Get user progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user progress'
    });
  }
};

/**
 * Get user's badges and badge progress
 */
export const getUserBadgeProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user stats for badge eligibility checking
    const userStats = await UserExtension.findOne({ userId });
    
    // Get all active badges
    const allBadges = await Badge.findActive();
    
    // Get user's earned badges
    const earnedBadges = userStats ? await userStats.getBadges() : [];
    const earnedBadgeIds = earnedBadges.map(eb => eb.badge._id.toString());
    
    // Calculate progress for unearned badges
    const badgeProgress = [];
    
    for (const badge of allBadges) {
      const isEarned = earnedBadgeIds.includes(badge._id.toString());
      
      let progress = null;
      if (!isEarned && userStats) {
        progress = await calculateBadgeProgress(badge, userStats);
      }
      
      badgeProgress.push({
        badge: {
          id: badge._id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          rarity: badge.rarity,
          points: badge.points,
          criteria: badge.criteria
        },
        earned: isEarned,
        earnedAt: isEarned 
          ? earnedBadges.find(eb => eb.badge._id.toString() === badge._id.toString())?.earnedAt
          : null,
        progress: progress
      });
    }
    
    // Calculate badge statistics
    const rarityStats = {
      common: { earned: 0, total: 0 },
      rare: { earned: 0, total: 0 },
      epic: { earned: 0, total: 0 },
      legendary: { earned: 0, total: 0 }
    };
    
    badgeProgress.forEach(bp => {
      rarityStats[bp.badge.rarity].total++;
      if (bp.earned) {
        rarityStats[bp.badge.rarity].earned++;
      }
    });
    
    res.json({
      success: true,
      data: {
        earnedBadges: earnedBadges,
        availableBadges: badgeProgress.filter(bp => !bp.earned),
        progress: badgeProgress,
        statistics: {
          totalEarned: earnedBadges.length,
          totalAvailable: allBadges.length,
          completionPercentage: allBadges.length > 0 
            ? ((earnedBadges.length / allBadges.length) * 100).toFixed(1)
            : 0,
          pointsFromBadges: earnedBadges.reduce((sum, eb) => sum + eb.badge.points, 0),
          rarityBreakdown: rarityStats
        }
      }
    });
    
  } catch (error) {
    logger.error('Get badge progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get badge progress'
    });
  }
};

/**
 * Get detailed progress for a specific lab
 */
export const getLabProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { labId } = req.params;
    
    // Validate lab exists
    const lab = await Lab.findById(labId);
    if (!lab) {
      return res.status(404).json({
        success: false,
        error: 'Lab not found'
      });
    }
    
    // Get user's sessions for this lab
    const sessions = await Session.find({ userId, labId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get flag submissions for this lab
    const flagSubmissions = await FlagSubmission.find({ userId, labId })
      .sort({ submittedAt: -1 });
    
    // Calculate completion status
    const completedSessions = sessions.filter(s => s.isCompleted);
    const bestScore = completedSessions.length > 0 
      ? Math.max(...completedSessions.map(s => s.stats.totalPoints))
      : 0;
    
    const isCompleted = completedSessions.length > 0;
    const bestTime = completedSessions.length > 0
      ? Math.min(...completedSessions.map(s => s.stats.durationMinutes))
      : null;
    
    res.json({
      success: true,
      data: {
        lab: {
          id: lab._id,
          name: lab.name,
          description: lab.description,
          difficulty: lab.difficulty,
          category: lab.category,
          totalPoints: lab.totalPoints,
          estimatedSolveTime: lab.estimatedSolveTime
        },
        userProgress: {
          isCompleted,
          bestScore,
          bestTime,
          totalAttempts: sessions.length,
          successfulAttempts: completedSessions.length,
          successRate: sessions.length > 0 
            ? ((completedSessions.length / sessions.length) * 100).toFixed(1)
            : 0
        },
        attempts: sessions.map(session => ({
          sessionId: session._id,
          startedAt: session.startedAt,
          completedAt: session.stoppedAt,
          status: session.status,
          points: session.stats.totalPoints,
          duration: session.stats.durationMinutes,
          flagsFound: session.stats.flagsFound,
          userFlagCorrect: session.flags.user.isCorrect,
          rootFlagCorrect: session.flags.root.isCorrect
        })),
        flagSubmissions: flagSubmissions.map(fs => ({
          flagType: fs.flagType,
          isCorrect: fs.isCorrect,
          submittedAt: fs.submittedAt,
          pointsAwarded: fs.pointsAwarded,
          attemptNumber: fs.metadata.attemptNumber
        })),
        completionStatus: {
          userFlagFound: flagSubmissions.some(fs => fs.flagType === 'user' && fs.isCorrect),
          rootFlagFound: flagSubmissions.some(fs => fs.flagType === 'root' && fs.isCorrect),
          totalPointsEarned: flagSubmissions
            .filter(fs => fs.isCorrect)
            .reduce((sum, fs) => sum + fs.pointsAwarded, 0)
        }
      }
    });
    
  } catch (error) {
    logger.error('Get lab progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get lab progress'
    });
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { difficulty, favoriteCategory, notifications } = req.body;
    
    const userStats = await UserExtension.findOrCreate(userId);
    
    // Update preferences
    if (difficulty) {
      userStats.preferences.difficulty = difficulty;
    }
    
    if (favoriteCategory) {
      userStats.preferences.favoriteCategory = favoriteCategory;
    }
    
    if (notifications) {
      userStats.preferences.notifications = {
        ...userStats.preferences.notifications,
        ...notifications
      };
    }
    
    await userStats.save();
    
    res.json({
      success: true,
      data: {
        message: 'Preferences updated successfully',
        preferences: userStats.preferences
      }
    });
    
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
};

/**
 * Get detailed user statistics
 */
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { detailed = false } = req.query;
    
    const userStats = await UserExtension.findOne({ userId });
    
    if (!userStats) {
      return res.json({
        success: true,
        data: {
          summary: getEmptyStats(),
          performance: {},
          trends: {},
          comparisons: {}
        }
      });
    }
    
    // Get flag submission statistics
    const flagStats = await FlagSubmission.getUserStats(userId);
    
    // Basic summary
    const summary = {
      totalPoints: userStats.labStats.totalPoints,
      totalLabs: userStats.labStats.labsCompleted,
      totalFlags: userStats.labStats.flagsFound,
      accuracy: userStats.accuracy,
      completionRate: userStats.completionRate,
      currentLevel: userStats.level,
      currentStreak: userStats.labStats.currentStreak,
      longestStreak: userStats.labStats.longestStreak
    };
    
    const responseData = { summary };
    
    if (detailed || detailed === 'true') {
      // Performance metrics
      responseData.performance = {
        averageSessionTime: userStats.activity.averageSessionTime,
        fastestCompletion: userStats.labStats.fastestCompletion === Infinity 
          ? null : userStats.labStats.fastestCompletion,
        perfectRuns: userStats.labStats.perfectRuns,
        flagSubmissionStats: flagStats
      };
      
      // Category breakdown
      responseData.trends = {
        categoriesCompleted: userStats.labStats.categoriesCompleted,
        favoriteLabTimes: userStats.activity.favoriteLabTimes,
        totalSessionTime: userStats.activity.totalSessionTime
      };
      
      // Comparisons with average
      const avgStats = await getSystemAverages();
      responseData.comparisons = {
        pointsVsAverage: userStats.labStats.totalPoints - avgStats.averagePoints,
        accuracyVsAverage: parseFloat(userStats.accuracy) - avgStats.averageAccuracy,
        completionRateVsAverage: parseFloat(userStats.completionRate) - avgStats.averageCompletionRate
      };
    }
    
    res.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    logger.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics'
    });
  }
};

/**
 * Get user's leaderboard position
 */
export const getUserLeaderboardPosition = async (req, res) => {
  try {
    const userId = req.user.id;
    const { category } = req.query;
    
    const userStats = await UserExtension.findOne({ userId });
    
    if (!userStats) {
      return res.json({
        success: true,
        data: {
          globalRank: 0,
          totalUsers: 1,
          percentile: 0,
          pointsToNext: 0,
          nearbyUsers: []
        }
      });
    }
    
    // Get global ranking
    const ranking = await getUserRanking(userId, userStats.labStats.totalPoints, category);
    
    // Get nearby users for context
    const nearbyUsers = await getNearbyUsers(userId, ranking.rank);
    
    res.json({
      success: true,
      data: {
        ...ranking,
        nearbyUsers
      }
    });
    
  } catch (error) {
    logger.error('Get leaderboard position error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get leaderboard position'
    });
  }
};

// Helper functions

async function getUserRanking(userId, userPoints, category = null) {
  const matchStage = category 
    ? { [`labStats.categoriesCompleted.${category}`]: { $gt: 0 } }
    : {};
  
  const totalUsers = await UserExtension.countDocuments(matchStage);
  const usersAbove = await UserExtension.countDocuments({
    ...matchStage,
    'labStats.totalPoints': { $gt: userPoints }
  });
  
  const rank = usersAbove + 1;
  const percentile = totalUsers > 0 ? ((totalUsers - rank) / totalUsers * 100).toFixed(1) : 0;
  
  // Get points needed for next rank
  const nextUser = await UserExtension.findOne({
    ...matchStage,
    'labStats.totalPoints': { $gt: userPoints }
  })
  .sort({ 'labStats.totalPoints': 1 })
  .limit(1);
  
  const pointsToNext = nextUser ? nextUser.labStats.totalPoints - userPoints : 0;
  
  return {
    globalRank: rank,
    categoryRank: category ? rank : null,
    totalUsers,
    percentile: parseFloat(percentile),
    pointsToNext
  };
}

async function getNearbyUsers(userId, userRank) {
  // Get users around current user's rank
  const nearbyUsers = await UserExtension.find({})
    .sort({ 'labStats.totalPoints': -1 })
    .skip(Math.max(0, userRank - 3))
    .limit(6)
    .populate('userId', 'username fullName avatar');
  
  return nearbyUsers.map((user, index) => ({
    rank: userRank - 2 + index,
    user: user.userId,
    points: user.labStats.totalPoints,
    isCurrentUser: user.userId._id.toString() === userId
  }));
}

async function getRecentActivity(userId, limit = 10) {
  const recentSessions = await Session.find({
    userId,
    status: 'stopped'
  })
  .populate('labId', 'name difficulty category')
  .sort({ createdAt: -1 })
  .limit(limit);
  
  return recentSessions.map(session => ({
    type: 'lab_completion',
    timestamp: session.stoppedAt,
    data: {
      labName: session.labId.name,
      difficulty: session.labId.difficulty,
      category: session.labId.category,
      points: session.stats.totalPoints,
      duration: session.stats.durationMinutes,
      completed: session.isCompleted
    }
  }));
}

async function calculateBadgeProgress(badge, userStats) {
  const { type, value, category, timeLimit } = badge.criteria;
  
  switch (type) {
    case 'labs_completed':
      return {
        current: userStats.labStats.labsCompleted,
        required: value,
        percentage: Math.min(100, (userStats.labStats.labsCompleted / value) * 100).toFixed(1)
      };
      
    case 'points_earned':
      return {
        current: userStats.labStats.totalPoints,
        required: value,
        percentage: Math.min(100, (userStats.labStats.totalPoints / value) * 100).toFixed(1)
      };
      
    case 'category_master':
      const userCompletedInCategory = userStats.labStats.categoriesCompleted[category] || 0;
      const totalLabsInCategory = await Lab.countDocuments({ 
        category, 
        isActive: true 
      });
      return {
        current: userCompletedInCategory,
        required: totalLabsInCategory,
        percentage: totalLabsInCategory > 0 
          ? Math.min(100, (userCompletedInCategory / totalLabsInCategory) * 100).toFixed(1)
          : 0
      };
      
    case 'streak':
      return {
        current: userStats.labStats.currentStreak,
        required: value,
        percentage: Math.min(100, (userStats.labStats.currentStreak / value) * 100).toFixed(1)
      };
      
    case 'perfectionist':
      return {
        current: userStats.labStats.perfectRuns,
        required: value,
        percentage: Math.min(100, (userStats.labStats.perfectRuns / value) * 100).toFixed(1)
      };
      
    default:
      return null;
  }
}

function getEmptyOverview() {
  return {
    totalPoints: 0,
    totalLabs: 0,
    completionRate: 0,
    accuracy: 100,
    currentStreak: 0,
    longestStreak: 0,
    fastestCompletion: null
  };
}

function getEmptyStats() {
  return {
    totalPoints: 0,
    totalLabs: 0,
    totalFlags: 0,
    accuracy: 100,
    completionRate: 0,
    currentLevel: { level: 1, title: 'Novice' },
    currentStreak: 0,
    longestStreak: 0
  };
}

async function getSystemAverages() {
  const stats = await UserExtension.aggregate([
    {
      $group: {
        _id: null,
        averagePoints: { $avg: '$labStats.totalPoints' },
        averageAccuracy: { $avg: '$labStats.successfulAttempts' },
        averageCompletionRate: { $avg: '$labStats.labsCompleted' }
      }
    }
  ]);
  
  return stats[0] || {
    averagePoints: 0,
    averageAccuracy: 0,
    averageCompletionRate: 0
  };
}