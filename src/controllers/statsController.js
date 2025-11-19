import ScoringService from '../services/scoringService.js';
import { UserExtension, Badge, Lab } from '../models/index.js';
import { logger } from '../utils/logger.js';

const scoringService = new ScoringService();

/**
 * @desc Get user's personal statistics
 * @route GET /api/stats/user
 * @access Private
 */
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user.id;

        const userStats = await UserExtension.findOne({ userId })
            .populate({
                path: 'completedLabs.labId',
                select: 'name difficulty category'
            });

        if (!userStats) {
            return res.json({
                success: true,
                data: {
                    userId,
                    totalPoints: 0,
                    totalFlagsFound: 0,
                    totalSessions: 0,
                    completedLabs: [],
                    badges: [],
                    ranking: null,
                    recentActivity: []
                }
            });
        }

        // Get user ranking
        const ranking = await scoringService.getUserRanking(userId);

        // Format completed labs
        const formattedLabs = userStats.completedLabs.map(lab => ({
            labId: lab.labId._id,
            labName: lab.labId.name,
            difficulty: lab.labId.difficulty,
            category: lab.labId.category,
            completedAt: lab.completedAt,
            flagsFound: lab.flagsFound,
            pointsEarned: lab.pointsEarned,
            timeSpent: lab.timeSpent
        }));

        // Calculate category breakdown
        const categoryStats = {};
        formattedLabs.forEach(lab => {
            if (!categoryStats[lab.category]) {
                categoryStats[lab.category] = {
                    completed: 0,
                    totalPoints: 0
                };
            }
            categoryStats[lab.category].completed++;
            categoryStats[lab.category].totalPoints += lab.pointsEarned;
        });

        // Recent badges (last 5)
        const recentBadges = userStats.badges
            .sort((a, b) => b.earnedAt - a.earnedAt)
            .slice(0, 5);

        res.json({
            success: true,
            data: {
                userId,
                totalPoints: userStats.totalPoints,
                totalFlagsFound: userStats.totalFlagsFound,
                totalSessions: userStats.totalSessions,
                totalSessionTime: userStats.totalSessionTime,
                lastActivity: userStats.lastActivity,
                completedLabs: formattedLabs,
                badges: userStats.badges,
                recentBadges,
                ranking,
                categoryStats,
                summary: {
                    labsCompleted: formattedLabs.length,
                    badgesEarned: userStats.badges.length,
                    averagePointsPerLab: formattedLabs.length > 0 
                        ? Math.round(userStats.totalPoints / formattedLabs.length) 
                        : 0
                }
            }
        });

    } catch (error) {
        logger.error('Failed to get user stats', {
            error: error.message,
            userId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user statistics'
        });
    }
};

/**
 * @desc Get global leaderboard
 * @route GET /api/stats/leaderboard
 * @access Public
 */
export const getLeaderboard = async (req, res) => {
    try {
        const { 
            limit = 20, 
            page = 1,
            category = 'all',
            timeframe = 'all'
        } = req.query;

        const limitNum = parseInt(limit);
        const pageNum = parseInt(page);

        let leaderboardData;

        if (category === 'all' && timeframe === 'all') {
            // Global leaderboard
            leaderboardData = await scoringService.getLeaderboard(limitNum * pageNum);
        } else {
            // Custom filtered leaderboard
            const filter = {};
            
            if (timeframe !== 'all') {
                const now = new Date();
                let startDate;
                
                switch (timeframe) {
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        break;
                    default:
                        startDate = null;
                }

                if (startDate) {
                    filter.lastActivity = { $gte: startDate };
                }
            }

            const users = await UserExtension.find(filter)
                .sort({ totalPoints: -1 })
                .limit(limitNum)
                .skip((pageNum - 1) * limitNum)
                .select('userId totalPoints totalFlagsFound completedLabs badges')
                .populate({
                    path: 'completedLabs.labId',
                    select: 'category'
                });

            leaderboardData = users.map((user, index) => {
                let categoryPoints = user.totalPoints;
                
                if (category !== 'all') {
                    categoryPoints = user.completedLabs
                        .filter(lab => lab.labId && lab.labId.category === category)
                        .reduce((sum, lab) => sum + (lab.pointsEarned || 0), 0);
                }

                return {
                    rank: ((pageNum - 1) * limitNum) + index + 1,
                    userId: user.userId,
                    totalPoints: categoryPoints,
                    totalFlags: user.totalFlagsFound,
                    totalLabs: user.completedLabs.length,
                    badgeCount: user.badges.length
                };
            }).filter(user => category === 'all' || user.totalPoints > 0);
        }

        // Get total count for pagination
        const totalUsers = await UserExtension.countDocuments();
        
        res.json({
            success: true,
            data: {
                leaderboard: leaderboardData.slice((pageNum - 1) * limitNum, pageNum * limitNum),
                pagination: {
                    currentPage: pageNum,
                    totalPages: Math.ceil(totalUsers / limitNum),
                    totalUsers,
                    limit: limitNum
                },
                filters: {
                    category,
                    timeframe
                }
            }
        });

    } catch (error) {
        logger.error('Failed to get leaderboard', {
            error: error.message
        });

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve leaderboard'
        });
    }
};

/**
 * @desc Get user's badges
 * @route GET /api/stats/badges
 * @access Private
 */
export const getUserBadges = async (req, res) => {
    try {
        const userId = req.user.id;

        const badges = await Badge.find({ userId })
            .sort({ earnedAt: -1 });

        const userStats = await UserExtension.findOne({ userId });
        const availableBadges = scoringService.badgeDefinitions;

        // Create badge progress info
        const badgeProgress = Object.entries(availableBadges).map(([badgeId, definition]) => {
            const earned = badges.find(b => b.badgeId === badgeId);
            return {
                badgeId,
                name: definition.name,
                description: definition.description,
                icon: definition.icon,
                points: definition.points,
                type: definition.type,
                rarity: definition.rarity,
                earned: !!earned,
                earnedAt: earned?.earnedAt || null,
                // Add progress indicators for some badges
                progress: getBadgeProgress(badgeId, definition, userStats)
            };
        });

        res.json({
            success: true,
            data: {
                earnedBadges: badges,
                totalBadges: badgeProgress.length,
                earnedCount: badges.length,
                totalPoints: badges.reduce((sum, badge) => sum + badge.points, 0),
                badgeProgress,
                recentBadges: badges.slice(0, 5)
            }
        });

    } catch (error) {
        logger.error('Failed to get user badges', {
            error: error.message,
            userId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve badges'
        });
    }
};

/**
 * @desc Get system-wide statistics
 * @route GET /api/stats/system
 * @access Public
 */
export const getSystemStats = async (req, res) => {
    try {
        // Get various system statistics
        const [
            totalUsers,
            totalLabs,
            totalBadges,
            topUser,
            recentActivity
        ] = await Promise.all([
            UserExtension.countDocuments(),
            Lab.countDocuments({ isActive: true }),
            Badge.countDocuments(),
            UserExtension.findOne().sort({ totalPoints: -1 }).select('userId totalPoints'),
            Badge.find().sort({ earnedAt: -1 }).limit(10)
                .populate('userId', 'username')
        ]);

        // Calculate total points in system
        const pointsAggregation = await UserExtension.aggregate([
            { $group: { _id: null, totalPoints: { $sum: '$totalPoints' } } }
        ]);
        const totalPoints = pointsAggregation[0]?.totalPoints || 0;

        // Get category breakdown
        const categoryStats = await Lab.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get badge rarity distribution
        const badgeRarityStats = await Badge.aggregate([
            { $group: { _id: '$rarity', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalLabs,
                    totalBadgesAwarded: totalBadges,
                    totalPointsInSystem: totalPoints,
                    averagePointsPerUser: totalUsers > 0 ? Math.round(totalPoints / totalUsers) : 0
                },
                topUser: topUser ? {
                    userId: topUser.userId,
                    points: topUser.totalPoints
                } : null,
                categoryBreakdown: categoryStats.map(cat => ({
                    category: cat._id,
                    labCount: cat.count
                })),
                badgeRarityDistribution: badgeRarityStats.map(rarity => ({
                    rarity: rarity._id,
                    count: rarity.count
                })),
                recentActivity: recentActivity.map(badge => ({
                    userId: badge.userId,
                    badgeName: badge.name,
                    earnedAt: badge.earnedAt,
                    rarity: badge.rarity
                }))
            }
        });

    } catch (error) {
        logger.error('Failed to get system stats', {
            error: error.message
        });

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system statistics'
        });
    }
};

/**
 * @desc Get user comparison with another user
 * @route GET /api/stats/compare/:targetUserId
 * @access Private
 */
export const compareUsers = async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserId } = req.params;

        const [userStats, targetStats] = await Promise.all([
            UserExtension.findOne({ userId }),
            UserExtension.findOne({ userId: targetUserId })
        ]);

        if (!targetStats) {
            return res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
        }

        const [userRanking, targetRanking] = await Promise.all([
            scoringService.getUserRanking(userId),
            scoringService.getUserRanking(targetUserId)
        ]);

        const comparison = {
            user: {
                userId,
                totalPoints: userStats?.totalPoints || 0,
                totalFlags: userStats?.totalFlagsFound || 0,
                totalLabs: userStats?.completedLabs.length || 0,
                badges: userStats?.badges.length || 0,
                ranking: userRanking
            },
            target: {
                userId: targetUserId,
                totalPoints: targetStats.totalPoints,
                totalFlags: targetStats.totalFlagsFound,
                totalLabs: targetStats.completedLabs.length,
                badges: targetStats.badges.length,
                ranking: targetRanking
            },
            differences: {
                pointsDiff: (userStats?.totalPoints || 0) - targetStats.totalPoints,
                flagsDiff: (userStats?.totalFlagsFound || 0) - targetStats.totalFlagsFound,
                labsDiff: (userStats?.completedLabs.length || 0) - targetStats.completedLabs.length,
                badgesDiff: (userStats?.badges.length || 0) - targetStats.badges.length,
                rankDiff: (userRanking?.rank || 0) - (targetRanking?.rank || 0)
            }
        };

        res.json({
            success: true,
            data: comparison
        });

    } catch (error) {
        logger.error('Failed to compare users', {
            error: error.message,
            userId: req.user?.id,
            targetUserId: req.params.targetUserId
        });

        res.status(500).json({
            success: false,
            message: 'Failed to compare users'
        });
    }
};

/**
 * Helper function to calculate badge progress
 */
function getBadgeProgress(badgeId, definition, userStats) {
    if (!userStats) return null;

    switch (badgeId) {
        case 'lab_explorer':
            return { current: userStats.completedLabs.length, required: 5 };
        case 'dedicated_learner':
            return { current: userStats.completedLabs.length, required: 10 };
        case 'prolific_hacker':
            return { current: userStats.completedLabs.length, required: 50 };
        default:
            return null;
    }
}