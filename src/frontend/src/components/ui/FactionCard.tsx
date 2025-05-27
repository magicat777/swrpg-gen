import React from 'react';
import styled, { css } from 'styled-components';
import { FactionIcon, FactionName } from './StarWarsIcons';

interface FactionCardProps {
  faction?: FactionName;
  forceSide?: 'light' | 'dark' | 'neutral';
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  selected?: boolean;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  headerContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const getCardColors = (theme: any, faction?: FactionName, forceSide?: 'light' | 'dark' | 'neutral') => {
  if (faction) {
    const factionColors = theme.colors.factions[faction];
    return {
      primary: factionColors.primary,
      secondary: factionColors.secondary,
      accent: factionColors.accent,
      background: factionColors.background,
    };
  }

  if (forceSide === 'light') {
    return theme.colors.lightSide;
  }

  if (forceSide === 'dark') {
    return theme.colors.darkSide;
  }

  return theme.colors.neutral;
};

const CardContainer = styled.div<{
  $variant: 'default' | 'elevated' | 'outlined' | 'filled';
  $size: 'sm' | 'md' | 'lg';
  $faction?: FactionName;
  $forceSide?: 'light' | 'dark' | 'neutral';
  $interactive?: boolean;
  $selected?: boolean;
}>`
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  overflow: hidden;
  transition: ${({ theme }) => theme.effects.transition.normal};
  position: relative;

  ${({ $interactive }) => $interactive && css`
    cursor: pointer;
    
    &:hover {
      transform: translateY(-2px);
    }
    
    &:active {
      transform: translateY(0);
    }
  `}

  ${({ $size, theme }) => {
    switch ($size) {
      case 'sm':
        return css`
          padding: ${theme.spacing.sm};
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing.lg};
        `;
      default:
        return css`
          padding: ${theme.spacing.md};
        `;
    }
  }}

  ${({ theme, $variant, $faction, $forceSide, $selected }) => {
    const colors = getCardColors(theme, $faction, $forceSide);

    const baseStyles = css`
      ${$selected && css`
        border: 2px solid ${colors.primary};
        box-shadow: 0 0 20px ${colors.primary}40;
      `}
    `;

    switch ($variant) {
      case 'elevated':
        return css`
          ${baseStyles}
          background: ${theme.colors.neutral.surface};
          color: ${theme.colors.neutral.text};
          box-shadow: ${theme.effects.shadow.lg};
          border: 1px solid ${colors.accent}20;

          &:hover {
            box-shadow: ${theme.effects.shadow.xl};
            border-color: ${colors.accent}40;
          }
        `;

      case 'outlined':
        return css`
          ${baseStyles}
          background: transparent;
          color: ${theme.colors.neutral.text};
          border: 2px solid ${colors.primary};

          &:hover {
            background: ${colors.accent}10;
            border-color: ${colors.secondary};
          }
        `;

      case 'filled':
        return css`
          ${baseStyles}
          background: linear-gradient(135deg, ${colors.primary}, ${colors.secondary});
          color: white;
          border: none;

          &:hover {
            background: linear-gradient(135deg, ${colors.secondary}, ${colors.background});
          }
        `;

      default:
        return css`
          ${baseStyles}
          background: ${theme.colors.neutral.surface};
          color: ${theme.colors.neutral.text};
          border: 1px solid ${theme.colors.neutral.border};
          box-shadow: ${theme.effects.shadow.sm};

          &:hover {
            border-color: ${colors.primary};
            box-shadow: ${theme.effects.shadow.md};
          }
        `;
    }
  }}
`;

const CardHeader = styled.div<{
  $faction?: FactionName;
  $forceSide?: 'light' | 'dark' | 'neutral';
}>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme, $faction, $forceSide }) => {
    const colors = getCardColors(theme, $faction, $forceSide);
    return `${colors.accent}30`;
  }};
`;

const FactionIconWrapper = styled.div<{
  $faction?: FactionName;
  $forceSide?: 'light' | 'dark' | 'neutral';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  background: ${({ theme, $faction, $forceSide }) => {
    const colors = getCardColors(theme, $faction, $forceSide);
    return `${colors.primary}20`;
  }};
  color: ${({ theme, $faction, $forceSide }) => {
    const colors = getCardColors(theme, $faction, $forceSide);
    return colors.primary;
  }};
`;

const CardTitleSection = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  line-height: ${({ theme }) => theme.typography.lineHeight.tight};
`;

const CardSubtitle = styled.p`
  margin: ${({ theme }) => theme.spacing.xs} 0 0 0;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  opacity: 0.8;
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardFooter = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const FactionBadge = styled.div<{
  $faction?: FactionName;
  $forceSide?: 'light' | 'dark' | 'neutral';
}>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${({ theme, $faction, $forceSide }) => {
    const colors = getCardColors(theme, $faction, $forceSide);
    return colors.primary;
  }};
  color: white;
`;

export const FactionCard: React.FC<FactionCardProps> = ({
  faction,
  forceSide = 'neutral',
  variant = 'default',
  size = 'md',
  interactive = false,
  selected = false,
  title,
  subtitle,
  children,
  headerContent,
  footerContent,
  onClick,
  className,
}) => {
  const handleClick = () => {
    if (interactive && onClick) {
      onClick();
    }
  };

  const showHeader = title || subtitle || headerContent || faction;
  const factionName = faction ? faction.charAt(0).toUpperCase() + faction.slice(1) : null;

  return (
    <CardContainer
      $variant={variant}
      $size={size}
      $faction={faction}
      $forceSide={forceSide}
      $interactive={interactive}
      $selected={selected}
      onClick={handleClick}
      className={className}
    >
      {faction && (
        <FactionBadge $faction={faction} $forceSide={forceSide}>
          {factionName}
        </FactionBadge>
      )}

      {showHeader && (
        <CardHeader $faction={faction} $forceSide={forceSide}>
          {faction && (
            <FactionIconWrapper $faction={faction} $forceSide={forceSide}>
              <FactionIcon faction={faction} size={24} />
            </FactionIconWrapper>
          )}
          
          {(title || subtitle) && (
            <CardTitleSection>
              {title && <CardTitle>{title}</CardTitle>}
              {subtitle && <CardSubtitle>{subtitle}</CardSubtitle>}
            </CardTitleSection>
          )}
          
          {headerContent}
        </CardHeader>
      )}

      <CardContent>
        {children}
      </CardContent>

      {footerContent && (
        <CardFooter>
          {footerContent}
        </CardFooter>
      )}
    </CardContainer>
  );
};