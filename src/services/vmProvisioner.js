import { execSync, spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/environment.js';
import LibvirtAdapter from './libvirtAdapter.js';

/**
 * Dynamic VM Provisioner Service
 * Handles KVM/QEMU operations for any VM (qcow2 base images)
 * Supports: Import, Clone, Start, Stop, Delete, Network Configuration
 */
class VMProvisionerService {
  constructor() {
    this.libvirt = LibvirtAdapter;
    this.baseImagesPath = config.vm.baseImagesPath || '/var/lib/libvirt/images';
    this.sessionDisksPath = path.join(this.baseImagesPath, 'sessions');
    this.portRanges = config.ports;
    
    // Track active VMs and port allocations
    this.activeVMs = new Map();
    this.allocatedPorts = new Set();
  }

  /**
   * Initialize the provisioner service
   * Check KVM/libvirt installation and create necessary directories
   */
  async initialize() {
    try {
      // Check libvirt/KVM installation
      await this.checkLibvirtInstallation();
      
      // Create necessary directories
      await this.ensureDirectories();
      
      // Load existing VM state
      await this.loadActiveVMs();
      
      console.log('VM Provisioner Service initialized successfully');
      return { status: 'success', message: 'Provisioner initialized' };
    } catch (error) {
      console.error('Failed to initialize VM Provisioner:', error);
      throw new Error(`Provisioner initialization failed: ${error.message}`);
    }
  }

  /**
   * Import qcow2 base image as template VM
   * @param {string} qcow2Path - Path to qcow2 base image
   * @param {Object} labConfig - Lab configuration object
   * @returns {Promise<Object>} Import result with template base image path
   */
  async importTemplate(qcow2Path, labConfig) {
    try {
      const { name, vmConfig = {} } = labConfig;
      const baseImageName = `${name}-base.qcow2`;
      const baseImagePath = path.join(this.baseImagesPath, baseImageName);
      
      // Verify qcow2 file exists
      await this.verifyVMFile(qcow2Path);
      
      // Check if base image already exists
      try {
        const stats = await fs.stat(baseImagePath);
        if (stats.isFile()) {
          console.log(`Base image ${baseImageName} already exists`);
          return {
            success: true,
            templateId: baseImagePath,
            templateName: baseImageName,
            message: 'Base image already imported'
          };
        }
      } catch (err) {
        // File doesn't exist, proceed with copy
      }

      // Copy qcow2 base image to libvirt storage
      console.log(`Copying ${qcow2Path} to ${baseImagePath}...`);
      await fs.copyFile(qcow2Path, baseImagePath);
      
      console.log(`Base image ${baseImageName} imported successfully`);
      return {
        success: true,
        templateId: baseImagePath,
        templateName: baseImageName,
        baseImagePath,
        message: 'Base image imported and ready for use'
      };
    } catch (error) {
      console.error('Base image import failed:', error);
      throw new Error(`Base image import failed: ${error.message}`);
    }
  }

  /**
   * Create VM instance from base image for user session
   * @param {string} templateId - Base image path (qcow2)
   * @param {string} sessionId - User session ID
   * @param {Object} sessionConfig - Session-specific configuration
   * @returns {Promise<Object>} Instance creation result
   */
  async createInstance(templateId, sessionId, sessionConfig = {}) {
    try {
      const instanceName = `Session-${sessionId}`;
      const { userId, vmConfig = {} } = sessionConfig;

      // Verify base image exists
      const baseImagePath = templateId; // templateId is the base image path
      try {
        await fs.stat(baseImagePath);
      } catch (err) {
        throw new Error(`Base image ${baseImagePath} not found`);
      }

      console.log(`Creating instance ${instanceName} from base image ${baseImagePath}...`);

      // Allocate network configuration
      const { useVPN = false, userSubnet = null } = sessionConfig;
      const networkConfig = await this.allocateNetworkPorts(sessionId, { useVPN, userSubnet });
      const { vmIP } = networkConfig;

      // Create session disk (qcow2 overlay)
      const sessionDiskPath = await this.libvirt.createSessionDisk(baseImagePath, sessionId);

      // Generate MAC address for DHCP
      const macAddress = this.libvirt.generateMacFromSessionId(sessionId);

      // Get VM config
      const ram = vmConfig.ram || config.defaults.vmRam || 2048;
      const vcpus = vmConfig.cpu || config.defaults.vmCpu || 2;

      // Create and start VM
      const domainName = await this.libvirt.createAndStartVM({
        sessionId,
        sessionDiskPath,
        macAddress,
        ramMB: ram,
        vcpus
      });

      // Wait for VM to boot and get IP
      await this.libvirt.waitForVMBoot(domainName);
      const actualIP = await this.libvirt.getVMIPAddress(domainName, macAddress);
      
      if (actualIP) {
        console.log(`VM ${domainName} received IP: ${actualIP}`);
        networkConfig.vmIP = actualIP; // Update with actual IP
      }

      // Track active VM
      this.activeVMs.set(sessionId, {
        vmId: domainName,
        vmName: instanceName,
        templateId: baseImagePath,
        sessionId,
        userId,
        status: 'running',
        networkConfig,
        sessionDiskPath,
        macAddress,
        createdAt: new Date(),
        startedAt: new Date()
      });

      console.log(`Instance ${instanceName} created and started successfully`);
      return {
        success: true,
        instanceId: domainName,
        instanceName,
        sessionId,
        networkConfig,
        status: 'running'
      };
    } catch (error) {
      console.error('Instance creation failed:', error);
      throw new Error(`Instance creation failed: ${error.message}`);
    }
  }

  /**
   * Start VM instance
   * Note: With KVM/libvirt, VMs are started immediately during createInstance.
   * This method is kept for API compatibility but VMs should already be running.
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Start result with connection info
   */
  async startInstance(sessionId) {
    try {
      const vmInfo = this.activeVMs.get(sessionId);
      if (!vmInfo) {
        throw new Error(`No VM instance found for session ${sessionId}`);
      }

      const { vmId, vmName, networkConfig } = vmInfo;
      const domainName = vmId;

      // Check current state
      const currentState = await this.libvirt.getVMState(domainName);
      
      if (currentState === 'running') {
        console.log(`VM instance ${vmName} is already running`);
      } else if (currentState === 'shut off') {
        console.log(`Starting VM instance ${vmName}...`);
        await this.libvirt.startVM(domainName);
        await this.libvirt.waitForVMBoot(domainName);
        
        // Update VM status
        vmInfo.status = 'running';
        vmInfo.startedAt = new Date();
        this.activeVMs.set(sessionId, vmInfo);
      } else {
        throw new Error(`VM ${domainName} is in unexpected state: ${currentState}`);
      }

      // Generate connection information
      const connectionInfo = this.generateConnectionInfo(networkConfig);

      console.log(`VM instance ${vmName} is running`);
      return {
        success: true,
        sessionId,
        vmId,
        status: 'running',
        connectionInfo,
        startedAt: vmInfo.startedAt
      };
    } catch (error) {
      console.error('VM start failed:', error);
      
      // Update status to failed
      const vmInfo = this.activeVMs.get(sessionId);
      if (vmInfo) {
        vmInfo.status = 'failed';
        vmInfo.error = error.message;
        this.activeVMs.set(sessionId, vmInfo);
      }
      
      throw new Error(`VM start failed: ${error.message}`);
    }
  }

  /**
   * Stop VM instance gracefully
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Stop result
   */
  async stopInstance(sessionId) {
    try {
      const vmInfo = this.activeVMs.get(sessionId);
      if (!vmInfo) {
        throw new Error(`No VM instance found for session ${sessionId}`);
      }

      const { vmId, vmName } = vmInfo;
      const domainName = vmId;
      console.log(`Stopping VM instance ${vmName}...`);

      // Stop VM using libvirt
      await this.libvirt.stopVM(domainName);

      // Update VM status
      vmInfo.status = 'stopped';
      vmInfo.stoppedAt = new Date();
      this.activeVMs.set(sessionId, vmInfo);

      console.log(`VM instance ${vmName} stopped successfully`);
      return {
        success: true,
        sessionId,
        vmId,
        status: 'stopped',
        stoppedAt: vmInfo.stoppedAt
      };
    } catch (error) {
      console.error('VM stop failed:', error);
      throw new Error(`VM stop failed: ${error.message}`);
    }
  }

  /**
   * Delete VM instance and cleanup
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} Delete result
   */
  async deleteInstance(sessionId) {
    try {
      const vmInfo = this.activeVMs.get(sessionId);
      if (!vmInfo) {
        console.warn(`No VM instance found for session ${sessionId} - may already be deleted`);
        return { success: true, message: 'Instance already deleted' };
      }

      const { vmId, vmName, networkConfig, sessionDiskPath } = vmInfo;
      const domainName = vmId;
      console.log(`Deleting VM instance ${vmName}...`);

      // Delete VM using libvirt (stops if running, undefines domain, deletes disk)
      await this.libvirt.deleteVM(domainName, sessionDiskPath);

      // Release allocated ports
      this.releaseNetworkPorts(networkConfig);

      // Remove from active VMs
      this.activeVMs.delete(sessionId);

      console.log(`VM instance ${vmName} deleted successfully`);
      return {
        success: true,
        sessionId,
        vmId,
        status: 'deleted'
      };
    } catch (error) {
      console.error('VM deletion failed:', error);
      
      // Still remove from tracking even if deletion failed
      this.activeVMs.delete(sessionId);
      
      throw new Error(`VM deletion failed: ${error.message}`);
    }
  }

  /**
   * Get VM instance status and information
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object>} VM status information
   */
  async getInstanceStatus(sessionId) {
    try {
      const vmInfo = this.activeVMs.get(sessionId);
      if (!vmInfo) {
        return { 
          exists: false, 
          sessionId,
          message: 'VM instance not found' 
        };
      }

      const { vmId, vmName, status, networkConfig } = vmInfo;
      const domainName = vmId;
      
      // Get current VM state from libvirt
      const currentState = await this.libvirt.getVMState(domainName);
      
      // Update status if needed
      if (currentState !== status) {
        vmInfo.status = currentState;
        this.activeVMs.set(sessionId, vmInfo);
      }

      const connectionInfo = this.generateConnectionInfo(networkConfig);

      return {
        exists: true,
        sessionId,
        vmId,
        vmName,
        status: currentState,
        networkConfig,
        connectionInfo,
        createdAt: vmInfo.createdAt,
        startedAt: vmInfo.startedAt,
        stoppedAt: vmInfo.stoppedAt
      };
    } catch (error) {
      console.error('Failed to get VM status:', error);
      throw new Error(`Failed to get VM status: ${error.message}`);
    }
  }

  /**
   * List all active VM instances
   * @returns {Promise<Array>} Array of active VM instances
   */
  async listActiveInstances() {
    const instances = [];
    
    for (const [sessionId, vmInfo] of this.activeVMs.entries()) {
      try {
        const status = await this.getInstanceStatus(sessionId);
        instances.push(status);
      } catch (error) {
        console.warn(`Failed to get status for session ${sessionId}:`, error.message);
      }
    }
    
    return instances;
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Check libvirt/KVM installation
   * @private
   */
  async checkLibvirtInstallation() {
    try {
      const result = execSync('virsh --version', { encoding: 'utf8' });
      console.log(`libvirt/virsh version: ${result.trim()}`);
      return result.trim();
    } catch (error) {
      throw new Error('libvirt/virsh not found. Please install KVM/libvirt stack.');
    }
  }

  /**
   * Ensure required directories exist
   * @private
   */
  async ensureDirectories() {
    const dirs = [this.baseImagesPath, this.sessionDisksPath];
    
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log(`Ensured directory exists: ${dir}`);
      } catch (error) {
        throw new Error(`Failed to create directory ${dir}: ${error.message}`);
      }
    }
  }

  /**
   * Verify VM file exists and is readable
   * @private
   */
  async verifyVMFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        throw new Error(`${filePath} is not a file`);
      }
      
      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      if (ext !== '.qcow2') {
        throw new Error(`Unsupported file type: ${ext}. Only .qcow2 files are supported.`);
      }
      
      console.log(`Verified VM file: ${filePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      return true;
    } catch (error) {
      throw new Error(`VM file verification failed: ${error.message}`);
    }
  }

  /**
   * Find VM by name (libvirt)
   * @private
   */
  async findVMByName(vmName) {
    try {
      const domains = await this.libvirt.listVMs();
      return domains.find(d => d.name === vmName) || null;
    } catch (error) {
      console.warn('Error finding VM by name:', error.message);
      return null;
    }
  }

  /**
   * Allocate network configuration for session
   * Supports HackTheBox-style internal networking via KVM/libvirt
   * @private
   */
  async allocateNetworkPorts(sessionId, options = {}) {
    const { useVPN = false, userSubnet = null, useHackTheBoxStyle = true } = options;
    
    if (useHackTheBoxStyle || (useVPN && userSubnet)) {
      // HackTheBox-style internal networking with libvirt
      const vmIP = this.libvirt.generateIPFromSessionId(sessionId);
      
      return {
        mode: 'hackthebox-internal',
        sessionId,
        vmIP,
        subnet: '10.12.10.0/24',
        netmask: '255.255.255.0',
        gateway: '10.12.10.1',
        dnsServers: ['8.8.8.8', '8.8.4.4'],
        networkName: 'labs-net',
        services: {
          ssh: { ip: vmIP, port: 22 },
          web: { ip: vmIP, port: 80 },
          https: { ip: vmIP, port: 443 },
          ftp: { ip: vmIP, port: 21 },
          mysql: { ip: vmIP, port: 3306 },
          rdp: { ip: vmIP, port: 3389 },
          smb: { ip: vmIP, port: 445 },
          telnet: { ip: vmIP, port: 23 }
        },
        vpnRequired: true
      };
    } else {
      // NAT mode with port forwarding (development fallback)
      const sshPort = this.findAvailablePort(this.portRanges.sshStart, this.portRanges.sshEnd);
      const webPort = this.findAvailablePort(this.portRanges.webStart, this.portRanges.webEnd);
      
      if (!sshPort || !webPort) {
        throw new Error('No available ports for VM networking');
      }
      
      this.allocatedPorts.add(sshPort);
      this.allocatedPorts.add(webPort);
      
      return {
        mode: 'nat',
        sessionId,
        sshPort,
        webPort,
        ipAddress: '127.0.0.1',
        vpnRequired: false
      };
    }
  }
  

  /**
   * Find available port in range
   * @private
   */
  findAvailablePort(startPort, endPort) {
    for (let port = startPort; port <= endPort; port++) {
      if (!this.allocatedPorts.has(port)) {
        return port;
      }
    }
    return null;
  }

  /**
   * Release network resources
   * @private
   */
  releaseNetworkPorts(networkConfig) {
    if (networkConfig && networkConfig.mode === 'nat') {
      // Only release ports for NAT mode
      this.allocatedPorts.delete(networkConfig.sshPort);
      this.allocatedPorts.delete(networkConfig.webPort);
      console.log(`Released ports: SSH=${networkConfig.sshPort}, Web=${networkConfig.webPort}`);
    } else if (networkConfig && networkConfig.mode === 'bridge') {
      // For bridge mode, log the IP release (no ports to release)
      console.log(`Released VPN subnet IP: ${networkConfig.vmIP}`);
    }
  }

  /**
   * Configure VM networking - libvirt handles this automatically
   * Network configuration is done during VM creation in LibvirtAdapter
   * This method is kept for API compatibility
   * @private
   */
  async configureNetworking(vmId, networkConfig) {
    // Network configuration is handled by LibvirtAdapter during createAndStartVM
    // MAC address and network attachment are set in the domain XML
    console.log(`Network configuration for ${vmId} handled by LibvirtAdapter`);
  }

  /**
   * Generate connection information for users
   * @private
   */
  generateConnectionInfo(networkConfig) {
    if (!networkConfig) return null;
    
    if (networkConfig.mode === 'hackthebox-internal') {
      // HackTheBox-style internal networking - VPN required
      const { vmIP, services } = networkConfig;
      
      return {
        mode: 'hackthebox-internal',
        ipAddress: vmIP,
        host: vmIP,
        sshPort: 22,
        webPort: 80,
        webPorts: [80, 443, 8080, 8443],
        username: 'tiago',
        password: null,
        ssh: {
          host: vmIP,
          port: 22,
          command: `ssh tiago@${vmIP}`,
          description: 'SSH access to the lab VM (VPN required)'
        },
        web: {
          url: `http://${vmIP}`,
          description: 'Web interface access via VPN'
        },
        services: {
          ssh: { ip: vmIP, port: 22 },
          web: { ip: vmIP, port: 80 },
          https: { ip: vmIP, port: 443 },
          ftp: { ip: vmIP, port: 21 },
          mysql: { ip: vmIP, port: 3306 },
          rdp: { ip: vmIP, port: 3389 },
          smb: { ip: vmIP, port: 445 },
          telnet: { ip: vmIP, port: 23 }
        },
        vpnRequired: true,
        directAccess: true,
        accessInstructions: [
          '1. Download and install your VPN configuration file',
          '2. Connect to the VPN using OpenVPN client',
          `3. Access the lab VM directly at ${vmIP}`,
          '4. Use standard ports (SSH: 22, Web: 80, etc.)'
        ]
      };
      
    } else if (networkConfig.mode === 'bridge') {
      // VPN Bridge mode - direct IP access
      const { vmIP, services } = networkConfig;
      
      return {
        mode: 'bridge',
        ssh: {
          host: services.ssh.ip,
          port: services.ssh.port,
          command: `ssh user@${services.ssh.ip}`,
          description: 'SSH access to the lab VM via VPN'
        },
        web: {
          url: `http://${services.web.ip}`,
          description: 'Web interface access via VPN'
        },
        ftp: {
          host: services.ftp.ip,
          port: services.ftp.port,
          description: 'FTP access via VPN'
        },
        mysql: {
          host: services.mysql.ip,
          port: services.mysql.port,
          description: 'MySQL database access via VPN'
        },
        general: {
          vmIP,
          directAccess: true,
          vpnRequired: true,
          services: services
        }
      };
      
    } else {
      // NAT mode with port forwarding (development fallback)
      const { ipAddress, sshPort, webPort } = networkConfig;
      
      return {
        mode: 'nat',
        host: ipAddress,
        ipAddress: ipAddress,
        sshPort: sshPort,
        webPort: webPort,
        webPorts: [webPort],
        username: 'tiago',
        password: null,
        ssh: {
          host: ipAddress,
          port: sshPort,
          command: `ssh tiago@${ipAddress} -p ${sshPort}`,
          description: 'SSH access to the lab VM'
        },
        web: {
          url: `http://${ipAddress}:${webPort}`,
          description: 'Web interface access (if available)'
        },
        vpnRequired: false,
        directAccess: false
      };
    }
  }


  /**
   * Load active VMs from previous session (persistence)
   * @private
   */
  async loadActiveVMs() {
    // This could load from a file or database in the future
    // For now, start with empty state
    console.log('Active VM state loaded');
  }


  /**
   * Sleep utility
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export default new VMProvisionerService();