import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
  margin-top: auto;
`;

const LegalText = styled.div`
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  text-align: center;
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

const Disclaimer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const Copyright = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const PersonalUse = styled.div`
  font-style: italic;
  opacity: 0.8;
`;

const Link = styled.a`
  color: ${({ theme }) => theme.colors.lightSide.primary};
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const LegalFooter: React.FC = () => {
  return (
    <FooterContainer>
      <LegalText>
        <Disclaimer>
          This is an unofficial fan-made application for personal, non-commercial use only.
        </Disclaimer>
        
        <Copyright>
          Star Wars™ and all related characters, names, marks, logos, and properties are trademarks and copyrights of 
          <Link href="https://www.lucasfilm.com" target="_blank" rel="noopener noreferrer"> Lucasfilm Ltd.</Link>, 
          a subsidiary of <Link href="https://www.disney.com" target="_blank" rel="noopener noreferrer">The Walt Disney Company</Link>. 
          All rights reserved.
        </Copyright>
        
        <Copyright>
          © & TM Lucasfilm Ltd. Used under Fair Use for educational and personal creative purposes.
        </Copyright>
        
        <PersonalUse>
          No copyright infringement intended. This application is not affiliated with, endorsed by, or sponsored by 
          Lucasfilm Ltd., Disney, or any of their subsidiaries or affiliates.
        </PersonalUse>
      </LegalText>
    </FooterContainer>
  );
};

export default LegalFooter;