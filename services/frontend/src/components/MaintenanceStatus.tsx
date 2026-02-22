import React from 'react';
import styled from 'styled-components';
import { dateUtils } from '../utils/formatters';
import { Card } from 'react-bootstrap';
import { FaInfoCircle, FaCog, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { getMaintenanceStatus } from '../lib/maintenanceMode';

const StatusCard = styled(Card)`
  background: ${({ theme }) => theme.background};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatusHeader = styled(Card.Header)`
  background: ${({ theme }) => theme.hover};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const StatusBadge = styled.span<{ status: 'active' | 'inactive' }>`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${({ status, theme }) => status === 'active' ? `
    background: ${theme.warning};
    color: #000;
  ` : `
    background: ${theme.success};
    color: #fff;
  `}
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  color: ${({ theme }) => theme.textMuted};
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: ${({ theme }) => theme.text};
`;

/**
 * MaintenanceStatus Component
 * 
 * Displays the current maintenance status for administrators
 */
const MaintenanceStatus: React.FC = () => {
  const status = getMaintenanceStatus();

  return (
    <StatusCard>
      <StatusHeader>
        {status.isActive ? (
          <FaExclamationTriangle color="#fbbf24" />
        ) : (
          <FaCheckCircle color="#22c55e" />
        )}
        <h6 style={{ margin: 0 }}>Maintenance Status</h6>
        <StatusBadge status={status.isActive ? 'active' : 'inactive'}>
          {status.isActive ? 'Active' : 'Inactive'}
        </StatusBadge>
      </StatusHeader>
      
      <Card.Body>
        <InfoRow>
          <InfoLabel>Status:</InfoLabel>
          <InfoValue>{status.isActive ? 'Under Maintenance' : 'Operational'}</InfoValue>
        </InfoRow>
        
        <InfoRow>
          <InfoLabel>Reason:</InfoLabel>
          <InfoValue>{status.reason}</InfoValue>
        </InfoRow>
        
        {status.isActive && (
          <>
            <InfoRow>
              <InfoLabel>Estimated Duration:</InfoLabel>
              <InfoValue>{status.estimatedDuration}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Start Time:</InfoLabel>
              <InfoValue>{dateUtils.format(status.startTime, { format: 'medium' })}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Contact Email:</InfoLabel>
              <InfoValue>{status.contactEmail}</InfoValue>
            </InfoRow>
            
            <InfoRow>
              <InfoLabel>Contact Phone:</InfoLabel>
              <InfoValue>{status.contactPhone}</InfoValue>
            </InfoRow>
          </>
        )}
      </Card.Body>
    </StatusCard>
  );
};

export default MaintenanceStatus;
