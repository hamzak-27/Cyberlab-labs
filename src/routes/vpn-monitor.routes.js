import { Router } from 'express';
import vpnMonitor from '../services/vpn-monitor.service.js';
import { authorization, adminOnly } from '../middleware/auth.js';

const router = Router();

/**
 * @route GET /api/vpn-monitor/status/:userId
 * @desc Get VPN connection status for specific user
 * @access Private
 */
router.get('/status/:userId', authorization, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Users can only check their own status, admins can check anyone's
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only check your own VPN status'
      });
    }
    
    const status = vpnMonitor.getConnectionStatus(userId);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting VPN status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get VPN connection status'
    });
  }
});

/**
 * @route GET /api/vpn-monitor/status
 * @desc Get current user's VPN connection status
 * @access Private
 */
router.get('/status', authorization, async (req, res) => {
  try {
    const status = vpnMonitor.getConnectionStatus(req.user.id);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error getting VPN status:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get VPN connection status'
    });
  }
});

/**
 * @route GET /api/vpn-monitor/connections
 * @desc Get all active VPN connections (Admin only)
 * @access Admin
 */
router.get('/connections', authorization, adminOnly, async (req, res) => {
  try {
    const connections = vpnMonitor.getAllConnections();
    
    res.json({
      success: true,
      data: {
        connections,
        total: connections.length,
        active: connections.filter(c => c.connected).length
      }
    });
  } catch (error) {
    console.error('Error getting VPN connections:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get VPN connections'
    });
  }
});

/**
 * @route GET /api/vpn-monitor/stats
 * @desc Get VPN connection statistics (Admin only)
 * @access Admin
 */
router.get('/stats', authorization, adminOnly, async (req, res) => {
  try {
    const stats = vpnMonitor.getConnectionStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting VPN stats:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get VPN statistics'
    });
  }
});

/**
 * @route GET /api/vpn-monitor/health
 * @desc Check VPN monitoring service health
 * @access Private
 */
router.get('/health', authorization, async (req, res) => {
  try {
    const health = {
      monitoring: vpnMonitor.isMonitoring,
      totalConnections: vpnMonitor.activeConnections.size,
      lastCheck: new Date().toISOString(),
      status: vpnMonitor.isMonitoring ? 'healthy' : 'stopped'
    };
    
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error getting VPN monitor health:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to get VPN monitor health status'
    });
  }
});

/**
 * @route POST /api/vpn-monitor/start
 * @desc Start VPN monitoring (Admin only)
 * @access Admin
 */
router.post('/start', authorization, adminOnly, async (req, res) => {
  try {
    if (vpnMonitor.isMonitoring) {
      return res.json({
        success: true,
        message: 'VPN monitoring is already running'
      });
    }
    
    await vpnMonitor.startMonitoring();
    
    res.json({
      success: true,
      message: 'VPN monitoring started successfully'
    });
  } catch (error) {
    console.error('Error starting VPN monitoring:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to start VPN monitoring'
    });
  }
});

/**
 * @route POST /api/vpn-monitor/stop
 * @desc Stop VPN monitoring (Admin only)
 * @access Admin
 */
router.post('/stop', authorization, adminOnly, async (req, res) => {
  try {
    vpnMonitor.stopMonitoring();
    
    res.json({
      success: true,
      message: 'VPN monitoring stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping VPN monitoring:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to stop VPN monitoring'
    });
  }
});

export default router;
