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

/// Helper function to determine partner status based on relationships
async fn get_partner_status_for_graph(
    person_id: Uuid,
    gender: Option<&str>,
    db: &sqlx::PgPool,
) -> Result<Option<String>, AppError> {
    // Check if person has a partner
    let partner_result: Option<(String, String)> = sqlx::query_as(
        "SELECT full_name, gender FROM persons WHERE id IN (
            SELECT person_b_id FROM relationships WHERE person_a_id = $1 AND relationship_type = 'spouse' AND status <> 'rejected'
            UNION
            SELECT person_a_id FROM relationships WHERE person_b_id = $1 AND relationship_type = 'spouse' AND status <> 'rejected'
        ) LIMIT 1"
    )
    .bind(person_id)
    .fetch_optional(db)
    .await?;

    let status = if let Some((partner_name, _partner_gender)) = partner_result {
        partner_name
    } else {
        "n/a".to_string()
    };

    Ok(Some(status))
}

/// Helper function to get father's name for graph
async fn get_father_info_for_graph(
    person_id: Uuid,
    db: &sqlx::PgPool,
) -> Result<Option<String>, AppError> {
    let father_result: Option<(String,)> = sqlx::query_as(
        "SELECT full_name FROM persons WHERE id IN (
            SELECT person_a_id FROM relationships WHERE person_b_id = $1 AND relationship_type = 'parent' AND status <> 'rejected'
        ) AND gender = 'Male' LIMIT 1"
    )
    .bind(person_id)
    .fetch_optional(db)
    .await?;

    Ok(father_result.map(|(name,)| name))
}

/// Helper function to get mother's name for graph
async fn get_mother_info_for_graph(
    person_id: Uuid,
    db: &sqlx::PgPool,
) -> Result<Option<String>, AppError> {
    let mother_result: Option<(String,)> = sqlx::query_as(
        "SELECT full_name FROM persons WHERE id IN (
            SELECT person_a_id FROM relationships WHERE person_b_id = $1 AND relationship_type = 'parent' AND status <> 'rejected'
        ) AND gender = 'Female' LIMIT 1"
    )
    .bind(person_id)
    .fetch_optional(db)
    .await?;

    Ok(mother_result.map(|(name,)| name))
}

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
    // Validate and set degrees (1-7 range for 7 generations, default 3)
    let degrees = params.degrees.unwrap_or(3).max(1).min(7);

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
        "SELECT id, full_name, birth_date, death_date, gender, married, avatar_url FROM persons WHERE id = ANY($1::uuid[])"
    )
    .bind(&person_ids)
    .fetch_all(&state.db)
    .await?;

    let mut persons: Vec<PersonResponse> = Vec::new();

    for row in person_result_rows.iter() {
        let id: Uuid = row.get("id");
        let gender: Option<String> = row.get("gender");
        let partner_status = get_partner_status_for_graph(id, gender.as_deref(), &state.db).await?;
        let father_info = get_father_info_for_graph(id, &state.db).await?;
        let mother_info = get_mother_info_for_graph(id, &state.db).await?;

        persons.push(PersonResponse {
            id,
            full_name: row.get("full_name"),
            birth_date: row.get("birth_date"),
            death_date: row.get("death_date"),
            gender,
            married: row.get("married"),
            avatar_url: row.get("avatar_url"),
            partner_status,
            father_info,
            mother_info,
        });
    }

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
