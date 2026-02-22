import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isMaintenanceModeEnabled, shouldBypassMaintenance } from '../utils/maintenanceMode';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

/**
 * MaintenanceGuard Component
 * 
 * This component wraps the app and automatically redirects to maintenance mode
 * when maintenance is enabled, except for exempt paths.
 */
const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if maintenance mode is active
    if (isMaintenanceModeEnabled()) {
      // Allow access to maintenance-related pages
      if (!shouldBypassMaintenance(location.pathname)) {
        // Redirect to maintenance page
        navigate('/maintenance', { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  // If in maintenance mode and not on an exempt path, don't render children
  if (isMaintenanceModeEnabled() && !shouldBypassMaintenance(location.pathname)) {
    return null;
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
