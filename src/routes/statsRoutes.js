import express from 'express';
import {
    getUserStats,
    getLeaderboard,
    getUserBadges,
    getSystemStats,
    compareUsers
} from '../controllers/statsController.js';
import { authorization } from '../middleware/auth.js';
import { rateLimitByUser } from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserStats:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         totalPoints:
 *           type: number
 *         totalFlagsFound:
 *           type: number
 *         totalSessions:
 *           type: number
 *         completedLabs:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               labId:
 *                 type: string
 *               labName:
 *                 type: string
 *               difficulty:
 *                 type: string
 *               category:
 *                 type: string
 *               completedAt:
 *                 type: string
 *                 format: date-time
 *               flagsFound:
 *                 type: number
 *               pointsEarned:
 *                 type: number
 *         badges:
 *           type: array
 *           items:
 *             type: object
 *         ranking:
 *           type: object
 *           properties:
 *             rank:
 *               type: number
 *             totalUsers:
 *               type: number
 *             points:
 *               type: number
 *             percentile:
 *               type: number
 *     
 *     Badge:
 *       type: object
 *       properties:
 *         badgeId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         icon:
 *           type: string
 *         points:
 *           type: number
 *         type:
 *           type: string
 *         rarity:
 *           type: string
 *         earnedAt:
 *           type: string
 *           format: date-time
 *     
 *     LeaderboardEntry:
 *       type: object
 *       properties:
 *         rank:
 *           type: number
 *         userId:
 *           type: string
 *         totalPoints:
 *           type: number
 *         totalFlags:
 *           type: number
 *         totalLabs:
 *           type: number
 *         badgeCount:
 *           type: number
 */

// Public routes

/**
 * @swagger
 * /api/stats/leaderboard:
 *   get:
 *     summary: Get global leaderboard
 *     tags: [Statistics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of entries to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           default: all
 *         description: Filter by lab category
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [all, week, month]
 *           default: all
 *         description: Filter by timeframe
 *     responses:
 *       200:
 *         description: Leaderboard retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     leaderboard:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LeaderboardEntry'
 *                     pagination:
 *                       type: object
 *                     filters:
 *                       type: object
 */
router.get('/leaderboard', getLeaderboard);

/**
 * @swagger
 * /api/stats/system:
 *   get:
 *     summary: Get system-wide statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                         totalLabs:
 *                           type: number
 *                         totalBadgesAwarded:
 *                           type: number
 *                         totalPointsInSystem:
 *                           type: number
 *                     topUser:
 *                       type: object
 *                     categoryBreakdown:
 *                       type: array
 *                     badgeRarityDistribution:
 *                       type: array
 *                     recentActivity:
 *                       type: array
 */
router.get('/system', getSystemStats);

// Protected routes (require authentication)
router.use(authorization);

/**
 * @swagger
 * /api/stats/user:
 *   get:
 *     summary: Get user's personal statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserStats'
 *       401:
 *         description: Authentication required
 */
router.get('/user', rateLimitByUser(30, 300), getUserStats);

/**
 * @swagger
 * /api/stats/badges:
 *   get:
 *     summary: Get user's badges and badge progress
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User badges retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     earnedBadges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Badge'
 *                     totalBadges:
 *                       type: number
 *                     earnedCount:
 *                       type: number
 *                     totalPoints:
 *                       type: number
 *                     badgeProgress:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           badgeId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           description:
 *                             type: string
 *                           icon:
 *                             type: string
 *                           points:
 *                             type: number
 *                           type:
 *                             type: string
 *                           rarity:
 *                             type: string
 *                           earned:
 *                             type: boolean
 *                           earnedAt:
 *                             type: string
 *                             format: date-time
 *                           progress:
 *                             type: object
 *                     recentBadges:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Badge'
 *       401:
 *         description: Authentication required
 */
router.get('/badges', rateLimitByUser(20, 300), getUserBadges);

/**
 * @swagger
 * /api/stats/compare/{targetUserId}:
 *   get:
 *     summary: Compare user stats with another user
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: targetUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to compare with
 *     responses:
 *       200:
 *         description: User comparison retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                         totalPoints:
 *                           type: number
 *                         totalFlags:
 *                           type: number
 *                         totalLabs:
 *                           type: number
 *                         badges:
 *                           type: number
 *                         ranking:
 *                           type: object
 *                     target:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                         totalPoints:
 *                           type: number
 *                         totalFlags:
 *                           type: number
 *                         totalLabs:
 *                           type: number
 *                         badges:
 *                           type: number
 *                         ranking:
 *                           type: object
 *                     differences:
 *                       type: object
 *                       properties:
 *                         pointsDiff:
 *                           type: number
 *                         flagsDiff:
 *                           type: number
 *                         labsDiff:
 *                           type: number
 *                         badgesDiff:
 *                           type: number
 *                         rankDiff:
 *                           type: number
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Target user not found
 */
router.get('/compare/:targetUserId', rateLimitByUser(10, 300), compareUsers);

export default router;