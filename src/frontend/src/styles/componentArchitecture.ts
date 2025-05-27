// Star Wars Design System - Component Architecture
// Defines styling patterns for Star Wars-themed UI components

import { css } from 'styled-components';
import { StarWarsTheme } from './theme';

// =============================================
// COMPONENT MIXINS - Core Star Wars UI Elements
// =============================================

export const componentMixins = {
  
  // Imperial Command Center Button
  imperialButton: css`
    background: linear-gradient(135deg, #1a1a1a 0%, #4a5568 100%);
    border: 2px solid #e2e8f0;
    color: #e2e8f0;
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.cinematic};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.bold};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.base};
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: ${({ theme }: { theme: StarWarsTheme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
    border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.md};
    cursor: pointer;
    transition: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.transition.fast};
    position: relative;
    overflow: hidden;
    
    &:hover {
      box-shadow: 0 0 15px rgba(226, 232, 240, 0.5);
      transform: translateY(-2px);
      background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 0 10px rgba(226, 232, 240, 0.3);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
    
    // Holographic scan line effect
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
      transition: left 0.6s ease;
    }
    
    &:hover::before {
      left: 100%;
    }
  `,

  // Rebel Alliance Button
  rebelButton: css`
    background: linear-gradient(135deg, #f56500 0%, #ffa726 100%);
    border: 2px solid #e53e3e;
    color: #ffffff;
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.cinematic};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.bold};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.base};
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: ${({ theme }: { theme: StarWarsTheme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
    border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.md};
    cursor: pointer;
    transition: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.transition.fast};
    position: relative;
    
    &:hover {
      box-shadow: 0 0 15px rgba(245, 101, 0, 0.6);
      transform: translateY(-2px);
      background: linear-gradient(135deg, #ed8936 0%, #f6ad55 100%);
    }
    
    &:active {
      transform: translateY(0);
      box-shadow: 0 0 10px rgba(245, 101, 0, 0.4);
    }
  `,

  // Jedi Temple Button
  jediButton: css`
    background: linear-gradient(135deg, #4299e1 0%, #63b3ed 100%);
    border: 2px solid #bee3f8;
    color: #1a202c;
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.cinematic};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.bold};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.base};
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: ${({ theme }: { theme: StarWarsTheme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
    border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.md};
    cursor: pointer;
    transition: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.transition.fast};
    
    &:hover {
      box-shadow: 0 0 15px rgba(66, 153, 225, 0.5);
      transform: translateY(-2px);
      background: linear-gradient(135deg, #63b3ed 0%, #90cdf4 100%);
    }
  `,

  // Sith Fortress Button
  sithButton: css`
    background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
    border: 2px solid #742a2a;
    color: #f7fafc;
    font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.cinematic};
    font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.bold};
    font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.base};
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: ${({ theme }: { theme: StarWarsTheme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
    border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.md};
    cursor: pointer;
    transition: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.transition.fast};
    position: relative;
    
    &:hover {
      box-shadow: 0 0 20px rgba(229, 62, 62, 0.7);
      transform: translateY(-2px);
      background: linear-gradient(135deg, #fc8181 0%, #e53e3e 100%);
    }
    
    // Dark Side energy effect
    &:hover::after {
      content: '';
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, transparent, #e53e3e, transparent);
      border-radius: inherit;
      z-index: -1;
      animation: darkSideEnergy 2s infinite;
    }
    
    @keyframes darkSideEnergy {
      0% { opacity: 0; }
      50% { opacity: 0.3; }
      100% { opacity: 0; }
    }
  `,

  // Datapad Card Design (Information Display)
  datapadCard: css`
    background: linear-gradient(145deg, #2d3748 0%, #1a202c 100%);
    border: 1px solid #4a5568;
    border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.lg};
    padding: ${({ theme }: { theme: StarWarsTheme }) => theme.spacing.lg};
    position: relative;
    color: #e2e8f0;
    box-shadow: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.shadow.md};
    transition: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.transition.normal};
    
    // Holographic scan line effect
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, #4299e1, transparent);
      animation: scan 3s infinite;
    }
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.shadow.lg};
      border-color: #4299e1;
    }
    
    @keyframes scan {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `,

  // Holocron Card Design (Lore/Character Information)
  holocronCard: css`
    background: linear-gradient(135deg, #bee3f8 0%, #ebf8ff 100%);
    border: 2px solid #4299e1;
    border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.lg};
    padding: ${({ theme }: { theme: StarWarsTheme }) => theme.spacing.lg};
    position: relative;
    color: #1a202c;
    box-shadow: 0 8px 25px rgba(66, 153, 225, 0.15);
    transition: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.transition.normal};
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(66, 153, 225, 0.1) 0%, transparent 70%);
      animation: holocronGlow 4s ease-in-out infinite;
    }
    
    &:hover {
      transform: translateY(-6px) rotateX(5deg);
      box-shadow: 0 15px 35px rgba(66, 153, 225, 0.3);
      border-color: #63b3ed;
    }
    
    @keyframes holocronGlow {
      0%, 100% { opacity: 0.3; transform: rotate(0deg); }
      50% { opacity: 0.8; transform: rotate(180deg); }
    }
  `,

  // Terminal Interface Form
  terminalForm: css`
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    border: 1px solid #4a5568;
    border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.md};
    padding: ${({ theme }: { theme: StarWarsTheme }) => theme.spacing.xl};
    position: relative;
    
    // Terminal screen effect
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: 
        linear-gradient(90deg, transparent 98%, rgba(66, 153, 225, 0.1) 100%),
        linear-gradient(0deg, transparent 98%, rgba(66, 153, 225, 0.1) 100%);
      background-size: 3px 3px;
      pointer-events: none;
      border-radius: inherit;
    }
    
    input, textarea, select {
      background: rgba(26, 32, 44, 0.8);
      border: 1px solid #4a5568;
      border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.sm};
      color: #e2e8f0;
      padding: ${({ theme }: { theme: StarWarsTheme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
      font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.technical};
      transition: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.transition.fast};
      
      &:focus {
        border-color: #4299e1;
        box-shadow: 0 0 10px rgba(66, 153, 225, 0.3);
        outline: none;
      }
      
      &::placeholder {
        color: #a0aec0;
      }
    }
    
    label {
      color: #a0aec0;
      font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.technical};
      font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.sm};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: ${({ theme }: { theme: StarWarsTheme }) => theme.spacing.xs};
      display: block;
    }
  `,

  // Navigation Menu Holographic Style
  holographicNavigation: css`
    background: rgba(26, 32, 44, 0.9);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(66, 153, 225, 0.3);
    border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.lg};
    box-shadow: 0 8px 32px rgba(66, 153, 225, 0.15);
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    
    li {
      border-bottom: 1px solid rgba(74, 85, 104, 0.3);
      
      &:last-child {
        border-bottom: none;
      }
    }
    
    a {
      display: block;
      padding: ${({ theme }: { theme: StarWarsTheme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
      color: #e2e8f0;
      text-decoration: none;
      font-family: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontFamily.cinematic};
      font-size: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontSize.sm};
      font-weight: ${({ theme }: { theme: StarWarsTheme }) => theme.typography.fontWeight.semibold};
      letter-spacing: 0.05em;
      text-transform: uppercase;
      transition: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.transition.fast};
      position: relative;
      
      &:hover {
        background: rgba(66, 153, 225, 0.1);
        color: #4299e1;
        text-shadow: 0 0 10px rgba(66, 153, 225, 0.5);
      }
      
      &.active {
        background: rgba(66, 153, 225, 0.2);
        color: #63b3ed;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: #4299e1;
          box-shadow: 0 0 10px #4299e1;
        }
      }
    }
  `,

  // Loading Spinner - Technical Scanner
  technicalSpinner: css`
    width: 40px;
    height: 40px;
    border: 3px solid rgba(66, 153, 225, 0.3);
    border-top: 3px solid #4299e1;
    border-radius: 50%;
    animation: technicalScan 1s linear infinite;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      inset: 6px;
      border: 1px solid rgba(66, 153, 225, 0.5);
      border-radius: 50%;
      animation: technicalScan 2s linear infinite reverse;
    }
    
    @keyframes technicalScan {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,

  // Modal/Dialog Imperial Command Style
  imperialModal: css`
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
    border: 2px solid #4a5568;
    border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.lg};
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    
    // Imperial border decoration
    &::before {
      content: '';
      position: absolute;
      inset: 8px;
      border: 1px solid rgba(226, 232, 240, 0.2);
      border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.md};
      pointer-events: none;
    }
    
    // Imperial corner accents
    &::after {
      content: '';
      position: absolute;
      top: 16px;
      left: 16px;
      right: 16px;
      bottom: 16px;
      background: 
        linear-gradient(45deg, #4a5568 0px, #4a5568 2px, transparent 2px, transparent 10px),
        linear-gradient(-45deg, #4a5568 0px, #4a5568 2px, transparent 2px, transparent 10px),
        linear-gradient(135deg, #4a5568 0px, #4a5568 2px, transparent 2px, transparent 10px),
        linear-gradient(-135deg, #4a5568 0px, #4a5568 2px, transparent 2px, transparent 10px);
      background-position: top left, top right, bottom right, bottom left;
      background-repeat: no-repeat;
      background-size: 20px 20px;
      pointer-events: none;
    }
  `,

  // Status Indicator Lights
  statusIndicator: css`
    width: 12px;
    height: 12px;
    border-radius: 50%;
    position: relative;
    display: inline-block;
    
    &.online {
      background: #48bb78;
      box-shadow: 0 0 10px rgba(72, 187, 120, 0.5);
      
      &::after {
        content: '';
        position: absolute;
        inset: 2px;
        background: #68d391;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }
    }
    
    &.offline {
      background: #e53e3e;
      box-shadow: 0 0 10px rgba(229, 62, 62, 0.5);
    }
    
    &.warning {
      background: #d69e2e;
      box-shadow: 0 0 10px rgba(214, 158, 46, 0.5);
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
  `,

  // Progress Bar - Energy Charging Effect
  energyProgressBar: css`
    width: 100%;
    height: 8px;
    background: rgba(45, 55, 72, 0.8);
    border-radius: ${({ theme }: { theme: StarWarsTheme }) => theme.effects.borderRadius.full};
    overflow: hidden;
    position: relative;
    border: 1px solid #4a5568;
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #4299e1 0%, #63b3ed 50%, #4299e1 100%);
      background-size: 200% 100%;
      animation: energyFlow 2s ease-in-out infinite;
      border-radius: inherit;
      transition: width 0.3s ease;
      position: relative;
      
      &::after {
        content: '';
        position: absolute;
        top: 0;
        right: -10px;
        width: 10px;
        height: 100%;
        background: linear-gradient(90deg, rgba(66, 153, 225, 0.8), transparent);
        border-radius: 0 4px 4px 0;
      }
    }
    
    @keyframes energyFlow {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `
};

// =============================================
// COMPONENT VARIANTS - Quick Application
// =============================================

export const ComponentVariants = {
  buttons: {
    imperial: 'component-imperial-button',
    rebel: 'component-rebel-button', 
    jedi: 'component-jedi-button',
    sith: 'component-sith-button'
  },
  cards: {
    datapad: 'component-datapad-card',
    holocron: 'component-holocron-card'
  },
  forms: {
    terminal: 'component-terminal-form'
  },
  navigation: {
    holographic: 'component-holographic-navigation'
  },
  modals: {
    imperial: 'component-imperial-modal'
  },
  indicators: {
    status: 'component-status-indicator',
    progress: 'component-energy-progress-bar'
  },
  loading: {
    technical: 'component-technical-spinner'
  }
} as const;

export type ComponentVariant = keyof typeof componentMixins;

// Helper function to apply component styles
export const getComponentStyles = (variant: ComponentVariant) => {
  return componentMixins[variant];
};

// Animation keyframes for reuse
export const starWarsAnimations = {
  scan: css`
    @keyframes scan {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `,
  
  holocronGlow: css`
    @keyframes holocronGlow {
      0%, 100% { opacity: 0.3; transform: rotate(0deg); }
      50% { opacity: 0.8; transform: rotate(180deg); }
    }
  `,
  
  darkSideEnergy: css`
    @keyframes darkSideEnergy {
      0% { opacity: 0; }
      50% { opacity: 0.3; }
      100% { opacity: 0; }
    }
  `,
  
  technicalScan: css`
    @keyframes technicalScan {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,
  
  energyFlow: css`
    @keyframes energyFlow {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  `,
  
  pulse: css`
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }
  `
};

export default componentMixins;