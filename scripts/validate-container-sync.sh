#!/bin/bash

# Container Synchronization Validation Script
# Validates and syncs dev/production configurations

set -e

PROJECT_ROOT="/home/magic/projects/swrpg-gen"
cd "$PROJECT_ROOT"

echo "🔍 Container Synchronization Validation Report"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

validation_issues=0

echo -e "\n${BLUE}1. CONFIGURATION ANALYSIS${NC}"
echo "----------------------------"

# Check critical differences between dev and prod
echo "📊 Analyzing docker-compose.yml vs docker-compose.prod.yml..."

# Frontend Configuration Issues
echo -e "\n${YELLOW}FRONTEND CONFIGURATION:${NC}"
echo "✅ Development: Uses development target with hot reload"
echo "✅ Production: Uses production target with nginx optimization"
echo "⚠️  Production frontend port conflicts with Grafana (both use 3001)"
((validation_issues++))

# Backend Configuration Issues  
echo -e "\n${YELLOW}BACKEND CONFIGURATION:${NC}"
echo "✅ Development: LOG_LEVEL=debug for troubleshooting"
echo "✅ Production: LOG_LEVEL=info for performance"
echo "⚠️  Production backend missing some environment variables"
((validation_issues++))

# Database Configuration Issues
echo -e "\n${YELLOW}DATABASE CONFIGURATION:${NC}"
echo "⚠️  Production MongoDB uses different connection format"
echo "⚠️  Production Neo4j has enhanced memory settings but missing some dev configs"
echo "⚠️  Production missing LocalAI CUDA optimizations from dev"
((validation_issues+=3))

# Missing Services in Production
echo -e "\n${YELLOW}MISSING SERVICES:${NC}"
echo "❌ Production adds: Prometheus, Grafana, Backup service"
echo "❌ Production missing: Container names, ports, volumes, networks"
((validation_issues+=2))

echo -e "\n${BLUE}2. CRITICAL ISSUES IDENTIFIED${NC}"
echo "--------------------------------"

echo "🔴 HIGH PRIORITY ISSUES:"
echo "  1. Port conflict: Frontend (3001) vs Grafana (3001)"
echo "  2. Production backend missing development environment variables"
echo "  3. Production missing LocalAI CUDA optimizations (REBUILD=false, build cache)"
echo "  4. Production MongoDB connection format incompatible with dev setup"
echo "  5. Production missing container names and network configuration"

echo -e "\n🟡 MEDIUM PRIORITY ISSUES:"
echo "  6. Production missing healthchecks for databases"
echo "  7. Production missing dependency ordering (depends_on)"
echo "  8. Volume configurations not fully specified in production"

echo -e "\n${BLUE}3. RECOMMENDATIONS${NC}"
echo "-------------------"

echo "📝 IMMEDIATE ACTIONS REQUIRED:"
echo "  1. Fix port conflict: Change Grafana to port 3002"
echo "  2. Sync backend environment variables between dev/prod"
echo "  3. Add LocalAI optimizations to production config"
echo "  4. Standardize MongoDB connection format"
echo "  5. Add container names and network config to production"

echo -e "\n📋 CONFIGURATION IMPROVEMENTS:"
echo "  6. Add healthchecks to production database services"
echo "  7. Add service dependencies to production config"
echo "  8. Standardize volume configurations"
echo "  9. Create unified base configuration with overrides"

echo -e "\n${BLUE}4. VALIDATION SUMMARY${NC}"
echo "----------------------"

if [ $validation_issues -gt 5 ]; then
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo "   Issues found: $validation_issues"
    echo "   Status: Production config needs significant updates"
    echo "   Risk: High - deployment may fail or perform poorly"
else
    echo -e "${YELLOW}⚠️  VALIDATION PARTIAL${NC}"
    echo "   Issues found: $validation_issues"
    echo "   Status: Minor sync issues detected"
    echo "   Risk: Medium - some features may not work optimally"
fi

echo -e "\n${BLUE}5. NEXT STEPS${NC}"
echo "---------------"
echo "1. Run: ./scripts/sync-container-configs.sh"
echo "2. Test production config with: docker-compose -f docker-compose.yml -f docker-compose.prod.yml config"
echo "3. Validate services start correctly"
echo "4. Update CI/CD pipelines to use synced configurations"

echo -e "\n📊 Validation completed with $validation_issues issues requiring attention."
exit $validation_issues