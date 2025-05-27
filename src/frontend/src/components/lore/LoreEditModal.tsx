import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Save, Book, Calendar, Globe, Users, Scroll } from 'lucide-react';
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

interface LoreEditModalProps {
  loreEntry: LoreEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (loreEntry: LoreEntry) => void;
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
  max-width: 700px;
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

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FormLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const FormInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.textSecondary};
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.textSecondary};
  }
`;

const FormContentTextarea = styled(FormTextarea)`
  min-height: 200px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const categoryOptions = ['characters', 'events', 'locations', 'organizations', 'timeline'];
const eraOptions = ['Old Republic', 'Prequel Trilogy', 'Clone Wars Era', 'Imperial Era', 'New Republic Era', 'Sequel Trilogy', 'All Eras', 'Multiple Eras'];

export const LoreEditModal: React.FC<LoreEditModalProps> = ({
  loreEntry,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<LoreEntry>({
    id: '',
    title: '',
    category: '',
    description: '',
    content: '',
    era: '',
    source: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when lore entry changes
  useEffect(() => {
    if (loreEntry) {
      setFormData(loreEntry);
    }
    setErrors({});
  }, [loreEntry]);

  const handleInputChange = (field: keyof LoreEntry, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.source.trim()) {
      newErrors.source = 'Source is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!loreEntry) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Edit Lore Entry</ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <FormGroup>
            <FormLabel>Title</FormLabel>
            <FormInput
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter lore entry title"
            />
            {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
          </FormGroup>

          <FormRow>
            <FormGroup>
              <FormLabel>Category</FormLabel>
              <FormSelect
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option value="">Select category</option>
                {categoryOptions.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </FormSelect>
              {errors.category && <ErrorMessage>{errors.category}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <FormLabel>Era</FormLabel>
              <FormSelect
                value={formData.era || ''}
                onChange={(e) => handleInputChange('era', e.target.value)}
              >
                <option value="">Select era</option>
                {eraOptions.map(era => (
                  <option key={era} value={era}>{era}</option>
                ))}
              </FormSelect>
            </FormGroup>
          </FormRow>

          <FormGroup>
            <FormLabel>Source</FormLabel>
            <FormInput
              type="text"
              value={formData.source}
              onChange={(e) => handleInputChange('source', e.target.value)}
              placeholder="e.g., Original Trilogy, Legends, etc."
            />
            {errors.source && <ErrorMessage>{errors.source}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <FormLabel>Description</FormLabel>
            <FormTextarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of this lore entry..."
            />
            {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
          </FormGroup>

          <FormGroup>
            <FormLabel>Content</FormLabel>
            <FormContentTextarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Detailed content about this lore entry..."
            />
            {errors.content && <ErrorMessage>{errors.content}</ErrorMessage>}
          </FormGroup>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Save size={16} />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};