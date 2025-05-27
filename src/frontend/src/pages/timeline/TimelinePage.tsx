import React from 'react';
import styled from 'styled-components';
import { TimelineComponent } from '../../components/timeline/TimelineComponent';

const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${props => props.theme.colors.background};
`;

const PageHeader = styled.div`
  padding: 1rem 2rem;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  h1 {
    margin: 0;
    color: ${props => props.theme.colors.primary};
    font-family: ${props => props.theme.typography.fontFamily.logo};
    font-weight: ${props => props.theme.typography.fontWeight.black};
    font-size: 1.8rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
  
  p {
    margin: 0.5rem 0 0 0;
    color: #cccccc;
    font-family: ${props => props.theme.typography.fontFamily.crawl};
    font-weight: ${props => props.theme.typography.fontWeight.normal};
    max-width: 800px;
    line-height: 1.6;
  }
`;

const TimelineContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

export const TimelinePage: React.FC = () => {
  return (
    <PageContainer>
      <PageHeader>
        <h1>⭐ Star Wars Galactic Timeline</h1>
        <p>
          Explore the complete chronology of the Star Wars universe, from the dawn of the Je'daii Order 
          to the rise of the New Republic. Track major events, battles, and pivotal moments that shaped 
          the galaxy far, far away.
        </p>
      </PageHeader>
      
      <TimelineContainer>
        <TimelineComponent />
      </TimelineContainer>
    </PageContainer>
  );
};