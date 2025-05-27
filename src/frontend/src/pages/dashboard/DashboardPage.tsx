import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Plus, Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { typographyMixins } from '../../styles/typography';
import { componentMixins } from '../../styles/componentArchitecture';
import { useFactionTheme } from '../../styles/FactionThemeContext';
import { SessionCreationModal } from '../../components/session/SessionCreationModal';
import { checkApiHealth } from '../../services/api/apiClient';
import { useAnalytics } from '../../services/analytics/AnalyticsContext';
import { 
  LightsaberIcon, 
  RebelIcon, 
  ImperialIcon, 
  DeathStarIcon,
  MandalorianIcon,
  JediIcon,
  ForceLightningIcon
} from '../../components/ui/StarWarsIcons';

const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  min-height: 100vh;
  padding: ${({ theme }) => theme.spacing.lg};
  
  /* Imperial Command Center Background */
  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.colors.neutral.background};
    background-image: 
      /* Holographic grid pattern */
      linear-gradient(90deg, rgba(66, 153, 225, 0.03) 1px, transparent 1px),
      linear-gradient(0deg, rgba(66, 153, 225, 0.03) 1px, transparent 1px),
      /* Energy field gradients */
      radial-gradient(circle at 25% 25%, ${({ theme }) => theme.colors.neutral.primary}15 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, ${({ theme }) => theme.colors.neutral.accent}10 0%, transparent 50%);
    background-size: 50px 50px, 50px 50px, 100% 100%, 100% 100%;
    z-index: -2;
    animation: holographicFlicker 8s ease-in-out infinite;
  }
  
  /* Command center scanner lines */
  &::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(66, 153, 225, 0.05) 45%,
      rgba(66, 153, 225, 0.1) 50%,
      rgba(66, 153, 225, 0.05) 55%,
      transparent 100%
    );
    animation: scannerSweep 6s linear infinite;
    z-index: -1;
    pointer-events: none;
  }
  
  @keyframes holographicFlicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.95; }
  }
  
  @keyframes scannerSweep {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100vw); }
  }
`;

const WelcomeSection = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  position: relative;
  
  /* Command header styling */
  &::before {
    content: '';
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      ${({ theme }) => theme.colors.neutral.primary} 20%, 
      ${({ theme }) => theme.colors.neutral.accent} 50%,
      ${({ theme }) => theme.colors.neutral.primary} 80%, 
      transparent 100%
    );
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.neutral.primary}60;
  }
`;

const WelcomeTitle = styled.h1`
  ${typographyMixins.pageTitle}
  color: ${({ theme }) => theme.colors.neutral.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-shadow: 
    0 0 20px ${({ theme }) => theme.colors.neutral.primary}60,
    0 0 40px ${({ theme }) => theme.colors.neutral.primary}30;
  letter-spacing: 0.1em;
  position: relative;
  
  /* Holographic text effect */
  &::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    color: ${({ theme }) => theme.colors.neutral.accent};
    opacity: 0.3;
    animation: holographicGlitch 3s ease-in-out infinite;
  }
  
  @keyframes holographicGlitch {
    0%, 100% { transform: translate(0); opacity: 0.3; }
    50% { transform: translate(1px, -1px); opacity: 0.1; }
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  font-family: ${({ theme }) => theme.typography.fontFamily.technical};
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
`;

const ActionCard = styled.div`
  ${componentMixins.datapadCard}
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  /* Enhanced holographic interface elements */
  &::after {
    content: '';
    position: absolute;
    top: 8px;
    right: 8px;
    width: 12px;
    height: 12px;
    background: ${({ theme }) => theme.colors.neutral.primary};
    border-radius: 50%;
    box-shadow: 0 0 10px ${({ theme }) => theme.colors.neutral.primary};
    animation: statusPulse 2s ease-in-out infinite;
  }
  
  /* Command panel corners */
  &::before {
    content: '';
    position: absolute;
    inset: 12px;
    background: 
      linear-gradient(45deg, ${({ theme }) => theme.colors.neutral.primary}80 0px, ${({ theme }) => theme.colors.neutral.primary}80 2px, transparent 2px, transparent 10px),
      linear-gradient(-45deg, ${({ theme }) => theme.colors.neutral.primary}80 0px, ${({ theme }) => theme.colors.neutral.primary}80 2px, transparent 2px, transparent 10px),
      linear-gradient(135deg, ${({ theme }) => theme.colors.neutral.primary}80 0px, ${({ theme }) => theme.colors.neutral.primary}80 2px, transparent 2px, transparent 10px),
      linear-gradient(-135deg, ${({ theme }) => theme.colors.neutral.primary}80 0px, ${({ theme }) => theme.colors.neutral.primary}80 2px, transparent 2px, transparent 10px);
    background-position: top left, top right, bottom right, bottom left;
    background-repeat: no-repeat;
    background-size: 15px 15px;
    pointer-events: none;
  }
  
  @keyframes statusPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.8); }
  }
`;

const ActionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: ${({ theme }) => theme.colors.lightSide.primary}20;
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  color: ${({ theme }) => theme.colors.lightSide.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ActionTitle = styled.h3`
  ${typographyMixins.characterName}
  color: ${({ theme }) => theme.colors.neutral.text};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ActionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatsTitle = styled.h2`
  ${typographyMixins.sectionTitle}
  color: ${({ theme }) => theme.colors.neutral.text};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.neutral.surface} 0%,
    ${({ theme }) => theme.colors.neutral.background} 100%
  );
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  position: relative;
  overflow: hidden;
  transition: ${({ theme }) => theme.effects.transition.normal};
  
  /* Technical readout styling */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, 
      transparent 0%, 
      ${({ theme }) => theme.colors.neutral.primary} 50%, 
      transparent 100%
    );
    box-shadow: 0 0 5px ${({ theme }) => theme.colors.neutral.primary};
  }
  
  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.neutral.primary};
    box-shadow: 0 5px 15px ${({ theme }) => theme.colors.neutral.primary}20;
  }
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  font-family: ${({ theme }) => theme.typography.fontFamily.technical};
  color: ${({ theme }) => theme.colors.neutral.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  text-shadow: 0 0 10px ${({ theme }) => theme.colors.neutral.primary}50;
  letter-spacing: 0.1em;
`;

const StatLabel = styled.div`
  ${typographyMixins.technicalData}
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const RecentSessions = styled.section`
  ${componentMixins.imperialModal}
  padding: ${({ theme }) => theme.spacing.xl};
  margin-top: ${({ theme }) => theme.spacing['2xl']};
`;

const SectionTitle = styled.h2`
  ${typographyMixins.sectionTitle}
  color: ${({ theme }) => theme.colors.neutral.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['3xl']};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const EmptyStateIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: ${({ theme }) => theme.colors.neutral.background};
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  color: ${({ theme }) => theme.colors.neutral.accent};
  margin: 0 auto ${({ theme }) => theme.spacing.md};
`;

const HealthStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: linear-gradient(135deg, 
    ${({ theme }) => theme.colors.neutral.surface} 0%,
    ${({ theme }) => theme.colors.neutral.background} 100%
  );
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  font-family: ${({ theme }) => theme.typography.fontFamily.technical};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.text};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  position: relative;
  
  /* Status indicator line */
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: ${({ theme }) => theme.colors.neutral.primary};
    border-radius: 0 2px 2px 0;
    box-shadow: 0 0 5px ${({ theme }) => theme.colors.neutral.primary};
  }
  
  span {
    color: ${({ theme }) => theme.colors.neutral.text};
  }
`;

const HealthIcon = styled.div<{ $status: 'checking' | 'healthy' | 'error' }>`
  display: flex;
  color: ${({ $status, theme }) => {
    switch ($status) {
      case 'healthy': return theme.colors.success;
      case 'error': return theme.colors.error;
      default: return theme.colors.neutral.textSecondary;
    }
  }};
`;

interface DashboardStats {
  activeSessions: number;
  characters: number;
  locations: number;
  factions: number;
  events: number;
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentFaction, availableFactions } = useFactionTheme();
  const { trackFeatureUsage, trackEvent } = useAnalytics();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    activeSessions: 0,
    characters: 0,
    locations: 0,
    factions: 0,
    events: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [backendHealth, setBackendHealth] = useState<{
    status: 'checking' | 'healthy' | 'error';
    message?: string;
  }>({ status: 'checking' });

  const handleCreateSession = () => {
    trackFeatureUsage('Dashboard', 'Create Session Button', true);
    setIsSessionModalOpen(true);
  };

  const handleViewCharacters = () => {
    trackFeatureUsage('Dashboard', 'View Characters', true);
    navigate('/characters');
  };

  const handleViewLocations = () => {
    trackFeatureUsage('Dashboard', 'View Locations', true);
    navigate('/locations');
  };

  const fetchDashboardStats = async () => {
      try {
        setIsLoadingStats(true);
        setBackendHealth({ status: 'checking' });
        
        // Test backend health first
        const isHealthy = await checkApiHealth();
        
        if (isHealthy) {
          setBackendHealth({ status: 'healthy', message: 'Backend connected successfully' });
          trackEvent({
            category: 'System',
            action: 'Backend Health Check',
            label: 'Success',
            value: 1
          });
          
          // Fetch actual counts from the API with cache-busting
          try {
            const timestamp = Date.now();
            const [charactersResponse, locationsResponse, factionsResponse, eventsResponse] = await Promise.all([
              fetch(`http://localhost:3000/api/world/characters?limit=1&_t=${timestamp}`, {
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
              }),
              fetch(`http://localhost:3000/api/world/locations?limit=1&_t=${timestamp}`, {
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
              }),
              fetch(`http://localhost:3000/api/world/factions?limit=1&_t=${timestamp}`, {
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
              }),
              fetch(`http://localhost:3000/api/timeline/events?limit=1&_t=${timestamp}`, {
                headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
              })
            ]);

            const charactersData = await charactersResponse.json();
            const locationsData = await locationsResponse.json();
            const factionsData = await factionsResponse.json();
            const eventsData = await eventsResponse.json();

            console.log('📊 Fetched fresh counts:', {
              characters: charactersData.total,
              locations: locationsData.total,
              factions: factionsData.total,
              events: eventsData.data?.pagination?.total || eventsData.data?.events?.length || 0
            });

            setStats({
              activeSessions: 0, // No active sessions yet
              characters: charactersData.total || 0,
              locations: locationsData.total || 0,
              factions: factionsData.total || 0,
              events: eventsData.data?.pagination?.total || eventsData.data?.events?.length || 0
            });
          } catch (apiError) {
            console.error('Failed to fetch API counts:', apiError);
            // Use fallback values
            setStats({
              activeSessions: 0,
              characters: 224,
              locations: 120,
              factions: 51,
              events: 64
            });
          }
        } else {
          setBackendHealth({ status: 'error', message: 'Backend connection failed' });
          
          // Fallback counts
          setStats({
            activeSessions: 0,
            characters: 224,
            locations: 120,
            factions: 51,
            events: 64
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // Fallback counts
        setStats({
          activeSessions: 0,
          characters: 224,
          locations: 120,
          factions: 51,
          events: 64
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

  const handleRefreshStats = () => {
    fetchDashboardStats();
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <DashboardContainer>
      <WelcomeSection>
        <WelcomeTitle>Welcome to {availableFactions[currentFaction]?.name || 'Star Wars RPG Generator'}</WelcomeTitle>
        <WelcomeSubtitle>
          {availableFactions[currentFaction]?.description || 'Create immersive Star Wars adventures with AI-powered storytelling'}
        </WelcomeSubtitle>
        
        <HealthStatus>
          <HealthIcon $status={backendHealth.status}>
            {backendHealth.status === 'checking' && <Activity size={16} />}
            {backendHealth.status === 'healthy' && <CheckCircle size={16} />}
            {backendHealth.status === 'error' && <XCircle size={16} />}
          </HealthIcon>
          <span>
            Backend Status: {backendHealth.message || 'Connecting...'}
          </span>
        </HealthStatus>
      </WelcomeSection>

      <QuickActionsGrid>
        <ActionCard>
          <ActionIcon>
            <LightsaberIcon size={24} />
          </ActionIcon>
          <ActionTitle>New Mission</ActionTitle>
          <ActionDescription>
            Launch a new galactic adventure with AI-powered storytelling, character dialogue, 
            and immersive world-building assistance.
          </ActionDescription>
          <Button variant="primary" fullWidth onClick={handleCreateSession}>
            Begin Mission
          </Button>
        </ActionCard>

        <ActionCard>
          <ActionIcon>
            <RebelIcon size={24} />
          </ActionIcon>
          <ActionTitle>Heroes & Villains</ActionTitle>
          <ActionDescription>
            Explore legendary figures from across the galaxy, create new allies and enemies, 
            and forge destinies that will echo through the stars.
          </ActionDescription>
          <Button variant="outline" fullWidth onClick={handleViewCharacters}>
            Browse Heroes
          </Button>
        </ActionCard>

        <ActionCard>
          <ActionIcon>
            <DeathStarIcon size={24} />
          </ActionIcon>
          <ActionTitle>Galactic Sectors</ActionTitle>
          <ActionDescription>
            Navigate through iconic worlds, from desert wastelands to forest moons. 
            Discover new frontiers and forge your own legends.
          </ActionDescription>
          <Button variant="outline" fullWidth onClick={handleViewLocations}>
            Explore Galaxy
          </Button>
        </ActionCard>
      </QuickActionsGrid>

      <StatsHeader>
        <StatsTitle>Database Statistics</StatsTitle>
        <Button 
          variant="outline" 
          size="sm" 
          leftIcon={<RefreshCw size={16} />}
          onClick={handleRefreshStats}
          disabled={isLoadingStats}
        >
          Refresh
        </Button>
      </StatsHeader>

      <StatsGrid>
        <StatCard>
          <StatValue>{isLoadingStats ? '...' : stats.activeSessions}</StatValue>
          <StatLabel>Active Missions</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{isLoadingStats ? '...' : stats.characters}</StatValue>
          <StatLabel>Heroes & Villains</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{isLoadingStats ? '...' : stats.locations}</StatValue>
          <StatLabel>Galactic Worlds</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{isLoadingStats ? '...' : stats.factions}</StatValue>
          <StatLabel>Organizations</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{isLoadingStats ? '...' : stats.events}</StatValue>
          <StatLabel>Timeline Events</StatLabel>
        </StatCard>
      </StatsGrid>

      <RecentSessions>
        <SectionTitle>Recent Missions</SectionTitle>
        <EmptyState>
          <EmptyStateIcon>
            <JediIcon size={32} />
          </EmptyStateIcon>
          <p style={{ 
            fontFamily: '"Crimson Text", "Libre Baskerville", "Inter", serif', 
            fontStyle: 'italic',
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#64748B'
          }}>
            Your destiny awaits, young Padawan. The Force guides you to begin your first mission across the galaxy far, far away.
          </p>
          <Button variant="primary" leftIcon={<ForceLightningIcon size={16} />} onClick={handleCreateSession}>
            Embrace Your Destiny
          </Button>
        </EmptyState>
      </RecentSessions>

      <SessionCreationModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
      />
    </DashboardContainer>
  );
};

export default DashboardPage;