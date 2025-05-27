import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

export const StoryPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <Container>
      <Title>Story Generation Interface</Title>
      <Message>
        Session ID: {sessionId}
        <br />
        This page will contain the chat-style story generation interface.
      </Message>
    </Container>
  );
};

export default StoryPage;