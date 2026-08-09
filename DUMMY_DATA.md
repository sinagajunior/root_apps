# Root App - Dummy Test Data

This document describes the test data that is automatically created by the migration `20240101000005_seed_data.sql`.

## Users

| ID | Name | Email | Auth Provider | Password |
|---|---|---|---|---|
| `550e8400-e29b-41d4-a716-446655440001` | John Doe | john@example.com | google (123456789) | N/A (OAuth) |
| `550e8400-e29b-41d4-a716-446655440002` | Jane Smith | jane@example.com | google (987654321) | N/A (OAuth) |
| `550e8400-e29b-41d4-a716-446655440003` | Bob Johnson | bob@example.com | google (555555555) | N/A (OAuth) |

## Family Tree - Persons

```
Charlie Brown (1960-03-10, d: 2020-12-05)
├── John Doe (1990-01-15) ↔ Alice Doe (1988-06-20) [SPOUSE - PENDING]
└── Alice Doe (1988-06-20)

Jane Smith (1992-07-22) ↔ David Smith (1989-11-11) [SIBLING - VALIDATED]
```

### Person Details

| ID | Full Name | Birth Date | Death Date | Owner | Status |
|---|---|---|---|---|---|
| `650e8400-e29b-41d4-a716-446655440001` | John Doe | 1990-01-15 | — | John Doe | ✅ Validated |
| `650e8400-e29b-41d4-a716-446655440002` | Alice Doe | 1988-06-20 | — | John Doe | ✅ Validated |
| `650e8400-e29b-41d4-a716-446655440003` | Charlie Brown | 1960-03-10 | 2020-12-05 | John Doe | ✅ Validated |
| `650e8400-e29b-41d4-a716-446655440004` | Jane Smith | 1992-07-22 | — | Jane Smith | ✅ Validated |
| `650e8400-e29b-41d4-a716-446655440005` | David Smith | 1989-11-11 | — | Jane Smith | ✅ Validated |

## Relationships

| ID | Person A | Person B | Type | Status | Notes |
|---|---|---|---|---|---|
| `750e8400-e29b-41d4-a716-446655440001` | Charlie Brown | John Doe | parent | ✅ Validated | Charlie is John's parent |
| `750e8400-e29b-41d4-a716-446655440002` | Charlie Brown | Alice Doe | parent | ✅ Validated | Charlie is Alice's parent |
| `750e8400-e29b-41d4-a716-446655440003` | John Doe | Alice Doe | spouse | ⏳ Pending | Alice needs to accept |
| `750e8400-e29b-41d4-a716-446655440004` | Jane Smith | David Smith | sibling | ✅ Validated | Siblings |

## Validation Requests (Pending)

| ID | Relationship | Sender | Recipient | Status |
|---|---|---|---|---|
| `850e8400-e29b-41d4-a716-446655440001` | John Doe ↔ Alice Doe (spouse) | John Doe | Alice Doe | ⏳ Pending |

**Note**: Alice Doe needs to accept this relationship to validate the spouse connection.

## Cycle Detection Test Case

The dummy data is designed to test cycle detection:

**Current DAG (Directed Acyclic Graph)**:
```
Charlie Brown
├→ John Doe
└→ Alice Doe
```

**If someone tries to add** "John Doe → Charlie Brown (parent)":
- **Expected**: ❌ HTTP 409 Conflict - "This relationship would create a cycle"
- **Reason**: Would create cycle: Charlie → John → Charlie

**If someone tries to add** "Alice Doe → Charlie Brown (parent)":
- **Expected**: ❌ HTTP 409 Conflict - "This relationship would create a cycle"
- **Reason**: Would create cycle: Charlie → Alice → Charlie

## Using the Dummy Data

### View All Users
```bash
# Get all users
curl http://localhost:8080/persons \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Expected: Returns list of 5 persons
```

### View Relationships
```bash
# Get all relationships
curl http://localhost:8080/relationships \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Expected: Returns 4 relationships (3 validated, 1 pending)
```

### View Validation Inbox
```bash
# Get pending validations
curl http://localhost:8080/validations/inbox \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Expected: Returns 1 pending validation (Alice's spouse request)
```

### Get Family Subgraph
```bash
# Get family tree of John Doe (2 degrees)
curl http://localhost:8080/graph/650e8400-e29b-41d4-a716-446655440001?degrees=2 \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Expected: Returns:
# - Persons: John, Alice, Charlie (direct family within 2 degrees)
# - Relationships: All three relationships involving them
```

## Testing Cycle Detection

```bash
# Try to create cycle: John → Charlie (would close Charlie → John → Charlie)
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
# Content-Type: application/json
# {"error":"This relationship would create a cycle"}
```

## Reset Dummy Data

If you need to clear the dummy data and start fresh:

```bash
# Option 1: Drop database volume and restart
podman-compose down -v
podman-compose up --build

# Option 2: Delete records manually
psql -h localhost -U root_user -d root_db -c "
  DELETE FROM validation_requests;
  DELETE FROM relationships;
  DELETE FROM persons;
  DELETE FROM users;
"

# Then migrations will re-seed the data on next startup
```

## Notes

- All IDs use the pattern `*e8400-e29b-41d4-a716-4466554400*` for easy identification
- Dates use realistic birthdates (Charlie is 30 years older than John)
- Charlie Brown's death date tests handling of deceased persons in ancestry
- John and Alice's spouse relationship is pending to test validation inbox
- Jane and David's sibling relationship is validated to show different statuses
- The family tree is designed to be small but complete for testing all features
