import { FlagSubmission, Lab, UserExtension, Badge, Session, User } from '../models/index.js';
import { logger } from '../utils/logger.js';
import { calculateDifficultyScore } from '../utils/helpers.js';

class ScoringService {
    constructor() {
        this.difficultyMultipliers = {
            'Easy': 1.0,
            'Medium': 1.5,
            'Hard': 2.0
        };

        this.speedBonusThresholds = {
            'Easy': 600,    // 10 minutes
            'Medium': 1800, // 30 minutes  
            'Hard': 3600    // 60 minutes
        };

        this.badgeDefinitions = this.initializeBadgeDefinitions();
    }

    /**
     * Initialize all badge definitions
     */
    initializeBadgeDefinitions() {
        return {
            // First Achievement Badges
            first_blood: {
                name: 'First Blood',
                description: 'First person to solve a lab',
                icon: '🩸',
                points: 50,
                type: 'achievement',
                rarity: 'legendary'
            },
            first_flag: {
                name: 'First Steps',
                description: 'Submit your first correct flag',
                icon: '🚩',
                points: 10,
                type: 'milestone',
                rarity: 'common'
            },
            
            // Speed Badges
            speed_demon: {
                name: 'Speed Demon',
                description: 'Solve a hard lab in under 30 minutes',
                icon: '⚡',
                points: 100,
                type: 'achievement',
                rarity: 'epic'
            },
            quick_solver: {
                name: 'Quick Solver',
                description: 'Solve 5 labs under time limit',
                icon: '🏃',
                points: 75,
                type: 'achievement',
                rarity: 'rare'
            },
            
            // Streak Badges
            streak_master: {
                name: 'Streak Master',
                description: 'Solve labs for 7 consecutive days',
                icon: '🔥',
                points: 150,
                type: 'streak',
                rarity: 'epic'
            },
            consistent_hacker: {
                name: 'Consistent Hacker',
                description: 'Solve labs for 3 consecutive days',
                icon: '📅',
                points: 50,
                type: 'streak',
                rarity: 'uncommon'
            },
            
            // Category Mastery Badges
            web_master: {
                name: 'Web Master',
                description: 'Complete all web application labs',
                icon: '🌐',
                points: 200,
                type: 'mastery',
                rarity: 'legendary'
            },
            binary_ninja: {
                name: 'Binary Ninja',
                description: 'Complete all binary exploitation labs',
                icon: '🥷',
                points: 200,
                type: 'mastery',
                rarity: 'legendary'
            },
            crypto_wizard: {
                name: 'Crypto Wizard',
                description: 'Complete all cryptography labs',
                icon: '🧙‍♂️',
                points: 200,
                type: 'mastery',
                rarity: 'legendary'
            },
            
            // Quantity Badges
            prolific_hacker: {
                name: 'Prolific Hacker',
                description: 'Complete 50 labs',
                icon: '🎯',
                points: 250,
                type: 'quantity',
                rarity: 'legendary'
            },
            dedicated_learner: {
                name: 'Dedicated Learner',
                description: 'Complete 10 labs',
                icon: '📚',
                points: 100,
                type: 'quantity',
                rarity: 'rare'
            },
            lab_explorer: {
                name: 'Lab Explorer',
                description: 'Complete 5 labs',
                icon: '🔍',
                points: 50,
                type: 'quantity',
                rarity: 'uncommon'
            },
            
            // Perfect Performance Badges
            perfectionist: {
                name: 'Perfectionist',
                description: 'Solve a lab without any wrong flag submissions',
                icon: '💎',
                points: 75,
                type: 'achievement',
                rarity: 'rare'
            },
            
            // Special Event Badges
            night_owl: {
                name: 'Night Owl',
                description: 'Complete a lab between 12 AM and 6 AM',
                icon: '🦉',
                points: 25,
                type: 'special',
                rarity: 'uncommon'
            },
            weekend_warrior: {
                name: 'Weekend Warrior',
                description: 'Complete 5 labs on weekends',
                icon: '⚔️',
                points: 50,
                type: 'special',
                rarity: 'uncommon'
            }
        };
    }

    /**
     * Calculate points for a flag submission
     */
    async calculateFlagPoints(flagSubmission, lab, session) {
        try {
            let basePoints = flagSubmission.points || 10; // Default points from flag config
            let bonusPoints = 0;
            let multiplier = this.difficultyMultipliers[lab.difficulty] || 1.0;

            // Time-based bonus for speed
            const sessionDuration = (Date.now() - session.startedAt.getTime()) / 1000; // seconds
            const timeLimit = this.speedBonusThresholds[lab.difficulty];
            
            if (timeLimit && sessionDuration < timeLimit) {
                const speedBonus = Math.floor(basePoints * 0.5); // 50% bonus for speed
                bonusPoints += speedBonus;
                logger.info('Speed bonus awarded', {
                    userId: flagSubmission.userId,
                    labId: lab._id,
                    duration: sessionDuration,
                    bonus: speedBonus
                });
            }

            // First blood bonus (first person to solve this lab)
            const existingSubmissions = await FlagSubmission.countDocuments({
                flagName: flagSubmission.flagName,
                isCorrect: true,
                labId: lab._id
            });

            if (existingSubmissions === 1) { // This is the first correct submission
                const firstBloodBonus = Math.floor(basePoints * 1.0); // 100% bonus for first blood
                bonusPoints += firstBloodBonus;
                logger.info('First blood bonus awarded', {
                    userId: flagSubmission.userId,
                    labId: lab._id,
                    bonus: firstBloodBonus
                });
            }

            const totalPoints = Math.floor((basePoints + bonusPoints) * multiplier);

            return {
                basePoints,
                bonusPoints,
                multiplier,
                totalPoints,
                factors: {
                    difficulty: lab.difficulty,
                    speed: sessionDuration < timeLimit,
                    firstBlood: existingSubmissions === 1
                }
            };

        } catch (error) {
            logger.error('Error calculating flag points', {
                error: error.message,
                flagSubmissionId: flagSubmission._id
            });
            return {
                basePoints: flagSubmission.points || 10,
                bonusPoints: 0,
                multiplier: 1.0,
                totalPoints: flagSubmission.points || 10,
                factors: {}
            };
        }
    }

    /**
     * Update user score and stats after flag submission
     */
    async updateUserScore(userId, pointsAwarded, labId, flagName) {
        try {
            // Update UserExtension (labs-backend stats)
            let userStats = await UserExtension.findOne({ userId });
            if (!userStats) {
                userStats = new UserExtension({ userId });
            }

            // Update total points (using correct nested path)
            userStats.labStats.totalPoints += pointsAwarded;
            userStats.activity.lastLabAt = new Date();

            // Update flag statistics
            userStats.labStats.flagsFound += 1;
            
            // Update flag type specific count
            if (flagName === 'user') {
                userStats.labStats.userFlagsFound += 1;
            } else if (flagName === 'root') {
                userStats.labStats.rootFlagsFound += 1;
            }

            await userStats.save();

            // Update main User model (for frontend summary card)
            try {
                const user = await User.findById(userId);
                if (user) {
                    // Update overall lab stats
                    user.labsStats.totalFlagsCaptured = (user.labsStats.totalFlagsCaptured || 0) + 1;
                    user.labsStats.totalPoints = (user.labsStats.totalPoints || 0) + pointsAwarded;

                    // Update lab-specific progress
                    let labProgress = user.labsProgress.find(lp => lp.labId.toString() === labId.toString());
                    if (!labProgress) {
                        labProgress = {
                            labId,
                            sessionsStarted: 0,
                            flagsCaptured: { user: false, root: false },
                            points: 0,
                            completed: false,
                            attempts: 0
                        };
                        user.labsProgress.push(labProgress);
                        labProgress = user.labsProgress[user.labsProgress.length - 1];
                    }

                    // Mark flag as captured
                    if (flagName === 'user') {
                        labProgress.flagsCaptured.user = true;
                    } else if (flagName === 'root') {
                        labProgress.flagsCaptured.root = true;
                    }

                    // Update points for this lab
                    labProgress.points = (labProgress.points || 0) + pointsAwarded;

                    // Check if lab is completed (both flags captured)
                    if (labProgress.flagsCaptured.user && labProgress.flagsCaptured.root) {
                        if (!labProgress.completed) {
                            labProgress.completed = true;
                            labProgress.completedAt = new Date();
                            user.labsStats.labsCompleted = (user.labsStats.labsCompleted || 0) + 1;
                        }
                    }

                    await user.save();

                    logger.info('User model synced', {
                        userId,
                        totalFlagsCaptured: user.labsStats.totalFlagsCaptured,
                        labCompleted: labProgress.completed
                    });
                }
            } catch (userUpdateError) {
                // Log error but don't fail the whole operation
                logger.error('Failed to update User model', {
                    error: userUpdateError.message,
                    userId
                });
            }

            logger.info('User score updated', {
                userId,
                pointsAwarded,
                totalPoints: userStats.labStats.totalPoints,
                totalFlags: userStats.labStats.flagsFound
            });

            return userStats;

        } catch (error) {
            logger.error('Error updating user score', {
                error: error.message,
                userId,
                pointsAwarded
            });
            throw error;
        }
    }

    /**
     * Check and award badges based on achievements
     */
    async checkAndAwardBadges(userId, context = {}) {
        // Badges disabled - just return empty array
        return [];
    }

    /**
     * Check if a specific badge condition is met
     */
    async checkBadgeCondition(badgeKey, badgeDefinition, userId, userStats, context) {
        try {
            switch (badgeKey) {
                case 'first_flag':
                    return userStats.labStats.flagsFound >= 1;

                case 'first_blood':
                    return context.isFirstBlood === true;

                case 'lab_explorer':
                    return userStats.labStats.labsCompleted >= 5;

                case 'dedicated_learner':
                    return userStats.labStats.labsCompleted >= 10;

                case 'prolific_hacker':
                    return userStats.labStats.labsCompleted >= 50;

                case 'speed_demon':
                    return context.sessionDuration && 
                           context.labDifficulty === 'Hard' && 
                           context.sessionDuration < 1800; // 30 minutes

                case 'quick_solver':
                    const speedSolves = await this.countSpeedSolves(userId);
                    return speedSolves >= 5;

                case 'perfectionist':
                    return context.perfectSolve === true;

                case 'night_owl':
                    const currentHour = new Date().getHours();
                    return currentHour >= 0 && currentHour < 6;

                case 'weekend_warrior':
                    const weekendSolves = await this.countWeekendSolves(userId);
                    return weekendSolves >= 5;

                case 'consistent_hacker':
                    return await this.checkConsecutiveDays(userId, 3);

                case 'streak_master':
                    return await this.checkConsecutiveDays(userId, 7);

                case 'web_master':
                    return await this.checkCategoryMastery(userId, 'Web');

                case 'binary_ninja':
                    return await this.checkCategoryMastery(userId, 'Binary');

                case 'crypto_wizard':
                    return await this.checkCategoryMastery(userId, 'Crypto');

                default:
                    return false;
            }
        } catch (error) {
            logger.error('Error checking badge condition', {
                error: error.message,
                badgeKey,
                userId
            });
            return false;
        }
    }

    /**
     * Award a badge to a user
     */
    async awardBadge(userId, badgeKey, badgeDefinition) {
        try {
            // Create badge record
            const badge = new Badge({
                userId,
                badgeId: badgeKey,
                name: badgeDefinition.name,
                description: badgeDefinition.description,
                icon: badgeDefinition.icon,
                points: badgeDefinition.points,
                type: badgeDefinition.type,
                rarity: badgeDefinition.rarity,
                earnedAt: new Date()
            });

            await badge.save();

            // Add to user's badge collection
            const userStats = await UserExtension.findOne({ userId });
            if (userStats) {
                userStats.badges.push({
                    badgeId: badgeKey,
                    name: badgeDefinition.name,
                    earnedAt: new Date()
                });
                userStats.totalPoints += badgeDefinition.points;
                await userStats.save();
            }

            logger.info('Badge awarded', {
                userId,
                badgeKey,
                badgeName: badgeDefinition.name,
                points: badgeDefinition.points
            });

            return badge;

        } catch (error) {
            logger.error('Error awarding badge', {
                error: error.message,
                userId,
                badgeKey
            });
            throw error;
        }
    }

    /**
     * Helper methods for badge conditions
     */
    async countSpeedSolves(userId) {
        const sessions = await Session.find({ 
            userId,
            status: { $in: ['stopped', 'expired'] }
        }).populate('labId');

        let speedCount = 0;
        for (const session of sessions) {
            if (session.duration && session.labId) {
                const timeLimit = this.speedBonusThresholds[session.labId.difficulty];
                if (timeLimit && session.duration < timeLimit * 1000) {
                    speedCount++;
                }
            }
        }
        return speedCount;
    }

    async countWeekendSolves(userId) {
        const userStats = await UserExtension.findOne({ userId });
        if (!userStats) return 0;

        return userStats.completedLabs.filter(lab => {
            const dayOfWeek = lab.completedAt.getDay();
            return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
        }).length;
    }

    async checkConsecutiveDays(userId, requiredDays) {
        const submissions = await FlagSubmission.find({
            userId,
            isCorrect: true
        }).sort({ submittedAt: -1 });

        if (submissions.length === 0) return false;

        const uniqueDays = new Set();
        submissions.forEach(submission => {
            const day = submission.submittedAt.toDateString();
            uniqueDays.add(day);
        });

        const sortedDays = Array.from(uniqueDays).sort((a, b) => new Date(b) - new Date(a));
        
        let consecutiveDays = 1;
        for (let i = 1; i < sortedDays.length; i++) {
            const current = new Date(sortedDays[i]);
            const previous = new Date(sortedDays[i - 1]);
            const diffDays = (previous - current) / (1000 * 60 * 60 * 24);
            
            if (diffDays === 1) {
                consecutiveDays++;
                if (consecutiveDays >= requiredDays) return true;
            } else {
                break;
            }
        }

        return consecutiveDays >= requiredDays;
    }

    async checkCategoryMastery(userId, category) {
        const totalLabsInCategory = await Lab.countDocuments({ 
            category,
            isActive: true 
        });

        const userStats = await UserExtension.findOne({ userId }).populate('completedLabs.labId');
        if (!userStats) return false;

        const completedInCategory = userStats.completedLabs.filter(
            lab => lab.labId && lab.labId.category === category
        ).length;

        return completedInCategory >= totalLabsInCategory && totalLabsInCategory > 0;
    }

    /**
     * Get user's ranking based on points
     */
    async getUserRanking(userId) {
        try {
            const userStats = await UserExtension.findOne({ userId });
            if (!userStats) return null;

            const ranking = await UserExtension.countDocuments({
                totalPoints: { $gt: userStats.totalPoints }
            }) + 1;

            const totalUsers = await UserExtension.countDocuments();

            return {
                rank: ranking,
                totalUsers,
                points: userStats.totalPoints,
                percentile: Math.round((1 - ranking / totalUsers) * 100)
            };

        } catch (error) {
            logger.error('Error getting user ranking', {
                error: error.message,
                userId
            });
            return null;
        }
    }

    /**
     * Get leaderboard data
     */
    async getLeaderboard(limit = 10) {
        try {
            const topUsers = await UserExtension.find()
                .sort({ totalPoints: -1 })
                .limit(limit)
                .select('userId totalPoints totalFlagsFound completedLabs badges')
                .lean();

            return topUsers.map((user, index) => ({
                rank: index + 1,
                userId: user.userId,
                totalPoints: user.totalPoints,
                totalFlags: user.totalFlagsFound,
                totalLabs: user.completedLabs.length,
                badgeCount: user.badges.length
            }));

        } catch (error) {
            logger.error('Error getting leaderboard', {
                error: error.message
            });
            return [];
        }
    }

    /**
     * Process flag submission with complete scoring
     */
    async processFlagSubmission(flagSubmission, session, lab) {
        try {
            // Calculate points
            const scoreData = await this.calculateFlagPoints(flagSubmission, lab, session);
            
            // Update flag submission with calculated points
            flagSubmission.points = scoreData.totalPoints;
            flagSubmission.scoreBreakdown = {
                basePoints: scoreData.basePoints,
                bonusPoints: scoreData.bonusPoints,
                multiplier: scoreData.multiplier,
                factors: scoreData.factors
            };
            await flagSubmission.save();

            // Update user score
            const userStats = await this.updateUserScore(
                flagSubmission.userId,
                scoreData.totalPoints,
                lab._id,
                flagSubmission.flagName
            );

            // Check for badge achievements
            const context = {
                isFirstBlood: scoreData.factors.firstBlood,
                sessionDuration: (Date.now() - session.startedAt.getTime()) / 1000,
                labDifficulty: lab.difficulty,
                perfectSolve: true // TODO: Track wrong submissions per session
            };

            const newBadges = await this.checkAndAwardBadges(flagSubmission.userId, context);

            // Get updated ranking
            const ranking = await this.getUserRanking(flagSubmission.userId);

            logger.info('Flag submission processed', {
                userId: flagSubmission.userId,
                labId: lab._id,
                pointsAwarded: scoreData.totalPoints,
                newBadges: newBadges.length,
                newRank: ranking?.rank
            });

            return {
                scoreData,
                userStats,
                newBadges,
                ranking
            };

        } catch (error) {
            logger.error('Error processing flag submission', {
                error: error.message,
                flagSubmissionId: flagSubmission._id
            });
            throw error;
        }
    }
}

export default ScoringService;