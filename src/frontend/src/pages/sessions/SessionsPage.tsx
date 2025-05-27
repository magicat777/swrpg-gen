import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Search, MessageSquare, Plus, Play, Archive, Calendar, Users, Settings, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SessionCreationModal } from '../../components/session/SessionCreationModal';
import { SessionApi } from '../../services/api/sessionApi';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
  flex: 1;
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} 48px;
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.lightSide.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.textSecondary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  pointer-events: none;
`;

const SessionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SessionCard = styled.div`
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.effects.shadow.md};
    transform: translateY(-2px);
  }
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SessionName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
  flex: 1;
`;

const SessionStatus = styled.span<{ $isActive: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: ${({ $isActive, theme }) => 
    $isActive ? theme.colors.success + '20' : theme.colors.neutral.accent + '20'
  };
  color: ${({ $isActive, theme }) => 
    $isActive ? theme.colors.success : theme.colors.neutral.textSecondary
  };
`;

const SessionInfo = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const InfoLabel = styled.span`
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const InfoValue = styled.span`
  color: ${({ theme }) => theme.colors.neutral.text};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const SessionDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const SessionActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme, $variant }) => 
    $variant === 'danger' ? theme.colors.error : 
    $variant === 'primary' ? theme.colors.lightSide.primary : 
    theme.colors.neutral.border
  };
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  background-color: ${({ theme, $variant }) => 
    $variant === 'primary' ? theme.colors.lightSide.primary : 
    theme.colors.neutral.background
  };
  color: ${({ theme, $variant }) => 
    $variant === 'danger' ? theme.colors.error :
    $variant === 'primary' ? 'white' : 
    theme.colors.neutral.textSecondary
  };
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    background-color: ${({ theme, $variant }) => 
      $variant === 'danger' ? theme.colors.error :
      $variant === 'primary' ? theme.colors.lightSide.secondary : 
      theme.colors.lightSide.primary
    };
    color: white;
    border-color: ${({ theme, $variant }) => 
      $variant === 'danger' ? theme.colors.error :
      theme.colors.lightSide.primary
    };
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
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

interface Session {
  id: string;
  name: string;
  description?: string;
  era: string;
  lastPlayed: string;
  messageCount: number;
  playerCount: number;
  isActive: boolean;
  createdAt: string;
}

// Mock session data
const mockSessions: Session[] = [
  {
    id: 'session-1',
    name: 'Rebels on the Run',
    description: 'A group of rebels flee the Empire after stealing vital Death Star plans.',
    era: 'Imperial Era',
    lastPlayed: '2024-01-15',
    messageCount: 142,
    playerCount: 4,
    isActive: true,
    createdAt: '2024-01-10'
  },
  {
    id: 'session-2',
    name: 'Jedi Academy Chronicles',
    description: 'Young padawans train under Master Yoda on Dagobah.',
    era: 'Old Republic',
    lastPlayed: '2024-01-12',
    messageCount: 89,
    playerCount: 3,
    isActive: false,
    createdAt: '2024-01-05'
  },
  {
    id: 'session-3',
    name: 'Smugglers\' Paradise',
    description: 'Han Solo and crew navigate the criminal underworld of Nar Shaddaa.',
    era: 'Imperial Era',
    lastPlayed: '2024-01-08',
    messageCount: 67,
    playerCount: 2,
    isActive: false,
    createdAt: '2024-01-02'
  }
];

export const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load sessions from API
  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const sessionsData = await SessionApi.getSessions();
      // Ensure we have an array and each session has required properties
      const safeSessions = Array.isArray(sessionsData) ? sessionsData.map(session => ({
        ...session,
        id: session._id || session.id || `session-${Date.now()}-${Math.random()}`,
        name: session.campaignName || session.name || 'Untitled Session',
        era: session.setting?.era || session.era || 'Unknown Era',
        description: session.description || '',
        messageCount: session.messageCount || 0,
        playerCount: session.campaignSettings?.playerCount || session.playerCount || 0,
        isActive: session.isActive !== undefined ? session.isActive : true,
        lastPlayed: session.lastPlayed || session.createdAt || new Date().toISOString(),
        createdAt: session.createdAt || new Date().toISOString()
      })) : [];
      setSessions(safeSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
      // Keep empty array on error
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh sessions
  const refreshSessions = async () => {
    try {
      setIsRefreshing(true);
      const sessionsData = await SessionApi.getSessions();
      // Same safe processing as loadSessions
      const safeSessions = Array.isArray(sessionsData) ? sessionsData.map(session => ({
        ...session,
        id: session._id || session.id || `session-${Date.now()}-${Math.random()}`,
        name: session.campaignName || session.name || 'Untitled Session',
        era: session.setting?.era || session.era || 'Unknown Era',
        description: session.description || '',
        messageCount: session.messageCount || 0,
        playerCount: session.campaignSettings?.playerCount || session.playerCount || 0,
        isActive: session.isActive !== undefined ? session.isActive : true,
        lastPlayed: session.lastPlayed || session.createdAt || new Date().toISOString(),
        createdAt: session.createdAt || new Date().toISOString()
      })) : [];
      setSessions(safeSessions);
    } catch (error) {
      console.error('Error refreshing sessions:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load sessions on component mount
  useEffect(() => {
    loadSessions();
  }, []);

  const filteredSessions = sessions.filter(session =>
    session.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.era?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenSession = (sessionId: string) => {
    navigate(`/session/${sessionId}`);
  };

  const handleArchiveSession = async (sessionId: string) => {
    try {
      // Update session to inactive via API
      await SessionApi.updateSession(sessionId, { isActive: false });
      // Refresh sessions list
      refreshSessions();
    } catch (error) {
      console.error('Error archiving session:', error);
      alert('Failed to archive session. Please try again.');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }
    
    try {
      await SessionApi.deleteSession(sessionId);
      // Refresh sessions list
      refreshSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Failed to delete session. Please try again.');
    }
  };

  const handleSessionCreated = () => {
    setIsSessionModalOpen(false);
    // Refresh sessions list to show new session
    refreshSessions();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <PageContainer>
      <Header>
        <Title>Campaign Sessions</Title>
        <Controls>
          <Button 
            variant="secondary" 
            leftIcon={<RefreshCw size={16} />}
            onClick={refreshSessions}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Plus size={16} />}
            onClick={() => setIsSessionModalOpen(true)}
          >
            New Session
          </Button>
        </Controls>
      </Header>

      <SearchContainer>
        <SearchIcon size={20} />
        <SearchInput
          type="text"
          placeholder="Search sessions by name, era, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      {filteredSessions.length > 0 ? (
        <SessionsGrid>
          {filteredSessions.map((session) => (
            <SessionCard key={session.id}>
              <SessionHeader>
                <SessionName>{session.name}</SessionName>
                <SessionStatus $isActive={session.isActive}>
                  {session.isActive ? 'Active' : 'Archived'}
                </SessionStatus>
              </SessionHeader>

              {session.description && (
                <SessionDescription>{session.description}</SessionDescription>
              )}

              <SessionInfo>
                <InfoRow>
                  <InfoLabel>Era:</InfoLabel>
                  <InfoValue>{session.era}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Players:</InfoLabel>
                  <InfoValue>{session.playerCount}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Messages:</InfoLabel>
                  <InfoValue>{session.messageCount}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Last Played:</InfoLabel>
                  <InfoValue>{formatDate(session.lastPlayed)}</InfoValue>
                </InfoRow>
              </SessionInfo>

              <SessionActions>
                <ActionButton 
                  $variant="primary"
                  onClick={() => handleOpenSession(session.id)}
                  disabled={isLoading}
                >
                  <Play size={14} />
                  {session.isActive ? 'Continue' : 'Resume'}
                </ActionButton>
                
                {session.isActive && (
                  <ActionButton 
                    onClick={() => handleArchiveSession(session.id)}
                    disabled={isLoading}
                  >
                    <Archive size={14} />
                    Archive
                  </ActionButton>
                )}
                
                <ActionButton 
                  $variant="danger"
                  onClick={() => handleDeleteSession(session.id)}
                  disabled={isLoading}
                >
                  <Trash2 size={14} />
                  Delete
                </ActionButton>
              </SessionActions>
            </SessionCard>
          ))}
        </SessionsGrid>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <MessageSquare size={32} />
          </EmptyStateIcon>
          <p style={{ fontFamily: 'var(--font-lore)', fontStyle: 'italic', color: 'var(--theme-colors-neutral-textSecondary)' }}>
            Your adventures await, young Jedi. Begin a new campaign to forge your legend across the galaxy.
          </p>
          <Button 
            variant="primary" 
            leftIcon={<Plus size={16} />}
            onClick={() => setIsSessionModalOpen(true)}
            forceSide="light"
          >
            Begin Your Legend
          </Button>
        </EmptyState>
      )}

      <SessionCreationModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onSessionCreated={handleSessionCreated}
      />
    </PageContainer>
  );
};

export default SessionsPage;