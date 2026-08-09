use crate::error::AppError;
use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,      // User ID
    pub iat: i64,         // Issued at
    pub exp: i64,         // Expiration time
}

impl Claims {
    pub fn new(user_id: Uuid, expiry_secs: u64) -> Self {
        let now = Utc::now();
        let iat = now.timestamp();
        let exp = (now + Duration::seconds(expiry_secs as i64)).timestamp();

        Claims {
            sub: user_id.to_string(),
            iat,
            exp,
        }
    }

    pub fn user_id(&self) -> Result<Uuid, AppError> {
        Uuid::parse_str(&self.sub)
            .map_err(|_| AppError::Unauthorized("Invalid user ID in token".to_string()))
    }
}

pub fn sign_token(claims: &Claims, secret: &str) -> Result<String, AppError> {
    let key = EncodingKey::from_secret(secret.as_bytes());
    encode(&Header::default(), claims, &key)
        .map_err(|e| AppError::InternalError(format!("Failed to sign token: {}", e)))
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    let key = DecodingKey::from_secret(secret.as_bytes());
    decode::<Claims>(token, &key, &Validation::default())
        .map(|data| data.claims)
        .map_err(|e| AppError::Unauthorized(format!("Invalid token: {}", e)))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sign_and_verify_token() {
        let secret = "test-secret-key";
        let user_id = Uuid::new_v4();
        let claims = Claims::new(user_id, 3600);

        let token = sign_token(&claims, secret).expect("Failed to sign");
        let verified = verify_token(&token, secret).expect("Failed to verify");

        assert_eq!(verified.sub, user_id.to_string());
        assert_eq!(verified.iat, claims.iat);
        assert_eq!(verified.exp, claims.exp);
    }

    #[test]
    fn test_invalid_token() {
        let secret = "test-secret-key";
        let result = verify_token("invalid.token.here", secret);
        assert!(result.is_err());
    }

    #[test]
    fn test_wrong_secret() {
        let secret = "test-secret-key";
        let user_id = Uuid::new_v4();
        let claims = Claims::new(user_id, 3600);

        let token = sign_token(&claims, secret).expect("Failed to sign");
        let result = verify_token(&token, "wrong-secret");
        assert!(result.is_err());
    }
}
