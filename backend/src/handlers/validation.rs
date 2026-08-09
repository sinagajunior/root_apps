use crate::error::AppError;
use crate::models::validation_request::ValidationRequestResponse;
use crate::state::AppState;
use axum::{
    extract::{Path, Query, State},
    http::{StatusCode, HeaderMap},
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::Row;
use std::sync::Arc;
use uuid::Uuid;

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

#[derive(Serialize)]
pub struct InboxItem {
    pub id: Uuid,
    pub relationship_id: Uuid,
    pub sender_person_id: Uuid,
    pub sender_name: String,
    pub relationship_type: String,
    pub status: String,
    pub created_at: String,
}

/// Helper to extract Bearer token from headers
fn extract_bearer_token(headers: &HeaderMap) -> Result<String, AppError> {
    let auth_header = headers
        .get("Authorization")
        .and_then(|h| h.to_str().ok())
        .ok_or_else(|| AppError::Unauthorized("Missing Authorization header".to_string()))?;

    let parts: Vec<&str> = auth_header.split_whitespace().collect();
    if parts.len() != 2 || parts[0] != "Bearer" {
        return Err(AppError::Unauthorized(
            "Invalid Authorization header format".to_string(),
        ));
    }
    Ok(parts[1].to_string())
}

/// Get validation requests inbox for authenticated user
pub async fn list_inbox(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Query(params): Query<ListQuery>,
) -> Result<Json<ListResponse<InboxItem>>, AppError> {
    let limit = params.limit.unwrap_or(20).min(100);
    let offset = params.offset.unwrap_or(0).max(0);

    // Extract and verify token
    let token = extract_bearer_token(&headers)?;
    let claims = crate::auth::jwt::verify_token(&token, &state.config.jwt_secret)?;
    let user_id = claims.user_id()?;

    // Get all persons owned by this user
    let user_persons: Vec<(Uuid,)> = sqlx::query_as(
        "SELECT id FROM persons WHERE user_id = $1"
    )
    .bind(user_id)
    .fetch_all(&state.db)
    .await?;

    if user_persons.is_empty() {
        return Ok(Json(ListResponse {
            data: vec![],
            total: 0,
        }));
    }

    let person_ids: Vec<Uuid> = user_persons.iter().map(|(id,)| *id).collect();

    // Query validation requests for these persons
    let rows = sqlx::query(
        r#"
        SELECT
            vr.id,
            vr.relationship_id,
            r.person_a_id as sender_person_id,
            CASE
                WHEN r.person_a_id = vr.requested_to_person_id THEN p2.full_name
                ELSE p1.full_name
            END as sender_name,
            r.relationship_type,
            vr.status,
            vr.created_at
        FROM validation_requests vr
        JOIN relationships r ON vr.relationship_id = r.id
        JOIN persons p1 ON r.person_a_id = p1.id
        JOIN persons p2 ON r.person_b_id = p2.id
        WHERE vr.requested_to_person_id = ANY($1::uuid[])
        ORDER BY vr.created_at DESC
        LIMIT $2 OFFSET $3
        "#
    )
    .bind(&person_ids)
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.db)
    .await?;

    let total: (i64,) = sqlx::query_as(
        "SELECT COUNT(*) FROM validation_requests WHERE requested_to_person_id = ANY($1::uuid[])"
    )
    .bind(&person_ids)
    .fetch_one(&state.db)
    .await?;

    let data: Vec<InboxItem> = rows.iter().map(|row| {
        InboxItem {
            id: row.get("id"),
            relationship_id: row.get("relationship_id"),
            sender_person_id: row.get("sender_person_id"),
            sender_name: row.get("sender_name"),
            relationship_type: row.get("relationship_type"),
            status: row.get("status"),
            created_at: row.get::<String, _>("created_at"),
        }
    }).collect();

    Ok(Json(ListResponse {
        data,
        total: total.0,
    }))
}

/// Accept a validation request
pub async fn accept_validation(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<ValidationRequestResponse>, AppError> {
    // Extract and verify token
    let token = extract_bearer_token(&headers)?;
    let claims = crate::auth::jwt::verify_token(&token, &state.config.jwt_secret)?;
    let _user_id = claims.user_id()?;

    // Start a transaction to ensure both updates succeed
    let mut tx = state.db.begin().await?;

    // Get the validation request
    let vr_row: Option<(Uuid,)> = sqlx::query_as(
        "SELECT relationship_id FROM validation_requests WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?;

    let relationship_id = vr_row
        .ok_or_else(|| AppError::NotFound("Validation request not found".to_string()))?
        .0;

    // Update validation request status to 'accepted'
    sqlx::query(
        "UPDATE validation_requests SET status = $1::validation_request_status WHERE id = $2"
    )
    .bind("accepted")
    .bind(id)
    .execute(&mut *tx)
    .await?;

    // Update relationship status to 'validated'
    sqlx::query(
        "UPDATE relationships SET status = $1::relationship_status WHERE id = $2"
    )
    .bind("validated")
    .bind(relationship_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    // Fetch the updated validation request
    let row = sqlx::query(
        "SELECT id, relationship_id, requested_to_person_id, status, created_at FROM validation_requests WHERE id = $1"
    )
    .bind(id)
    .fetch_one(&state.db)
    .await?;

    Ok(Json(ValidationRequestResponse {
        id: row.get("id"),
        relationship_id: row.get("relationship_id"),
        requested_to_person_id: row.get("requested_to_person_id"),
        status: row.get("status"),
        created_at: row.get("created_at"),
    }))
}

/// Reject a validation request
pub async fn reject_validation(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    // Extract and verify token
    let token = extract_bearer_token(&headers)?;
    let claims = crate::auth::jwt::verify_token(&token, &state.config.jwt_secret)?;
    let _user_id = claims.user_id()?;

    // Start a transaction
    let mut tx = state.db.begin().await?;

    // Get the validation request
    let vr_row: Option<(Uuid,)> = sqlx::query_as(
        "SELECT relationship_id FROM validation_requests WHERE id = $1"
    )
    .bind(id)
    .fetch_optional(&mut *tx)
    .await?;

    let relationship_id = vr_row
        .ok_or_else(|| AppError::NotFound("Validation request not found".to_string()))?
        .0;

    // Update validation request status to 'rejected'
    sqlx::query(
        "UPDATE validation_requests SET status = $1::validation_request_status WHERE id = $2"
    )
    .bind("rejected")
    .bind(id)
    .execute(&mut *tx)
    .await?;

    // Update relationship status to 'rejected'
    sqlx::query(
        "UPDATE relationships SET status = $1::relationship_status WHERE id = $2"
    )
    .bind("rejected")
    .bind(relationship_id)
    .execute(&mut *tx)
    .await?;

    tx.commit().await?;

    Ok(StatusCode::NO_CONTENT)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validation_flow() {
        // Would need database for full testing
        // Test structure for: create relationship -> auto-create validation -> accept
    }
}
