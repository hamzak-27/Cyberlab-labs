import SessionManager from '../services/sessionManager.js';
import { logger } from '../utils/logger.js';
import { formatDuration } from '../utils/helpers.js';

// Singleton session manager instance
let sessionManager = null;

// Initialize session manager
const getSessionManager = () => {
    if (!sessionManager) {
        sessionManager = new SessionManager();
    }
    return sessionManager;
};

/**
 * @desc Start a new lab session
 * @route POST /api/sessions/start
 * @access Private
 */
export const startSession = async (req, res) => {
    try {
        const { labId, metadata } = req.body;
        const userId = req.user.id;

        if (!labId) {
            return res.status(400).json({
                success: false,
                message: 'Lab ID is required'
            });
        }

        logger.info('Starting session request', { userId, labId, metadata });

        const manager = getSessionManager();
        const sessionData = await manager.startSession(userId, labId, { metadata });

        res.status(201).json({
            success: true,
            message: 'Session started successfully',
            data: sessionData
        });

    } catch (error) {
        logger.error('Failed to start session', {
            error: error.message,
            userId: req.user?.id,
            labId: req.body?.labId
        });

        const statusCode = error.message.includes('not found') ? 404 :
                          error.message.includes('already has an active') ? 409 :
                          error.message.includes('Maximum concurrent') ? 429 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/**
 * @desc Get session information
 * @route GET /api/sessions/:sessionId
 * @access Private
 */
export const getSessionInfo = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const manager = getSessionManager();
        const sessionInfo = await manager.getSessionInfo(sessionId);

        // Verify user owns this session
        if (sessionInfo.userId && sessionInfo.userId !== userId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this session'
            });
        }

        res.json({
            success: true,
            data: sessionInfo
        });

    } catch (error) {
        logger.error('Failed to get session info', {
            error: error.message,
            sessionId: req.params.sessionId,
            userId: req.user?.id
        });

        const statusCode = error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc Stop a session
 * @route POST /api/sessions/:sessionId/stop
 * @access Private
 */
export const stopSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const manager = getSessionManager();
        
        // Get session info first to verify ownership
        const sessionInfo = await manager.getSessionInfo(sessionId);
        if (sessionInfo.userId && sessionInfo.userId !== userId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this session'
            });
        }

        const result = await manager.stopSession(sessionId, 'user_requested');

        res.json({
            success: true,
            message: 'Session stopped successfully',
            data: result
        });

    } catch (error) {
        logger.error('Failed to stop session', {
            error: error.message,
            sessionId: req.params.sessionId,
            userId: req.user?.id
        });

        const statusCode = error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc Extend session duration
 * @route POST /api/sessions/:sessionId/extend
 * @access Private
 */
export const extendSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { extensionTime } = req.body;
        const userId = req.user.id;

        const manager = getSessionManager();
        
        // Get session info first to verify ownership
        const sessionInfo = await manager.getSessionInfo(sessionId);
        if (sessionInfo.userId && sessionInfo.userId !== userId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this session'
            });
        }

        const result = await manager.extendSession(sessionId, extensionTime);

        res.json({
            success: true,
            message: 'Session extended successfully',
            data: {
                ...result,
                newDuration: formatDuration(result.expiresAt - new Date())
            }
        });

    } catch (error) {
        logger.error('Failed to extend session', {
            error: error.message,
            sessionId: req.params.sessionId,
            userId: req.user?.id
        });

        const statusCode = error.message.includes('not found') ? 404 :
                          error.message.includes('Maximum extensions') ? 429 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc Submit a flag for validation
 * @route POST /api/sessions/:sessionId/flags
 * @access Private
 */
export const submitFlag = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { flagName, flag } = req.body;
        const userId = req.user.id;

        if (!flagName || !flag) {
            return res.status(400).json({
                success: false,
                message: 'Flag name and flag value are required'
            });
        }

        const manager = getSessionManager();
        const result = await manager.submitFlag(sessionId, flagName, flag, userId);

        // Update session activity
        await manager.updateActivity(sessionId, 'flag_submission');

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        logger.error('Failed to submit flag', {
            error: error.message,
            sessionId: req.params.sessionId,
            flagName: req.body?.flagName,
            userId: req.user?.id
        });

        const statusCode = error.message.includes('not found') ? 404 :
                          error.message.includes('does not belong') ? 403 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc Update session activity (heartbeat)
 * @route POST /api/sessions/:sessionId/activity
 * @access Private
 */
export const updateActivity = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { activityType = 'heartbeat' } = req.body;
        const userId = req.user.id;

        const manager = getSessionManager();
        
        // Verify session ownership (basic check)
        try {
            const sessionInfo = await manager.getSessionInfo(sessionId);
            if (sessionInfo.userId && sessionInfo.userId !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied to this session'
                });
            }
        } catch (error) {
            // Session might not exist, but updateActivity will handle it gracefully
        }

        const success = await manager.updateActivity(sessionId, activityType);

        res.json({
            success: true,
            data: { updated: success }
        });

    } catch (error) {
        logger.error('Failed to update activity', {
            error: error.message,
            sessionId: req.params.sessionId,
            userId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: 'Failed to update activity'
        });
    }
};

/**
 * @desc Get user's active sessions
 * @route GET /api/sessions/active
 * @access Private
 */
export const getActiveSessions = async (req, res) => {
    try {
        const userId = req.user.id;

        const manager = getSessionManager();
        const activeSessions = await manager.getUserActiveSessions(userId);

        const formattedSessions = activeSessions.map(session => ({
            sessionId: session.vmInstanceId,
            status: session.status,
            lab: {
                id: session.labId._id,
                name: session.labId.name,
                description: session.labId.description,
                category: session.labId.category,
                difficulty: session.labId.difficulty
            },
            startedAt: session.startedAt,
            expiresAt: session.expiresAt,
            timeRemaining: Math.max(0, Math.round((session.expiresAt - new Date()) / 1000 / 60)),
            connectionInfo: session.connectionInfo,
            extensionsUsed: session.metadata?.extensionCount || 0,
            lastActivity: session.lastActivity
        }));

        res.json({
            success: true,
            data: {
                sessions: formattedSessions,
                count: formattedSessions.length
            }
        });

    } catch (error) {
        logger.error('Failed to get active sessions', {
            error: error.message,
            userId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve active sessions'
        });
    }
};

/**
 * @desc Get system status (Admin only)
 * @route GET /api/sessions/system/status
 * @access Admin
 */
export const getSystemStatus = async (req, res) => {
    try {
        const manager = getSessionManager();
        const status = await manager.getSystemStatus();

        res.json({
            success: true,
            data: status
        });

    } catch (error) {
        logger.error('Failed to get system status', {
            error: error.message,
            userId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve system status'
        });
    }
};

/**
 * @desc Stop all sessions for a user (Admin only)
 * @route POST /api/sessions/admin/stop-user/:userId
 * @access Admin
 */
export const stopUserSessions = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason = 'admin_action' } = req.body;

        const manager = getSessionManager();
        const results = await manager.stopUserSessions(userId, reason);

        res.json({
            success: true,
            message: `Stopped ${results.length} sessions for user`,
            data: results
        });

    } catch (error) {
        logger.error('Failed to stop user sessions', {
            error: error.message,
            targetUserId: req.params.userId,
            adminUserId: req.user?.id
        });

        res.status(500).json({
            success: false,
            message: 'Failed to stop user sessions'
        });
    }
};

/**
 * @desc Get session connection info
 * @route GET /api/sessions/:sessionId/connection
 * @access Private
 */
export const getConnectionInfo = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const manager = getSessionManager();
        const sessionInfo = await manager.getSessionInfo(sessionId);

        // Verify user owns this session
        if (sessionInfo.userId && sessionInfo.userId !== userId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this session'
            });
        }

        if (sessionInfo.status !== 'running') {
            return res.status(400).json({
                success: false,
                message: 'Session is not running'
            });
        }

        // Remove sensitive data from connectionInfo before sending to frontend
        const sanitizedConnectionInfo = { ...sessionInfo.connectionInfo };
        delete sanitizedConnectionInfo.password;
        delete sanitizedConnectionInfo._managementSSH; // Backend-only field
        
        res.json({
            success: true,
            data: {
                connectionInfo: sanitizedConnectionInfo,
                vmStatus: sessionInfo.vmStatus,
                sessionStatus: sessionInfo.status
            }
        });

    } catch (error) {
        logger.error('Failed to get connection info', {
            error: error.message,
            sessionId: req.params.sessionId,
            userId: req.user?.id
        });

        const statusCode = error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @desc Get session flags status
 * @route GET /api/sessions/:sessionId/flags
 * @access Private
 */
export const getSessionFlags = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const manager = getSessionManager();
        const sessionInfo = await manager.getSessionInfo(sessionId);

        // Verify user owns this session
        if (sessionInfo.userId && sessionInfo.userId !== userId && !req.user.isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied to this session'
            });
        }

        res.json({
            success: true,
            data: {
                flags: sessionInfo.flags || [],
                totalFlags: sessionInfo.flags?.length || 0,
                submittedFlags: sessionInfo.flags?.filter(f => f.submitted)?.length || 0
            }
        });

    } catch (error) {
        logger.error('Failed to get session flags', {
            error: error.message,
            sessionId: req.params.sessionId,
            userId: req.user?.id
        });

        const statusCode = error.message.includes('not found') ? 404 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};