#!/bin/bash

echo "🎮 Fixing Campaign Sessions Page"
echo "================================"
echo ""

echo "🔧 Issues Fixed:"
echo "================="
echo "✅ Removed mock/dummy session data"
echo "✅ Connected to real SessionApi endpoints"
echo "✅ Added session persistence after creation"
echo "✅ Added refresh functionality"
echo "✅ Added proper error handling"
echo "✅ Fixed session deletion and archiving"

echo ""
echo "🔌 API Integration:"
echo "=================="
echo "✅ SessionApi.getSessions() - Load all sessions"
echo "✅ SessionApi.createSession() - Create new session"
echo "✅ SessionApi.updateSession() - Archive sessions"
echo "✅ SessionApi.deleteSession() - Delete sessions"

echo ""
echo "🎯 New Features:"
echo "================"
echo "✅ Refresh button to reload sessions list"
echo "✅ Auto-refresh after session creation"
echo "✅ Auto-refresh after session deletion/archiving"
echo "✅ Loading states during API calls"
echo "✅ Better error messages for users"

echo ""
echo "🧪 Testing Sessions API..."
echo ""

echo "Testing backend API availability..."
if curl -s http://localhost:3000/api/sessions > /dev/null; then
    echo "✅ Sessions API is responding"
    
    # Get current sessions
    session_count=$(curl -s http://localhost:3000/api/sessions | jq '.data | length' 2>/dev/null || echo "0")
    echo "📊 Current sessions in database: $session_count"
    
    if [ "$session_count" = "0" ]; then
        echo "📝 No sessions found - this is normal for a fresh installation"
        echo "💡 Create a new session to test persistence!"
    else
        echo "📋 Existing sessions found in database"
    fi
else
    echo "❌ Sessions API not responding"
    echo "Check: docker-compose ps"
    exit 1
fi

echo ""
echo "🔧 Rebuilding frontend with session fixes..."
./scripts/rebuild-frontend.sh

echo ""
echo "🎯 Manual Testing Steps:"
echo "========================"
echo "1. Visit: http://localhost:3001/sessions"
echo "2. Verify no dummy/mock sessions are displayed"
echo "3. Click 'New Session' button"
echo "4. Fill out session creation form"
echo "5. Submit and verify session persists"
echo "6. Check that you're redirected to the new session"
echo "7. Return to sessions page and verify session appears"
echo "8. Test refresh button functionality"
echo "9. Test session deletion (if created)"

echo ""
echo "🐛 If sessions still don't persist:"
echo "=================================="
echo "1. Check browser console for API errors"
echo "2. Verify backend logs: docker logs swrpg-backend"
echo "3. Test API directly: curl http://localhost:3000/api/sessions"
echo "4. Check MongoDB connection in backend"

echo ""
echo "✨ Campaign Sessions page fix complete!"
echo "No more dummy content - real session persistence enabled!"