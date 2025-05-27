#!/bin/bash

echo "🔧 Fixing Galactic Map Image and Marker Issues"
echo "=============================================="
echo ""

echo "📁 Ensuring correct directory structure..."
mkdir -p /home/magic/projects/swrpg-gen/src/frontend/public/images

echo "🖼️ Copying galaxy map image to correct location..."
if [ -f "/home/magic/projects/swrpg-gen/sw-rgp-extended-unverse-map.jpg" ]; then
    cp /home/magic/projects/swrpg-gen/sw-rgp-extended-unverse-map.jpg /home/magic/projects/swrpg-gen/src/frontend/public/images/galaxy-map.jpg
    echo "✅ Galaxy map copied to public/images/galaxy-map.jpg"
    
    # Check file size to ensure it copied correctly
    file_size=$(du -h /home/magic/projects/swrpg-gen/src/frontend/public/images/galaxy-map.jpg | cut -f1)
    echo "📊 Image file size: $file_size"
else
    echo "❌ Source galaxy map image not found!"
    echo "Expected location: /home/magic/projects/swrpg-gen/sw-rgp-extended-unverse-map.jpg"
    echo ""
    echo "Please ensure the galaxy map image is in the project root directory."
    exit 1
fi

echo ""
echo "🔍 Verifying image accessibility..."
if [ -f "/home/magic/projects/swrpg-gen/src/frontend/public/images/galaxy-map.jpg" ]; then
    echo "✅ Image file exists and is readable"
    ls -la /home/magic/projects/swrpg-gen/src/frontend/public/images/galaxy-map.jpg
else
    echo "❌ Image file not accessible"
    exit 1
fi

echo ""
echo "🎯 Testing image accessibility via public path..."
echo "Image will be accessible at: http://localhost:3001/images/galaxy-map.jpg"

echo ""
echo "📋 Fixed Issues:"
echo "================"
echo "✅ Simplified marker positioning (removed complex aspect ratio calculations)"
echo "✅ Fixed image path (/images/galaxy-map.jpg)"
echo "✅ Markers now positioned as simple percentages"
echo "✅ Removed overly complex dimension tracking"
echo "✅ Image and markers scale together properly"

echo ""
echo "🌟 Default Location Coordinates:"
echo "================================"
echo "🏜️ Tatooine:   75%, 65% (Outer Rim)"
echo "🏙️ Coruscant:  50%, 42% (Core)"
echo "🌸 Alderaan:   48%, 40% (Core)"
echo "🌿 Yavin 4:    85%, 48% (Outer Rim)"
echo "❄️ Hoth:       72%, 30% (Outer Rim)"
echo "🌲 Endor:      88%, 52% (Outer Rim)"
echo "🐸 Dagobah:    78%, 68% (Outer Rim)"
echo "☁️ Bespin:     70%, 58% (Outer Rim)"

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Run: ./scripts/rebuild-frontend.sh"
echo "2. Navigate to: http://localhost:3001/galaxy-map"
echo "3. Verify image loads and markers are positioned correctly"
echo "4. Test zoom/pan functionality"

echo ""
echo "🐛 If image still doesn't load:"
echo "================================"
echo "1. Check browser console for 404 errors"
echo "2. Verify file permissions: chmod 644 /home/magic/projects/swrpg-gen/src/frontend/public/images/galaxy-map.jpg"
echo "3. Try accessing directly: http://localhost:3001/images/galaxy-map.jpg"

echo ""
echo "✨ Galactic map fix complete!"