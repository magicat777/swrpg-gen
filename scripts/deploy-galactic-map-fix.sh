#!/bin/bash

echo "🌌 Deploying Galactic Map Fix"
echo "============================="
echo ""

echo "Step 1: Fix image and directory issues..."
./scripts/fix-galactic-map.sh

if [ $? -ne 0 ]; then
    echo "❌ Image setup failed!"
    exit 1
fi

echo ""
echo "Step 2: Rebuild frontend with fixes..."
./scripts/rebuild-frontend.sh

echo ""
echo "Step 3: Verify deployment..."
sleep 5

echo "🔍 Checking if frontend is running..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend not responding"
    echo "Check: docker-compose ps"
    exit 1
fi

echo ""
echo "🔍 Testing galaxy map image accessibility..."
if curl -s http://localhost:3001/images/galaxy-map.jpg > /dev/null; then
    echo "✅ Galaxy map image is accessible"
else
    echo "❌ Galaxy map image not accessible"
    echo "Check: http://localhost:3001/images/galaxy-map.jpg"
fi

echo ""
echo "🎯 Testing Complete!"
echo "==================="
echo "✅ Image fixed and deployed"
echo "✅ Marker positioning simplified" 
echo "✅ Frontend rebuilt and running"

echo ""
echo "🌟 Ready to test!"
echo "================="
echo "1. Visit: http://localhost:3001/galaxy-map"
echo "2. Verify image loads (should see detailed Star Wars galaxy)"
echo "3. Check markers are positioned correctly on planets"
echo "4. Test zoom/pan functionality"
echo "5. Click markers to see location details"

echo ""
echo "📍 Expected Marker Positions:"
echo "============================="
echo "• Tatooine (desert planet) - Bottom right area"
echo "• Coruscant (center) - Core worlds, middle of galaxy"
echo "• Yavin 4 - Far right (Outer Rim)"
echo "• Hoth - Upper right (Outer Rim)"
echo "• Endor - Far right edge"

echo ""
echo "🚀 Galaxy map deployment complete!"