import React from 'react';
import styled from 'styled-components';
import { X, Edit, ExternalLink, Book, Calendar, Globe, Users, Scroll } from 'lucide-react';
import { Button } from '../ui/Button';

interface LoreEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  era?: string;
  source: string;
}

interface LoreDetailModalProps {
  loreEntry: LoreEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (loreEntry: LoreEntry) => void;
  onViewSource: (source: string) => void;
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const HeaderContent = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing.md};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0 0 ${({ theme }) => theme.spacing.sm} 0;
`;

const HeaderMeta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const CategoryBadge = styled.span<{ $category: string }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background-color: ${({ $category, theme }) => {
    // Handle both old lore categories and new faction types
    const categoryLower = $category?.toLowerCase() || '';
    if (categoryLower.includes('criminal')) return theme.colors.error + '20';
    if (categoryLower.includes('government') || categoryLower.includes('empire')) return theme.colors.warning + '20';
    if (categoryLower.includes('military')) return theme.colors.info + '20';
    if (categoryLower.includes('religious') || categoryLower.includes('order')) return theme.colors.success + '20';
    if (categoryLower.includes('organization') || categoryLower.includes('professional')) return theme.colors.lightSide.primary + '20';
    if (categoryLower.includes('trade')) return theme.colors.lightSide.secondary + '20';
    // Legacy categories
    switch (categoryLower) {
      case 'characters': return theme.colors.lightSide.primary + '20';
      case 'events': return theme.colors.success + '20';
      case 'locations': return theme.colors.info + '20';
      case 'organizations': return theme.colors.warning + '20';
      case 'timeline': return theme.colors.error + '20';
      default: return theme.colors.neutral.secondary + '20';
    }
  }};
  color: ${({ $category, theme }) => {
    // Handle both old lore categories and new faction types
    const categoryLower = $category?.toLowerCase() || '';
    if (categoryLower.includes('criminal')) return theme.colors.error;
    if (categoryLower.includes('government') || categoryLower.includes('empire')) return theme.colors.warning;
    if (categoryLower.includes('military')) return theme.colors.info;
    if (categoryLower.includes('religious') || categoryLower.includes('order')) return theme.colors.success;
    if (categoryLower.includes('organization') || categoryLower.includes('professional')) return theme.colors.lightSide.primary;
    if (categoryLower.includes('trade')) return theme.colors.lightSide.secondary;
    // Legacy categories
    switch (categoryLower) {
      case 'characters': return theme.colors.lightSide.primary;
      case 'events': return theme.colors.success;
      case 'locations': return theme.colors.info;
      case 'organizations': return theme.colors.warning;
      case 'timeline': return theme.colors.error;
      default: return theme.colors.neutral.text;
    }
  }};
`;

const ActionButtons = styled.div`
  display: flex;
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

const Description = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.neutral.text};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  border-left: 4px solid ${({ theme }) => theme.colors.lightSide.primary};
`;

const ContentSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Content = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.text};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  white-space: pre-wrap;
`;

const getCategoryIcon = (category: string) => {
  if (!category) return <Book size={16} />;
  
  const categoryLower = category.toLowerCase();
  
  // Handle faction types
  if (categoryLower.includes('criminal')) return <Users size={16} />;
  if (categoryLower.includes('government') || categoryLower.includes('empire')) return <Globe size={16} />;
  if (categoryLower.includes('military')) return <Users size={16} />;
  if (categoryLower.includes('religious') || categoryLower.includes('order')) return <Book size={16} />;
  if (categoryLower.includes('organization') || categoryLower.includes('professional')) return <Users size={16} />;
  if (categoryLower.includes('trade')) return <Users size={16} />;
  if (categoryLower.includes('indigenous') || categoryLower.includes('people')) return <Users size={16} />;
  
  // Legacy categories
  switch (categoryLower) {
    case 'characters': return <Users size={16} />;
    case 'events': return <Calendar size={16} />;
    case 'locations': return <Globe size={16} />;
    case 'organizations': return <Users size={16} />;
    case 'timeline': return <Calendar size={16} />;
    default: return <Book size={16} />;
  }
};

export const LoreDetailModal: React.FC<LoreDetailModalProps> = ({
  loreEntry,
  isOpen,
  onClose,
  onEdit,
  onViewSource,
}) => {
  if (!loreEntry) return null;

  const handleEdit = () => {
    onEdit(loreEntry);
    onClose();
  };

  const handleViewSource = () => {
    // If it's a Wookieepedia URL, open it directly
    if (loreEntry.source && (loreEntry.source.includes('starwars.fandom.com') || loreEntry.source.startsWith('http'))) {
      window.open(loreEntry.source, '_blank', 'noopener,noreferrer');
    } else {
      onViewSource(loreEntry.source);
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <HeaderContent>
            <ModalTitle>{loreEntry.title}</ModalTitle>
            <HeaderMeta>
              <CategoryBadge $category={loreEntry.category}>
                {getCategoryIcon(loreEntry.category)}
                {loreEntry.category && loreEntry.category.charAt(0).toUpperCase() + loreEntry.category.slice(1) || 'Unknown'}
              </CategoryBadge>
              {loreEntry.era && (
                <MetaItem>
                  <Calendar size={14} />
                  {loreEntry.era}
                </MetaItem>
              )}
              <MetaItem>
                <ExternalLink size={14} />
                {loreEntry.source}
              </MetaItem>
            </HeaderMeta>
          </HeaderContent>
          
          <ActionButtons>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit size={16} />}
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink size={16} />}
              onClick={handleViewSource}
            >
              Source
            </Button>
            <CloseButton onClick={onClose}>
              <X size={20} />
            </CloseButton>
          </ActionButtons>
        </ModalHeader>

        <ModalBody>
          <Description>
            {loreEntry.description}
          </Description>

          <ContentSection>
            <SectionTitle>
              <Scroll size={18} />
              Full Content
            </SectionTitle>
            <Content>
              {loreEntry.content}
            </Content>
          </ContentSection>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};