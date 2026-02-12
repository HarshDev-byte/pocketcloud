const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Windows-specific configuration for PocketCloud
 * Adapts the Linux-based config for Windows environments
 */

/**
 * Get or generate session secret
 * Generates once, saves to .pocketcloud-secret, reuses on restart
 */
function getSessionSecret() {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  
  const secretFile = path.join(process.cwd(), '.pocketcloud-secret');
  
  // Try to read existing secret
  if (fs.existsSync(secretFile)) {
    try {
      return fs.readFileSync(secretFile, 'utf8').trim();
    } catch (error) {
      console.warn('Could not read session secret file, generating new one');
    }
  }
  
  // Generate new secret
  const secret = crypto.randomBytes(32).toString('hex');
  
  // Save for future restarts
  try {
    fs.writeFileSync(secretFile, secret, { mode: 0o600 });
    console.log('✓ Generated new session secret');
  } catch (error) {
    console.warn('Could not save session secret file, will regenerate on restart');
  }
  
  return secret;
}

/**
 * Get storage path for Windows
 * Uses environment variable STORAGE_PATH if set, otherwise defaults to dev-storage
 */
function getStorageRoot() {
  // If STORAGE_PATH is set (from our batch script), use it
  if (process.env.STORAGE_PATH) {
    return process.env.STORAGE_PATH;
  }
  
  // Development mode: use local directory
  if (process.env.NODE_ENV === 'development' || process.env.POCKETCLOUD_DEV_MODE === 'true') {
    return path.join(process.cwd(), 'dev-storage');
  }
  
  // Default for Windows: use a local directory
  return path.join(process.cwd(), 'storage');
}

// Windows-adapted configuration for PocketCloud
const config = {
  // Server configuration
  PORT: parseInt(process.env.PORT, 10) || 3000,
  
  // Storage configuration - Windows compatible
  STORAGE_ROOT: getStorageRoot(),
  
  // Upload limits (1GB default - streaming supports it)
  MAX_UPLOAD_SIZE: parseInt(process.env.MAX_UPLOAD_SIZE, 10) || (1024 * 1024 * 1024),
  
  // Session configuration
  SESSION_SECRET: getSessionSecret(),
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  
  // Database configuration
  DB_PATH: process.env.DB_PATH || path.join(process.cwd(), 'data', 'pocketcloud.db'),
  
  // Windows-specific settings
  IS_WINDOWS: true,
  PLATFORM: 'windows'
};

// Log the storage path for debugging
console.log('Storage root configured as:', config.STORAGE_ROOT);

module.exports = config;