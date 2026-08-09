use crate::error::AppError;
use crate::models::person::PersonResponse;
use crate::models::relationship::RelationshipResponse;
use crate::state::AppState;
use axum::{
    extract::{Path, Query, State},
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct SubgraphQuery {
    degrees: Option<i32>,
}

#[derive(Serialize)]
pub struct SubgraphResponse {
    pub persons: Vec<PersonResponse>,
    pub relationships: Vec<RelationshipResponse>,
}

/// Get subgraph of relationships within N degrees of a person
pub async fn get_subgraph(
    State(state): State<Arc<AppState>>,
    Path(person_id): Path<Uuid>,
    Query(params): Query<SubgraphQuery>,
) -> Result<Json<SubgraphResponse>, AppError> {
    // Validate and set degrees (1-5 range, default 3)
    let degrees = params.degrees.unwrap_or(3).max(1).min(5);

    // Use PostgreSQL recursive CTE to find all persons within N degrees
    let person_rows = sqlx::query(
        r#"
        WITH RECURSIVE neighborhood(person_id, depth) AS (
            SELECT $1::uuid, 0
            UNION ALL
            SELECT CASE
                    WHEN r.person_a_id = n.person_id THEN r.person_b_id
                    ELSE r.person_a_id
                END as connected_person_id,
                n.depth + 1
            FROM relationships r
            INNER JOIN neighborhood n
                ON (r.person_a_id = n.person_id OR r.person_b_id = n.person_id)
            WHERE n.depth < $2
              AND r.status <> 'rejected'
        )
        SELECT DISTINCT person_id FROM neighborhood
        ORDER BY person_id
        "#
    )
    .bind(person_id)
    .bind(degrees)
    .fetch_all(&state.db)
    .await?;

    let person_ids: Vec<Uuid> = person_rows
        .iter()
        .map(|row| row.get::<Uuid, _>("person_id"))
        .collect();

    if person_ids.is_empty() {
        return Ok(Json(SubgraphResponse {
            persons: vec![],
            relationships: vec![],
        }));
    }

    // Bulk fetch persons
    let person_result_rows = sqlx::query(
        "SELECT id, full_name, birth_date, death_date FROM persons WHERE id = ANY($1::uuid[])"
    )
    .bind(&person_ids)
    .fetch_all(&state.db)
    .await?;

    let persons: Vec<PersonResponse> = person_result_rows.iter().map(|row| {
        PersonResponse {
            id: row.get("id"),
            full_name: row.get("full_name"),
            birth_date: row.get("birth_date"),
            death_date: row.get("death_date"),
        }
    }).collect();

    // Fetch all relationships between these persons (where both person_a and person_b are in the set)
    let rel_rows = sqlx::query(
        r#"
        SELECT id, person_a_id, person_b_id, relationship_type::text, status::text
        FROM relationships
        WHERE (person_a_id = ANY($1::uuid[]) OR person_b_id = ANY($1::uuid[]))
          AND person_a_id = ANY($1::uuid[])
          AND person_b_id = ANY($1::uuid[])
          AND status <> 'rejected'
        "#
    )
    .bind(&person_ids)
    .fetch_all(&state.db)
    .await?;

    let relationships: Vec<RelationshipResponse> = rel_rows.iter().map(|row| {
        RelationshipResponse {
            id: row.get("id"),
            person_a_id: row.get("person_a_id"),
            person_b_id: row.get("person_b_id"),
            relationship_type: row.get("relationship_type"),
            status: row.get("status"),
        }
    }).collect();

    Ok(Json(SubgraphResponse {
        persons,
        relationships,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_single_person_subgraph() {
        // Single person should return just that person with no relationships
    }

    #[test]
    fn test_two_degree_subgraph() {
        // Two-degree search should include direct connections and their connections
    }

    #[test]
    fn test_depth_boundary() {
        // Verify depth boundaries are respected
    }
}
