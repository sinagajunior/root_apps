use crate::config::AppConfig;
use crate::error::AppError;
use sqlx::PgPool;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub config: AppConfig,
}

impl AppState {
    pub fn new(db: PgPool, config: AppConfig) -> Result<Self, AppError> {
        Ok(AppState { db, config })
    }
}
