#!/bin/bash

echo "🌌 Testing Basic Interactive Galactic Map"
echo "========================================="
echo ""

echo "📦 What we've simplified:"
echo "========================"
echo "✅ Removed complex marker overlay system"
echo "✅ Removed aspect ratio calculations"
echo "✅ Simplified to just image pan/zoom"
echo "✅ Clean mouse event handling"
echo "✅ Fixed event listeners"

echo ""
echo "🎯 Basic features included:"
echo "==========================="
echo "✅ Pan/drag functionality"
echo "✅ Zoom in/out with mouse wheel"
echo "✅ Zoom controls (buttons)"
echo "✅ Reset view button"
echo "✅ Fullscreen toggle"
echo "✅ Real-time zoom percentage display"
echo "✅ Keyboard shortcuts (ESC to exit fullscreen)"

echo ""
echo "🔧 Rebuilding frontend..."
./scripts/rebuild-frontend.sh

echo ""
echo "⏳ Waiting for frontend to start..."
sleep 10

echo ""
echo "🔍 Testing basic functionality..."

echo "Testing frontend response..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend not responding"
    echo "Run: docker-compose ps"
    exit 1
fi

echo ""
echo "Testing galaxy map image..."
if curl -s http://localhost:3001/images/galaxy-map.jpg > /dev/null; then
    echo "✅ Galaxy map image is accessible"
    image_size=$(curl -s -I http://localhost:3001/images/galaxy-map.jpg | grep -i content-length | awk '{print $2}' | tr -d '\r')
    echo "📊 Image size: $image_size bytes"
else
    echo "❌ Galaxy map image not accessible"
fi

echo ""
echo "🎮 Manual Testing Instructions:"
echo "==============================="
echo "1. Visit: http://localhost:3001/galaxy-map"
echo "2. Verify you see the detailed Star Wars galaxy image"
echo "3. Test mouse wheel zoom (should zoom in/out smoothly)"
echo "4. Test click and drag (should pan around the galaxy)"
echo "5. Test zoom buttons (+ and - in top right)"
echo "6. Test reset button (circular arrow - should return to center)"
echo "7. Test fullscreen button (expand icon)"
echo "8. Check zoom percentage display (bottom right)"

echo ""
echo "🐛 If issues persist:"
echo "===================="
echo "1. Check browser console for JavaScript errors"
echo "2. Verify image loads: http://localhost:3001/images/galaxy-map.jpg"
echo "3. Try refreshing the page (Ctrl+F5)"
echo "4. Check network tab for failed requests"

echo ""
echo "✨ Basic galactic map test complete!"
echo "Once this works, we can add the overlay system back."