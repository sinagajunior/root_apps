use axum::{
    http::StatusCode,
    response::IntoResponse,
    routing::get,
    Router,
};
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tracing::info;

mod config;
mod error;
mod state;
mod router;
mod auth;
mod db;
mod models;
mod graph;
mod handlers;

use config::AppConfig;
use state::AppState;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    // Load configuration from environment
    let config = AppConfig::from_env()?;
    info!("Configuration loaded: {:?}", config);

    // Create database connection pool
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&config.database_url)
        .await?;

    info!("Connected to database");

    // Run migrations
    sqlx::migrate!("./src/db/migrations")
        .run(&pool)
        .await?;

    info!("Migrations applied successfully");

    // Create application state
    let state = Arc::new(AppState::new(pool, config.clone())?);

    // Build the router with all routes
    let app = router::build_router(state)
        .layer(CorsLayer::permissive())
        .into_make_service();

    // Create server
    let listener = tokio::net::TcpListener::bind(format!("{}:{}", config.host, config.port))
        .await?;

    info!(
        "Server listening on {}:{}",
        config.host, config.port
    );

    axum::serve(listener, app).await?;

    Ok(())
}

// Health check endpoint
async fn healthz() -> impl IntoResponse {
    (StatusCode::OK, "OK")
}
