import React from 'react';
import styled, { css } from 'styled-components';
import { FactionIcon, FactionName } from './StarWarsIcons';

interface ThemedButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  faction?: FactionName;
  forceSide?: 'light' | 'dark' | 'neutral';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const getButtonColors = (theme: any, faction?: FactionName, forceSide?: 'light' | 'dark' | 'neutral') => {
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

const ButtonBase = styled.button<{
  $variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  $size: 'sm' | 'md' | 'lg';
  $faction?: FactionName;
  $forceSide?: 'light' | 'dark' | 'neutral';
  $fullWidth?: boolean;
  $loading?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  border: 2px solid transparent;
  cursor: pointer;
  transition: ${({ theme }) => theme.effects.transition.normal};
  position: relative;
  overflow: hidden;
  
  ${({ $fullWidth }) => $fullWidth && css`
    width: 100%;
  `}

  ${({ $loading }) => $loading && css`
    pointer-events: none;
    opacity: 0.7;
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  &:focus {
    outline: none;
    box-shadow: ${({ theme }) => theme.effects.shadow.glow};
  }

  /* Size variants */
  ${({ $size, theme }) => {
    switch ($size) {
      case 'sm':
        return css`
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          font-size: ${theme.typography.fontSize.sm};
          min-height: 32px;
        `;
      case 'lg':
        return css`
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          font-size: ${theme.typography.fontSize.lg};
          min-height: 48px;
        `;
      default:
        return css`
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.fontSize.base};
          min-height: 40px;
        `;
    }
  }}

  /* Style variants */
  ${({ theme, $variant, $faction, $forceSide }) => {
    const colors = getButtonColors(theme, $faction, $forceSide);

    switch ($variant) {
      case 'primary':
        return css`
          background: ${colors.primary};
          color: white;
          border-color: ${colors.primary};

          &:hover:not(:disabled) {
            background: ${colors.secondary};
            border-color: ${colors.secondary};
            box-shadow: ${theme.effects.shadow.md};
          }

          &:active:not(:disabled) {
            background: ${colors.background};
            transform: translateY(1px);
          }
        `;

      case 'secondary':
        return css`
          background: ${colors.secondary};
          color: white;
          border-color: ${colors.secondary};

          &:hover:not(:disabled) {
            background: ${colors.primary};
            border-color: ${colors.primary};
            box-shadow: ${theme.effects.shadow.md};
          }

          &:active:not(:disabled) {
            background: ${colors.background};
            transform: translateY(1px);
          }
        `;

      case 'outline':
        return css`
          background: transparent;
          color: ${colors.primary};
          border-color: ${colors.primary};

          &:hover:not(:disabled) {
            background: ${colors.primary};
            color: white;
            box-shadow: ${theme.effects.shadow.md};
          }

          &:active:not(:disabled) {
            background: ${colors.secondary};
            transform: translateY(1px);
          }
        `;

      case 'ghost':
        return css`
          background: transparent;
          color: ${colors.primary};
          border-color: transparent;

          &:hover:not(:disabled) {
            background: ${colors.accent}20;
            border-color: ${colors.accent}40;
          }

          &:active:not(:disabled) {
            background: ${colors.accent}40;
            transform: translateY(1px);
          }
        `;

      default:
        return '';
    }
  }}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const IconWrapper = styled.span<{ $position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  ${({ $position }) => $position === 'right' && css`
    order: 1;
  `}
`;

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  variant = 'primary',
  size = 'md',
  faction,
  forceSide = 'neutral',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  children,
  onClick,
  type = 'button',
  className,
  ...props
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const renderIcon = () => {
    if (loading) {
      return <LoadingSpinner />;
    }
    
    if (faction && !icon) {
      return <FactionIcon faction={faction} size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />;
    }
    
    return icon;
  };

  return (
    <ButtonBase
      $variant={variant}
      $size={size}
      $faction={faction}
      $forceSide={forceSide}
      $fullWidth={fullWidth}
      $loading={loading}
      disabled={disabled}
      onClick={handleClick}
      type={type}
      className={className}
      {...props}
    >
      {renderIcon() && iconPosition === 'left' && (
        <IconWrapper $position="left">
          {renderIcon()}
        </IconWrapper>
      )}
      {children}
      {renderIcon() && iconPosition === 'right' && (
        <IconWrapper $position="right">
          {renderIcon()}
        </IconWrapper>
      )}
    </ButtonBase>
  );
};