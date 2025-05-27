import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../services/auth/AuthContext';
import { useFactionTheme } from '../../styles/FactionThemeContext';
import { Button } from '../ui/Button';
import { FactionIcon, FactionName, ImperialIcon, JediIcon } from '../ui/StarWarsIcons';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  box-shadow: ${({ theme }) => theme.effects.shadow.sm};
`;

const Title = styled.h1`
  font-family: ${({ theme }) => theme.typography.fontFamily.crawl} !important; /* Soloist - Star Wars style font */
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']} !important;
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold} !important;
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0 !important;
  letter-spacing: 0.025em !important; /* Star Wars spacing */
  text-transform: uppercase !important; /* Classic Star Wars style */
`;

const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    display: none;
  }
`;

const Username = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ThemeSelector = styled.div`
  position: relative;
`;

const ThemeSelectorButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  min-width: 120px;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
    background-color: ${({ theme }) => theme.colors.neutral.background};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.lightSide.primary}20;
  }
`;

const ThemeDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  margin-top: 4px;
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  box-shadow: ${({ theme }) => theme.effects.shadow.lg};
  min-width: 180px;
  display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
`;

const ThemeOption = styled.button<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  background-color: ${({ $isSelected, theme }) => 
    $isSelected ? theme.colors.lightSide.primary + '20' : 'transparent'};
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: left;
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightSide.primary}15;
  }
  
  &:first-child {
    border-radius: ${({ theme }) => theme.effects.borderRadius.md} ${({ theme }) => theme.effects.borderRadius.md} 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 ${({ theme }) => theme.effects.borderRadius.md} ${({ theme }) => theme.effects.borderRadius.md};
  }
`;

const UserIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.lightSide.primary}, ${({ theme }) => theme.colors.lightSide.secondary});
  color: white;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
`;

const SettingsIcon = styled.div`
  color: ${({ theme }) => theme.colors.lightSide.primary};
`;

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { currentFaction, setFaction, availableFactions } = useFactionTheme();
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = React.useState(false);
  
  const currentFactionData = availableFactions[currentFaction];
  
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-theme-selector]')) {
        setIsThemeDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <HeaderContainer>
      <Title>Star Wars RPG Generator</Title>
      
      <UserSection>
        {user && (
          <UserInfo>
            <UserIcon>
              {user.username.charAt(0).toUpperCase()}
            </UserIcon>
            <Username>{user.username}</Username>
          </UserInfo>
        )}
        
        <ActionButtons>
          <ThemeSelector data-theme-selector>
            <ThemeSelectorButton
              onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
              title="Change Faction Theme"
            >
              <FactionIcon faction={currentFaction as FactionName} size={16} />
              {currentFactionData.name}
            </ThemeSelectorButton>
            
            <ThemeDropdown $isOpen={isThemeDropdownOpen}>
              {Object.values(availableFactions).map((faction) => (
                <ThemeOption
                  key={faction.id}
                  $isSelected={currentFaction === faction.id}
                  onClick={() => {
                    setFaction(faction.id);
                    setIsThemeDropdownOpen(false);
                  }}
                >
                  <FactionIcon faction={faction.id as FactionName} size={16} />
                  {faction.name}
                </ThemeOption>
              ))}
            </ThemeDropdown>
          </ThemeSelector>
          
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<SettingsIcon><ImperialIcon size={16} /></SettingsIcon>}
            title="Settings"
            onClick={() => navigate('/settings')}
          >
            <span className="sr-only">Settings</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            leftIcon={<LogOut size={16} />}
            onClick={logout}
            title="Logout"
          >
            Logout
          </Button>
        </ActionButtons>
      </UserSection>
    </HeaderContainer>
  );
};

export default Header;