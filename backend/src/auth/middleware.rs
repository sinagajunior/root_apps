use crate::auth::jwt::{verify_token, Claims};
use crate::error::AppError;
use uuid::Uuid;

/// AuthUser represents an authenticated user
#[derive(Clone, Debug)]
pub struct AuthUser {
    pub user_id: Uuid,
    pub claims: Claims,
}

impl AuthUser {
    pub fn new(user_id: Uuid, claims: Claims) -> Self {
        AuthUser { user_id, claims }
    }
}

// Middleware function to extract JWT from Authorization header
pub fn extract_token(auth_header: &str) -> Result<String, AppError> {
    let parts: Vec<&str> = auth_header.split_whitespace().collect();
    if parts.len() != 2 || parts[0] != "Bearer" {
        return Err(AppError::Unauthorized(
            "Invalid Authorization header format".to_string(),
        ));
    }
    Ok(parts[1].to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::auth::jwt;

    #[test]
    fn test_auth_user_creation() {
        let user_id = Uuid::new_v4();
        let claims = Claims::new(user_id, 3600);

        assert_eq!(claims.user_id().unwrap(), user_id);
    }
}
