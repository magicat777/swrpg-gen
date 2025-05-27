import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Book, Plus, Edit3, Trash2, Save } from 'lucide-react';
import { Button } from '../ui/Button';

interface SessionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  type: 'character' | 'location' | 'plot' | 'general';
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
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  flex-shrink: 0;
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
  flex: 1;
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const NotesListSection = styled.div`
  flex: 1;
  min-width: 250px;
`;

const NotesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
`;

const NotesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-height: 400px;
  overflow-y: auto;
`;

const NoteItem = styled.div<{ $selected: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.effects.transition.fast};
  background-color: ${({ $selected, theme }) => 
    $selected ? theme.colors.lightSide.primary + '20' : theme.colors.neutral.background
  };
  border-color: ${({ $selected, theme }) => 
    $selected ? theme.colors.lightSide.primary : theme.colors.neutral.border
  };

  &:hover {
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

const NoteTitle = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const NotePreview = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const NoteType = styled.span<{ $type: string }>`
  display: inline-block;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.effects.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  margin-top: ${({ theme }) => theme.spacing.xs};
  background-color: ${({ $type, theme }) => {
    switch ($type) {
      case 'character': return theme.colors.lightSide.primary + '20';
      case 'location': return theme.colors.success + '20';
      case 'plot': return theme.colors.error + '20';
      default: return theme.colors.neutral.secondary + '20';
    }
  }};
  color: ${({ $type, theme }) => {
    switch ($type) {
      case 'character': return theme.colors.lightSide.primary;
      case 'location': return theme.colors.success;
      case 'plot': return theme.colors.error;
      default: return theme.colors.neutral.text;
    }
  }};
`;

const NoteEditorSection = styled.div`
  flex: 2;
  min-width: 400px;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const EditorForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const FormInput = styled.input`
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

const FormSelect = styled.select`
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
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};
  min-height: 300px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

// Mock notes data
const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Tatooine Desert Encounter',
    content: 'The party encounters a group of Tusken Raiders near the moisture farm. They seem to be searching for something...',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T11:00:00Z',
    type: 'location'
  },
  {
    id: '2',
    title: 'Luke\'s Character Development',
    content: 'Luke is showing signs of Force sensitivity. Consider introducing Obi-Wan earlier than planned.',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:15:00Z',
    type: 'character'
  },
  {
    id: '3',
    title: 'Imperial Plot Hook',
    content: 'The Empire is searching for stolen Death Star plans. This could be a major plot point for the next session.',
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    type: 'plot'
  }
];

export const SessionNotesModal: React.FC<SessionNotesModalProps> = ({
  isOpen,
  onClose,
  sessionId,
}) => {
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    type: 'general' as Note['type']
  });

  const handleNewNote = () => {
    setEditForm({ title: '', content: '', type: 'general' });
    setSelectedNote(null);
    setIsEditing(true);
  };

  const handleEditNote = (note: Note) => {
    setEditForm({
      title: note.title,
      content: note.content,
      type: note.type
    });
    setSelectedNote(note);
    setIsEditing(true);
  };

  const handleSaveNote = () => {
    // TODO: Implement save to backend
    console.log('Saving note for session:', sessionId, editForm);
    setIsEditing(false);
    setSelectedNote(null);
  };

  const handleDeleteNote = (noteId: string) => {
    // TODO: Implement delete from backend
    console.log('Deleting note:', noteId);
    setNotes(notes.filter(note => note.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Book size={24} />
            Session Notes
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <NotesListSection>
            <NotesHeader>
              <SectionTitle>Notes ({notes.length})</SectionTitle>
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus size={16} />}
                onClick={handleNewNote}
              >
                New Note
              </Button>
            </NotesHeader>
            
            <NotesList>
              {notes.map((note) => (
                <NoteItem
                  key={note.id}
                  $selected={selectedNote?.id === note.id}
                  onClick={() => setSelectedNote(note)}
                >
                  <NoteTitle>{note.title}</NoteTitle>
                  <NotePreview>{note.content}</NotePreview>
                  <NoteType $type={note.type}>{note.type}</NoteType>
                </NoteItem>
              ))}
            </NotesList>
          </NotesListSection>

          <NoteEditorSection>
            <EditorHeader>
              <SectionTitle>
                {isEditing ? (selectedNote ? 'Edit Note' : 'New Note') : 'Note Details'}
              </SectionTitle>
              {selectedNote && !isEditing && (
                <ButtonGroup>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Edit3 size={16} />}
                    onClick={() => handleEditNote(selectedNote)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Trash2 size={16} />}
                    onClick={() => handleDeleteNote(selectedNote.id)}
                  >
                    Delete
                  </Button>
                </ButtonGroup>
              )}
            </EditorHeader>

            {isEditing ? (
              <EditorForm>
                <FormInput
                  type="text"
                  placeholder="Note title..."
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                />
                <FormSelect
                  value={editForm.type}
                  onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as Note['type'] }))}
                >
                  <option value="general">General</option>
                  <option value="character">Character</option>
                  <option value="location">Location</option>
                  <option value="plot">Plot</option>
                </FormSelect>
                <FormTextarea
                  placeholder="Write your note here..."
                  value={editForm.content}
                  onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                />
                <ButtonGroup>
                  <Button
                    variant="primary"
                    leftIcon={<Save size={16} />}
                    onClick={handleSaveNote}
                  >
                    Save Note
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                </ButtonGroup>
              </EditorForm>
            ) : selectedNote ? (
              <div>
                <h4>{selectedNote.title}</h4>
                <NoteType $type={selectedNote.type}>{selectedNote.type}</NoteType>
                <p style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
                  {selectedNote.content}
                </p>
              </div>
            ) : (
              <p>Select a note to view details or create a new note.</p>
            )}
          </NoteEditorSection>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};