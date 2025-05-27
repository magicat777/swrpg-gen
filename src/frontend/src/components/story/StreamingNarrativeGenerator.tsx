import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Square, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { StoryApi } from '../../services/api/storyApi';
import type { GenerateNarrativeRequest } from '../../types/api';
import { ForceLightningIcon, LightsaberIcon } from '../ui/StarWarsIcons';
import { useAnalytics } from '../../services/analytics/AnalyticsContext';

interface StreamingNarrativeGeneratorProps {
  sessionId: string;
  onNarrativeComplete?: (narrative: string) => void;
  onError?: (error: string) => void;
}

const Container = styled.div`
  background: ${({ theme }) => theme.colors.neutral.surface};
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  align-items: center;
`;

const InputSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const InputLabel = styled.label`
  display: block;
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const InputTextarea = styled.textarea`
  width: 100%;
  min-height: 80px;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  background: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  resize: vertical;
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

const OptionsRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  background: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

const StreamingArea = styled.div`
  background: ${({ theme }) => theme.colors.neutral.background};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  font-family: 'Georgia', serif;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.neutral.text};
`;

const StreamingText = styled.div<{ $isStreaming: boolean }>`
  white-space: pre-wrap;
  word-wrap: break-word;
  
  ${({ $isStreaming }) => $isStreaming && `
    &::after {
      content: '▊';
      animation: blink 1s infinite;
      color: #0099ff;
    }
    
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
  `}
`;

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.neutral.surface};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const StatusIndicator = styled.div<{ $status: 'idle' | 'generating' | 'complete' | 'error' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $status, theme }) => {
    switch ($status) {
      case 'generating': return theme.colors.warning;
      case 'complete': return theme.colors.success;
      case 'error': return theme.colors.error;
      default: return theme.colors.neutral.textSecondary;
    }
  }};
  
  ${({ $status }) => $status === 'generating' && `
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.2); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
  `}
`;

export const StreamingNarrativeGenerator: React.FC<StreamingNarrativeGeneratorProps> = ({
  sessionId,
  onNarrativeComplete,
  onError
}) => {
  const { trackStoryGeneration, trackFeatureUsage, trackError } = useAnalytics();
  
  const [userInput, setUserInput] = useState('');
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'complete' | 'error'>('idle');
  const [contextStatus, setContextStatus] = useState('');
  
  // Generation options
  const [style, setStyle] = useState<'action' | 'dialogue' | 'description' | 'introspection'>('description');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [tone, setTone] = useState<'dramatic' | 'lighthearted' | 'suspenseful' | 'mysterious'>('dramatic');
  const [temperature, setTemperature] = useState(0.7);

  const abortControllerRef = useRef<(() => void) | null>(null);
  const streamingAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom during streaming
  useEffect(() => {
    if (streamingAreaRef.current && isStreaming) {
      streamingAreaRef.current.scrollTop = streamingAreaRef.current.scrollHeight;
    }
  }, [streamedText, isStreaming]);

  const handleGenerate = useCallback(() => {
    if (!userInput.trim()) return;

    // Track story generation start
    trackFeatureUsage('story-generator', 'start-generation', true);

    setIsStreaming(true);
    setStatus('generating');
    setStreamedText('');
    setContextStatus('Assembling context...');

    const request: GenerateNarrativeRequest = {
      sessionId,
      userInput: userInput.trim(),
      options: {
        style,
        length,
        tone,
        temperature
      }
    };

    const cleanup = StoryApi.streamNarrative(request, {
      onChunk: (chunk: string) => {
        setStreamedText(prev => prev + chunk);
        setContextStatus('Generating...');
      },
      onContext: (contextStatus: string) => {
        setContextStatus(`Context ${contextStatus}`);
      },
      onComplete: () => {
        setIsStreaming(false);
        setStatus('complete');
        setContextStatus('Generation complete');
        
        // Track successful story generation
        trackStoryGeneration('dialogue', 'original_trilogy', true);
        trackFeatureUsage('story-generator', 'complete-generation', true);
        
        if (onNarrativeComplete) {
          onNarrativeComplete(streamedText);
        }
      },
      onError: (error: string) => {
        setIsStreaming(false);
        setStatus('error');
        setContextStatus(`Error: ${error}`);
        
        // Track story generation failure
        trackStoryGeneration('dialogue', 'original_trilogy', false);
        trackFeatureUsage('story-generator', 'generation-error', false);
        trackError(new Error(error), 'StreamingNarrativeGenerator');
        
        if (onError) {
          onError(error);
        }
      }
    });

    abortControllerRef.current = cleanup;
  }, [sessionId, userInput, style, length, tone, temperature, onNarrativeComplete, onError, streamedText, trackStoryGeneration, trackFeatureUsage, trackError]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStatus('idle');
    setContextStatus('Generation stopped');
    
    // Track generation stop
    trackFeatureUsage('story-generator', 'stop-generation', true);
  }, [trackFeatureUsage]);

  const handleClear = useCallback(() => {
    setStreamedText('');
    setUserInput('');
    setStatus('idle');
    setContextStatus('');
    
    // Track clear action
    trackFeatureUsage('story-generator', 'clear-content', true);
  }, [trackFeatureUsage]);

  return (
    <Container>
      <Header>
        <Title>
          <ForceLightningIcon size={20} />
          Galactic Chronicle Generator
        </Title>
        <Controls>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClear}
            disabled={isStreaming}
            leftIcon={<RefreshCw size={16} />}
          >
            Clear
          </Button>
        </Controls>
      </Header>

      <InputSection>
        <InputLabel htmlFor="userInput">Mission Brief</InputLabel>
        <InputTextarea
          id="userInput"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="The Force guides your narrative... Describe the unfolding events in your galactic adventure. What challenges do the heroes face? What mysteries await discovery across the stars?"
          disabled={isStreaming}
        />
      </InputSection>

      <OptionsRow>
        <OptionGroup>
          <InputLabel>Narrative Style</InputLabel>
          <Select value={style} onChange={(e) => setStyle(e.target.value as any)} disabled={isStreaming}>
            <option value="description">Environmental Detail</option>
            <option value="action">Combat & Action</option>
            <option value="dialogue">Character Interaction</option>
            <option value="introspection">Inner Force Vision</option>
          </Select>
        </OptionGroup>
        
        <OptionGroup>
          <InputLabel>Chronicle Length</InputLabel>
          <Select value={length} onChange={(e) => setLength(e.target.value as any)} disabled={isStreaming}>
            <option value="short">Brief Entry</option>
            <option value="medium">Standard Log</option>
            <option value="long">Full Report</option>
          </Select>
        </OptionGroup>
        
        <OptionGroup>
          <InputLabel>Galactic Mood</InputLabel>
          <Select value={tone} onChange={(e) => setTone(e.target.value as any)} disabled={isStreaming}>
            <option value="dramatic">Epic & Heroic</option>
            <option value="lighthearted">Cantina Tales</option>
            <option value="suspenseful">Imperial Tension</option>
            <option value="mysterious">Ancient Mysteries</option>
          </Select>
        </OptionGroup>
        
        <OptionGroup>
          <InputLabel>Force Guidance</InputLabel>
          <Select value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} disabled={isStreaming}>
            <option value={0.3}>Focused (Jedi Discipline)</option>
            <option value={0.7}>Balanced (Gray Path)</option>
            <option value={1.0}>Wild (Chaotic Force)</option>
          </Select>
        </OptionGroup>
      </OptionsRow>

      <div style={{ marginBottom: '16px' }}>
        {isStreaming ? (
          <Button
            variant="danger"
            onClick={handleStop}
            leftIcon={<Square size={16} />}
            fullWidth
          >
            Cease Transmission
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!userInput.trim()}
            leftIcon={<LightsaberIcon size={16} />}
            fullWidth
          >
            Channel the Force
          </Button>
        )}
      </div>

      <StreamingArea ref={streamingAreaRef}>
        {streamedText ? (
          <StreamingText $isStreaming={isStreaming}>
            {streamedText}
          </StreamingText>
        ) : (
          <div style={{ 
            color: 'var(--text-secondary)', 
            fontStyle: 'italic', 
            textAlign: 'center',
            padding: '2rem'
          }}>
            The Force flows through these chronicles... Your galactic tale will unfold here as the ancient wisdom streams through hyperspace.
          </div>
        )}
      </StreamingArea>

      <StatusBar>
        <StatusIndicator $status={status} />
        <span>{contextStatus || 'Standing by for Force transmission'}</span>
        {streamedText && (
          <span style={{ marginLeft: 'auto' }}>
            {streamedText.length} characters
          </span>
        )}
      </StatusBar>
    </Container>
  );
};

export default StreamingNarrativeGenerator;