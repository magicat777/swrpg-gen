#!/bin/bash

# Verify Accessibility Deployment
# This script checks if accessibility fixes are actually visible in the browser

set -e

echo "🔍 ACCESSIBILITY DEPLOYMENT VERIFICATION"
echo "======================================="

# Step 1: Check if frontend is running
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Frontend not accessible at localhost:3001"
    echo "Run: docker-compose up -d frontend"
    exit 1
fi

echo "✅ Frontend is accessible"

# Step 2: Check container theme file
echo ""
echo "🔍 Checking theme file in container..."
if docker exec swrpg-frontend test -f /app/src/styles/factionThemes.ts; then
    echo "✅ Theme file exists in container"
    
    # Check for specific fixes
    echo ""
    echo "🎨 Checking Empire theme fixes:"
    if docker exec swrpg-frontend grep -q "text: '#f7fafc'" /app/src/styles/factionThemes.ts; then
        echo "✅ Empire text color fixed (#f7fafc)"
    else
        echo "❌ Empire text color not fixed"
    fi
    
    if docker exec swrpg-frontend grep -q "textSecondary: '#cbd5e0'" /app/src/styles/factionThemes.ts; then
        echo "✅ Empire secondary text fixed (#cbd5e0)"
    else
        echo "❌ Empire secondary text not fixed"
    fi
    
    echo ""
    echo "🎨 Checking Sith theme fixes:"
    if docker exec swrpg-frontend grep -q "text: '#ffffff'" /app/src/styles/factionThemes.ts; then
        echo "✅ Sith text color fixed (#ffffff)"
    else
        echo "❌ Sith text color not fixed"
    fi
    
    if docker exec swrpg-frontend grep -q "textSecondary: '#e2e8f0'" /app/src/styles/factionThemes.ts; then
        echo "✅ Sith secondary text fixed (#e2e8f0)"
    else
        echo "❌ Sith secondary text not fixed"
    fi
    
else
    echo "❌ Theme file not found in container"
    exit 1
fi

# Step 3: Check if Vite is running (development server)
echo ""
echo "🔧 Checking Vite development server..."
if docker exec swrpg-frontend pgrep -f "vite" > /dev/null; then
    echo "✅ Vite development server is running"
else
    echo "❌ Vite development server not running"
    echo "Container may need restart"
fi

# Step 4: Try to fetch compiled CSS (if available)
echo ""
echo "🌐 Testing frontend endpoints..."
if curl -s "http://localhost:3001/dashboard" | grep -q "html"; then
    echo "✅ Dashboard page loads"
else
    echo "❌ Dashboard page not loading properly"
fi

# Step 5: Check for specific accessibility indicators
echo ""
echo "📝 Manual Testing Required:"
echo "1. Open http://localhost:3001/dashboard in browser"
echo "2. Open Developer Tools (F12)"
echo "3. Go to Settings and change theme to 'Empire'"
echo "4. Check if text colors are lighter than before"
echo "5. Run WAVE extension to verify contrast improvements"
echo ""
echo "Expected Empire theme colors:"
echo "  - Main text: #f7fafc (light gray)"
echo "  - Secondary text: #cbd5e0 (medium gray)"
echo "  - Background: #2d3748 (dark gray)"
echo ""
echo "Expected Sith theme colors:"
echo "  - Main text: #ffffff (pure white)"
echo "  - Secondary text: #e2e8f0 (light gray)"
echo ""

# Step 6: Container logs check
echo "🔍 Recent container logs:"
docker-compose logs --tail=10 frontend

echo ""
echo "🎯 VERIFICATION COMPLETE"
echo "If colors are still not updated, try:"
echo "1. ./scripts/force-accessibility-rebuild.sh"
echo "2. Clear browser cache completely"
echo "3. Use incognito/private browsing mode"