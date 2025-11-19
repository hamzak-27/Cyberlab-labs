import EventEmitter from 'events';
import net from 'net';
import { Session, Lab, FlagSubmission, UserExtension } from '../models/index.js';
import vmProvisioner from './vmProvisioner.js';
import flagService from './flagService.js';
import ScoringService from './scoringService.js';
import websocketService from './websocket.service.js';
import { logger } from '../utils/logger.js';
import { generateSessionId } from '../utils/helpers.js';

class SessionManager extends EventEmitter {
    constructor() {
        super();
        this.activeSessions = new Map(); // sessionId -> session metadata
        this.sessionTimeouts = new Map(); // sessionId -> timeout handle
        this.vmProvisioner = vmProvisioner;
        this.flagService = flagService;
        this.scoringService = new ScoringService();
        
        // Configuration
        this.config = {
            maxSessionDuration: parseInt(process.env.MAX_SESSION_DURATION) || 3600000, // 1 hour
            sessionExtensionTime: parseInt(process.env.SESSION_EXTENSION_TIME) || 1800000, // 30 minutes
            maxExtensions: parseInt(process.env.MAX_SESSION_EXTENSIONS) || 2,
            sessionCleanupInterval: parseInt(process.env.SESSION_CLEANUP_INTERVAL) || 300000, // 5 minutes
            maxConcurrentSessions: parseInt(process.env.MAX_CONCURRENT_SESSIONS) || 10,
            inactivityTimeout: parseInt(process.env.SESSION_INACTIVITY_TIMEOUT) || 1800000, // 30 minutes
        };

        // Start cleanup interval
        this.setupCleanupInterval();
        
        logger.info('Session Manager initialized', {
            maxSessionDuration: this.config.maxSessionDuration / 1000 / 60,
            maxConcurrentSessions: this.config.maxConcurrentSessions
        });
    }

    /**
     * Start a new lab session for a user
     */
    async startSession(userId, labId, sessionOptions = {}) {
        try {
            logger.info('Starting new session', { userId, labId, sessionOptions });

            // Validate user and lab
            const lab = await Lab.findById(labId);
            if (!lab || !lab.isActive) {
                throw new Error('Lab not found or inactive');
            }

            // Check for existing active session for this user
            const existingSession = await Session.findOne({
                userId,
                status: { $in: ['starting', 'running'] }
            });

            if (existingSession) {
                throw new Error('User already has an active session');
            }

            // Check concurrent session limits
            const activeSessions = await this.getActiveSessionCount();
            if (activeSessions >= this.config.maxConcurrentSessions) {
                throw new Error('Maximum concurrent sessions reached');
            }

            // Generate session ID and create session record
            const sessionId = generateSessionId();
            
            // Generate flags for the session
            const userFlag = `FLAG{user_lampiao_${sessionId}_${Date.now()}}`;
            const rootFlag = `FLAG{root_lampiao_${sessionId}_${Date.now()}}`;
            
            const session = new Session({
                userId,
                labId,
                vmInstanceId: sessionId, // Use sessionId as vmInstanceId for now
                vmName: `Session-${sessionId}`,
                status: 'starting',
                startedAt: new Date(),
                expiresAt: new Date(Date.now() + this.config.maxSessionDuration),
                connectionInfo: {
                    host: '127.0.0.1',
                    ipAddress: '127.0.0.1',
                    sshPort: 2222, // Placeholder port, will be updated during VM provisioning
                    webPort: 8080, // Placeholder port, will be updated during VM provisioning
                    webPorts: [8080],
                    username: 'tiago',
                    password: null
                },
                flags: {
                    user: {
                        value: userFlag,
                        submitted: false,
                        isCorrect: false
                    },
                    root: {
                        value: rootFlag,
                        submitted: false,
                        isCorrect: false
                    }
                },
                lastActivity: new Date(),
                metadata: {
                    userAgent: sessionOptions.metadata?.userAgent,
                    ipAddress: sessionOptions.metadata?.ipAddress,
                    isExtended: false,
                    extensionCount: 0
                }
            });

            await session.save();

            // Start VM provisioning
            await this.provisionVM(session);

            logger.info('Session started successfully', { 
                sessionId, 
                userId, 
                labId,
                vmId: session.vmInstanceId 
            });

            // Sanitize connectionInfo before returning (remove password and internal fields)
            const sanitizedConnectionInfo = { ...session.connectionInfo };
            delete sanitizedConnectionInfo.password;
            delete sanitizedConnectionInfo._managementSSH;

            return {
                sessionId: session.vmInstanceId,
                status: session.status,
                expiresAt: session.expiresAt,
                connectionInfo: sanitizedConnectionInfo,
                estimatedStartTime: 60 // seconds
            };

        } catch (error) {
            logger.error('Failed to start session', { 
                error: error.message, 
                userId, 
                labId 
            });
            throw error;
        }
    }

    /**
     * Provision VM and inject flags
     */
    async provisionVM(session) {
        try {
            const lab = await Lab.findById(session.labId);
            
            // DEBUG: Check what flags MongoDB returned
            logger.info('Lab data from MongoDB', {
                labId: lab._id,
                labName: lab.name,
                hasFlags: !!lab.flags,
                flagsStructure: JSON.stringify(lab.flags, null, 2)
            });
            
            // Create VM from template
            logger.info('Provisioning VM', { 
                sessionId: session.vmInstanceId, 
                labId: session.labId 
            });

            const vmResult = await this.vmProvisioner.createInstance(
                lab.templateVmId, // Use the templateVmId from the lab
                session.vmInstanceId,
                {
                    userId: session.userId,
                    vmConfig: {
                        memory: lab.vmConfig?.ram || 1024,
                        cpus: lab.vmConfig?.cpu || 1,
                        network: lab.vmConfig?.network || 'nat'
                    }
                }
            );

            // Update session with VM details - keep the original vmInstanceId for tracking
            // Store the actual VM UUID separately if needed
            session.vmName = vmResult.instanceName;

            // Generate connection info based on network mode
            if (vmResult.networkConfig?.mode === 'hackthebox-internal') {
                // HackTheBox-style internal networking
                const vmIP = vmResult.networkConfig.vmIP;
                const managementPort = vmResult.networkConfig.managementPort;
                
                session.connectionInfo = {
                    mode: 'hackthebox-internal',
                    host: vmIP,
                    ipAddress: vmIP,
                    sshPort: 22, // Direct SSH port on internal IP (for users via VPN)
                    webPort: 80, // Direct web port on internal IP
                    webPorts: [80, 443], // Common ports on internal IP
                    username: lab.defaultCredentials?.username || 'tiago',
                    password: lab.defaultCredentials?.password || null,
                    sshCommand: `ssh ${lab.defaultCredentials?.username || 'tiago'}@${vmIP}`,
                    webUrl: `http://${vmIP}`,
                    vpnRequired: true,
                    services: vmResult.networkConfig.services,
                    // Backend management access (NOT exposed to users)
                    _managementSSH: {
                        host: '127.0.0.1',
                        port: managementPort,
                        internal: true // Mark as internal-only
                    }
                };
            } else {
                // NAT mode with port forwarding
                const sshPort = vmResult.networkConfig?.sshPort || 2222;
                const webPort = vmResult.networkConfig?.webPort || 8080;
                
                session.connectionInfo = {
                    mode: 'nat',
                    host: '127.0.0.1',
                    ipAddress: '127.0.0.1', 
                    sshPort: sshPort,
                    webPort: webPort,
                    webPorts: [webPort],
                    username: lab.defaultCredentials?.username || 'tiago',
                    password: lab.defaultCredentials?.password || null,
                    sshCommand: `ssh ${lab.defaultCredentials?.username || 'tiago'}@127.0.0.1 -p ${sshPort}`,
                    webUrl: `http://127.0.0.1:${webPort}`,
                    vpnRequired: false
                };
            }

            await session.save();

            // Start the VM instance using the original session ID that was used to create it
            await this.vmProvisioner.startInstance(session.vmInstanceId);

            // Skip connectivity check for HackTheBox mode (requires VPN)
            if (vmResult.networkConfig?.mode !== 'hackthebox-internal') {
                // Wait for VM to be ready (basic connectivity check) - only for NAT mode
                await this.waitForVMReady(session);
            }

            // Generate and inject flags
            await this.setupFlags(session, lab);

            // Update session status
            session.status = 'running';
            await session.save();

            // Add to active sessions tracking
            this.activeSessions.set(session.vmInstanceId, {
                sessionId: session.vmInstanceId,
                userId: session.userId,
                labId: session.labId,
                vmId: session.vmInstanceId, // Use vmInstanceId as the VM identifier
                startedAt: session.startedAt,
                lastActivity: new Date()
            });

            // Set session timeout
            this.setSessionTimeout(session.vmInstanceId, session.expiresAt);

            this.emit('sessionStarted', { session: session.toObject() });
            
            // Send WebSocket notification
            websocketService.sendSessionEvent(session.userId, {
                type: 'started',
                sessionId: session.vmInstanceId,
                labName: lab.name,
                status: 'running',
                connectionInfo: session.connectionInfo,
                timestamp: new Date().toISOString()
            });

            logger.info('VM provisioned and session running', { 
                sessionId: session.vmInstanceId,
                vmId: session.vmInstanceId
            });

        } catch (error) {
            // Update session status to failed
            session.status = 'failed';
            await session.save();

            // Cleanup any partial VM creation
            if (session.vmInstanceId) {
                try {
                    await this.vmProvisioner.deleteInstance(session.vmInstanceId);
                } catch (cleanupError) {
                    logger.warn('Failed to cleanup failed VM', { 
                        vmId: session.vmInstanceId,
                        error: cleanupError.message 
                    });
                }
            }

            throw error;
        }
    }

    /**
     * Wait for VM to be ready for SSH connections
     */
    async waitForVMReady(session, maxWaitTime = 120000) { // 2 minutes
        const startTime = Date.now();
        const sshPort = session.connectionInfo.sshPort;
        
        logger.info('Waiting for VM to be ready', { 
            sessionId: session.vmInstanceId,
            sshPort 
        });

        return new Promise((resolve, reject) => {
            const checkReady = async () => {
                try {
                    if (Date.now() - startTime > maxWaitTime) {
                        reject(new Error('VM failed to start within timeout period'));
                        return;
                    }

                    // Simple TCP connection test to SSH port
                    const socket = new net.Socket();
                    
                    socket.setTimeout(3000);
                    
                    socket.connect(sshPort, 'localhost', () => {
                        socket.destroy();
                        logger.info('VM is ready', { sessionId: session.vmInstanceId });
                        resolve();
                    });

                    socket.on('error', () => {
                        socket.destroy();
                        setTimeout(checkReady, 5000); // Retry in 5 seconds
                    });

                    socket.on('timeout', () => {
                        socket.destroy();
                        setTimeout(checkReady, 5000); // Retry in 5 seconds
                    });

                } catch (error) {
                    setTimeout(checkReady, 5000); // Retry in 5 seconds
                }
            };

            checkReady();
        });
    }

    /**
     * Generate and inject flags into the VM
     */
    async setupFlags(session, lab) {
        try {
            logger.info('Setting up flags', { sessionId: session.vmInstanceId });

            // Generate session-specific flags using FlagService
            // Convert Mongoose document to plain object to access nested fields
            const labPlain = lab.toObject();
            const flagData = this.flagService.generateSessionFlags(
                session.vmInstanceId,
                session.userId.toString(),
                {
                    _id: labPlain._id,
                    name: labPlain.name,
                    flags: labPlain.flags
                }
            );
            
            // Update session with generated flags
            session.flags = {
                user: {
                    value: flagData.userFlag,
                    submitted: false,
                    isCorrect: false,
                    points: flagData.points.user
                },
                root: {
                    value: flagData.rootFlag,
                    submitted: false,
                    isCorrect: false,
                    points: flagData.points.root
                }
            };
            
            await session.save();
            
            // Inject flags into the VM (non-blocking - flags are already in database)
            try {
                // Pass full connectionInfo - flagService will detect HackTheBox mode and use _managementSSH
                logger.info('Flag injection connection info', {
                    sessionId: session.vmInstanceId,
                    mode: session.connectionInfo.mode,
                    hasManagementSSH: !!session.connectionInfo._managementSSH
                });
                
                const injectionResult = await this.flagService.injectFlags(
                    session.vmInstanceId,
                    session.connectionInfo,  // Pass full connectionInfo
                    lab
                );
                
                logger.info('Flag injection completed', {
                    sessionId: session.vmInstanceId,
                    success: injectionResult.success,
                    userFlagInjected: injectionResult.userFlagInjected,
                    rootFlagInjected: injectionResult.rootFlagInjected
                });
                
            } catch (injectionError) {
                logger.warn('Flag injection failed - flags available in database, session continues', {
                    sessionId: session.vmInstanceId,
                    error: injectionError.message,
                    note: 'Users can still submit flags - they are stored in the session'
                });
                // Don't fail the entire session if flag injection fails
                // Flags are already in the database and can be validated
            }
            
            logger.info('Flags setup completed', { 
                sessionId: session.vmInstanceId,
                userFlag: session.flags.user.value,
                rootFlag: session.flags.root.value
            });

        } catch (error) {
            logger.error('Failed to setup flags', { 
                sessionId: session.vmInstanceId,
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Extend an active session
     */
    async extendSession(sessionId, extensionTime = null) {
        try {
            const session = await Session.findOne({ vmInstanceId: sessionId, status: 'running' });
            if (!session) {
                throw new Error('Session not found or not running');
            }

            if (session.metadata?.extensionCount >= this.config.maxExtensions) {
                throw new Error('Maximum extensions reached');
            }

            const extension = extensionTime || this.config.sessionExtensionTime;
            const newExpiryTime = new Date(session.expiresAt.getTime() + extension);

            session.expiresAt = newExpiryTime;
            session.extensionsUsed += 1;
            session.lastActivity = new Date();
            await session.save();

            // Update timeout
            this.setSessionTimeout(sessionId, newExpiryTime);

            // Update active sessions tracking
            if (this.activeSessions.has(sessionId)) {
                this.activeSessions.get(sessionId).lastActivity = new Date();
            }

            logger.info('Session extended', { 
                sessionId, 
                newExpiryTime,
                extensionsUsed: session.extensionsUsed 
            });

            this.emit('sessionExtended', { 
                sessionId, 
                expiresAt: newExpiryTime,
                extensionsUsed: session.extensionsUsed 
            });

            return {
                sessionId,
                expiresAt: newExpiryTime,
                extensionsRemaining: this.config.maxExtensions - session.extensionsUsed
            };

        } catch (error) {
            logger.error('Failed to extend session', { 
                sessionId, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Stop a session
     */
    async stopSession(sessionId, reason = 'user_requested') {
        try {
            const session = await Session.findOne({ vmInstanceId: sessionId });
            if (!session) {
                throw new Error('Session not found');
            }

            if (session.status === 'stopped' || session.status === 'expired') {
                return { sessionId, status: session.status };
            }

            logger.info('Stopping session', { sessionId, reason });

            // Update session status
            session.status = reason === 'expired' ? 'expired' : 'stopped';
            session.endedAt = new Date();
            session.duration = session.endedAt - session.startedAt;
            await session.save();

            // Stop and cleanup VM
            if (session.vmDetails?.vmId) {
                try {
                    await this.vmProvisioner.stopVM(session.vmDetails.vmId);
                    await this.vmProvisioner.deleteVM(session.vmDetails.vmId);
                } catch (vmError) {
                    logger.warn('Failed to cleanup VM', { 
                        sessionId, 
                        vmId: session.vmDetails.vmId,
                        error: vmError.message 
                    });
                }
            }

            // Remove from tracking
            this.activeSessions.delete(sessionId);
            if (this.sessionTimeouts.has(sessionId)) {
                clearTimeout(this.sessionTimeouts.get(sessionId));
                this.sessionTimeouts.delete(sessionId);
            }

            // Update user stats
            await this.updateUserStats(session.userId, session);

            this.emit('sessionStopped', { 
                sessionId, 
                reason,
                duration: session.duration 
            });
            
            // Send WebSocket notification
            websocketService.sendSessionEvent(session.userId, {
                type: 'stopped',
                sessionId,
                reason,
                duration: session.duration,
                timestamp: new Date().toISOString()
            });

            logger.info('Session stopped successfully', { sessionId, reason });

            return { sessionId, status: session.status };

        } catch (error) {
            logger.error('Failed to stop session', { 
                sessionId, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Get session status and info
     */
    async getSessionInfo(sessionId) {
        try {
        const session = await Session.findOne({ vmInstanceId: sessionId })
            .populate('labId', 'name description difficulty category')
            .lean();

            if (!session) {
                throw new Error('Session not found');
            }

            const info = {
                sessionId: session.vmInstanceId,
                status: session.status,
                lab: session.labId,
                startedAt: session.startedAt,
                expiresAt: session.expiresAt,
                duration: session.endedAt ? 
                    session.endedAt - session.startedAt : 
                    Date.now() - session.startedAt,
                connectionInfo: session.connectionInfo,
                flags: Object.keys(session.flags || {}).map(name => ({
                    name,
                    points: session.flags[name].points,
                    hint: session.flags[name].hint,
                    submitted: false // TODO: Check flag submissions
                })),
                extensionsUsed: session.extensionsUsed,
                extensionsRemaining: this.config.maxExtensions - session.extensionsUsed,
                lastActivity: session.lastActivity
            };

            // Add VM status if running
            if (session.status === 'running' && session.vmDetails?.vmId) {
                try {
                    const vmStatus = await this.vmProvisioner.getVMStatus(session.vmDetails.vmId);
                    info.vmStatus = vmStatus;
                } catch (vmError) {
                    info.vmStatus = { state: 'unknown', error: vmError.message };
                }
            }

            return info;

        } catch (error) {
            logger.error('Failed to get session info', { 
                sessionId, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Update user activity for a session
     */
    async updateActivity(sessionId, activityType = 'general') {
        try {
            const session = await Session.findOne({ vmInstanceId: sessionId, status: 'running' });
            if (!session) {
                return false;
            }

            session.lastActivity = new Date();
            await session.save();

            // Update active sessions tracking
            if (this.activeSessions.has(sessionId)) {
                this.activeSessions.get(sessionId).lastActivity = new Date();
            }

            this.emit('sessionActivity', { 
                sessionId, 
                activityType, 
                timestamp: new Date() 
            });

            return true;

        } catch (error) {
            logger.warn('Failed to update session activity', { 
                sessionId, 
                error: error.message 
            });
            return false;
        }
    }

    /**
     * Submit a flag for a session
     */
    async submitFlag(sessionId, flagName, submittedFlag, userId) {
        try {
            const session = await Session.findOne({ vmInstanceId: sessionId, status: 'running' });
            if (!session) {
                throw new Error('Session not found or not running');
            }

            // Convert both to strings for comparison
            if (session.userId.toString() !== userId.toString()) {
                logger.warn('Session ownership mismatch', {
                    sessionUserId: session.userId.toString(),
                    requestUserId: userId.toString(),
                    sessionId
                });
                throw new Error('Session does not belong to user');
            }

            if (!session.flags[flagName]) {
                throw new Error('Flag not found in this session');
            }

            // Check if already submitted
            const existingSubmission = await FlagSubmission.findOne({
                sessionId,
                flagType: flagName,
                isCorrect: true
            });

            if (existingSubmission) {
                return {
                    success: false,
                    message: 'Flag already submitted',
                    points: 0
                };
            }

            // Validate flag directly against session flag value
            const expectedFlag = session.flags[flagName].value;
            const isCorrect = submittedFlag.trim() === expectedFlag;

            const submission = new FlagSubmission({
                sessionId,
                userId,
                labId: session.labId,
                flagType: flagName, // 'user' or 'root'
                submittedFlag,
                expectedFlag: expectedFlag,
                isCorrect,
                pointsAwarded: isCorrect ? session.flags[flagName].points : 0,
                submittedAt: new Date()
            });

            await submission.save();

            // Update session activity
            await this.updateActivity(sessionId, 'flag_submission');

            if (isCorrect) {
                // Get lab information for scoring
                const lab = await Lab.findById(session.labId);
                
                // Process with scoring service
                const scoringResult = await this.scoringService.processFlagSubmission(
                    submission, 
                    session, 
                    lab
                );

                logger.info('Correct flag submitted with scoring', { 
                    sessionId, 
                    flagName, 
                    points: scoringResult.scoreData.totalPoints,
                    newBadges: scoringResult.newBadges.length,
                    ranking: scoringResult.ranking
                });

                this.emit('flagSubmitted', {
                    sessionId,
                    userId,
                    flagName,
                    points: scoringResult.scoreData.totalPoints,
                    badges: scoringResult.newBadges,
                    ranking: scoringResult.ranking
                });
                
                // Send WebSocket notifications
                websocketService.sendFlagSubmissionResult(userId, {
                    success: true,
                    flagName,
                    points: scoringResult.scoreData.totalPoints,
                    scoreBreakdown: {
                        basePoints: scoringResult.scoreData.basePoints,
                        bonusPoints: scoringResult.scoreData.bonusPoints,
                        multiplier: scoringResult.scoreData.multiplier
                    },
                    timestamp: new Date().toISOString()
                });
                
                // Send progress update
                websocketService.sendProgressUpdate(userId, {
                    totalPoints: scoringResult.userStats.totalPoints,
                    currentRank: scoringResult.ranking.currentRank,
                    totalUsers: scoringResult.ranking.totalUsers,
                    badgeCount: scoringResult.userStats.badges?.length || 0
                });
                
                // Send badge notifications if any
                for (const badge of scoringResult.newBadges) {
                    websocketService.sendBadgeNotification(userId, {
                        name: badge.name,
                        description: badge.description,
                        icon: badge.icon,
                        points: badge.points,
                        rarity: badge.rarity,
                        timestamp: new Date().toISOString()
                    });
                }

                return {
                    success: true,
                    message: 'Correct flag!',
                    points: scoringResult.scoreData.totalPoints,
                    scoreBreakdown: {
                        basePoints: scoringResult.scoreData.basePoints,
                        bonusPoints: scoringResult.scoreData.bonusPoints,
                        multiplier: scoringResult.scoreData.multiplier,
                        factors: scoringResult.scoreData.factors
                    },
                    newBadges: scoringResult.newBadges.map(badge => ({
                        name: badge.name,
                        description: badge.description,
                        icon: badge.icon,
                        points: badge.points,
                        rarity: badge.rarity
                    })),
                    userRanking: scoringResult.ranking
                };
            } else {
                return {
                    success: false,
                    message: 'Incorrect flag',
                    points: 0
                };
            }

        } catch (error) {
            logger.error('Failed to submit flag', { 
                sessionId, 
                flagName, 
                error: error.message 
            });
            throw error;
        }
    }

    /**
     * Set timeout for session expiry
     */
    setSessionTimeout(sessionId, expiresAt) {
        // Clear existing timeout
        if (this.sessionTimeouts.has(sessionId)) {
            clearTimeout(this.sessionTimeouts.get(sessionId));
        }

        const timeUntilExpiry = expiresAt.getTime() - Date.now();
        
        if (timeUntilExpiry > 0) {
            const timeout = setTimeout(async () => {
                logger.info('Session expired by timeout', { sessionId });
                await this.stopSession(sessionId, 'expired');
            }, timeUntilExpiry);

            this.sessionTimeouts.set(sessionId, timeout);
        }
    }

    /**
     * Setup cleanup interval for expired sessions
     */
    setupCleanupInterval() {
        setInterval(async () => {
            try {
                await this.cleanupExpiredSessions();
                await this.cleanupInactiveSessions();
            } catch (error) {
                logger.error('Session cleanup failed', { error: error.message });
            }
        }, this.config.sessionCleanupInterval);

        logger.info('Session cleanup interval started', {
            intervalMinutes: this.config.sessionCleanupInterval / 1000 / 60
        });
    }

    /**
     * Cleanup expired sessions
     */
    async cleanupExpiredSessions() {
        const expiredSessions = await Session.find({
            status: { $in: ['running', 'starting'] },
            expiresAt: { $lt: new Date() }
        });

        for (const session of expiredSessions) {
            try {
                await this.stopSession(session.vmInstanceId, 'expired');
                logger.info('Cleaned up expired session', { 
                    sessionId: session.vmInstanceId 
                });
            } catch (error) {
                logger.error('Failed to cleanup expired session', { 
                    sessionId: session.vmInstanceId,
                    error: error.message 
                });
            }
        }

        if (expiredSessions.length > 0) {
            logger.info('Expired sessions cleanup complete', { 
                count: expiredSessions.length 
            });
        }
    }

    /**
     * Cleanup inactive sessions
     */
    async cleanupInactiveSessions() {
        const inactiveThreshold = new Date(Date.now() - this.config.inactivityTimeout);
        
        const inactiveSessions = await Session.find({
            status: 'running',
            lastActivity: { $lt: inactiveThreshold }
        });

        for (const session of inactiveSessions) {
            try {
                await this.stopSession(session.vmInstanceId, 'inactive');
                logger.info('Cleaned up inactive session', { 
                    sessionId: session.vmInstanceId,
                    lastActivity: session.lastActivity 
                });
            } catch (error) {
                logger.error('Failed to cleanup inactive session', { 
                    sessionId: session.vmInstanceId,
                    error: error.message 
                });
            }
        }

        if (inactiveSessions.length > 0) {
            logger.info('Inactive sessions cleanup complete', { 
                count: inactiveSessions.length 
            });
        }
    }

    /**
     * Get count of active sessions
     */
    async getActiveSessionCount() {
        return await Session.countDocuments({
            status: { $in: ['starting', 'running'] }
        });
    }

    /**
     * Update user statistics after session
     */
    async updateUserStats(userId, session) {
        try {
            let userStats = await UserExtension.findOne({ userId });
            if (!userStats) {
                userStats = new UserExtension({ userId });
            }

            // Update session stats
            userStats.totalSessions += 1;
            userStats.totalSessionTime += session.duration || 0;
            userStats.lastActivity = new Date();

            // Update lab completion if flags were found
            const flagSubmissions = await FlagSubmission.find({
                sessionId: session.sessionId,
                isCorrect: true
            });

            if (flagSubmissions.length > 0) {
                const labId = session.labId.toString();
                const existingLab = userStats.completedLabs.find(
                    lab => lab.labId.toString() === labId
                );

                if (existingLab) {
                    existingLab.completedAt = new Date();
                    existingLab.timeSpent += session.duration || 0;
                    existingLab.flagsFound = flagSubmissions.length;
                } else {
                    userStats.completedLabs.push({
                        labId: session.labId,
                        completedAt: new Date(),
                        timeSpent: session.duration || 0,
                        flagsFound: flagSubmissions.length
                    });
                }
            }

            await userStats.save();

        } catch (error) {
            logger.error('Failed to update user stats', { 
                userId, 
                error: error.message 
            });
        }
    }

    /**
     * Get user's active sessions
     */
    async getUserActiveSessions(userId) {
        return await Session.find({
            userId,
            status: { $in: ['starting', 'running'] }
        }).populate('labId', 'name description category difficulty');
    }

    /**
     * Force stop all sessions for a user (admin function)
     */
    async stopUserSessions(userId, reason = 'admin_action') {
        const sessions = await this.getUserActiveSessions(userId);
        const results = [];

        for (const session of sessions) {
            try {
                const result = await this.stopSession(session.vmInstanceId, reason);
                results.push({ sessionId: session.vmInstanceId, success: true, result });
            } catch (error) {
                results.push({ 
                    sessionId: session.vmInstanceId, 
                    success: false, 
                    error: error.message 
                });
            }
        }

        return results;
    }

    /**
     * Get system status and statistics
     */
    async getSystemStatus() {
        const activeSessionsCount = await this.getActiveSessionCount();
        const totalSessions = await Session.countDocuments();
        
        return {
            activeSessions: activeSessionsCount,
            maxConcurrentSessions: this.config.maxConcurrentSessions,
            totalSessions,
            systemLoad: {
                activeSessions: this.activeSessions.size,
                pendingTimeouts: this.sessionTimeouts.size
            },
            config: {
                maxSessionDuration: this.config.maxSessionDuration / 1000 / 60, // minutes
                maxExtensions: this.config.maxExtensions,
                inactivityTimeout: this.config.inactivityTimeout / 1000 / 60 // minutes
            }
        };
    }
}

export default SessionManager;
