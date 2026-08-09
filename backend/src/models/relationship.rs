use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "relationship_type", rename_all = "lowercase")]
pub enum RelationshipType {
    #[serde(rename = "parent")]
    Parent,
    #[serde(rename = "child")]
    Child,
    #[serde(rename = "spouse")]
    Spouse,
    #[serde(rename = "sibling")]
    Sibling,
}

impl RelationshipType {
    pub fn as_str(&self) -> &'static str {
        match self {
            RelationshipType::Parent => "parent",
            RelationshipType::Child => "child",
            RelationshipType::Spouse => "spouse",
            RelationshipType::Sibling => "sibling",
        }
    }

    pub fn requires_cycle_check(&self) -> bool {
        matches!(self, RelationshipType::Parent | RelationshipType::Child)
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, sqlx::Type)]
#[sqlx(type_name = "relationship_status", rename_all = "lowercase")]
pub enum RelationshipStatus {
    #[serde(rename = "pending")]
    Pending,
    #[serde(rename = "validated")]
    Validated,
    #[serde(rename = "rejected")]
    Rejected,
}

impl RelationshipStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            RelationshipStatus::Pending => "pending",
            RelationshipStatus::Validated => "validated",
            RelationshipStatus::Rejected => "rejected",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Relationship {
    pub id: Uuid,
    pub person_a_id: Uuid,
    pub person_b_id: Uuid,
    pub relationship_type: RelationshipType,
    pub status: RelationshipStatus,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Validate, Deserialize)]
pub struct CreateRelationshipRequest {
    pub person_a_id: Option<Uuid>,
    pub person_b_id: Uuid,
    pub relationship_type: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct RelationshipResponse {
    pub id: Uuid,
    pub person_a_id: Uuid,
    pub person_b_id: Uuid,
    pub relationship_type: String,
    pub status: String,
}

impl From<Relationship> for RelationshipResponse {
    fn from(rel: Relationship) -> Self {
        RelationshipResponse {
            id: rel.id,
            person_a_id: rel.person_a_id,
            person_b_id: rel.person_b_id,
            relationship_type: rel.relationship_type.as_str().to_string(),
            status: rel.status.as_str().to_string(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_relationship_type_cycle_check() {
        assert!(RelationshipType::Parent.requires_cycle_check());
        assert!(RelationshipType::Child.requires_cycle_check());
        assert!(!RelationshipType::Spouse.requires_cycle_check());
        assert!(!RelationshipType::Sibling.requires_cycle_check());
    }

    #[test]
    fn test_relationship_type_as_str() {
        assert_eq!(RelationshipType::Parent.as_str(), "parent");
        assert_eq!(RelationshipType::Child.as_str(), "child");
        assert_eq!(RelationshipType::Spouse.as_str(), "spouse");
        assert_eq!(RelationshipType::Sibling.as_str(), "sibling");
    }

    #[test]
    fn test_relationship_status_as_str() {
        assert_eq!(RelationshipStatus::Pending.as_str(), "pending");
        assert_eq!(RelationshipStatus::Validated.as_str(), "validated");
        assert_eq!(RelationshipStatus::Rejected.as_str(), "rejected");
    }
}
