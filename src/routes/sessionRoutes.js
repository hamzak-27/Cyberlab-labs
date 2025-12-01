import express from 'express';
import {
    startSession,
    getSessionInfo,
    stopSession,
    extendSession,
    submitFlag,
    updateActivity,
    getActiveSessions,
    getSystemStatus,
    stopUserSessions,
    getConnectionInfo,
    getSessionFlags,
    downloadVPNConfig
} from '../controllers/sessionController.js';
import { authorization, adminOnly } from '../middleware/auth.js';
import { rateLimitByUser, rateLimitByIP } from '../middleware/rateLimit.js';

const router = express.Router();

// Public routes (no authentication required)
// None for sessions - all require authentication

// Protected routes (require authentication)
router.use(authorization);

/**
 * @swagger
 * components:
 *   schemas:
 *     SessionData:
 *       type: object
 *       properties:
 *         sessionId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [starting, running, stopped, failed, expired]
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         connectionInfo:
 *           type: object
 *           properties:
 *             sshPort:
 *               type: number
 *             webPorts:
 *               type: array
 *               items:
 *                 type: number
 *             host:
 *               type: string
 *             username:
 *               type: string
 *         estimatedStartTime:
 *           type: number
 *           description: Estimated time in seconds for VM to be ready
 */

/**
 * @swagger
 * /api/sessions/start:
 *   post:
 *     summary: Start a new lab session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - labId
 *             properties:
 *               labId:
 *                 type: string
 *                 description: ID of the lab to start
 *               metadata:
 *                 type: object
 *                 description: Optional session metadata
 *     responses:
 *       201:
 *         description: Session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SessionData'
 *       400:
 *         description: Bad request - missing lab ID
 *       404:
 *         description: Lab not found
 *       409:
 *         description: User already has an active session
 *       429:
 *         description: Maximum concurrent sessions reached
 */
router.post('/start', rateLimitByUser(1, 60), startSession);

/**
 * @swagger
 * /api/sessions/active:
 *   get:
 *     summary: Get user's active sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active sessions retrieved successfully
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
 *                     sessions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: number
 */
router.get('/active', getActiveSessions);

/**
 * @swagger
 * /api/sessions/{sessionId}:
 *   get:
 *     summary: Get session information
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session information retrieved successfully
 *       403:
 *         description: Access denied to this session
 *       404:
 *         description: Session not found
 */
router.get('/:sessionId', getSessionInfo);

/**
 * @swagger
 * /api/sessions/{sessionId}/stop:
 *   post:
 *     summary: Stop a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session stopped successfully
 *       403:
 *         description: Access denied to this session
 *       404:
 *         description: Session not found
 */
router.post('/:sessionId/stop', stopSession);

/**
 * @swagger
 * /api/sessions/{sessionId}/extend:
 *   post:
 *     summary: Extend session duration
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               extensionTime:
 *                 type: number
 *                 description: Extension time in milliseconds (optional)
 *     responses:
 *       200:
 *         description: Session extended successfully
 *       403:
 *         description: Access denied to this session
 *       404:
 *         description: Session not found
 *       429:
 *         description: Maximum extensions reached
 */
router.post('/:sessionId/extend', extendSession);

/**
 * @swagger
 * /api/sessions/{sessionId}/flags:
 *   post:
 *     summary: Submit a flag for validation
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flagName
 *               - flag
 *             properties:
 *               flagName:
 *                 type: string
 *                 description: Name of the flag (e.g., 'user_flag', 'root_flag')
 *               flag:
 *                 type: string
 *                 description: The flag value to submit
 *     responses:
 *       200:
 *         description: Flag submitted successfully
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
 *                     success:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     points:
 *                       type: number
 *       400:
 *         description: Bad request - missing required fields
 *       403:
 *         description: Access denied to this session
 *       404:
 *         description: Session not found
 */
router.post('/:sessionId/flags', rateLimitByUser(10, 60), submitFlag);

/**
 * @swagger
 * /api/sessions/{sessionId}/flags:
 *   get:
 *     summary: Get session flags status
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session flags retrieved successfully
 *       403:
 *         description: Access denied to this session
 *       404:
 *         description: Session not found
 */
router.get('/:sessionId/flags', getSessionFlags);

/**
 * @swagger
 * /api/sessions/{sessionId}/vpn-config:
 *   get:
 *     summary: Download VPN configuration file
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: VPN configuration file
 *         content:
 *           application/x-openvpn-profile:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: Access denied to this session
 *       404:
 *         description: Session not found
 */
router.get('/:sessionId/vpn-config', downloadVPNConfig);

/**
 * @swagger
 * /api/sessions/{sessionId}/connection:
 *   get:
 *     summary: Get session connection information
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Connection information retrieved successfully
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
 *                     connectionInfo:
 *                       type: object
 *                       properties:
 *                         sshPort:
 *                           type: number
 *                         webPorts:
 *                           type: array
 *                           items:
 *                             type: number
 *                         host:
 *                           type: string
 *                         username:
 *                           type: string
 *                     vmStatus:
 *                       type: object
 *                     sessionStatus:
 *                       type: string
 *       400:
 *         description: Session is not running
 *       403:
 *         description: Access denied to this session
 *       404:
 *         description: Session not found
 */
router.get('/:sessionId/connection', getConnectionInfo);

/**
 * @swagger
 * /api/sessions/{sessionId}/activity:
 *   post:
 *     summary: Update session activity (heartbeat)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activityType:
 *                 type: string
 *                 default: heartbeat
 *                 description: Type of activity
 *     responses:
 *       200:
 *         description: Activity updated successfully
 *       403:
 *         description: Access denied to this session
 */
router.post('/:sessionId/activity', rateLimitByUser(60, 60), updateActivity);

// Admin-only routes
router.use(adminOnly);

/**
 * @swagger
 * /api/sessions/system/status:
 *   get:
 *     summary: Get system status (Admin only)
 *     tags: [Sessions, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System status retrieved successfully
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
 *                     activeSessions:
 *                       type: number
 *                     maxConcurrentSessions:
 *                       type: number
 *                     totalSessions:
 *                       type: number
 *                     systemLoad:
 *                       type: object
 *                     config:
 *                       type: object
 *       403:
 *         description: Admin access required
 */
router.get('/system/status', getSystemStatus);

/**
 * @swagger
 * /api/sessions/admin/stop-user/{userId}:
 *   post:
 *     summary: Stop all sessions for a user (Admin only)
 *     tags: [Sessions, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 default: admin_action
 *                 description: Reason for stopping sessions
 *     responses:
 *       200:
 *         description: User sessions stopped successfully
 *       403:
 *         description: Admin access required
 */
router.post('/admin/stop-user/:userId', stopUserSessions);

export default router;