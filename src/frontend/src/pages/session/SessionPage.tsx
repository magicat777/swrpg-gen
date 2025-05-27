import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ChatInterface } from '../../components/session/ChatInterface';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface SessionData {
  _id: string;
  sessionName: string;
  settings: {
    era: string;
    location?: string;
    tonePreferences: string[];
    difficulty: string;
    campaignLength: string;
  };
  participants: Array<{
    userId: string;
    role: string;
  }>;
  isActive: boolean;
  createdAt: string;
  lastModified: string;
}

const Container = styled.div`
  height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  text-align: center;
  color: ${({ theme }) => theme.colors.error};
`;

const ErrorTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

export const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock session data for now
        const mockSession: SessionData = {
          _id: sessionId,
          sessionName: `Campaign ${sessionId.split('-').pop()}`,
          settings: {
            era: 'Imperial Era',
            location: 'Tatooine',
            tonePreferences: ['Heroic Adventure', 'Political Intrigue'],
            difficulty: 'Medium',
            campaignLength: 'Medium'
          },
          participants: [
            {
              userId: 'demo-user',
              role: 'GM'
            }
          ],
          isActive: true,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };

        setSessionData(mockSession);
      } catch (err) {
        setError('Failed to load session data');
        console.error('Error loading session:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <LoadingSpinner size="large" />
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !sessionData || !sessionId) {
    return (
      <Container>
        <ErrorContainer>
          <ErrorTitle>Session Not Found</ErrorTitle>
          <ErrorMessage>
            {error || 'The session you are looking for could not be found.'}
          </ErrorMessage>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <ChatInterface 
        sessionId={sessionId}
        sessionName={sessionData.sessionName}
      />
    </Container>
  );
};

export default SessionPage;