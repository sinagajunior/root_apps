use crate::error::AppError;
use crate::models::person::{CreatePersonRequest, PersonResponse, UpdatePersonRequest};
use crate::state::AppState;
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::Row;
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

#[derive(Deserialize)]
pub struct SearchQuery {
    q: String,
    limit: Option<i64>,
}

/// List all persons
pub async fn list_persons(
    State(state): State<Arc<AppState>>,
    Query(params): Query<ListQuery>,
) -> Result<Json<ListResponse<PersonResponse>>, AppError> {
    let limit = params.limit.unwrap_or(20).min(100);
    let offset = params.offset.unwrap_or(0).max(0);

    let rows = sqlx::query("SELECT id, full_name, birth_date, death_date, gender, married, avatar_url FROM persons ORDER BY full_name LIMIT $1 OFFSET $2")
        .bind(limit)
        .bind(offset)
        .fetch_all(&state.db)
        .await?;

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM persons")
        .fetch_one(&state.db)
        .await?;

    let data: Vec<PersonResponse> = rows.iter().map(|row| {
        PersonResponse {
            id: row.get("id"),
            full_name: row.get("full_name"),
            birth_date: row.get("birth_date"),
            death_date: row.get("death_date"),
            gender: row.get("gender"),
            married: row.get("married"),
            avatar_url: row.get("avatar_url"),
        }
    }).collect();

    Ok(Json(ListResponse {
        data,
        total: total.0,
    }))
}

/// Create a new person
pub async fn create_person(
    State(state): State<Arc<AppState>>,
    Json(req): Json<CreatePersonRequest>,
) -> Result<(StatusCode, Json<PersonResponse>), AppError> {
    // Validate input
    req.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let id = Uuid::new_v4();

    // Get the first user from the database for development
    let user_row = sqlx::query("SELECT id FROM users LIMIT 1")
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::InternalError("No users found in database".to_string()))?;

    let user_id: Uuid = user_row.get("id");

    let row = sqlx::query(
        "INSERT INTO persons (id, user_id, full_name, birth_date, death_date, gender, married, avatar_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, full_name, birth_date, death_date, gender, married, avatar_url"
    )
    .bind(id)
    .bind(user_id)
    .bind(&req.full_name)
    .bind(&req.birth_date)
    .bind(&req.death_date)
    .bind(&req.gender)
    .bind(&req.married)
    .bind(&req.avatar_url)
    .fetch_one(&state.db)
    .await?;

    let response = PersonResponse {
        id: row.get("id"),
        full_name: row.get("full_name"),
        birth_date: row.get("birth_date"),
        death_date: row.get("death_date"),
        gender: row.get("gender"),
        married: row.get("married"),
        avatar_url: row.get("avatar_url"),
    };

    Ok((StatusCode::CREATED, Json(response)))
}

/// Get a specific person
pub async fn get_person(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<Json<PersonResponse>, AppError> {
    let row = sqlx::query("SELECT id, full_name, birth_date, death_date, gender, married, avatar_url FROM persons WHERE id = $1")
        .bind(id)
        .fetch_optional(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound("Person not found".to_string()))?;

    Ok(Json(PersonResponse {
        id: row.get("id"),
        full_name: row.get("full_name"),
        birth_date: row.get("birth_date"),
        death_date: row.get("death_date"),
        gender: row.get("gender"),
        married: row.get("married"),
        avatar_url: row.get("avatar_url"),
    }))
}

/// Update a person
pub async fn update_person(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdatePersonRequest>,
) -> Result<Json<PersonResponse>, AppError> {
    // Validate input
    req.validate()
        .map_err(|e| AppError::Validation(e.to_string()))?;

    let row = sqlx::query(
        "UPDATE persons SET full_name = COALESCE($2, full_name), birth_date = COALESCE($3, birth_date), death_date = COALESCE($4, death_date), gender = COALESCE($5, gender), married = COALESCE($6, married), avatar_url = COALESCE($7, avatar_url) WHERE id = $1 RETURNING id, full_name, birth_date, death_date, gender, married, avatar_url"
    )
    .bind(id)
    .bind(&req.full_name)
    .bind(&req.birth_date)
    .bind(&req.death_date)
    .bind(&req.gender)
    .bind(&req.married)
    .bind(&req.avatar_url)
    .fetch_optional(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound("Person not found".to_string()))?;

    Ok(Json(PersonResponse {
        id: row.get("id"),
        full_name: row.get("full_name"),
        birth_date: row.get("birth_date"),
        death_date: row.get("death_date"),
        gender: row.get("gender"),
        married: row.get("married"),
        avatar_url: row.get("avatar_url"),
    }))
}

/// Delete a person
pub async fn delete_person(
    State(state): State<Arc<AppState>>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode, AppError> {
    let result = sqlx::query("DELETE FROM persons WHERE id = $1")
        .bind(id)
        .execute(&state.db)
        .await?;

    if result.rows_affected() == 0 {
        return Err(AppError::NotFound("Person not found".to_string()));
    }

    Ok(StatusCode::NO_CONTENT)
}

/// Search persons by name
pub async fn search_persons(
    State(state): State<Arc<AppState>>,
    Query(params): Query<SearchQuery>,
) -> Result<Json<ListResponse<PersonResponse>>, AppError> {
    let limit = params.limit.unwrap_or(20).min(100);
    let search_query = format!("%{}%", params.q);

    let rows = sqlx::query("SELECT id, full_name, birth_date, death_date, gender, married, avatar_url FROM persons WHERE full_name ILIKE $1 ORDER BY full_name LIMIT $2")
        .bind(&search_query)
        .bind(limit)
        .fetch_all(&state.db)
        .await?;

    let total: (i64,) = sqlx::query_as("SELECT COUNT(*) FROM persons WHERE full_name ILIKE $1")
        .bind(&search_query)
        .fetch_one(&state.db)
        .await?;

    let data: Vec<PersonResponse> = rows.iter().map(|row| {
        PersonResponse {
            id: row.get("id"),
            full_name: row.get("full_name"),
            birth_date: row.get("birth_date"),
            death_date: row.get("death_date"),
            gender: row.get("gender"),
            married: row.get("married"),
            avatar_url: row.get("avatar_url"),
        }
    }).collect();

    Ok(Json(ListResponse {
        data,
        total: total.0,
    }))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_person_validation() {
        let valid = CreatePersonRequest {
            full_name: "John Doe".to_string(),
            birth_date: None,
            death_date: None,
        };
        assert!(valid.validate().is_ok());
    }
}
