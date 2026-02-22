import React, { useState, useEffect } from 'react';
import { Button, Card, Alert, Badge } from 'react-bootstrap';
import { FaTools, FaCheck, FaTimes } from 'react-icons/fa';
import { 
  isMaintenanceModeEnabled, 
  enableMaintenanceMode, 
  disableMaintenanceMode 
} from '../utils/maintenanceMode';

const MaintenanceControl: React.FC = () => {
  const [maintenanceEnabled, setMaintenanceEnabled] = useState<boolean>(false);

  useEffect(() => {
    setMaintenanceEnabled(isMaintenanceModeEnabled());
  }, []);

  const handleToggleMaintenance = () => {
    if (maintenanceEnabled) {
      disableMaintenanceMode();
    } else {
      enableMaintenanceMode();
    }
  };

  return (
    <Card className="mb-3">
      <Card.Header>
        <FaTools className="me-2" />
        Maintenance Mode Control
      </Card.Header>
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h6 className="mb-1">Current Status:</h6>
            <Badge bg={maintenanceEnabled ? 'warning' : 'success'} className="d-flex align-items-center w-auto">
              {maintenanceEnabled ? (
                <>
                  <FaTimes className="me-1" />
                  Maintenance Mode ON
                </>
              ) : (
                <>
                  <FaCheck className="me-1" />
                  System Online
                </>
              )}
            </Badge>
          </div>
          <Button
            variant={maintenanceEnabled ? 'success' : 'warning'}
            onClick={handleToggleMaintenance}
            size="sm"
          >
            {maintenanceEnabled ? 'Disable Maintenance' : 'Enable Maintenance'}
          </Button>
        </div>
        
        {maintenanceEnabled && (
          <Alert variant="warning" className="mt-3 mb-0">
            <small>
              <strong>Note:</strong> Maintenance mode is currently active. 
              Users will be redirected to the maintenance page.
            </small>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default MaintenanceControl;
