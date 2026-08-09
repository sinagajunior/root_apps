use anyhow::{anyhow, Result};
use dotenv::dotenv;
use std::env;

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_expiry_secs: u64,
    pub host: String,
    pub port: u16,
    pub cors_origin: String,
    pub google_client_id: String,
    pub google_client_secret: String,
    pub google_redirect_uri: String,
    pub facebook_client_id: String,
    pub facebook_client_secret: String,
    pub facebook_redirect_uri: String,
}

impl AppConfig {
    pub fn from_env() -> Result<Self> {
        dotenv().ok();

        Ok(AppConfig {
            database_url: env::var("DATABASE_URL")
                .map_err(|_| anyhow!("DATABASE_URL not set"))?,
            jwt_secret: env::var("JWT_SECRET")
                .map_err(|_| anyhow!("JWT_SECRET not set"))?,
            jwt_expiry_secs: env::var("JWT_EXPIRY_SECS")
                .unwrap_or_else(|_| "604800".to_string())
                .parse()?,
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()?,
            cors_origin: env::var("CORS_ORIGIN")
                .unwrap_or_else(|_| "http://localhost:5173".to_string()),
            google_client_id: env::var("GOOGLE_CLIENT_ID")
                .unwrap_or_else(|_| String::new()),
            google_client_secret: env::var("GOOGLE_CLIENT_SECRET")
                .unwrap_or_else(|_| String::new()),
            google_redirect_uri: env::var("GOOGLE_REDIRECT_URI")
                .unwrap_or_else(|_| String::new()),
            facebook_client_id: env::var("FACEBOOK_CLIENT_ID")
                .unwrap_or_else(|_| String::new()),
            facebook_client_secret: env::var("FACEBOOK_CLIENT_SECRET")
                .unwrap_or_else(|_| String::new()),
            facebook_redirect_uri: env::var("FACEBOOK_REDIRECT_URI")
                .unwrap_or_else(|_| String::new()),
        })
    }
}
