#!/bin/bash

# Test script for volume mounting performance in WSL2
cd /home/magic/projects/swrpg-gen

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Testing volume mounting performance...${NC}"

# Create test directories if they don't exist
mkdir -p /home/magic/projects/swrpg-gen/tests/volume-test/wsl
mkdir -p /mnt/c/temp/volume-test/windows

# File sizes for testing (in MB)
sizes=(10 100 500)

echo -e "\n${YELLOW}== Testing WSL Native Filesystem Performance ==${NC}"
for size in "${sizes[@]}"; do
  echo -e "\nTesting with ${size}MB file..."
  
  # Create test file
  echo "  Creating ${size}MB test file..."
  dd if=/dev/urandom of=/home/magic/projects/swrpg-gen/tests/volume-test/wsl/test_${size}mb.bin bs=1M count=${size} status=progress
  
  # Test read performance
  echo "  Testing read performance..."
  time cat /home/magic/projects/swrpg-gen/tests/volume-test/wsl/test_${size}mb.bin > /dev/null
  
  # Test Docker volume mounting
  echo "  Testing Docker volume mounting..."
  time docker run --rm -v /home/magic/projects/swrpg-gen/tests/volume-test/wsl:/data alpine cat /data/test_${size}mb.bin > /dev/null
  
  # Cleanup
  rm /home/magic/projects/swrpg-gen/tests/volume-test/wsl/test_${size}mb.bin
done

echo -e "\n${YELLOW}== Testing Windows Filesystem Access (WSL Boundary) ==${NC}"
for size in "${sizes[@]}"; do
  echo -e "\nTesting with ${size}MB file..."
  
  # Create test file
  echo "  Creating ${size}MB test file..."
  dd if=/dev/urandom of=/mnt/c/temp/volume-test/windows/test_${size}mb.bin bs=1M count=${size} status=progress
  
  # Test read performance
  echo "  Testing read performance..."
  time cat /mnt/c/temp/volume-test/windows/test_${size}mb.bin > /dev/null
  
  # Test Docker volume mounting
  echo "  Testing Docker volume mounting..."
  time docker run --rm -v /mnt/c/temp/volume-test/windows:/data alpine cat /data/test_${size}mb.bin > /dev/null
  
  # Cleanup
  rm /mnt/c/temp/volume-test/windows/test_${size}mb.bin
done

echo -e "\n${GREEN}Performance testing complete!${NC}"
echo -e "${YELLOW}Recommendation:${NC} Store project files within the WSL filesystem for best performance."
echo -e "Use the Windows filesystem only for files that need to be accessed by Windows applications."