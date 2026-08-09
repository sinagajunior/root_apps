# Root App - Testing & Verification Guide

## ✅ Compilation Status

### Backend
- **Status**: ✅ Successfully compiles
- **Command**: `cargo check`
- **Output**: Completed with 50 warnings (mostly unused functions - expected for stubs)

## 🚀 Quick Start - Testing the Application

### Prerequisites
- Rust 1.82+
- Node.js 22+
- PostgreSQL 16 (local or Podman)
- Podman Compose (for containerized setup)

### Option 1: Full Stack with Containers

```bash
# Start all services (backend, frontend, postgres)
podman-compose up --build

# Services will be available at:
# - Backend API: http://localhost:8080
# - Frontend: http://localhost (via nginx proxy)
# - PostgreSQL: localhost:5432
```

**Expected Output:**
```
root-postgres | PostgreSQL started on 5432
root-backend | Server listening on 0.0.0.0:8080
root-frontend | Listening on port 80 (via nginx)
```

### Option 2: Local Development (Backend Only)

```bash
# Start PostgreSQL container only
podman-compose up postgres

# Run backend locally
cargo build --release
cargo run --bin root-backend

# Expected output:
# Configuration loaded: AppConfig { database_url: "...", host: "0.0.0.0", port: 8080, ... }
# Connected to database
# Migrations applied successfully: Applied 5 migrations
# Server listening on 0.0.0.0:8080
```

### Option 3: Local Development (Frontend Only)

```bash
# Frontend requires backend API running
# Assuming backend is running on http://localhost:8080

cd frontend
npm install
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

## 🧪 Testing Endpoints

### Health Check
```bash
curl -i http://localhost:8080/healthz

# Expected Response:
# HTTP/1.1 200 OK
# content-type: text/plain
#
# OK
```

### Test Database Seed Data

**Dummy Users** (created by seed migration):
```
1. John Doe (google@123456789) - User ID: 550e8400-e29b-41d4-a716-446655440001
2. Jane Smith (google@987654321) - User ID: 550e8400-e29b-41d4-a716-446655440002
3. Bob Johnson (google@555555555) - User ID: 550e8400-e29b-41d4-a716-446655440003
```

**Dummy Persons**:
```
1. John Doe (b: 1990-01-15) - Person ID: 650e8400-e29b-41d4-a716-446655440001
2. Alice Doe (b: 1988-06-20) - Person ID: 650e8400-e29b-41d4-a716-446655440002
3. Charlie Brown (b: 1960-03-10, d: 2020-12-05) - Person ID: 650e8400-e29b-41d4-a716-446655440003
4. Jane Smith (b: 1992-07-22) - Person ID: 650e8400-e29b-41d4-a716-446655440004
5. David Smith (b: 1989-11-11) - Person ID: 650e8400-e29b-41d4-a716-446655440005
```

**Dummy Relationships**:
```
1. Charlie Brown → John Doe (parent, validated)
2. Charlie Brown → Alice Doe (parent, validated)
3. John Doe ↔ Alice Doe (spouse, pending) ← Needs validation
4. Jane Smith ↔ David Smith (sibling, validated)
```

**Dummy Validations Pending**:
```
1. Relationship #3 (John ↔ Alice spouse) - Waiting for Alice's approval
```

## 🔍 Database Verification

### Connect to Database

```bash
# Using psql (if installed locally)
psql -h localhost -U root_user -d root_db -W
# Password: root_pass

# Using podman
podman exec -it root_apps-postgres-1 psql -U root_user -d root_db

# Using podman-compose
podman-compose exec postgres psql -U root_user -d root_db
```

### Verify Seed Data

```sql
-- Check users
SELECT id, name, auth_provider, email FROM users;

-- Check persons
SELECT id, full_name, birth_date, death_date FROM persons;

-- Check relationships
SELECT r.id, p1.full_name, p2.full_name, r.relationship_type, r.status
FROM relationships r
JOIN persons p1 ON r.person_a_id = p1.id
JOIN persons p2 ON r.person_b_id = p2.id;

-- Check validation requests
SELECT vr.id, r.id as rel_id, p.full_name, vr.status
FROM validation_requests vr
JOIN relationships r ON vr.relationship_id = r.id
JOIN persons p ON vr.requested_to_person_id = p.id;

-- Check migrations
SELECT version, description, success FROM _sqlx_migrations ORDER BY version;
```

## 🧬 Testing Cycle Detection

The cycle detection algorithm is implemented and ready. To test it manually (after handlers are complete):

```bash
# Expected behavior: Cannot create cycle A→B→C→A
# Scenario:
# 1. Add Charlie as parent of John (exists: validated)
# 2. Try to add John as parent of Charlie
# 3. Should get: HTTP 409 Conflict "This relationship would create a cycle"

curl -X POST http://localhost:8080/relationships \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "person_a_id": "650e8400-e29b-41d4-a716-446655440001",
    "person_b_id": "650e8400-e29b-41d4-a716-446655440003",
    "relationship_type": "parent"
  }'

# Expected Response:
# HTTP/1.1 409 Conflict
# {"error": "This relationship would create a cycle"}
```

## 🎯 Integration Testing Scenarios

### Scenario 1: Complete Auth Flow (TODO - needs OAuth setup)
```
1. User clicks "Login with Google"
2. Redirected to Google OAuth consent
3. After approval, exchanged for JWT token
4. Token stored in localStorage
5. Redirect to /onboarding
6. Create initial person record
7. Redirect to /family-tree
```

### Scenario 2: Add Family Member
```
1. Authenticated user on /family-tree
2. Click "Add Relative" button
3. Select "Parent" from dropdown
4. Search for existing person or create new
5. Confirm submission
6. New relationship created with status "pending"
7. If target person has account: validation_request created
```

### Scenario 3: Accept Validation
```
1. User has pending validation in inbox (/inbox)
2. Reviews relationship and clicks "Accept"
3. Relationship status changes to "validated"
4. Validation request status changes to "accepted"
5. Family tree updates to show solid line instead of dashed
```

## 📊 Performance Testing

### Database Connections
```bash
# Check active connections
podman exec root_apps-postgres-1 psql -U root_user -d root_db -c \
  "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"
```

### Query Performance
```sql
-- Test full-text search on persons
EXPLAIN ANALYZE
SELECT * FROM persons
WHERE to_tsvector('english', full_name) @@ plainto_tsquery('english', 'john');

-- Test cycle detection
EXPLAIN ANALYZE
WITH RECURSIVE ancestors(person_id) AS (
    SELECT person_a_id FROM relationships
    WHERE person_b_id = '650e8400-e29b-41d4-a716-446655440001'
    AND relationship_type = 'parent'
    UNION ALL
    SELECT r.person_a_id FROM relationships r
    INNER JOIN ancestors a ON r.person_b_id = a.person_id
    WHERE r.relationship_type = 'parent'
)
SELECT person_id FROM ancestors LIMIT 1;
```

## ⚠️ Known Limitations

1. **OAuth Integration**: Google & Facebook handlers are stubs - need implementation
2. **Protected Routes**: Auth middleware not fully integrated with handlers yet
3. **Frontend Handlers**: Many handlers return "Not yet implemented" stubs
4. **UI Components**: react-flow family tree visualization not implemented
5. **Tests**: Unit/integration tests structure created but tests not written

## 🐛 Troubleshooting

### Backend fails to start
```bash
# Check if port 8080 is in use
lsof -i :8080
# Kill process if needed
kill -9 <PID>

# Check PostgreSQL connection
psql -h localhost -U root_user -d root_db -W
```

### Frontend build fails
```bash
# Clear node_modules and rebuild
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Migrations failed
```bash
# Drop database and restart
podman-compose down -v
podman-compose up --build
```

### Permission errors with Podman
```bash
# Ensure rootless Podman is set up
podman machine start  # macOS/Windows
podman info  # Verify setup
```

## 📝 Next Steps

1. **Complete Handler Implementations**:
   - Implement database queries in person/relationship handlers
   - Add proper auth extraction and validation
   - Wire up validation request auto-creation

2. **OAuth Integration**:
   - Implement Google OAuth2 flow
   - Implement Facebook OAuth2 flow
   - Set up OAuth provider credentials

3. **Frontend Components**:
   - Build PersonForm and AddRelativeModal
   - Implement FamilyChart with react-flow
   - Create ValidationInbox UI

4. **Testing**:
   - Write unit tests for cycle detection
   - Add integration tests for API endpoints
   - Create E2E tests for user flows

5. **Deployment**:
   - Set up CI/CD pipeline
   - Configure production environment variables
   - Deploy to cloud platform

## 📚 Documentation Links

- [Rust Backend Documentation](./backend/README.md) - TODO
- [React Frontend Guide](./frontend/README.md) - TODO
- [Database Schema](./backend/src/db/migrations/) - SQL files
- [API Specification](./README.md#api-routes)
- [Architecture Overview](./README.md#architecture)
