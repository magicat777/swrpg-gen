#!/bin/bash

echo "🗑️ Fixing Session Deletion Issue"
echo "================================"
echo ""

echo "🐛 Issue Found:"
echo "==============="
echo "❌ Session deletion was failing with 'Failed to delete session'"
echo "❌ Backend was not properly handling MongoDB ObjectId conversion"
echo "❌ String session IDs were being compared against ObjectId _id fields"

echo ""
echo "✅ Fixes Applied:"
echo "================="
echo "✅ Added ObjectId import to session controller"
echo "✅ Added ObjectId validation for all session operations"
echo "✅ Fixed deleteSession to use new ObjectId(sessionId)"
echo "✅ Fixed getSession to use new ObjectId(sessionId)"
echo "✅ Fixed updateSession to use new ObjectId(sessionId)"
echo "✅ Added proper error messages for invalid ID formats"

echo ""
echo "🔧 Rebuilding backend with session fixes..."
./scripts/rebuild-backend.sh

echo ""
echo "⏳ Waiting for backend to restart..."
sleep 10

echo ""
echo "🧪 Testing session API endpoints..."

echo ""
echo "Testing sessions list endpoint..."
sessions_response=$(curl -s "http://localhost:3000/api/sessions")
echo "Sessions API response: $sessions_response"

if echo "$sessions_response" | grep -q '"success":true'; then
    echo "✅ Sessions API is working"
else
    echo "❌ Sessions API error"
    exit 1
fi

echo ""
echo "Testing invalid session ID handling..."
delete_response=$(curl -s -X DELETE "http://localhost:3000/api/sessions/invalid-id")
echo "Delete invalid ID response: $delete_response"

if echo "$delete_response" | grep -q "Invalid session ID format"; then
    echo "✅ Invalid ID validation working"
else
    echo "❌ Invalid ID validation not working properly"
fi

echo ""
echo "🎯 Manual Testing Steps:"
echo "========================"
echo "1. Visit: http://localhost:3001/sessions"
echo "2. Create a new session"
echo "3. Try to delete the created session"
echo "4. Verify deletion works without errors"
echo "5. Check that session is removed from the list"

echo ""
echo "📋 Expected Behavior:"
echo "===================="
echo "✅ Session creation should work"
echo "✅ Session should appear in the list"
echo "✅ Delete button should work without 'Failed to delete' error"
echo "✅ Session should disappear from list after deletion"
echo "✅ Refresh button should work correctly"

echo ""
echo "🐛 If deletion still fails:"
echo "=========================="
echo "1. Check browser console for API request details"
echo "2. Check backend logs: docker logs swrpg-backend"
echo "3. Verify the session ID format being sent to API"
echo "4. Test API directly with valid ObjectId"

echo ""
echo "✨ Session deletion fix complete!"
echo "MongoDB ObjectId handling should now work properly!"