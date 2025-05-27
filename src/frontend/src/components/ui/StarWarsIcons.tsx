import React from 'react';
import styled from 'styled-components';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const IconSvg = styled.svg<{ size: number }>`
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  fill: currentColor;
  flex-shrink: 0;
`;

// Imperial Symbol
export const ImperialIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <path d="M12 2L22 7v10l-10 5L2 17V7l10-5z M12 4.5L4 8.5v7l8 4 8-4v-7l-8-4z M12 8l6 3v6l-6 3-6-3v-6l6-3z"/>
  </IconSvg>
);

// Rebel Alliance Symbol
export const RebelIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <path d="M12 2c-1.1 0-2 .9-2 2 0 .74.4 1.38 1 1.73v2.54c-2.79.8-5 3.11-6.03 6.03H2.73c-.35-.6-.99-1-1.73-1-1.1 0-2 .9-2 2s.9 2 2 2c.74 0 1.38-.4 1.73-1h2.54c1.03 2.92 3.24 5.23 6.03 6.03v2.54c-.6.35-1 .99-1 1.73 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.73v-2.54c2.79-.8 5-3.11 6.03-6.03h2.54c.35.6.99 1 1.73 1 1.1 0 2-.9 2-2s-.9-2-2-2c-.74 0-1.38.4-1.73 1h-2.54c-1.03-2.92-3.24-5.23-6.03-6.03V5.73c.6-.35 1-.99 1-1.73 0-1.1-.9-2-2-2z"/>
  </IconSvg>
);

// Jedi Order Symbol
export const JediIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z"/>
  </IconSvg>
);

// Sith Symbol
export const SithIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <path d="M12 2L8 6l4 4 4-4-4-4z M2 12l4-4 4 4-4 4-4-4z M14 12l4-4 4 4-4 4-4-4z M12 14l-4 4 4 4 4-4-4-4z"/>
  </IconSvg>
);

// Republic Symbol
export const RepublicIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1"/>
    <circle cx="12" cy="12" r="2"/>
    <path d="M12 2v4 M22 12h-4 M12 22v-4 M2 12h4"/>
  </IconSvg>
);

// First Order Symbol
export const FirstOrderIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <path d="M12 2L20 6v12l-8 4L4 18V6l8-4z M12 6l-6 3v6l6 3 6-3V9l-6-3z M12 9l3 1.5v3L12 15l-3-1.5v-3L12 9z"/>
  </IconSvg>
);

// Resistance Symbol
export const ResistanceIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <path d="M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6z"/>
    <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
  </IconSvg>
);

// Mandalorian Symbol
export const MandalorianIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <path d="M12 3c-5 0-9 4-9 9s4 9 9 9 9-4 9-9-4-9-9-9z M8 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z M14 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z M7 16c1-2 2.5-3 5-3s4 1 5 3"/>
  </IconSvg>
);

// Hutt Cartel Symbol
export const HuttIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z M12 18c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z"/>
    <path d="M9 10h6v4H9z"/>
  </IconSvg>
);

// Force Lightning Icon
export const ForceLightningIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <path d="M11 2L6 10h4l-2 10 8-12h-4l3-6z"/>
  </IconSvg>
);

// Lightsaber Icon
export const LightsaberIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <rect x="11" y="2" width="2" height="14" rx="1"/>
    <rect x="10" y="16" width="4" height="3" rx="1"/>
    <rect x="9" y="19" width="6" height="2" rx="1"/>
    <rect x="10.5" y="21" width="3" height="1" rx="0.5"/>
  </IconSvg>
);

// Death Star Icon
export const DeathStarIcon: React.FC<IconProps> = ({ size = 24, color, className }) => (
  <IconSvg size={size} viewBox="0 0 24 24" color={color} className={className}>
    <circle cx="12" cy="12" r="10" fill="currentColor"/>
    <circle cx="12" cy="12" r="8" fill="none" stroke="white" strokeWidth="0.5"/>
    <circle cx="15" cy="9" r="2" fill="none" stroke="white" strokeWidth="1"/>
    <path d="M2 12h20" stroke="white" strokeWidth="0.5"/>
    <path d="M6 8h12" stroke="white" strokeWidth="0.3"/>
    <path d="M4 16h16" stroke="white" strokeWidth="0.3"/>
  </IconSvg>
);

// Faction Icon Map
export const FactionIcons = {
  empire: ImperialIcon,
  rebellion: RebelIcon,
  republic: RepublicIcon,
  firstOrder: FirstOrderIcon,
  resistance: ResistanceIcon,
  jedi: JediIcon,
  sith: SithIcon,
  mandalorian: MandalorianIcon,
  hutt: HuttIcon,
} as const;

export type FactionName = keyof typeof FactionIcons;

// Galaxy Map Icon
const GalaxyMapIcon: React.FC<IconProps> = ({ size = 20, color = 'currentColor', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    <path d="M6.34 6.34l2.83 2.83M14.83 14.83l2.83 2.83M6.34 17.66l2.83-2.83M14.83 9.17l2.83-2.83" />
  </svg>
);

export const StarWarsIcons = {
  galaxyMap: GalaxyMapIcon,
};

// Generic Faction Icon Component
interface FactionIconProps extends IconProps {
  faction: FactionName;
}

export const FactionIcon: React.FC<FactionIconProps> = ({ faction, ...props }) => {
  const IconComponent = FactionIcons[faction];
  return <IconComponent {...props} />;
};