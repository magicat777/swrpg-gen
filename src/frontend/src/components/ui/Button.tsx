import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import { Loader2 } from 'lucide-react';
import { FactionIcon, FactionName } from './StarWarsIcons';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  faction?: FactionName;
  forceSide?: 'light' | 'dark' | 'neutral';
  children: ReactNode;
}

const getButtonColors = (theme: any, faction?: FactionName, forceSide?: 'light' | 'dark' | 'neutral') => {
  if (faction) {
    return theme.colors.factions[faction];
  }

  if (forceSide === 'light') {
    return theme.colors.lightSide;
  }

  if (forceSide === 'dark') {
    return theme.colors.darkSide;
  }

  return theme.colors.neutral;
};

const getVariantStyles = (variant: ButtonVariant, faction?: FactionName, forceSide?: 'light' | 'dark' | 'neutral') => {
  const variants = {
    primary: css`
      background-color: ${({ theme }) => {
        const colors = getButtonColors(theme, faction, forceSide);
        return colors.primary;
      }};
      color: white;
      border: 2px solid ${({ theme }) => {
        const colors = getButtonColors(theme, faction, forceSide);
        return colors.primary;
      }};

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => {
          const colors = getButtonColors(theme, faction, forceSide);
          return colors.secondary;
        }};
        border-color: ${({ theme }) => {
          const colors = getButtonColors(theme, faction, forceSide);
          return colors.secondary;
        }};
        box-shadow: ${({ theme }) => theme.effects.shadow.glow};
      }

      &:active:not(:disabled) {
        transform: translateY(1px);
        background-color: ${({ theme }) => {
          const colors = getButtonColors(theme, faction, forceSide);
          return colors.background;
        }};
      }
    `,
    secondary: css`
      background-color: ${({ theme }) => {
        const colors = getButtonColors(theme, faction, forceSide);
        return colors.secondary || theme.colors.neutral.secondary;
      }};
      color: white;
      border: 2px solid ${({ theme }) => {
        const colors = getButtonColors(theme, faction, forceSide);
        return colors.secondary || theme.colors.neutral.secondary;
      }};

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => {
          const colors = getButtonColors(theme, faction, forceSide);
          return colors.primary;
        }};
        border-color: ${({ theme }) => {
          const colors = getButtonColors(theme, faction, forceSide);
          return colors.primary;
        }};
      }
    `,
    outline: css`
      background-color: transparent;
      color: ${({ theme }) => {
        const colors = getButtonColors(theme, faction, forceSide);
        return colors.primary || theme.colors.neutral.text;
      }};
      border: 2px solid ${({ theme }) => {
        const colors = getButtonColors(theme, faction, forceSide);
        return colors.primary;
      }};

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => {
          const colors = getButtonColors(theme, faction, forceSide);
          return colors.primary;
        }};
        color: white;
      }
    `,
    ghost: css`
      background-color: transparent;
      color: ${({ theme }) => {
        const colors = getButtonColors(theme, faction, forceSide);
        return colors.primary || theme.colors.neutral.text;
      }};
      border: 2px solid transparent;

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => {
          const colors = getButtonColors(theme, faction, forceSide);
          return `${colors.accent || colors.primary}20`;
        }};
        border-color: ${({ theme }) => {
          const colors = getButtonColors(theme, faction, forceSide);
          return `${colors.accent || colors.primary}40`;
        }};
      }
    `,
    danger: css`
      background-color: ${({ theme }) => theme.colors.error};
      color: white;
      border: 2px solid ${({ theme }) => theme.colors.error};

      &:hover:not(:disabled) {
        background-color: ${({ theme }) => theme.colors.darkSide.primary};
        border-color: ${({ theme }) => theme.colors.darkSide.primary};
      }
    `,
  };

  return variants[variant];
};

const getSizeStyles = (size: ButtonSize) => {
  const sizes = {
    sm: css`
      padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      height: 32px;
    `,
    md: css`
      padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
      font-size: ${({ theme }) => theme.typography.fontSize.base};
      height: 40px;
    `,
    lg: css`
      padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
      font-size: ${({ theme }) => theme.typography.fontSize.lg};
      height: 48px;
    `,
  };

  return sizes[size];
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $size: ButtonSize;
  $fullWidth: boolean;
  $isLoading: boolean;
  $faction?: FactionName;
  $forceSide?: 'light' | 'dark' | 'neutral';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: 1;
  
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  transition: ${({ theme }) => theme.effects.transition.fast};
  cursor: pointer;
  
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};
  
  ${({ $variant, $faction, $forceSide }) => getVariantStyles($variant, $faction, $forceSide)}
  ${({ $size }) => getSizeStyles($size)}
  
  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.lightSide.primary};
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: none;
    }
  }
  
  ${({ $isLoading }) =>
    $isLoading &&
    css`
      cursor: not-allowed;
      
      > *:not(.loading-spinner) {
        visibility: hidden;
      }
    `}
`;

const LoadingSpinner = styled(Loader2)`
  position: absolute;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  faction,
  forceSide = 'neutral',
  children,
  disabled,
  ...props
}) => {
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  
  // Auto-add faction icon if faction is specified but no leftIcon provided
  const finalLeftIcon = leftIcon || (faction && !isLoading ? <FactionIcon faction={faction} size={iconSize} /> : null);

  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $isLoading={isLoading}
      $faction={faction}
      $forceSide={forceSide}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <LoadingSpinner className="loading-spinner" size={16} />}
      
      {finalLeftIcon && !isLoading && <IconWrapper>{finalLeftIcon}</IconWrapper>}
      
      <span>{children}</span>
      
      {rightIcon && !isLoading && <IconWrapper>{rightIcon}</IconWrapper>}
    </StyledButton>
  );
};

export default Button;