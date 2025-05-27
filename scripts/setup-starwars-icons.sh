#!/bin/bash

echo "🌟 Setting Up Star Wars Icon Assets"
echo "=================================="
echo ""

# Create icons directory
mkdir -p /home/magic/projects/swrpg-gen/src/frontend/src/assets/icons

echo "📦 Downloading Star Wars Glyph Icons..."
cd /tmp
git clone https://github.com/maxgreb/StarWars-Glyph-Icons.git starwars-glyphs 2>/dev/null || echo "Repository already exists"

echo "📦 Downloading Stream Deck Squadrons Icons..."
git clone https://github.com/Ordo-Corona-Stellarum/streamdeck-squadrons-icons.git squadrons-icons 2>/dev/null || echo "Repository already exists"

echo ""
echo "📋 Available Star Wars Glyph Icons:"
echo "======================================"

# List available glyph icons
if [ -d "starwars-glyphs" ]; then
    echo "Found glyph icons repository. Available icons:"
    ls starwars-glyphs/css/ 2>/dev/null || echo "CSS directory not found"
    ls starwars-glyphs/fonts/ 2>/dev/null || echo "Fonts directory not found"
    
    # Copy glyph assets to our project
    echo ""
    echo "📋 Copying glyph assets..."
    cp -r starwars-glyphs/* /home/magic/projects/swrpg-gen/src/frontend/src/assets/icons/ 2>/dev/null || echo "Copy failed"
fi

echo ""
echo "📋 Available Squadrons Icons:"
echo "============================="

# List available squadrons icons
if [ -d "squadrons-icons" ]; then
    echo "Found squadrons icons repository. Available icons:"
    find squadrons-icons -name "*.svg" | head -20
    
    # Copy squadrons assets to our project
    echo ""
    echo "📋 Copying squadrons assets..."
    cp -r squadrons-icons/* /home/magic/projects/swrpg-gen/src/frontend/src/assets/icons/ 2>/dev/null || echo "Copy failed"
fi

echo ""
echo "🎨 Creating Enhanced Star Wars Icon Components..."

# Create enhanced icon component
cat > /home/magic/projects/swrpg-gen/src/frontend/src/components/ui/EnhancedStarWarsIcons.tsx << 'EOF'
import React from 'react';
import styled from 'styled-components';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// Enhanced Galaxy Map Icon (based on Imperial/Rebel symbols)
const GalacticMapIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Central Core */}
    <circle cx="12" cy="12" r="2" fill={color} />
    
    {/* Inner Ring */}
    <circle cx="12" cy="12" r="5" stroke={color} strokeWidth="1" fill="none" />
    
    {/* Outer Ring */}
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="0.5" fill="none" />
    
    {/* Spiral Arms */}
    <path d="M12 3 Q18 7 20 12 Q18 17 12 21 Q6 17 4 12 Q6 7 12 3" 
          stroke={color} strokeWidth="0.5" fill="none" />
    
    {/* Hyperspace Routes */}
    <line x1="3" y1="12" x2="7" y2="12" stroke={color} strokeWidth="0.3" />
    <line x1="17" y1="12" x2="21" y2="12" stroke={color} strokeWidth="0.3" />
    <line x1="12" y1="3" x2="12" y2="7" stroke={color} strokeWidth="0.3" />
    <line x1="12" y1="17" x2="12" y2="21" stroke={color} strokeWidth="0.3" />
  </svg>
);

// Planet/Location Icon
const PlanetIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="8" stroke={color} strokeWidth="1.5" fill="none" />
    <path d="M12 4 Q16 8 12 12 Q8 16 12 20" stroke={color} strokeWidth="1" fill="none" />
    <path d="M4 12 Q8 8 12 12 Q16 16 20 12" stroke={color} strokeWidth="1" fill="none" />
    <circle cx="12" cy="12" r="1" fill={color} />
  </svg>
);

// Space Station Icon
const SpaceStationIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="8" y="8" width="8" height="8" stroke={color} strokeWidth="1.5" fill="none" />
    <line x1="12" y1="4" x2="12" y2="8" stroke={color} strokeWidth="1" />
    <line x1="12" y1="16" x2="12" y2="20" stroke={color} strokeWidth="1" />
    <line x1="4" y1="12" x2="8" y2="12" stroke={color} strokeWidth="1" />
    <line x1="16" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1" />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

// Hyperlane Icon
const HyperlaneIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 12 L21 12" stroke={color} strokeWidth="2" strokeDasharray="2 1" />
    <path d="M3 8 L21 16" stroke={color} strokeWidth="1" strokeDasharray="1 2" opacity="0.6" />
    <path d="M3 16 L21 8" stroke={color} strokeWidth="1" strokeDasharray="1 2" opacity="0.6" />
    <circle cx="3" cy="12" r="1.5" fill={color} />
    <circle cx="21" cy="12" r="1.5" fill={color} />
  </svg>
);

// Sector Icon
const SectorIcon: React.FC<IconProps> = ({ size = 24, color = 'currentColor', className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" stroke={color} strokeWidth="1.5" fill="none" />
    <polygon points="12,6 18,9 18,15 12,18 6,15 6,9" stroke={color} strokeWidth="1" fill="none" />
    <circle cx="12" cy="12" r="2" fill={color} />
  </svg>
);

export const EnhancedStarWarsIcons = {
  galaxyMap: GalacticMapIcon,
  planet: PlanetIcon,
  spaceStation: SpaceStationIcon,
  hyperlane: HyperlaneIcon,
  sector: SectorIcon,
};

export default EnhancedStarWarsIcons;
EOF

echo "✅ Enhanced Star Wars icons created!"

echo ""
echo "🎨 Available Icon Categories:"
echo "=============================="
echo "✅ Galactic Map - Interactive galaxy navigation"
echo "✅ Planet Icons - Individual world markers" 
echo "✅ Space Station Icons - Orbital facility markers"
echo "✅ Hyperlane Icons - Trade route indicators"
echo "✅ Sector Icons - Regional boundary markers"

echo ""
echo "📋 Integration Instructions:"
echo "=============================="
echo "1. Import: import { EnhancedStarWarsIcons } from '../ui/EnhancedStarWarsIcons'"
echo "2. Use: <EnhancedStarWarsIcons.galaxyMap size={20} color=\"#FFE81F\" />"
echo "3. Map Integration: Already included in GalacticMap component"

echo ""
echo "🌟 Star Wars icon setup complete!"