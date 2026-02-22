/**
 * Maintenance Mode Utilities
 * 
 * This utility helps manage maintenance mode for the application.
 */

// Check if maintenance mode is enabled
export const isMaintenanceModeEnabled = (): boolean => {
  // Check environment variable first
  const envMaintenanceMode = process.env.REACT_APP_MAINTENANCE_MODE === 'true';
  
  // Check localStorage for manual override (useful for testing)
  const localStorageOverride = localStorage.getItem('maintenanceMode') === 'true';
  
  // Check if there's a maintenance flag in sessionStorage (for temporary maintenance)
  const sessionOverride = sessionStorage.getItem('maintenanceMode') === 'true';
  
  return envMaintenanceMode || localStorageOverride || sessionOverride;
};

// Enable maintenance mode manually (for testing/admin)
export const enableMaintenanceMode = (): void => {
  localStorage.setItem('maintenanceMode', 'true');
  window.location.reload();
};

// Disable maintenance mode manually
export const disableMaintenanceMode = (): void => {
  localStorage.removeItem('maintenanceMode');
  sessionStorage.removeItem('maintenanceMode');
  window.location.reload();
};

// Check if current path should bypass maintenance mode
export const shouldBypassMaintenance = (pathname: string): boolean => {
  const exemptPaths = [
    '/maintenance'
  ];
  
  return exemptPaths.some(path => pathname.startsWith(path));
};

// Get maintenance status info
export const getMaintenanceStatus = () => {
  return {
    isActive: isMaintenanceModeEnabled(),
    reason: process.env.REACT_APP_MAINTENANCE_MODE === 'true' ? 'Environment variable enabled' : 
            localStorage.getItem('maintenanceMode') === 'true' ? 'Manual override enabled' : 
            sessionStorage.getItem('maintenanceMode') === 'true' ? 'Session override enabled' :
            'Not in maintenance mode',
    estimatedDuration: '2-3 hours',
    startTime: new Date().toISOString(),
    contactEmail: 'support@mtcm.dev',
    contactPhone: '+1 (555) 123-4567'
  };
};
