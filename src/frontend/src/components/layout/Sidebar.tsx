import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { SessionCreationModal } from '../session/SessionCreationModal';
import { 
  DeathStarIcon, 
  LightsaberIcon, 
  RebelIcon, 
  ImperialIcon,
  JediIcon,
  MandalorianIcon,
  StarWarsIcons
} from '../ui/StarWarsIcons';

const SidebarContainer = styled.aside`
  width: 250px;
  background-image: url('/images/sidebar-background.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: local;
  border-right: 1px solid ${({ theme }) => theme.colors.neutral.border};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  position: relative;
  
  /* Subtle overlay to ensure text readability */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.neutral.surface};
    opacity: 0.1;
    pointer-events: none;
    z-index: 1;
  }
  
  /* Ensure content is above the overlay */
  > * {
    position: relative;
    z-index: 2;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none; // Hide sidebar on mobile/tablet for now
  }
`;

const Logo = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(1px);
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LogoIcon = styled.div`
  color: ${({ theme }) => theme.colors.lightSide.primary};
`;

const LogoText = styled.h2`
  font-family: ${({ theme }) => theme.typography.fontFamily.logo};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.black};
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.lightSide.primary};
  margin: 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.lightSide.primary}, ${({ theme }) => theme.colors.lightSide.secondary});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Navigation = styled.nav`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md} 0;
`;

const NavSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-family: ${({ theme }) => theme.typography.fontFamily.technical};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: 0 ${({ theme }) => theme.spacing.md};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.neutral.text};
  text-decoration: none;
  font-family: ${({ theme }) => theme.typography.fontFamily.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  letter-spacing: 0.02em;
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral.background};
    color: ${({ theme }) => theme.colors.lightSide.primary};
  }
  
  &.active {
    background-color: ${({ theme }) => theme.colors.lightSide.primary}15;
    color: ${({ theme }) => theme.colors.lightSide.primary};
    border-right: 3px solid ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: calc(100% - ${({ theme }) => theme.spacing.lg});
  margin: 0 ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.lightSide.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightSide.secondary};
    box-shadow: ${({ theme }) => theme.effects.shadow.md};
  }
`;

export const Sidebar: React.FC = () => {
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  return (
    <SidebarContainer>
      <Logo>
        <LogoContainer>
          <img 
            src="/images/swrpg-logo.svg" 
            alt="SWRPG Story Generator" 
            style={{ 
              width: '240px', 
              height: '80px', 
              maxWidth: '100%',
              objectFit: 'contain'
            }} 
          />
        </LogoContainer>
      </Logo>
      
      <CreateButton onClick={() => setIsSessionModalOpen(true)}>
        <Plus size={16} />
        New Mission
      </CreateButton>
      
      <Navigation>
        <NavSection>
          <SectionTitle>Main</SectionTitle>
          <NavList>
            <NavItem>
              <StyledNavLink to="/dashboard">
                <DeathStarIcon size={16} />
                Command Center
              </StyledNavLink>
            </NavItem>
          </NavList>
        </NavSection>
        
        <NavSection>
          <SectionTitle>Galaxy Operations</SectionTitle>
          <NavList>
            <NavItem>
              <StyledNavLink to="/sessions">
                <LightsaberIcon size={16} />
                Missions
              </StyledNavLink>
            </NavItem>
            <NavItem>
              <StyledNavLink to="/characters">
                <RebelIcon size={16} />
                Heroes
              </StyledNavLink>
            </NavItem>
            <NavItem>
              <StyledNavLink to="/locations">
                <ImperialIcon size={16} />
                Sectors
              </StyledNavLink>
            </NavItem>
            <NavItem>
              <StyledNavLink to="/galaxy-map">
                <StarWarsIcons.galaxyMap size={16} />
                Galaxy Map
              </StyledNavLink>
            </NavItem>
            <NavItem>
              <StyledNavLink to="/lore">
                <MandalorianIcon size={16} />
                Archives
              </StyledNavLink>
            </NavItem>
            <NavItem>
              <StyledNavLink to="/timeline">
                <JediIcon size={16} />
                Timeline
              </StyledNavLink>
            </NavItem>
          </NavList>
        </NavSection>
        
        <NavSection>
          <SectionTitle>Imperial Systems</SectionTitle>
          <NavList>
            <NavItem>
              <StyledNavLink to="/settings">
                <ImperialIcon size={16} />
                Imperial Config
              </StyledNavLink>
            </NavItem>
          </NavList>
        </NavSection>
      </Navigation>

      <SessionCreationModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
      />
    </SidebarContainer>
  );
};

export default Sidebar;