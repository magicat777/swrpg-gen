import { css } from 'styled-components';
import { StarWarsTheme } from './theme';

// Typography Mixins for Star Wars Design System
// Based on component-specific typography rules

export const typographyMixins = {
  // Epic Page Titles (Dashboard, Character Lists)
  pageTitle: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.cinematic};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize['3xl']};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.heavy};
    letter-spacing: 0.05em;
    text-transform: uppercase;
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.tight};
  `,

  // Section Headers (Cards, Modals)
  sectionTitle: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.cinematic};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize['2xl']};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.bold};
    letter-spacing: 0.025em;
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.tight};
  `,

  // Character/Location Names
  characterName: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.cinematic};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.bold};
    letter-spacing: 0.025em;
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.tight};
  `,

  // Lore Descriptions & Quotes
  loreText: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.lore};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.normal};
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.relaxed};
    font-style: italic;
  `,

  // Technical Data (Stats, IDs, Coordinates)
  technicalData: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.technical};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.medium};
    letter-spacing: 0.05em;
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.normal};
    text-transform: uppercase;
  `,

  // UI Interface Elements (buttons, labels, forms)
  interface: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.primary};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.medium};
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.normal};
  `,

  // Cinematic Action Button Text
  cinematicButton: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.cinematic};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.heavy};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.tight};
  `,

  // Navigation and Menu Items
  navigation: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.cinematic};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.semibold};
    letter-spacing: 0.05em;
    text-transform: uppercase;
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.normal};
  `,

  // Faction Labels and Tags
  factionLabel: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.technical};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.bold};
    letter-spacing: 0.1em;
    text-transform: uppercase;
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.tight};
  `,

  // Quotes and Memorable Lines
  quote: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.lore};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.lg};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.normal};
    font-style: italic;
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.relaxed};
    
    &::before {
      content: '"';
      font-size: 1.5em;
      line-height: 0;
      vertical-align: -0.4em;
    }
    
    &::after {
      content: '"';
      font-size: 1.5em;
      line-height: 0;
      vertical-align: -0.4em;
    }
  `,

  // Empty State Messages
  emptyState: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.lore};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.base};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.normal};
    font-style: italic;
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.relaxed};
  `,

  // Loading State Messages
  loadingState: css`
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.technical};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.medium};
    letter-spacing: 0.05em;
    text-transform: uppercase;
    line-height: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.lineHeight.normal};
  `,
};

// Typography Utility Classes for quick application
export const TypographyClasses = {
  pageTitle: 'typography-page-title',
  sectionTitle: 'typography-section-title', 
  characterName: 'typography-character-name',
  loreText: 'typography-lore-text',
  technicalData: 'typography-technical-data',
  interface: 'typography-interface',
  cinematicButton: 'typography-cinematic-button',
  navigation: 'typography-navigation',
  factionLabel: 'typography-faction-label',
  quote: 'typography-quote',
  emptyState: 'typography-empty-state',
  loadingState: 'typography-loading-state',
} as const;

export type TypographyVariant = keyof typeof typographyMixins;

// Helper function to apply typography styles to styled components
export const getTypographyStyles = (variant: TypographyVariant) => {
  return typographyMixins[variant];
};

export default typographyMixins;