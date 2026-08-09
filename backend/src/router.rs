use crate::state::AppState;
use crate::handlers::{auth, persons, relationships, validation, graph};
use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post, delete, put},
    Router,
};
use std::sync::Arc;

// Health check endpoint
async fn healthz() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}

pub fn build_router(state: Arc<AppState>) -> Router {
    let router = Router::new()
        .route("/healthz", get(healthz))
        .route("/auth/demo-login", post(auth::demo_login))
        .route("/persons", get(persons::list_persons))
        .route("/persons", post(persons::create_person))
        .route("/persons/search", get(persons::search_persons))
        .route("/persons/{id}", get(persons::get_person))
        .route("/persons/{id}", put(persons::update_person))
        .route("/persons/{id}", delete(persons::delete_person))
        .route("/relationships", post(relationships::create_relationship))
        .route("/relationships", get(relationships::list_relationships))
        .route("/relationships/{id}", get(relationships::get_relationship))
        .route("/validations/inbox", get(validation::list_inbox))
        .route("/validations/{id}/accept", post(validation::accept_validation))
        .route("/validations/{id}/reject", post(validation::reject_validation))
        .route("/graph/{person_id}", get(graph::get_subgraph))
        .with_state(state.clone());

    router
}
