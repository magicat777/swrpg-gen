import React from 'react';
import styled from 'styled-components';
import { X, Users, UserPlus, Shield, User } from 'lucide-react';
import { Button } from '../ui/Button';

interface SessionPlayersModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.md};
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.effects.shadow.lg};
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral.background};
    color: ${({ theme }) => theme.colors.neutral.text};
  }
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const PlayersList = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const PlayerItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background-color: ${({ theme }) => theme.colors.neutral.background};
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const PlayerIcon = styled.div<{ $role: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  background-color: ${({ $role, theme }) => 
    $role === 'GM' ? theme.colors.lightSide.primary : theme.colors.neutral.secondary
  };
  color: white;
`;

const PlayerDetails = styled.div``;

const PlayerName = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.text};
`;

const PlayerRole = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const PlayerStatus = styled.div<{ $online: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ $online, theme }) => 
    $online ? theme.colors.success : theme.colors.neutral.textSecondary
  };
`;

const StatusDot = styled.div<{ $online: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ $online, theme }) => 
    $online ? theme.colors.success : theme.colors.neutral.textSecondary
  };
`;

const AddPlayerSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
  padding-top: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

// Mock player data
const mockPlayers = [
  {
    id: 'user1',
    name: 'Game Master',
    role: 'GM',
    online: true,
    joinedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'user2', 
    name: 'Luke Skywalker',
    role: 'Player',
    online: true,
    joinedAt: '2024-01-15T10:05:00Z'
  },
  {
    id: 'user3',
    name: 'Princess Leia',
    role: 'Player', 
    online: false,
    joinedAt: '2024-01-15T10:10:00Z'
  }
];

export const SessionPlayersModal: React.FC<SessionPlayersModalProps> = ({
  isOpen,
  onClose,
  sessionId,
}) => {
  const handleInvitePlayer = () => {
    // TODO: Implement player invitation functionality
    console.log('Invite player to session:', sessionId);
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Users size={24} />
            Session Players
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <PlayersList>
            <SectionTitle>Current Players ({mockPlayers.length})</SectionTitle>
            {mockPlayers.map((player) => (
              <PlayerItem key={player.id}>
                <PlayerInfo>
                  <PlayerIcon $role={player.role}>
                    {player.role === 'GM' ? <Shield size={16} /> : <User size={16} />}
                  </PlayerIcon>
                  <PlayerDetails>
                    <PlayerName>{player.name}</PlayerName>
                    <PlayerRole>{player.role}</PlayerRole>
                  </PlayerDetails>
                </PlayerInfo>
                <PlayerStatus $online={player.online}>
                  <StatusDot $online={player.online} />
                  {player.online ? 'Online' : 'Offline'}
                </PlayerStatus>
              </PlayerItem>
            ))}
          </PlayersList>

          <AddPlayerSection>
            <SectionTitle>Invite Players</SectionTitle>
            <Button
              variant="primary"
              leftIcon={<UserPlus size={16} />}
              onClick={handleInvitePlayer}
            >
              Invite Player
            </Button>
          </AddPlayerSection>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};