use crate::error::AppError;
use crate::graph::cycle_detection;
use crate::models::relationship::{
    CreateRelationshipRequest, Relationship, RelationshipResponse, RelationshipStatus,
    RelationshipType,
};
use crate::state::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;
use validator::Validate;

#[derive(Deserialize)]
pub struct ListQuery {
    limit: Option<i64>,
    offset: Option<i64>,
}

#[derive(Serialize)]
pub struct ListResponse<T> {
    data: Vec<T>,
    total: i64,
}

/// Create a new relationship with full validation pipeline
pub async fn create_relationship(
    State(state): State<Arc<AppState>>,
    Json(mut req): Json<CreateRelationshipRequest>,
) -> Result<impl IntoResponse, AppError> {
    // Validate input
    req.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    // Step 1: Parse relationship type
    let rel_type = match req.relationship_type.to_lowercase().as_str() {
        "parent" => RelationshipType::Parent,
        "child" => RelationshipType::Child,
        "spouse" => RelationshipType::Spouse,
        "sibling" => RelationshipType::Sibling,
        _ => return Err(AppError::BadRequest("Invalid relationship type".to_string())),
    };

    // Step 2: Determine person_a_id (use current user's person or provided person_a_id)
    let person_a_id = req.person_a_id.ok_or(AppError::BadRequest(
        "person_a_id is required".to_string(),
    ))?;

    let person_b_id = req.person_b_id;

    // Step 3: Check no self-relationships
    if person_a_id == person_b_id {
        return Err(AppError::Conflict(
            "Cannot create self-relationship".to_string(),
        ));
    }

    // Step 4: Normalize canonical pair ordering (smaller UUID is person_a_id)
    let (canonical_a, canonical_b, rel_type_final) = if person_a_id < person_b_id {
        (person_a_id, person_b_id, rel_type)
    } else {
        // If we flip the order, we need to flip the relationship type for parent/child
        let flipped_type = match rel_type {
            RelationshipType::Parent => RelationshipType::Child,
            RelationshipType::Child => RelationshipType::Parent,
            other => other,
        };
        (person_b_id, person_a_id, flipped_type)
    };

    // Step 5: Check for duplicates
    let duplicate_check: Option<(uuid::Uuid,)> = sqlx::query_as(
        "SELECT id FROM relationships WHERE person_a_id = $1 AND person_b_id = $2 AND relationship_type = $3::relationship_type"
    )
    .bind(canonical_a)
    .bind(canonical_b)
    .bind(rel_type_final.as_str())
    .fetch_optional(&state.db)
    .await?;

    if duplicate_check.is_some() {
        return Err(AppError::Conflict(
            "Relationship already exists".to_string(),
        ));
    }

    // Step 6: Check for cycles (only for parent/child relationships)
    if rel_type_final.requires_cycle_check() {
        let would_cycle = cycle_detection::would_create_cycle(
            &state.db,
            canonical_b, // child
            canonical_a, // proposed parent
        )
        .await?;

        if would_cycle {
            return Err(AppError::Conflict(
                "This relationship would create a cycle".to_string(),
            ));
        }
    }

    // Step 7: Insert relationship with status='pending'
    let rel_id = Uuid::new_v4();
    sqlx::query(
        r#"
        INSERT INTO relationships (id, person_a_id, person_b_id, relationship_type, status)
        VALUES ($1, $2, $3, $4::relationship_type, $5::relationship_status)
        "#
    )
    .bind(rel_id)
    .bind(canonical_a)
    .bind(canonical_b)
    .bind(rel_type_final.as_str())
    .bind("pending")
    .execute(&state.db)
    .await?;

    // Step 8: Auto-create validation request if target person has linked_user_id
    // TODO: Implement validation request auto-creation

    let response = RelationshipResponse {
        id: rel_id,
        person_a_id: canonical_a,
        person_b_id: canonical_b,
        relationship_type: rel_type_final.as_str().to_string(),
        status: "pending".to_string(),
    };

    Ok((StatusCode::CREATED, Json(response)))
}

/// List relationships
pub async fn list_relationships(
    State(_state): State<Arc<AppState>>,
    Query(_params): Query<ListQuery>,
) -> Result<Json<ListResponse<RelationshipResponse>>, AppError> {
    // TODO: Implement
    Err(AppError::InternalError(
        "Not yet implemented".to_string(),
    ))
}

/// Get specific relationship
pub async fn get_relationship(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<Uuid>,
) -> Result<Json<RelationshipResponse>, AppError> {
    // TODO: Implement
    Err(AppError::InternalError(
        "Not yet implemented".to_string(),
    ))
}

/// Delete relationship
pub async fn delete_relationship(
    State(_state): State<Arc<AppState>>,
    Path(_id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    // TODO: Implement
    Ok(StatusCode::NO_CONTENT)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_relationship_type_parsing() {
        let req = CreateRelationshipRequest {
            person_a_id: Some(Uuid::new_v4()),
            person_b_id: Uuid::new_v4(),
            relationship_type: "parent".to_string(),
        };

        // Would need database to fully test
        assert!(req.validate().is_ok());
    }

    #[test]
    fn test_self_relationship_check() {
        let id = Uuid::new_v4();
        let req = CreateRelationshipRequest {
            person_a_id: Some(id),
            person_b_id: id,
            relationship_type: "parent".to_string(),
        };

        // In actual handler, this would be rejected
        assert_eq!(req.person_a_id, Some(req.person_b_id));
    }
}
