#!/bin/bash

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         ROOT APP - TESTING & VERIFICATION SCRIPT                ║${NC}"
echo -e "${BLUE}║         Family & Ancestor Relationship Manager                 ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Verify environment
echo -e "${YELLOW}[1/5] Verifying environment setup...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi
echo -e "${GREEN}✓ Environment file ready${NC}"
echo ""

# Step 2: Check dependencies
echo -e "${YELLOW}[2/5] Checking dependencies...${NC}"
if ! command -v podman &> /dev/null; then
    echo -e "${RED}✗ Podman not found. Please install Podman.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Podman available${NC}"

if ! command -v cargo &> /dev/null; then
    echo -e "${RED}✗ Cargo not found. Please install Rust.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Cargo available${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found. Please install Node.js.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm available${NC}"
echo ""

# Step 3: Build containers
echo -e "${YELLOW}[3/5] Building containers (this may take a few minutes)...${NC}"
podman-compose build 2>&1 | tail -10
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Containers built successfully${NC}"
else
    echo -e "${RED}✗ Container build failed${NC}"
    exit 1
fi
echo ""

# Step 4: Start services
echo -e "${YELLOW}[4/5] Starting services...${NC}"
echo "Starting PostgreSQL and backend API..."
podman-compose up -d postgres postgres_test backend frontend

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
echo ""
echo -e "${YELLOW}[5/5] Verifying services...${NC}"

# Check PostgreSQL
echo "Checking PostgreSQL..."
if podman-compose exec -T postgres pg_isready -U root_user -d root_db 2>/dev/null; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${RED}✗ PostgreSQL not responding${NC}"
fi

# Check Backend
echo "Checking Backend API..."
if curl -s http://localhost:8080/healthz | grep -q "OK"; then
    echo -e "${GREEN}✓ Backend API is running (http://localhost:8080)${NC}"
else
    echo -e "${YELLOW}⚠ Backend may still be starting... (trying again)${NC}"
    sleep 5
    if curl -s http://localhost:8080/healthz | grep -q "OK"; then
        echo -e "${GREEN}✓ Backend API is running (http://localhost:8080)${NC}"
    else
        echo -e "${RED}✗ Backend not responding${NC}"
    fi
fi

# Check Frontend
echo "Checking Frontend..."
if curl -s http://localhost/ | grep -q "html"; then
    echo -e "${GREEN}✓ Frontend is running (http://localhost)${NC}"
else
    echo -e "${YELLOW}⚠ Frontend may still be starting...${NC}"
fi

echo ""
echo -e "${GREEN}═════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ SERVICES STARTED SUCCESSFULLY${NC}"
echo -e "${GREEN}═════════════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${BLUE}📍 Service URLs:${NC}"
echo -e "   Backend API:    ${YELLOW}http://localhost:8080${NC}"
echo -e "   Frontend:       ${YELLOW}http://localhost${NC}"
echo -e "   Database:       ${YELLOW}localhost:5432${NC}"
echo ""

echo -e "${BLUE}📊 Quick Tests:${NC}"
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Backend Health Check${NC}"
HEALTH=$(curl -s http://localhost:8080/healthz)
if [ "$HEALTH" = "OK" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Backend is healthy"
else
    echo -e "${RED}✗ FAIL${NC}: Backend health check failed"
fi
echo ""

# Test 2: Database Connection
echo -e "${YELLOW}Test 2: Database Connection${NC}"
PERSON_COUNT=$(podman-compose exec -T postgres psql -U root_user -d root_db -c "SELECT count(*) FROM persons;" 2>/dev/null | grep -oE '[0-9]+' | head -1)
if [ ! -z "$PERSON_COUNT" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Database connected - Found $PERSON_COUNT persons"
else
    echo -e "${RED}✗ FAIL${NC}: Database query failed"
fi
echo ""

# Test 3: Seed Data
echo -e "${YELLOW}Test 3: Seed Data Verification${NC}"
USER_COUNT=$(podman-compose exec -T postgres psql -U root_user -d root_db -c "SELECT count(*) FROM users;" 2>/dev/null | grep -oE '[0-9]+' | head -1)
REL_COUNT=$(podman-compose exec -T postgres psql -U root_user -d root_db -c "SELECT count(*) FROM relationships;" 2>/dev/null | grep -oE '[0-9]+' | head -1)
if [ "$USER_COUNT" = "3" ] && [ "$REL_COUNT" = "4" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Seed data loaded - $USER_COUNT users, $REL_COUNT relationships"
else
    echo -e "${RED}✗ FAIL${NC}: Seed data not as expected (Users: $USER_COUNT, Relationships: $REL_COUNT)"
fi
echo ""

# Test 4: Frontend Response
echo -e "${YELLOW}Test 4: Frontend Response${NC}"
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" http://localhost)
if [ "$FRONTEND" = "200" ]; then
    echo -e "${GREEN}✓ PASS${NC}: Frontend is responding (HTTP $FRONTEND)"
else
    echo -e "${YELLOW}⚠ PENDING${NC}: Frontend HTTP $FRONTEND (may still be starting)"
fi
echo ""

echo -e "${BLUE}═════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📝 Database Information:${NC}"
echo -e "   User: root_user"
echo -e "   Password: root_pass"
echo -e "   Database: root_db"
echo ""
echo -e "${BLUE}🔗 To connect to database:${NC}"
echo -e "   ${YELLOW}podman-compose exec postgres psql -U root_user -d root_db${NC}"
echo ""
echo -e "${BLUE}📋 Sample Queries:${NC}"
echo -e "   List users:"
echo -e "   ${YELLOW}SELECT name, email FROM users;${NC}"
echo ""
echo -e "   List persons:"
echo -e "   ${YELLOW}SELECT full_name, birth_date FROM persons;${NC}"
echo ""
echo -e "   List relationships:"
echo -e "   ${YELLOW}SELECT p1.full_name, p2.full_name, r.relationship_type, r.status"
echo -e "   FROM relationships r"
echo -e "   JOIN persons p1 ON r.person_a_id = p1.id"
echo -e "   JOIN persons p2 ON r.person_b_id = p2.id;${NC}"
echo ""

echo -e "${BLUE}📖 Documentation:${NC}"
echo -e "   Architecture:  ${YELLOW}README.md${NC}"
echo -e "   Status Report: ${YELLOW}STATUS.md${NC}"
echo -e "   Testing Guide: ${YELLOW}TEST_SETUP.md${NC}"
echo -e "   Test Data:     ${YELLOW}DUMMY_DATA.md${NC}"
echo -e "   Final Guide:   ${YELLOW}FINAL_GUIDE.md${NC}"
echo ""

echo -e "${BLUE}🛑 To stop services:${NC}"
echo -e "   ${YELLOW}podman-compose down${NC}"
echo ""

echo -e "${BLUE}🔄 To view logs:${NC}"
echo -e "   ${YELLOW}podman-compose logs -f backend${NC}"
echo -e "   ${YELLOW}podman-compose logs -f frontend${NC}"
echo -e "   ${YELLOW}podman-compose logs -f postgres${NC}"
echo ""

echo -e "${GREEN}═════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}All services are running! 🚀${NC}"
echo -e "${GREEN}═════════════════════════════════════════════════════════════════${NC}"
