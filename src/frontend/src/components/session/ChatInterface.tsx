import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Send, Bot, User, Dice6, Settings, Book, Users, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { sendChatMessage, getChatHistory, isLoreQuery } from '../../services/api/chatApi';
import { SessionPlayersModal } from './SessionPlayersModal';
import { SessionNotesModal } from './SessionNotesModal';
import { SessionSettingsModal } from './SessionSettingsModal';
import { StreamingNarrativeGenerator } from '../story/StreamingNarrativeGenerator';

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  type?: 'chat' | 'action' | 'system' | 'narrative';
  metadata?: {
    characterName?: string;
    actionType?: string;
    diceResult?: number;
  };
}

interface ChatInterfaceProps {
  sessionId: string;
  sessionName: string;
}

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: calc(100vh - 200px);
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  background-color: ${({ theme }) => theme.colors.neutral.surface};
`;

const SessionInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const SessionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
`;

const SessionId = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const ChatControls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.neutral.background};
`;

const MessageWrapper = styled.div<{ $sender: string }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  justify-content: ${({ $sender }) => $sender === 'user' ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div<{ $sender: string; $type?: string }>`
  max-width: 70%;
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  background-color: ${({ $sender, $type, theme }) => {
    if ($type === 'system') return theme.colors.info;
    if ($type === 'narrative') return theme.colors.lightSide.primary;
    if ($sender === 'user') return theme.colors.lightSide.primary;
    return theme.colors.neutral.surface;
  }};
  color: ${({ $sender, $type, theme }) => {
    if ($type === 'system' || $type === 'narrative' || $sender === 'user') return 'white';
    return theme.colors.neutral.text;
  }};
  border: ${({ $sender, $type, theme }) => 
    $sender === 'ai' && $type !== 'narrative' ? `1px solid ${theme.colors.neutral.border}` : 'none'
  };
  position: relative;
`;

const MessageContent = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  white-space: pre-wrap;
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  opacity: 0.8;
`;

const MessageIcon = styled.div<{ $sender: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  background-color: ${({ $sender, theme }) => 
    $sender === 'user' ? theme.colors.lightSide.primary : theme.colors.neutral.accent
  };
  color: white;
  flex-shrink: 0;
`;

const InputContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
  background-color: ${({ theme }) => theme.colors.neutral.surface};
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const MessageInput = styled.textarea`
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  resize: none;
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

const QuickActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const QuickActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  cursor: pointer;
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightSide.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const EmptyStateIcon = styled.div`
  width: 64px;
  height: 64px;
  background-color: ${({ theme }) => theme.colors.neutral.accent}20;
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.neutral.accent};
`;

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  sessionId,
  sessionName
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayersModalOpen, setIsPlayersModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isStreamingMode, setIsStreamingMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load chat history when component mounts
    const loadChatHistory = async () => {
      try {
        const history = await getChatHistory(sessionId, 20);
        if (history.messages.length > 0) {
          // Convert backend messages to frontend format
          const convertedMessages: Message[] = history.messages.map(msg => ({
            id: msg.id || `${msg.sender.type}-${Date.now()}`,
            sender: msg.sender.type === 'user' ? 'user' : 
                   msg.sender.type === 'system' ? 'ai' : 'system',
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            type: msg.type,
            metadata: msg.metadata
          }));
          setMessages(convertedMessages);
        } else {
          // Add welcome message if no history
          const welcomeMessage: Message = {
            id: 'welcome',
            sender: 'system',
            content: `Welcome to ${sessionName}! I'm your AI Game Master assistant. I can help you create stories, generate NPCs, describe locations, and manage your campaign. What would you like to start with?`,
            timestamp: new Date(),
            type: 'system'
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Failed to load chat history:', error);
        // Add welcome message on error
        const welcomeMessage: Message = {
          id: 'welcome',
          sender: 'system',
          content: `Welcome to ${sessionName}! I'm your AI Game Master assistant. I can help you create stories, generate NPCs, describe locations, and manage your campaign. What would you like to start with?`,
          timestamp: new Date(),
          type: 'system'
        };
        setMessages([welcomeMessage]);
      }
    };

    loadChatHistory();
  }, [sessionId, sessionName]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      type: 'chat'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      // Call the backend API with lore integration
      const response = await sendChatMessage({
        sessionId,
        message: messageText,
        context: {
          // You can add context here if needed
          characters: [],
          locations: [],
          factions: []
        }
      });

      const aiResponse: Message = {
        id: `ai-${Date.now()}`,
        sender: response.responseType === 'lore' ? 'system' : 'ai',
        content: response.response,
        timestamp: new Date(),
        type: response.responseType === 'lore' ? 'lore' : 'narrative',
        metadata: {
          isLoreQuery: response.metadata.isLoreQuery,
          responseType: response.responseType
        }
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        sender: 'system',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
        type: 'system'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action: string) => {
    const quickActions = {
      dice: "Roll a d20 for me",
      npc: "Generate a random NPC for this scene",
      location: "Describe the current location in detail",
      quest: "Suggest a side quest or plot hook"
    };
    
    setInputValue(quickActions[action as keyof typeof quickActions] || '');
    inputRef.current?.focus();
  };

  const handlePlayersModal = () => {
    setIsPlayersModalOpen(true);
  };

  const handleNotesModal = () => {
    setIsNotesModalOpen(true);
  };

  const handleSettingsModal = () => {
    setIsSettingsModalOpen(true);
  };

  const renderMessageIcon = (sender: string, type?: string) => {
    if (sender === 'user') return <User size={16} />;
    if (type === 'system') return <Settings size={16} />;
    return <Bot size={16} />;
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <SessionInfo>
          <SessionTitle>{sessionName}</SessionTitle>
          <SessionId>Session ID: {sessionId}</SessionId>
        </SessionInfo>
        <ChatControls>
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Users size={16} />}
            onClick={handlePlayersModal}
          >
            Players
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Book size={16} />}
            onClick={handleNotesModal}
          >
            Notes
          </Button>
          <Button 
            variant={isStreamingMode ? "primary" : "outline"} 
            size="sm" 
            leftIcon={<Zap size={16} />}
            onClick={() => setIsStreamingMode(!isStreamingMode)}
          >
            Stream
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            leftIcon={<Settings size={16} />}
            onClick={handleSettingsModal}
          >
            Settings
          </Button>
        </ChatControls>
      </ChatHeader>

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon>
              <Bot size={32} />
            </EmptyStateIcon>
            <p>Start your adventure by sending a message!</p>
          </EmptyState>
        ) : (
          messages.map((message) => (
            <MessageWrapper key={message.id} $sender={message.sender}>
              {message.sender !== 'user' && (
                <MessageIcon $sender={message.sender}>
                  {renderMessageIcon(message.sender, message.type)}
                </MessageIcon>
              )}
              <MessageBubble $sender={message.sender} $type={message.type}>
                <MessageContent>{message.content}</MessageContent>
                <MessageMeta>
                  {message.timestamp.toLocaleTimeString()}
                  {message.metadata?.diceResult && (
                    <span>• Rolled: {message.metadata.diceResult}</span>
                  )}
                </MessageMeta>
              </MessageBubble>
              {message.sender === 'user' && (
                <MessageIcon $sender={message.sender}>
                  {renderMessageIcon(message.sender, message.type)}
                </MessageIcon>
              )}
            </MessageWrapper>
          ))
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      {isStreamingMode && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <StreamingNarrativeGenerator
            sessionId={sessionId}
            onNarrativeComplete={(narrative) => {
              // Add the completed narrative to the chat as a system message
              const newMessage: Message = {
                id: Date.now().toString(),
                sender: 'system',
                content: narrative,
                timestamp: new Date(),
                type: 'narrative'
              };
              setMessages(prev => [...prev, newMessage]);
            }}
            onError={(error) => {
              console.error('Streaming generation error:', error);
              // Could show a toast notification here
            }}
          />
        </div>
      )}

      <InputContainer>
        <QuickActions>
          <QuickActionButton 
            onClick={() => handleQuickAction('dice')}
            title="Roll Dice"
            disabled={isLoading}
          >
            <Dice6 size={16} />
          </QuickActionButton>
          <QuickActionButton 
            onClick={() => handleQuickAction('npc')}
            title="Generate NPC"
            disabled={isLoading}
          >
            <Users size={16} />
          </QuickActionButton>
          <QuickActionButton 
            onClick={() => handleQuickAction('location')}
            title="Describe Location"
            disabled={isLoading}
          >
            <Book size={16} />
          </QuickActionButton>
        </QuickActions>
        
        <InputWrapper>
          <MessageInput
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe what you want to do, ask for story elements, or give commands..."
            disabled={isLoading}
          />
        </InputWrapper>
        
        <Button
          variant="primary"
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isLoading}
          isLoading={isLoading}
          leftIcon={<Send size={16} />}
        >
          Send
        </Button>
      </InputContainer>

      <SessionPlayersModal
        isOpen={isPlayersModalOpen}
        onClose={() => setIsPlayersModalOpen(false)}
        sessionId={sessionId}
      />

      <SessionNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        sessionId={sessionId}
      />

      <SessionSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        sessionId={sessionId}
      />
    </ChatContainer>
  );
};

export default ChatInterface;