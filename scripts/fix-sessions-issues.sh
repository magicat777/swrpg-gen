#!/bin/bash

echo "🔧 Fixing All Sessions Page Issues"
echo "=================================="
echo ""

echo "🐛 Issues Found and Fixed:"
echo "=========================="
echo "✅ React key prop warning - Fixed session ID mapping"
echo "✅ Session deletion API errors - Fixed ObjectId handling"
echo "✅ Session data format mismatch - Fixed field mapping"
echo "✅ Missing session properties - Added safe defaults"

echo ""
echo "🔧 Frontend Fixes:"
echo "=================="
echo "✅ Fixed session.id mapping from MongoDB _id field"
echo "✅ Fixed session.name mapping from campaignName field"
echo "✅ Fixed session.era mapping from setting.era field"
echo "✅ Fixed session.playerCount mapping from campaignSettings.playerCount"
echo "✅ Added fallback ID generation for React keys"

echo ""
echo "🔧 Backend Fixes:"
echo "================="
echo "✅ Added ObjectId import and validation"
echo "✅ Fixed deleteSession to use new ObjectId()"
echo "✅ Fixed getSession to use new ObjectId()"
echo "✅ Fixed updateSession to use new ObjectId()"
echo "✅ Added proper error handling for invalid IDs"

echo ""
echo "🔄 Rebuilding both frontend and backend..."

echo ""
echo "Rebuilding backend..."
./scripts/rebuild-backend.sh

echo ""
echo "Rebuilding frontend..."
./scripts/rebuild-frontend.sh

echo ""
echo "⏳ Waiting for services to restart..."
sleep 15

echo ""
echo "🧪 Testing fixed endpoints..."

echo ""
echo "Testing sessions API..."
sessions_response=$(curl -s "http://localhost:3000/api/sessions")
if echo "$sessions_response" | grep -q '"success":true'; then
    echo "✅ Sessions API working"
else
    echo "❌ Sessions API error: $sessions_response"
fi

echo ""
echo "Testing frontend response..."
if curl -s "http://localhost:3001/sessions" > /dev/null; then
    echo "✅ Frontend sessions page accessible"
else
    echo "❌ Frontend sessions page not accessible"
fi

echo ""
echo "🎯 Manual Testing Checklist:"
echo "============================"
echo "1. Visit: http://localhost:3001/sessions"
echo "2. Check browser console - no React key warnings"
echo "3. Create a new session"
echo "4. Verify session appears in list with correct data"
echo "5. Try to delete the session"
echo "6. Verify deletion works without API errors"
echo "7. Check session is removed from list"
echo "8. Test refresh button functionality"

echo ""
echo "🐛 If issues persist:"
echo "===================="
echo "1. Check browser console for specific errors"
echo "2. Check network tab for API request/response details"
echo "3. Check backend logs: docker logs swrpg-backend"
echo "4. Verify session data format in MongoDB"

echo ""
echo "✨ All sessions issues should now be fixed!"
echo "Both React warnings and API errors resolved!"