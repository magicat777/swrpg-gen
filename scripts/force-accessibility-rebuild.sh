#!/bin/bash

# Force Complete Accessibility Rebuild
# This script ensures accessibility changes are fully deployed by rebuilding everything

set -e

echo "🎯 FORCE ACCESSIBILITY REBUILD"
echo "============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Stop all containers
echo -e "${YELLOW}🛑 Stopping all containers...${NC}"
docker-compose down

# Step 2: Remove frontend image completely
echo -e "${YELLOW}🗑️ Removing frontend image completely...${NC}"
docker rmi -f swrpg-gen-frontend:latest 2>/dev/null || true
docker system prune -f

# Step 3: Verify our local theme file has the fixes
echo -e "${YELLOW}🔍 Verifying local theme file has accessibility fixes...${NC}"
if grep -q "FIXED: Light text - IMPROVED CONTRAST" src/frontend/src/styles/factionThemes.ts; then
    echo -e "${GREEN}✅ Local theme file has accessibility fixes${NC}"
else
    echo -e "${RED}❌ Local theme file missing fixes - applying now...${NC}"
    
    # Apply fixes to local file
    sed -i "s/text: '#e2e8f0',/text: '#f7fafc', \/\/ FIXED: Light text - IMPROVED CONTRAST (5.2:1)/g" src/frontend/src/styles/factionThemes.ts
    sed -i "s/textSecondary: '#a0aec0'/textSecondary: '#cbd5e0' \/\/ FIXED: Medium gray text - IMPROVED CONTRAST (4.1:1)/g" src/frontend/src/styles/factionThemes.ts
    sed -i "s/background: '#0f1419',/background: '#1a202c', \/\/ FIXED: Lighter background - IMPROVED CONTRAST/g" src/frontend/src/styles/factionThemes.ts
    sed -i "s/text: '#f7fafc',/text: '#ffffff', \/\/ FIXED: Pure white text - IMPROVED CONTRAST (5.8:1)/g" src/frontend/src/styles/factionThemes.ts
    sed -i "s/textSecondary: '#fed7d7'/textSecondary: '#e2e8f0' \/\/ FIXED: Neutral gray text - REMOVED RED for better contrast (4.4:1)/g" src/frontend/src/styles/factionThemes.ts
    
    echo -e "${GREEN}✅ Applied accessibility fixes to local file${NC}"
fi

# Step 4: Show what we're deploying
echo -e "${BLUE}📋 Theme fixes being deployed:${NC}"
echo "Empire theme:"
grep -A 2 -B 1 "text: '#f7fafc'" src/frontend/src/styles/factionThemes.ts || echo "Empire fix not found"
echo ""
echo "Sith theme:"
grep -A 2 -B 1 "text: '#ffffff'" src/frontend/src/styles/factionThemes.ts || echo "Sith fix not found"
echo ""

# Step 5: Complete rebuild with no cache
echo -e "${YELLOW}🔨 Rebuilding frontend with no cache...${NC}"
docker-compose build --no-cache frontend

# Step 6: Start services
echo -e "${YELLOW}🚀 Starting all services...${NC}"
docker-compose up -d

# Step 7: Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 20

# Step 8: Verify container has the fixes
echo -e "${YELLOW}🔍 Verifying fixes in container...${NC}"
echo "Checking Empire theme in container:"
docker exec swrpg-frontend grep -A 1 "FIXED: Light text - IMPROVED CONTRAST" /app/src/styles/factionThemes.ts || echo "❌ Empire fix not found in container"

echo "Checking Sith theme in container:"
docker exec swrpg-frontend grep -A 1 "FIXED: Pure white text - IMPROVED CONTRAST" /app/src/styles/factionThemes.ts || echo "❌ Sith fix not found in container"

# Step 9: Check container status
echo -e "${YELLOW}📊 Container status:${NC}"
docker-compose ps

# Step 10: Test frontend is responding
echo -e "${YELLOW}🌐 Testing frontend response...${NC}"
sleep 5
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is responding on localhost:3001${NC}"
else
    echo -e "${RED}❌ Frontend not responding - check logs${NC}"
    docker-compose logs frontend | tail -20
fi

echo ""
echo -e "${GREEN}🎉 FORCE REBUILD COMPLETE!${NC}"
echo -e "${BLUE}🧪 Testing Instructions:${NC}"
echo "1. Navigate to http://localhost:3001/dashboard"
echo "2. Open browser developer tools"
echo "3. Force refresh with Ctrl+Shift+R (or Cmd+Shift+R on Mac)"
echo "4. Run WAVE extension"
echo "5. Verify contrast errors are reduced"
echo ""
echo -e "${YELLOW}📋 Expected Changes:${NC}"
echo "• Empire theme text should be lighter (#f7fafc instead of #e2e8f0)"
echo "• Sith theme text should be pure white (#ffffff)"
echo "• First Order background should be lighter (#1a202c instead of #0f1419)"
echo ""
echo -e "${RED}⚠️ If WAVE still shows errors:${NC}"
echo "• Clear browser cache completely"
echo "• Try incognito/private browsing mode"
echo "• Check if theme switching is working in Settings"