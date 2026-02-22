import React from 'react';
import styled, { keyframes } from 'styled-components';
import logo from '../../assets/mtcm_logo_ok.webp';

const pulseAndFade = keyframes`
  0% {
    opacity: 0.7;
    transform: scale(0.98);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
  100% {
    opacity: 0.7;
    transform: scale(0.98);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: ${({ theme }) => theme.background};
`;

const LogoContainer = styled.div`
  animation: ${pulseAndFade} 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

const Logo = styled.img`
  width: 200px;
  height: auto;
  object-fit: contain;
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.text};
  margin-top: 20px;
  font-size: 16px;
  letter-spacing: 0.5px;
  opacity: 0.8;
`;

const LoadingSpinner: React.FC = () => {
  
  return (
    <LoadingContainer>
      <LogoContainer>
        <Logo src={logo} alt="MTCM Logo" />
      </LogoContainer>
      <LoadingText>Initializing...</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingSpinner;
