use crate::error::AppError;
use sqlx::PgPool;
use uuid::Uuid;

/// Check if adding a parent relationship would create a cycle
/// Uses PostgreSQL recursive CTE (WITH RECURSIVE) for efficient traversal
pub async fn would_create_cycle(
    pool: &PgPool,
    child_id: Uuid,
    proposed_parent_id: Uuid,
) -> Result<bool, AppError> {
    // Recursive CTE to find all ancestors of the child
    let query = r#"
        WITH RECURSIVE ancestors(person_id) AS (
            -- Base case: direct parents
            SELECT person_a_id AS person_id
            FROM relationships
            WHERE person_b_id = $1
              AND relationship_type = 'parent'
              AND status <> 'rejected'
            UNION ALL
            -- Recursive case: parents of parents
            SELECT r.person_a_id
            FROM relationships r
            INNER JOIN ancestors a ON r.person_b_id = a.person_id
            WHERE r.relationship_type = 'parent'
              AND r.status <> 'rejected'
        )
        SELECT EXISTS (
            SELECT 1 FROM ancestors WHERE person_id = $2
        ) AS would_create_cycle
    "#;

    let result: (bool,) = sqlx::query_as(query)
        .bind(child_id)
        .bind(proposed_parent_id)
        .fetch_one(pool)
        .await?;

    Ok(result.0)
}

/// Check if a person is an ancestor of another (used for validation)
pub async fn is_ancestor_of(
    pool: &PgPool,
    potential_ancestor_id: Uuid,
    person_id: Uuid,
) -> Result<bool, AppError> {
    let query = r#"
        WITH RECURSIVE ancestors(person_id) AS (
            SELECT person_a_id AS person_id
            FROM relationships
            WHERE person_b_id = $1
              AND relationship_type = 'parent'
              AND status <> 'rejected'
            UNION ALL
            SELECT r.person_a_id
            FROM relationships r
            INNER JOIN ancestors a ON r.person_b_id = a.person_id
            WHERE r.relationship_type = 'parent'
              AND r.status <> 'rejected'
        )
        SELECT EXISTS (
            SELECT 1 FROM ancestors WHERE person_id = $2
        ) AS is_ancestor
    "#;

    let result: (bool,) = sqlx::query_as(query)
        .bind(person_id)
        .bind(potential_ancestor_id)
        .fetch_one(pool)
        .await?;

    Ok(result.0)
}

/// Get all ancestors of a person (within a depth limit)
pub async fn get_ancestors(
    pool: &PgPool,
    person_id: Uuid,
    max_depth: Option<i32>,
) -> Result<Vec<Uuid>, AppError> {
    let depth_limit = max_depth.unwrap_or(100);

    let query = r#"
        WITH RECURSIVE ancestors(person_id, depth) AS (
            SELECT person_a_id, 1
            FROM relationships
            WHERE person_b_id = $1
              AND relationship_type = 'parent'
              AND status <> 'rejected'
            UNION ALL
            SELECT r.person_a_id, a.depth + 1
            FROM relationships r
            INNER JOIN ancestors a ON r.person_b_id = a.person_id
            WHERE r.relationship_type = 'parent'
              AND r.status <> 'rejected'
              AND a.depth < $2
        )
        SELECT DISTINCT person_id FROM ancestors ORDER BY depth
    "#;

    let results: Vec<(Uuid,)> = sqlx::query_as(query)
        .bind(person_id)
        .bind(depth_limit)
        .fetch_all(pool)
        .await?;

    Ok(results.into_iter().map(|(id,)| id).collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    // These tests would need a test database setup
    // For now, they're placeholders showing the test structure

    #[tokio::test]
    #[ignore] // Requires database
    async fn test_no_cycle_simple_pair() {
        // Test that a simple parent-child relationship doesn't create a cycle
        // Setup: Create two persons A and B
        // Attempt: Add A as parent of B
        // Expected: No cycle detected
    }

    #[tokio::test]
    #[ignore] // Requires database
    async fn test_detect_immediate_cycle() {
        // Test: A -> B -> A cycle detection
    }

    #[tokio::test]
    #[ignore] // Requires database
    async fn test_detect_long_cycle() {
        // Test: A -> B -> C -> D -> A (5-node cycle)
    }

    #[tokio::test]
    #[ignore] // Requires database
    async fn test_no_cycle_with_rejected_relationships() {
        // Test: Rejected relationships are ignored in cycle detection
    }
}
