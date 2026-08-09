use sqlx::postgres::PgPoolOptions;

pub async fn setup_test_db() -> sqlx::PgPool {
    let database_url = std::env::var("DATABASE_URL_TEST")
        .unwrap_or_else(|_| "postgres://root_user:root_pass@localhost:5433/root_db_test".to_string());

    PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await
        .expect("Failed to connect to test database")
}
