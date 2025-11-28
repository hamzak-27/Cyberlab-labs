import { execSync } from 'child_process';
import { promisify } from 'util';
import { exec } from 'child_process';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * LibvirtAdapter - Wrapper for KVM/QEMU operations via virsh and qemu-img
 * Replaces VBoxManage calls with libvirt equivalents
 */
class LibvirtAdapter {
  constructor(config = {}) {
    this.baseImagesPath = config.baseImagesPath || '/var/lib/libvirt/images';
    this.sessionsPath = config.sessionsPath || '/var/lib/libvirt/images/sessions';
    this.networkName = config.networkName || 'labs-net';
  }

  /**
   * Execute virsh command synchronously
   * @private
   */
  executeVirshSync(args, options = {}) {
    const command = `virsh ${args.join(' ')}`;
    try {
      const result = execSync(command, {
        encoding: 'utf8',
        timeout: options.timeout || 60000,
        maxBuffer: 1024 * 1024,
        ...options
      });
      return result.trim();
    } catch (error) {
      throw new Error(`Virsh command failed: ${error.message}\nCommand: ${command}`);
    }
  }

  /**
   * Execute virsh command asynchronously
   * @private
   */
  async executeVirsh(args, options = {}) {
    const command = `virsh ${args.join(' ')}`;
    try {
      const { stdout } = await execAsync(command, {
        timeout: options.timeout || 60000,
        maxBuffer: 1024 * 1024
      });
      return stdout.trim();
    } catch (error) {
      throw new Error(`Virsh command failed: ${error.message}\nCommand: ${command}`);
    }
  }

  /**
   * Execute qemu-img command
   * @private
   */
  async executeQemuImg(args) {
    const command = `qemu-img ${args.join(' ')}`;
    try {
      const { stdout } = await execAsync(command);
      return stdout.trim();
    } catch (error) {
      throw new Error(`qemu-img command failed: ${error.message}\nCommand: ${command}`);
    }
  }

  /**
   * Create a copy-on-write overlay disk for a session
   * @param {string} baseImagePath - Path to base qcow2 image
   * @param {string} sessionId - Unique session identifier
   * @returns {Promise<string>} Path to the created overlay disk
   */
  async createSessionDisk(baseImagePath, sessionId) {
    const overlayPath = path.join(this.sessionsPath, `${sessionId}.qcow2`);
    
    console.log(`Creating overlay disk for session ${sessionId}`);
    await this.executeQemuImg([
      'create',
      '-f', 'qcow2',
      '-F', 'qcow2',
      '-b', baseImagePath,
      overlayPath
    ]);
    
    console.log(`Overlay disk created: ${overlayPath}`);
    return overlayPath;
  }

  /**
   * Generate MAC address from session ID for deterministic IPs
   * @param {string} sessionId - Session identifier
   * @returns {string} MAC address in format 52:54:00:XX:XX:XX
   */
  generateMacFromSessionId(sessionId) {
    const hash = crypto.createHash('md5').update(sessionId).digest('hex');
    // Use 52:54:00 prefix (QEMU/KVM standard range)
    return `52:54:00:${hash.slice(0, 2)}:${hash.slice(2, 4)}:${hash.slice(4, 6)}`;
  }

  /**
   * Generate deterministic IP from session ID
   * @param {string} sessionId - Session identifier
   * @returns {string} IP address in 10.12.10.x range
   */
  generateIPFromSessionId(sessionId) {
    const hash = crypto.createHash('md5').update(sessionId).digest('hex');
    const ipSuffix = (parseInt(hash.slice(0, 2), 16) % 190) + 10; // 10-199
    return `10.12.10.${ipSuffix}`;
  }

  /**
   * Create domain XML for a VM
   * @param {Object} vmConfig - VM configuration
   * @returns {string} XML definition
   */
  generateDomainXML(vmConfig) {
    const {
      name,
      memory = 2048,
      vcpus = 2,
      diskPath,
      macAddress,
      networkName = this.networkName
    } = vmConfig;

    return `<domain type='kvm'>
  <name>${name}</name>
  <memory unit='MiB'>${memory}</memory>
  <vcpu placement='static'>${vcpus}</vcpu>
  <os>
    <type arch='x86_64' machine='pc'>hvm</type>
    <boot dev='hd'/>
  </os>
  <features>
    <acpi/>
    <apic/>
  </features>
  <clock offset='utc'/>
  <on_poweroff>destroy</on_poweroff>
  <on_reboot>restart</on_reboot>
  <on_crash>destroy</on_crash>
  <devices>
    <emulator>/usr/bin/qemu-system-x86_64</emulator>
    <disk type='file' device='disk'>
      <driver name='qemu' type='qcow2'/>
      <source file='${diskPath}'/>
      <target dev='vda' bus='virtio'/>
    </disk>
    <interface type='network'>
      <mac address='${macAddress}'/>
      <source network='${networkName}'/>
      <model type='virtio'/>
    </interface>
    <console type='pty'>
      <target type='serial' port='0'/>
    </console>
    <graphics type='vnc' port='-1' autoport='yes' listen='127.0.0.1'/>
  </devices>
</domain>`;
  }

  /**
   * Define and start a VM
   * @param {Object} vmConfig - VM configuration with sessionId, sessionDiskPath, macAddress, ramMB, vcpus
   * @returns {Promise<string>} Domain name
   */
  async createAndStartVM(vmConfig) {
    const { sessionId, sessionDiskPath, macAddress, ramMB = 2048, vcpus = 2 } = vmConfig;
    const domainName = `Session-${sessionId}`;

    try {
      // Generate domain XML
      const xml = this.generateDomainXML({
        name: domainName,
        memory: ramMB,
        vcpus,
        diskPath: sessionDiskPath,
        macAddress,
        networkName: this.networkName
      });

      // Write XML to temp file
      const xmlPath = `/tmp/${domainName}.xml`;
      await fs.writeFile(xmlPath, xml);

      // Define the domain
      console.log(`Defining domain ${domainName}`);
      await this.executeVirsh(['define', xmlPath]);

      // Start the domain
      console.log(`Starting domain ${domainName}`);
      await this.executeVirsh(['start', domainName]);

      // Clean up temp XML
      await fs.unlink(xmlPath).catch(() => {});

      return domainName;
    } catch (error) {
      console.error(`Failed to create/start VM ${domainName}:`, error);
      throw error;
    }
  }

  /**
   * Get VM state
   * @param {string} vmName - Name of the VM
   * @returns {Promise<string>} State (running, shut off, etc.)
   */
  async getVMState(vmName) {
    try {
      const state = await this.executeVirsh(['domstate', vmName]);
      return state.toLowerCase();
    } catch (error) {
      return 'not found';
    }
  }

  /**
   * Wait for VM to reach running state
   * @param {string} vmName - Name of the VM
   * @param {number} maxWaitMs - Maximum wait time in milliseconds
   * @returns {Promise<boolean>} True if running, false if timeout
   */
  async waitForVMBoot(vmName, maxWaitMs = 30000) {
    const startTime = Date.now();
    const checkInterval = 2000;

    console.log(`Waiting for VM ${vmName} to boot...`);

    while (Date.now() - startTime < maxWaitMs) {
      const state = await this.getVMState(vmName);
      
      if (state === 'running') {
        console.log(`✅ VM ${vmName} is running`);
        return true;
      }

      await this.sleep(checkInterval);
    }

    console.warn(`⚠️ VM ${vmName} did not reach running state within ${maxWaitMs}ms`);
    return false;
  }

  /**
   * Get IP address for a VM from DHCP leases
   * @param {string} vmName - Name of the VM
   * @param {string} macAddress - MAC address of the VM
   * @returns {Promise<string|null>} IP address or null if not found
   */
  async getVMIPAddress(vmName, macAddress) {
    try {
      const leases = await this.executeVirsh(['net-dhcp-leases', this.networkName]);
      
      // Parse the DHCP leases output
      const lines = leases.split('\n');
      for (const line of lines) {
        if (line.includes(macAddress.toLowerCase()) || line.includes(macAddress.toUpperCase())) {
          // Extract IP from line (format: "... 10.12.10.100/24 ...")
          const match = line.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/\d+/);
          if (match) {
            console.log(`Found IP ${match[1]} for VM ${vmName}`);
            return match[1];
          }
        }
      }

      console.warn(`No IP found for VM ${vmName} with MAC ${macAddress}`);
      return null;
    } catch (error) {
      console.error(`Failed to get IP for VM ${vmName}:`, error.message);
      return null;
    }
  }

  /**
   * Start a VM
   * @param {string} vmName - Name of the VM
   * @returns {Promise<void>}
   */
  async startVM(vmName) {
    try {
      const state = await this.getVMState(vmName);
      if (state === 'shut off') {
        console.log(`Starting VM ${vmName}`);
        await this.executeVirsh(['start', vmName]);
      } else if (state === 'running') {
        console.log(`VM ${vmName} is already running`);
      } else {
        throw new Error(`Cannot start VM ${vmName} in state: ${state}`);
      }
    } catch (error) {
      console.error(`Failed to start VM ${vmName}:`, error.message);
      throw error;
    }
  }

  /**
   * Stop (destroy) a VM
   * @param {string} vmName - Name of the VM
   * @returns {Promise<void>}
   */
  async stopVM(vmName) {
    try {
      const state = await this.getVMState(vmName);
      if (state === 'running') {
        console.log(`Stopping VM ${vmName}`);
        await this.executeVirsh(['destroy', vmName]);
      }
    } catch (error) {
      console.warn(`Failed to stop VM ${vmName}:`, error.message);
    }
  }

  /**
   * Delete a VM and its disk
   * @param {string} vmName - Name of the VM
   * @param {string} diskPath - Path to the VM's disk
   * @returns {Promise<void>}
   */
  async deleteVM(vmName, diskPath) {
    try {
      // Stop the VM if running
      await this.stopVM(vmName);

      // Undefine the domain
      console.log(`Undefining domain ${vmName}`);
      await this.executeVirsh(['undefine', vmName]);

      // Delete the disk
      if (diskPath) {
        console.log(`Deleting disk ${diskPath}`);
        await fs.unlink(diskPath).catch(err => {
          console.warn(`Failed to delete disk ${diskPath}:`, err.message);
        });
      }

      console.log(`✅ VM ${vmName} deleted successfully`);
    } catch (error) {
      console.error(`Failed to delete VM ${vmName}:`, error.message);
      throw error;
    }
  }

  /**
   * List all defined domains
   * @returns {Promise<Array<string>>} Array of domain names
   */
  async listVMs() {
    try {
      const result = await this.executeVirsh(['list', '--all', '--name']);
      return result.split('\n').filter(name => name.trim());
    } catch (error) {
      console.error('Failed to list VMs:', error.message);
      return [];
    }
  }

  /**
   * Sleep utility
   * @private
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default LibvirtAdapter;
