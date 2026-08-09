use crate::error::AppError;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FacebookTokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FacebookUserInfo {
    pub id: String,
    pub email: Option<String>,
    pub name: String,
    pub picture: Option<FacebookPicture>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FacebookPicture {
    pub data: FacebookPictureData,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FacebookPictureData {
    pub height: Option<u32>,
    pub width: Option<u32>,
    pub is_silhouette: bool,
    pub url: String,
}

pub async fn exchange_code_for_token(
    _code: &str,
    _client_id: &str,
    _client_secret: &str,
    _redirect_uri: &str,
) -> Result<FacebookTokenResponse, AppError> {
    // TODO: Implement actual OAuth2 flow
    // Use oauth2 crate to exchange authorization code for access token
    Err(AppError::InternalError(
        "Facebook OAuth not yet implemented".to_string(),
    ))
}

pub async fn fetch_user_info(
    _access_token: &str,
) -> Result<FacebookUserInfo, AppError> {
    // TODO: Implement actual user info fetch from Facebook API
    Err(AppError::InternalError(
        "Facebook user info fetch not yet implemented".to_string(),
    ))
}

#[cfg(test)]
mod tests {
    // TODO: Add tests for Facebook OAuth flow
}
