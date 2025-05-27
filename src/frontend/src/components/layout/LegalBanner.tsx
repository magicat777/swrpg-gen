import React from 'react';
import styled from 'styled-components';

const BannerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
  z-index: 1000;
  text-align: center;
`;

const LegalText = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.lightSide.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const LegalBanner: React.FC = () => {
  return (
    <BannerContainer>
      <LegalText>
        Star Wars™ © & TM <Link href="https://www.lucasfilm.com" target="_blank" rel="noopener noreferrer">Lucasfilm Ltd.</Link> 
        {' '}• Unofficial fan application for personal use • No copyright infringement intended
      </LegalText>
    </BannerContainer>
  );
};

export default LegalBanner;