# Root — Family & Ancestor Relationship Manager

A fullstack web application for managing family trees and ancestry relationships with graph-based validation to prevent circular ancestry chains.

## Project Status

This is an **implementation scaffold** based on the comprehensive plan in `root-app-prompt.md`. The following phases have been completed:

### ✅ Completed Phases

- **Phase 0**: Podman configuration (compose.yml, Containerfiles, nginx.conf, .env.example)
- **Phase 1**: Rust workspace scaffold (Cargo.toml, project structure)
- **Phase 1**: Database migrations (PostgreSQL schema with proper enums and constraints)
- **Phase 2**: JWT authentication helpers (sign/verify functions)
- **Phase 2**: OAuth2 provider stubs (Google, Facebook)
- **Phase 3**: Person model and CRUD handler stubs
- **Phase 4**: Cycle detection algorithm with PostgreSQL recursive CTEs
- **Phase 4**: Relationship model and validation pipeline
- **Phase 5**: Validation request model and handlers
- **Phase 6**: Graph subgraph endpoint with BFS
- **Phase 7**: React + Vite frontend scaffold
- **Phase 7**: Tailwind CSS configuration
- **Phase 8**: API client (axios) and TanStack Query hooks
- **Phase 8**: Auth store (Zustand) and page stubs

### ⏳ Remaining Phases

- **Phase 8**: Complete authentication pages with OAuth flow
- **Phase 9**: Person and relationship management components
- **Phase 9**: Family tree chart with react-flow
- **Phase 10**: Validation inbox UI
- **Phase 10**: Polish, testing, and deployment readiness

## Architecture

### Backend (Rust)
- **Framework**: Axum 0.8
- **Database**: PostgreSQL 16 with sqlx
- **Auth**: JWT + OAuth2 (Google, Facebook)
- **Graph Algorithms**: Recursive CTEs for cycle detection and BFS traversal

### Frontend (React)
- **Build**: Vite
- **State**: Zustand for auth, TanStack Query for server state
- **Forms**: react-hook-form + Zod
- **Charts**: react-flow for family tree visualization
- **Styling**: Tailwind CSS

### Container Runtime
- **Orchestration**: Podman Compose
- **Database**: PostgreSQL 16 in containers
- **Services**: Backend (Rust), Frontend (React + Nginx)

## Quick Start

### Prerequisites
- Rust 1.82+
- Node.js 22+
- Podman + podman-compose (or Docker Compose)
- PostgreSQL 16 (if running locally)

### Setup

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Start containers**:
   ```bash
   podman-compose up --build
   ```

3. **Backend** runs on `http://localhost:8080`
4. **Frontend** runs on `http://localhost` (nginx proxy)
5. **Database** on `postgres://root_user:root_pass@localhost:5432/root_db`

### Development

**Backend** (without containers):
```bash
cargo build
cargo run --bin root-backend
```

**Frontend**:
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
root_apps/
├── backend/                      # Rust backend
│   ├── src/
│   │   ├── main.rs              # Entry point
│   │   ├── config.rs            # Configuration from env
│   │   ├── error.rs             # Error types
│   │   ├── state.rs             # Application state
│   │   ├── router.rs            # Route assembly (TODO: complete)
│   │   ├── auth/                # Authentication modules
│   │   │   ├── jwt.rs           # JWT sign/verify
│   │   │   ├── middleware.rs    # Auth extractor
│   │   │   ├── google.rs        # Google OAuth (stub)
│   │   │   └── facebook.rs      # Facebook OAuth (stub)
│   │   ├── models/              # Data models
│   │   │   ├── person.rs        # Person struct + requests
│   │   │   ├── relationship.rs  # Relationship with types
│   │   │   └── validation_request.rs
│   │   ├── handlers/            # HTTP handlers
│   │   │   ├── persons.rs       # Person CRUD (stub)
│   │   │   ├── relationships.rs # Relationship with validation
│   │   │   ├── validation.rs    # Validation inbox (stub)
│   │   │   └── graph.rs         # Subgraph endpoint (stub)
│   │   ├── graph/               # Graph algorithms
│   │   │   └── cycle_detection.rs # Cycle detection with CTEs
│   │   └── db/
│   │       └── migrations/      # SQL migrations (4 files)
│   └── Cargo.toml
├── frontend/                     # React frontend
│   ├── src/
│   │   ├── main.tsx             # Entry point
│   │   ├── App.tsx              # Router setup
│   │   ├── index.css            # Tailwind + globals
│   │   ├── api/                 # API client layer
│   │   │   ├── client.ts        # Axios + interceptors
│   │   │   ├── types.ts         # TypeScript types
│   │   │   └── endpoints.ts     # API functions
│   │   ├── store/
│   │   │   └── authStore.ts     # Zustand auth store
│   │   ├── hooks/               # TanStack Query hooks
│   │   │   ├── usePersons.ts
│   │   │   ├── useRelationships.ts
│   │   │   ├── useGraph.ts
│   │   │   └── useValidations.ts
│   │   ├── pages/               # Page components
│   │   │   ├── LoginPage.tsx    # OAuth login (partial)
│   │   │   ├── OnboardingPage.tsx
│   │   │   ├── FamilyTreePage.tsx
│   │   │   ├── InboxPage.tsx
│   │   │   └── PersonDetailPage.tsx
│   │   └── components/          # (TODO: implement)
│   │       ├── auth/
│   │       ├── persons/
│   │       ├── relationships/
│   │       └── chart/
│   └── package.json, tsconfig.json, vite.config.ts, tailwind.config.ts
├── Cargo.toml                   # Workspace manifest
├── compose.yml                  # Podman Compose configuration
├── Containerfile.backend        # Backend build
├── Containerfile.frontend       # Frontend build
├── nginx.conf                   # Frontend server config
└── .env.example                 # Environment template
```

## Key Implementation Details

### Database Schema
- **Users**: OAuth provider + ID unique constraint
- **Persons**: Full-text search index, FK to users
- **Relationships**: Enum types for relationship/status, canonical pair ordering, check constraints
- **Validation Requests**: Track pending relationship confirmations

### Cycle Detection
Uses PostgreSQL `WITH RECURSIVE` (recursive CTE) to traverse parent relationships:
```sql
WITH RECURSIVE ancestors(person_id) AS (
    SELECT person_a_id FROM relationships WHERE person_b_id = $1 AND relationship_type = 'parent'
    UNION ALL
    SELECT r.person_a_id FROM relationships r INNER JOIN ancestors a ON r.person_b_id = a.person_id
)
SELECT EXISTS(SELECT 1 FROM ancestors WHERE person_id = $2)
```

Cycle check only applies to `parent`/`child` relationships (DAG constraint); `spouse`/`sibling` can be cyclic.

### Validation Pipeline (8-step)
1. Validate input fields
2. Check no self-relationships
3. Normalize canonical pair ordering (smaller UUID → person_a_id)
4. Check for duplicates
5. For parent/child: run cycle detection CTE
6. Return 409 Conflict if cycle detected
7. Insert relationship with status='pending'
8. Auto-create validation request if target has linked user

## Next Steps

### Short-term (to reach MVP)
1. **Implement missing handlers**:
   - Person CRUD operations (list, create, get, update, delete with auth)
   - Relationship listing and deletion
   - Validation inbox (list, accept, reject)
   - Graph subgraph query with BFS CTE

2. **Complete OAuth flows**:
   - Google token exchange and user fetch
   - Facebook token exchange and user fetch
   - Callback handlers that create/update users and return JWT

3. **Fix auth middleware**:
   - `AuthUser` extractor needs to accept `State<AppState>` to access JWT secret
   - Implement proper request guard for protected endpoints

4. **Add router routes**:
   - Wire all handlers to routes with auth middleware
   - Add error handling and response serialization

### Frontend Implementation
1. **Complete auth flow**:
   - OAuth redirect URLs
   - Token storage and refresh
   - Protected routes

2. **Implement components**:
   - PersonForm, AddRelativeModal
   - FamilyChart with react-flow
   - ValidationInbox with accept/reject

3. **Testing**:
   - TanStack Query hook tests
   - Integration tests with mocked API
   - E2E flow testing

### Deployment
1. Update OAuth provider settings with production URLs
2. Generate strong JWT secret
3. Configure CORS origins
4. Set database connection pooling for production load
5. Add logging and monitoring

## Testing

### Backend
```bash
# Run all tests (requires postgres_test container)
cargo test

# Run specific test file
cargo test --test test_graph.rs

# With output
cargo test -- --nocapture
```

### Frontend
```bash
cd frontend
npm run test
```

## Performance Considerations

- **Cycle detection**: O(E) where E = relationship edges; recursive CTE is efficient for DAGs
- **Subgraph queries**: Bulk fetch persons/relationships; N+1 prevented with careful query design
- **Full-text search**: GIN index on persons.full_name enables fast substring matching
- **Database**: Connection pooling with sqlx; prepared statements for all queries
- **Frontend**: React Query caching + optimistic updates for relationships

## Security Notes

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- All API calls require Authorization header
- CORS configured for frontend origin
- SQL injection prevented by sqlx prepared statements
- OAuth secrets never exposed in frontend code

## Known Limitations

1. OAuth providers not fully implemented (stubs in place)
2. Validation requests not auto-created (handler exists but not integrated)
3. Auth middleware needs refactoring for state access
4. Frontend auth flow partial (OAuth redirect handling)
5. No UI for family tree chart yet (components stubbed)
6. No offline support
7. No real-time updates (polling only)

## Contributing

See inline `TODO` comments throughout codebase for work in progress.

## License

MIT
