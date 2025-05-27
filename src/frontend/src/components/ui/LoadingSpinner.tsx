import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: number;
  fullScreen?: boolean;
  message?: string;
}

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const FullScreenContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.neutral.background};
  z-index: 9999;
`;

const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StyledSpinner = styled(Loader2)<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  color: ${({ theme }) => theme.colors.lightSide.primary};
  animation: ${spin} 1s linear infinite;
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
  margin: 0;
`;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 24,
  fullScreen = false,
  message,
}) => {
  const spinner = (
    <SpinnerContainer>
      <StyledSpinner $size={size} />
      {message && <Message>{message}</Message>}
    </SpinnerContainer>
  );

  if (fullScreen) {
    return <FullScreenContainer>{spinner}</FullScreenContainer>;
  }

  return spinner;
};

export default LoadingSpinner;