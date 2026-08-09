use axum::{
    response::IntoResponse,
    Json,
    http::StatusCode,
};
use serde_json::json;
use crate::state::AppState;
use crate::auth::jwt::{Claims, sign_token};
use std::sync::Arc;
use uuid::Uuid;
use sqlx::Row;

pub async fn demo_login(
    axum::extract::State(state): axum::extract::State<Arc<AppState>>,
) -> impl IntoResponse {
    // Get the first user from the database for demo purposes
    match sqlx::query("SELECT id, email, name FROM users LIMIT 1")
        .fetch_one(&state.db)
        .await
    {
        Ok(row) => {
            let user_id: Uuid = row.get("id");
            let email: String = row.get("email");
            let name: String = row.get("name");

            let claims = Claims::new(user_id, state.config.jwt_expiry_secs);
            match sign_token(&claims, &state.config.jwt_secret) {
                Ok(token) => (
                    StatusCode::OK,
                    Json(json!({
                        "token": token,
                        "user": {
                            "id": user_id.to_string(),
                            "email": email,
                            "name": name
                        }
                    }))
                ).into_response(),
                Err(e) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({"error": e.to_string()}))
                ).into_response(),
            }
        }
        Err(e) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": format!("Failed to fetch user: {}", e)}))
        ).into_response(),
    }
}
