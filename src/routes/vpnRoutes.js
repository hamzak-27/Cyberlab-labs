import express from 'express';
import { authorization, adminOnly, rateLimitByUser } from '../middleware/auth.middleware.js';
import VPNService from '../services/vpn.service.js';
import { logger } from '../utils/logger.js';
import { body, param, query, validationResult } from 'express-validator';

const router = express.Router();

// Apply authentication to all VPN routes
router.use(authorization);

/**
 * @swagger
 * components:
 *   schemas:
 *     VPNConfig:
 *       type: object
 *       properties:
 *         sessionId:
 *           type: string
 *           description: Session ID
 *         userSubnet:
 *           type: object
 *           properties:
 *             network:
 *               type: string
 *               example: "10.10.15.0"
 *             netmask:
 *               type: string
 *               example: "255.255.255.0"
 *             gateway:
 *               type: string
 *               example: "10.10.15.1"
 *         downloadFilename:
 *           type: string
 *           example: "lab-session123.ovpn"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         connectionInfo:
 *           type: object
 *           properties:
 *             serverIP:
 *               type: string
 *               example: "your-server-ip"
 *             serverPort:
 *               type: number
 *               example: 1194
 *             protocol:
 *               type: string
 *               example: "udp"
 *             userNetwork:
 *               type: string
 *               example: "10.10.15.0"
 */

/**
 * @swagger
 * /api/vpn/config/generate:
 *   post:
 *     summary: Generate VPN configuration for session
 *     tags: [VPN]
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
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Lab session ID
 *               labId:
 *                 type: string
 *                 description: Lab ID (optional)
 *               duration:
 *                 type: number
 *                 description: Config validity in minutes
 *                 default: 30
 *     responses:
 *       200:
 *         description: VPN configuration generated successfully
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
 *                   $ref: '#/components/schemas/VPNConfig'
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: VPN config generation failed
 */
router.post('/config/generate',
  rateLimitByUser(5, 5 * 60 * 1000), // 5 requests per 5 minutes
  [
    body('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required'),
    body('labId')
      .optional()
      .isString()
      .withMessage('Lab ID must be a string'),
    body('duration')
      .optional()
      .isInt({ min: 5, max: 240 })
      .withMessage('Duration must be between 5 and 240 minutes')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { sessionId, labId, duration = 30 } = req.body;
      const userId = req.userId;

      logger.info(`VPN config generation requested by user ${userId} for session ${sessionId}`);

      // Generate VPN configuration
      const configResult = await VPNService.generateUserConfig(userId, sessionId, {
        labId,
        duration
      });

      res.json({
        success: true,
        message: 'VPN configuration generated successfully',
        data: configResult
      });

    } catch (error) {
      logger.error('VPN config generation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate VPN configuration',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/vpn/config/download/{sessionId}:
 *   get:
 *     summary: Download VPN configuration file
 *     tags: [VPN]
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
 *       404:
 *         description: VPN configuration not found
 *       401:
 *         description: Unauthorized
 *       410:
 *         description: VPN configuration expired
 */
router.get('/config/download/:sessionId',
  rateLimitByUser(10, 10 * 60 * 1000), // 10 downloads per 10 minutes
  [
    param('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { sessionId } = req.params;
      const userId = req.userId;

      logger.info(`VPN config download requested by user ${userId} for session ${sessionId}`);

      // Get configuration file
      const configFile = await VPNService.getConfigFile(sessionId);

      // Verify user ownership (security check)
      if (configFile.session.userId !== userId && req.userRole !== 'admin') {
        logger.warn(`Unauthorized VPN config access attempt: user ${userId}, session ${sessionId}`);
        return res.status(403).json({
          success: false,
          message: 'Access denied - session does not belong to user'
        });
      }

      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${configFile.filename}"`);
      res.setHeader('Content-Type', configFile.contentType);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      // Send file
      res.send(configFile.data);

    } catch (error) {
      logger.error('VPN config download failed:', error);

      if (error.message.includes('expired')) {
        return res.status(410).json({
          success: false,
          message: 'VPN configuration has expired',
          error: error.message
        });
      }

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'VPN configuration not found',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to download VPN configuration',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/vpn/status/{sessionId}:
 *   get:
 *     summary: Get VPN session status
 *     tags: [VPN]
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
 *         description: VPN session status
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
 *                     exists:
 *                       type: boolean
 *                     status:
 *                       type: string
 *                       enum: [generated, expired]
 *                     userSubnet:
 *                       type: object
 *                     timeRemaining:
 *                       type: number
 *                       description: Minutes remaining
 *                     connectionInfo:
 *                       type: object
 *       404:
 *         description: VPN session not found
 *       401:
 *         description: Unauthorized
 */
router.get('/status/:sessionId',
  [
    param('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { sessionId } = req.params;
      const userId = req.userId;

      // Get VPN session status
      const status = VPNService.getSessionStatus(sessionId);

      if (!status.exists) {
        return res.status(404).json({
          success: false,
          message: 'VPN session not found'
        });
      }

      res.json({
        success: true,
        message: 'VPN session status retrieved',
        data: status
      });

    } catch (error) {
      logger.error('VPN status check failed:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get VPN status',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/vpn/cleanup:
 *   post:
 *     summary: Cleanup expired VPN configurations
 *     tags: [VPN]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 cleanedSessions:
 *                   type: number
 *       401:
 *         description: Unauthorized
 */
router.post('/cleanup', async (req, res) => {
  try {
    const cleanedCount = await VPNService.cleanupExpiredSessions();

    res.json({
      success: true,
      message: 'VPN cleanup completed',
      cleanedSessions: cleanedCount
    });

  } catch (error) {
    logger.error('VPN cleanup failed:', error);
    res.status(500).json({
      success: false,
      message: 'VPN cleanup failed',
      error: error.message
    });
  }
});

// Admin-only routes
/**
 * @swagger
 * /api/vpn/admin/sessions:
 *   get:
 *     summary: Get all active VPN sessions (Admin only)
 *     tags: [VPN, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active VPN sessions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sessionId:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       labId:
 *                         type: string
 *                       userSubnet:
 *                         type: string
 *                       status:
 *                         type: string
 *                       timeRemaining:
 *                         type: number
 *       403:
 *         description: Admin access required
 *       401:
 *         description: Unauthorized
 */
router.get('/admin/sessions', adminOnly, async (req, res) => {
  try {
    const sessions = VPNService.getActiveSessions();

    res.json({
      success: true,
      message: 'Active VPN sessions retrieved',
      data: sessions,
      count: sessions.length
    });

  } catch (error) {
    logger.error('VPN admin sessions query failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get VPN sessions',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/vpn/admin/revoke/{sessionId}:
 *   delete:
 *     summary: Revoke VPN session (Admin only)
 *     tags: [VPN, Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID to revoke
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for revocation
 *     responses:
 *       200:
 *         description: VPN session revoked successfully
 *       404:
 *         description: Session not found
 *       403:
 *         description: Admin access required
 *       401:
 *         description: Unauthorized
 */
router.delete('/admin/revoke/:sessionId', 
  adminOnly,
  [
    param('sessionId')
      .isString()
      .notEmpty()
      .withMessage('Session ID is required'),
    body('reason')
      .optional()
      .isString()
      .withMessage('Reason must be a string')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { sessionId } = req.params;
      const { reason = 'Administrative revocation' } = req.body;

      const result = await VPNService.revokeSession(sessionId, reason);

      res.json({
        success: true,
        message: 'VPN session revoked successfully',
        data: result
      });

    } catch (error) {
      logger.error('VPN session revocation failed:', error);

      if (error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'VPN session not found',
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to revoke VPN session',
        error: error.message
      });
    }
  }
);

/**
 * @swagger
 * /api/vpn/admin/stats:
 *   get:
 *     summary: Get VPN service statistics (Admin only)
 *     tags: [VPN, Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: VPN service statistics
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
 *                     totalActiveSessions:
 *                       type: number
 *                     expiredSessions:
 *                       type: number
 *                     validSessions:
 *                       type: number
 *                     serverIP:
 *                       type: string
 *                     serverPort:
 *                       type: number
 *                     protocol:
 *                       type: string
 *                     uptime:
 *                       type: number
 *       403:
 *         description: Admin access required
 *       401:
 *         description: Unauthorized
 */
router.get('/admin/stats', adminOnly, async (req, res) => {
  try {
    const stats = VPNService.getServiceStats();

    res.json({
      success: true,
      message: 'VPN service statistics retrieved',
      data: stats
    });

  } catch (error) {
    logger.error('VPN stats query failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get VPN statistics',
      error: error.message
    });
  }
});

export default router;