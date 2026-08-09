# Prompt: Build "Root" — Family & Ancestor Relationship Manager

Copy everything below into your AI coding assistant (Claude Code, Cursor, etc.) as the project brief.

---

## Project Overview

Build a fullstack web application called **Root** — a family tree / ancestor management platform where users can:

- Add and manage ancestors and living family members
- Define relationships between members (parent, child, spouse, sibling, etc.)
- Validate relationships (e.g. two members can't both be each other's parent, no duplicate spouses without divorce record, no circular ancestry)
- Invite family members to join and let them **confirm/validate their own relationship** before it's shown as verified
- Visualize the whole family as an interactive **relationship/tree chart**
- Log in with **Google** and **Facebook** (OAuth2)

---

## Tech Stack

**Backend:** Rust
- Framework: `axum` (preferred) or `actix-web`
- ORM: `sqlx` (compile-time checked queries) or `sea-orm`
- Auth: `oauth2` crate for Google & Facebook OAuth2, JWT (`jsonwebtoken`) for session tokens
- Validation: `validator` crate for input validation + custom domain validation logic for relationship graph integrity
- Async runtime: `tokio`

**Database:** PostgreSQL
- Relational, since family relationships are graph-like but benefit from strong relational integrity (foreign keys, junction tables)
- Consider `ltree` or a recursive CTE approach for ancestor-path queries
- Migrations: `sqlx-migrate` or `refinery`

**Frontend:** Fullstack with Tailwind CSS
- Framework: React (Vite) or SvelteKit — choose one, with Tailwind CSS for styling
- Chart/visualization: `d3.js` (force-directed graph or tree layout) or a library like `react-family-tree` / `react-flow` for node-edge relationship diagrams
- State management: React Query / TanStack Query for server state
- Forms: `react-hook-form` + `zod` for client-side validation matching backend rules

**Auth Provider Integration:**
- Google OAuth2 (Sign in with Google)
- Facebook Login (Meta OAuth2)
- Store provider tokens securely, issue your own JWT session token after successful OAuth callback

---

## Core Domain Model

```
User
 - id, name, email, avatar_url, auth_provider, created_at

Person (a family member profile — may or may not be a linked User)
 - id, full_name, birth_date, death_date (nullable), gender, photo_url
 - linked_user_id (nullable — set once the person joins & claims their profile)
 - created_by (user_id who added this person)

Relationship
 - id, person_a_id, person_b_id, relationship_type (parent, child, spouse, sibling)
 - status: pending | validated | rejected
 - validated_by (user_id), validated_at

RelationshipValidationRequest
 - id, relationship_id, requested_to_person_id, status, responded_at
```

**Validation rules to implement:**
1. No self-relationship (person_a ≠ person_b)
2. No relationship duplication (same pair + type can't repeat)
3. Parent/child edges must not form a cycle (a person can't be their own ancestor) — validate via graph traversal or recursive CTE before insert
4. A relationship is only marked "validated" once the invited/linked member confirms it themselves (if they have a linked User account)
5. Spouse relationships should support multiple historical spouses (divorced/deceased) without breaking chart rendering

---

## UX Requirements

- **Onboarding:** sign in with Google/Facebook → prompted to either create their own Person profile or find themselves in an existing tree via invite link
- **Add relative flow:** simple form — pick relationship type, search existing members or create new, submit → triggers a validation request to that person if they have an account
- **Validation inbox:** each user sees a small notification/inbox of "X says you are their [relation] — confirm?"
- **Family chart view:** interactive, zoomable/pannable diagram showing all connected members; clicking a node shows a side panel with details; unvalidated relationships shown with a dashed line or a "pending" badge
- **Mobile-responsive** with Tailwind CSS utility-first design
- **Search & filter:** find a member by name and auto-center the chart on them

---

## Suggested Build Order (for the AI assistant to follow)

1. Scaffold Rust backend (axum + sqlx + postgres) with migrations for the schema above
2. Implement Google & Facebook OAuth2 login flow + JWT session issuance
3. Build Person & Relationship CRUD endpoints with validation logic (including cycle detection)
4. Build relationship validation request/response endpoints
5. Scaffold frontend (Vite + Tailwind) with routing, auth screens, and API client
6. Build the "Add relative" and "Validate relationship" flows
7. Build the interactive family chart view (start with a static layout, then make it interactive)
8. Polish UX: notifications, search, responsive design
9. Write integration tests for the relationship validation logic (this is the trickiest part — prioritize test coverage here)

---

## Notes for the AI Assistant

- Prioritize correctness of the relationship graph validation over UI polish early on — data integrity is the core value of this app.
- Use recursive SQL CTEs (or a Rust-side graph check) to detect cycles before committing a parent/child relationship.
- Keep OAuth secrets in environment variables, never hardcoded.
- Design the API so the frontend chart can fetch a subgraph (e.g., "get all relationships within 3 degrees of person X") rather than the entire tree at once, for performance on large families.
