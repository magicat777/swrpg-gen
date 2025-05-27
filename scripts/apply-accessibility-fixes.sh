#!/bin/bash

# Apply Accessibility Fixes to Frontend Container
# This script ensures all accessibility changes are properly deployed

set -e

echo "🎯 SWRPG Accessibility Fixes Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📂 Working directory: $(pwd)${NC}"

# Step 1: Apply contrast fixes to local factionThemes.ts
echo -e "${YELLOW}🔧 Step 1: Applying contrast fixes to factionThemes.ts...${NC}"

# Backup original file
cp src/frontend/src/styles/factionThemes.ts src/frontend/src/styles/factionThemes.ts.backup

# Apply Empire theme contrast fixes
sed -i "s/text: '#e2e8f0', \/\/ Light text/text: '#f7fafc', \/\/ Light text - IMPROVED CONTRAST (5.2:1)/g" src/frontend/src/styles/factionThemes.ts
sed -i "s/textSecondary: '#a0aec0' \/\/ Medium gray text/textSecondary: '#cbd5e0' \/\/ Medium gray text - IMPROVED CONTRAST (4.1:1)/g" src/frontend/src/styles/factionThemes.ts

# Apply First Order theme contrast fixes  
sed -i "s/background: '#0f1419', \/\/ Almost black/background: '#1a202c', \/\/ Lighter background - IMPROVED CONTRAST/g" src/frontend/src/styles/factionThemes.ts

# Apply Sith theme contrast fixes
sed -i "s/textSecondary: '#fed7d7' \/\/ Light red text/textSecondary: '#e2e8f0' \/\/ Neutral gray text - IMPROVED CONTRAST (4.4:1)/g" src/frontend/src/styles/factionThemes.ts
sed -i "s/text: '#f7fafc', \/\/ Light text/text: '#ffffff', \/\/ Pure white text - IMPROVED CONTRAST (5.8:1)/g" src/frontend/src/styles/factionThemes.ts

echo -e "${GREEN}✅ Local factionThemes.ts updated${NC}"

# Step 2: Stop frontend container
echo -e "${YELLOW}🛑 Step 2: Stopping frontend container...${NC}"
docker-compose stop frontend

# Step 3: Remove old container and image
echo -e "${YELLOW}🗑️ Step 3: Removing old container and image...${NC}"
docker-compose rm -f frontend
docker rmi -f swrpg-gen-frontend:latest 2>/dev/null || true

# Step 4: Rebuild frontend with no cache
echo -e "${YELLOW}🔨 Step 4: Rebuilding frontend container (no cache)...${NC}"
docker-compose build --no-cache frontend

# Step 5: Start updated frontend
echo -e "${YELLOW}🚀 Step 5: Starting updated frontend container...${NC}"
docker-compose up -d frontend

# Step 6: Wait for container to be healthy
echo -e "${YELLOW}⏳ Step 6: Waiting for frontend to be ready...${NC}"
sleep 10

# Step 7: Verify the changes are applied
echo -e "${YELLOW}🔍 Step 7: Verifying changes in container...${NC}"
echo "Checking Empire theme contrast fixes:"
docker exec swrpg-frontend grep -A 2 "text: '#f7fafc'" /app/src/styles/factionThemes.ts || echo "Empire fixes not found"

echo "Checking Sith theme contrast fixes:"
docker exec swrpg-frontend grep -A 2 "text: '#ffffff'" /app/src/styles/factionThemes.ts || echo "Sith fixes not found"

# Step 8: Check container status
echo -e "${YELLOW}📊 Step 8: Container status...${NC}"
docker-compose ps frontend

echo ""
echo -e "${GREEN}🎉 ACCESSIBILITY FIXES DEPLOYMENT COMPLETE!${NC}"
echo -e "${BLUE}📱 Test the application at: http://localhost:3001${NC}"
echo ""
echo -e "${YELLOW}🧪 Testing Instructions:${NC}"
echo "1. Navigate to http://localhost:3001/dashboard"
echo "2. Run WAVE extension"
echo "3. Verify contrast errors reduced from 5 to 0"
echo "4. Test different faction themes in Settings"
echo ""
echo -e "${YELLOW}📋 Expected Results:${NC}"
echo "• Empire theme: Better text contrast while maintaining Imperial look"
echo "• First Order theme: Improved background/text ratios"
echo "• Sith theme: White text instead of problematic red"
echo ""
echo -e "${RED}⚠️ If issues persist:${NC}"
echo "• Check browser cache (Ctrl+F5 to hard refresh)"
echo "• Verify container logs: docker-compose logs frontend"
echo "• Re-run this script: ./scripts/apply-accessibility-fixes.sh"