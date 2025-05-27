#!/bin/bash

echo "🌌 Setting Up Interactive Galactic Map"
echo "======================================"
echo ""

echo "📁 Creating necessary directories..."
mkdir -p /home/magic/projects/swrpg-gen/src/frontend/public/images
mkdir -p /home/magic/projects/swrpg-gen/src/frontend/src/assets/images

echo "🖼️ Copying galaxy map image to public assets..."
if [ -f "/home/magic/projects/swrpg-gen/sw-rgp-extended-unverse-map.jpg" ]; then
    cp /home/magic/projects/swrpg-gen/sw-rgp-extended-unverse-map.jpg /home/magic/projects/swrpg-gen/src/frontend/public/images/galaxy-map.jpg
    echo "✅ Galaxy map copied to public/images/"
else
    echo "❌ Galaxy map image not found at expected location"
fi

echo ""
echo "🔧 Updating GalacticMap component to use public image path..."

# Update the image path in GalacticMap component
sed -i 's|src="/src/assets/images/galaxy-map.jpg"|src="/images/galaxy-map.jpg"|g' /home/magic/projects/swrpg-gen/src/frontend/src/components/map/GalacticMap.tsx

echo "✅ Updated image path in GalacticMap component"

echo ""
echo "📊 Galactic Map Features:"
echo "========================"
echo "✅ Interactive zoom and pan controls"
echo "✅ Location markers for major Star Wars systems"
echo "✅ Clickable location details"
echo "✅ Fullscreen viewing mode"
echo "✅ Legend with location types"
echo "✅ Integrated with locations database"

echo ""
echo "🗂️ Available Map Views:"
echo "======================"
echo "📍 Dedicated Galaxy Map Page (/galaxy-map)"
echo "📍 Sidebar Navigation Integration"
echo "📍 Location Page Map Toggle (future enhancement)"

echo ""
echo "🎯 Location Types Supported:"
echo "============================"
echo "🪐 Planets - Blue markers"
echo "⭐ Systems - Orange markers" 
echo "🚀 Space Stations - Red markers"

echo ""
echo "📡 Major Locations Included:"
echo "==========================="
echo "🏜️ Tatooine (Arkanis Sector)"
echo "🏙️ Coruscant (Core Worlds)"
echo "🌸 Alderaan (Core Worlds)"
echo "🌿 Yavin 4 (Gordian Reach)"
echo "❄️ Hoth (Anoat Sector)"
echo "🌲 Endor (Moddell Sector)"
echo "🐸 Dagobah (Sluis Sector)"
echo "☁️ Bespin (Anoat Sector)"
echo "🌊 Naboo (Mid Rim)"
echo "🌧️ Kamino (Wild Space)"

echo ""
echo "🎮 Usage Instructions:"
echo "====================="
echo "1. Navigate to /galaxy-map in the application"
echo "2. Use mouse wheel to zoom in/out"
echo "3. Click and drag to pan around the galaxy"
echo "4. Click location markers for details"
echo "5. Use controls in top-right for reset/fullscreen"
echo "6. Select locations from sidebar for quick navigation"

echo ""
echo "🔄 Next Steps:"
echo "=============="
echo "1. Run frontend rebuild: ./scripts/rebuild-frontend.sh"
echo "2. Visit http://localhost:3001/galaxy-map"
echo "3. Test interactive features"
echo "4. Connect to locations database for live data"

echo ""
echo "✨ Galactic map setup complete!"
echo "Ready for Game Masters to explore the galaxy!"