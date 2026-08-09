use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "validation_request_status", rename_all = "lowercase")]
pub enum ValidationRequestStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "accepted")]
    Accepted,
    #[serde(rename = "rejected")]
    Rejected,
}

impl ValidationRequestStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            ValidationRequestStatus::Pending => "pending",
            ValidationRequestStatus::Accepted => "accepted",
            ValidationRequestStatus::Rejected => "rejected",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct ValidationRequest {
    pub id: Uuid,
    pub relationship_id: Uuid,
    pub requested_to_person_id: Uuid,
    pub status: ValidationRequestStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ValidationRequestResponse {
    pub id: Uuid,
    pub relationship_id: Uuid,
    pub requested_to_person_id: Uuid,
    pub status: String,
    pub created_at: DateTime<Utc>,
}

impl From<ValidationRequest> for ValidationRequestResponse {
    fn from(req: ValidationRequest) -> Self {
        ValidationRequestResponse {
            id: req.id,
            relationship_id: req.relationship_id,
            requested_to_person_id: req.requested_to_person_id,
            status: req.status.as_str().to_string(),
            created_at: req.created_at,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validation_request_status_as_str() {
        assert_eq!(ValidationRequestStatus::Pending.as_str(), "pending");
        assert_eq!(ValidationRequestStatus::Accepted.as_str(), "accepted");
        assert_eq!(ValidationRequestStatus::Rejected.as_str(), "rejected");
    }
}
