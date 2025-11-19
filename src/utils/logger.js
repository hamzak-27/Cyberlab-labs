import { config } from '../config/environment.js';

/**
 * Simple logger utility for the application
 * Provides structured logging with different levels
 */
class Logger {
  constructor() {
    this.level = config.logging?.level || 'info';
    this.levels = {
      error: 0,
      warn: 1,
      info: 2,
      debug: 3
    };
  }

  /**
   * Log error messages
   */
  error(message, meta = {}) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, meta);
    }
  }

  /**
   * Log warning messages
   */
  warn(message, meta = {}) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, meta);
    }
  }

  /**
   * Log info messages
   */
  info(message, meta = {}) {
    if (this.shouldLog('info')) {
      console.log(`[INFO] ${message}`, meta);
    }
  }

  /**
   * Log debug messages
   */
  debug(message, meta = {}) {
    if (this.shouldLog('debug')) {
      console.log(`[DEBUG] ${message}`, meta);
    }
  }

  /**
   * Check if message should be logged based on current level
   * @private
   */
  shouldLog(level) {
    return this.levels[level] <= this.levels[this.level];
  }
}

// Export singleton instance
const logger = new Logger();

export default logger;
export { logger };