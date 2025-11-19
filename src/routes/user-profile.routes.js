import { Router } from 'express';
import { 
  submitFlag,
  getUserProfile,
  updateUserProfile,
  getUserProgress,
  getUserBadgeProgress,
  getLabProgress,
  updateUserPreferences,
  getUserStats,
  getUserLeaderboardPosition
} from '../controllers/user-profile.controller.js';
import { authorization, adminOnly } from '../middleware/auth.js';
import { rateLimitByUser } from '../middleware/rateLimit.js';

const router = Router();

// All routes require authentication
router.use(authorization);

/**
 * @swagger
 * /api/profile/flag-submission:
 *   post:
 *     summary: Submit flag for current session
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - flagType
 *               - flag
 *             properties:
 *               sessionId:
 *                 type: string
 *               flagType:
 *                 type: string
 *                 enum: [user, root]
 *               flag:
 *                 type: string
 *                 maxLength: 200
 *     responses:
 *       200:
 *         description: Flag submitted and validated
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
 *                     isCorrect:
 *                       type: boolean
 *                     pointsAwarded:
 *                       type: number
 *                     message:
 *                       type: string
 *                     sessionProgress:
 *                       type: object
 *                     newBadges:
 *                       type: array
 *                     levelUp:
 *                       type: boolean
 */
router.post('/flag-submission', rateLimitByUser(10, 60), submitFlag);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user's complete profile and statistics
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
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
 *                     labStats:
 *                       type: object
 *                     currentLevel:
 *                       type: object
 *                     leaderboardPosition:
 *                       type: object
 *                     recentActivity:
 *                       type: array
 *                     badges:
 *                       type: object
 */
router.get('/', rateLimitByUser(30, 300), getUserProfile);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update user profile preferences
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: object
 *                 properties:
 *                   difficulty:
 *                     type: string
 *                     enum: [Easy, Medium, Hard]
 *                   favoriteCategory:
 *                     type: string
 *                   notifications:
 *                     type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/', rateLimitByUser(5, 300), updateUserProfile);

/**
 * @swagger
 * /api/profile/progress:
 *   get:
 *     summary: Get user's lab progress and statistics
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by lab category
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [week, month, all]
 *           default: all
 *         description: Filter by timeframe
 *     responses:
 *       200:
 *         description: User progress retrieved successfully
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
 *                         totalPoints:
 *                           type: number
 *                         totalLabs:
 *                           type: number
 *                         completionRate:
 *                           type: number
 *                         averageScore:
 *                           type: number
 *                         currentStreak:
 *                           type: number
 *                     categoryProgress:
 *                       type: array
 *                     recentLabs:
 *                       type: array
 *                     achievements:
 *                       type: object
 */
router.get('/progress', rateLimitByUser(20, 300), getUserProgress);

/**
 * @swagger
 * /api/profile/badges:
 *   get:
 *     summary: Get user's badges and badge progress
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Badge information retrieved successfully
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
 *                     availableBadges:
 *                       type: array
 *                     progress:
 *                       type: array
 *                     statistics:
 *                       type: object
 */
router.get('/badges', rateLimitByUser(15, 300), getUserBadgeProgress);

/**
 * @swagger
 * /api/profile/labs/{labId}/progress:
 *   get:
 *     summary: Get detailed progress for a specific lab
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lab ID
 *     responses:
 *       200:
 *         description: Lab progress retrieved successfully
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
 *                     lab:
 *                       type: object
 *                     userProgress:
 *                       type: object
 *                     attempts:
 *                       type: array
 *                     bestScore:
 *                       type: number
 *                     completionStatus:
 *                       type: object
 */
router.get('/labs/:labId/progress', rateLimitByUser(20, 300), getLabProgress);

/**
 * @swagger
 * /api/profile/preferences:
 *   put:
 *     summary: Update user preferences and settings
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               difficulty:
 *                 type: string
 *                 enum: [Easy, Medium, Hard]
 *               favoriteCategory:
 *                 type: string
 *                 enum: [Web, Binary, Network, Crypto, Forensics, Misc]
 *               notifications:
 *                 type: object
 *                 properties:
 *                   sessionExpiry:
 *                     type: boolean
 *                   badgeEarned:
 *                     type: boolean
 *                   newLabs:
 *                     type: boolean
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */
router.put('/preferences', rateLimitByUser(5, 300), updateUserPreferences);

/**
 * @swagger
 * /api/profile/stats:
 *   get:
 *     summary: Get detailed user statistics
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: detailed
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include detailed breakdown
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
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                     performance:
 *                       type: object
 *                     trends:
 *                       type: object
 *                     comparisons:
 *                       type: object
 */
router.get('/stats', rateLimitByUser(20, 300), getUserStats);

/**
 * @swagger
 * /api/profile/leaderboard-position:
 *   get:
 *     summary: Get user's current leaderboard position
 *     tags: [User Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Get position in specific category
 *     responses:
 *       200:
 *         description: Leaderboard position retrieved successfully
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
 *                     globalRank:
 *                       type: number
 *                     categoryRank:
 *                       type: number
 *                     totalUsers:
 *                       type: number
 *                     percentile:
 *                       type: number
 *                     pointsToNext:
 *                       type: number
 *                     nearbyUsers:
 *                       type: array
 */
router.get('/leaderboard-position', rateLimitByUser(10, 300), getUserLeaderboardPosition);

export default router;