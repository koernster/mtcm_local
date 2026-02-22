/**
 * Maintenance Mode Utility
 * 
 * This utility helps manage maintenance mode for the application.
 * When maintenance mode is enabled, all routes will redirect to the maintenance page.
 */

// Environment variable to control maintenance mode
const MAINTENANCE_MODE = process.env.REACT_APP_MAINTENANCE_MODE === 'true';

// Manual override for development/testing
const MANUAL_MAINTENANCE_OVERRIDE = false;

/**
 * Check if the application is in maintenance mode
 * @returns {boolean} true if in maintenance mode
 */
export const isMaintenanceMode = (): boolean => {
  return MAINTENANCE_MODE || MANUAL_MAINTENANCE_OVERRIDE;
};

/**
 * Get the maintenance mode status with additional metadata
 * @returns {object} maintenance status object
 */
export const getMaintenanceStatus = () => {
  return {
    isActive: isMaintenanceMode(),
    reason: MAINTENANCE_MODE ? 'Environment variable enabled' : 
            MANUAL_MAINTENANCE_OVERRIDE ? 'Manual override enabled' : 
            'Not in maintenance mode',
    estimatedDuration: '2-3 hours',
    startTime: new Date().toISOString(),
    contactEmail: 'support@mtcm.dev',
    contactPhone: '+1 (555) 123-4567'
  };
};

/**
 * List of paths that should be accessible during maintenance
 */
export const MAINTENANCE_EXEMPT_PATHS = [
  '/maintenance',
  '/maintenance-mode',
  '/health',
  '/status'
];

/**
 * Check if a path should be accessible during maintenance
 * @param {string} path - The current path
 * @returns {boolean} true if path should be accessible
 */
export const isPathExemptFromMaintenance = (path: string): boolean => {
  return MAINTENANCE_EXEMPT_PATHS.some(exemptPath => 
    path.startsWith(exemptPath)
  );
};
