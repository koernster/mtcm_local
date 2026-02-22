import React from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { FaTools, FaClock } from 'react-icons/fa';
import { themes } from '../context/ThemeContext';

const FullScreenContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  padding: 20px;
`;

const MaintenanceCard = styled.div`
  background: ${({ theme }) => theme.hover};
  border: 2px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 40px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
`;

const Icon = styled(FaTools)`
  font-size: 4rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 24px;
  animation: heartbeat 2s ease-in-out infinite;

  @keyframes heartbeat {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.text};
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.textMuted};
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: ${({ theme }) => theme.background};
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ theme }) => theme.border};
  font-weight: 600;
  color: ${({ theme }) => theme.primary};
`;

const StandaloneMaintenancePage: React.FC = () => {
  const currentTheme = themes.dark;

  return (
    <ThemeProvider theme={currentTheme}>
      <FullScreenContainer>
        <MaintenanceCard>
          <Icon />
          <Title>Under Maintenance</Title>
          <Description>
            We're currently performing scheduled maintenance to improve our services. 
            We'll be back online shortly.
          </Description>
          <StatusInfo>
            <FaClock size={18} />
            <span>Estimated time: 2-3 hours</span>
          </StatusInfo>
        </MaintenanceCard>
      </FullScreenContainer>
    </ThemeProvider>
  );
};

export default StandaloneMaintenancePage;
