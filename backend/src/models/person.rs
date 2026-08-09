use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::FromRow)]
pub struct Person {
    pub id: Uuid,
    pub user_id: Uuid,
    pub full_name: String,
    pub birth_date: Option<NaiveDate>,
    pub death_date: Option<NaiveDate>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Validate, Deserialize)]
pub struct CreatePersonRequest {
    #[validate(length(min = 1, max = 255))]
    pub full_name: String,
    pub birth_date: Option<NaiveDate>,
    pub death_date: Option<NaiveDate>,
}

#[derive(Debug, Clone, Validate, Deserialize)]
pub struct UpdatePersonRequest {
    #[validate(length(min = 1, max = 255))]
    pub full_name: Option<String>,
    pub birth_date: Option<NaiveDate>,
    pub death_date: Option<NaiveDate>,
}

#[derive(Debug, Clone, Serialize)]
pub struct PersonResponse {
    pub id: Uuid,
    pub full_name: String,
    pub birth_date: Option<NaiveDate>,
    pub death_date: Option<NaiveDate>,
}

impl From<Person> for PersonResponse {
    fn from(person: Person) -> Self {
        PersonResponse {
            id: person.id,
            full_name: person.full_name,
            birth_date: person.birth_date,
            death_date: person.death_date,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_person_validation() {
        let valid = CreatePersonRequest {
            full_name: "John Doe".to_string(),
            birth_date: None,
            death_date: None,
        };
        assert!(valid.validate().is_ok());

        let invalid = CreatePersonRequest {
            full_name: "".to_string(),
            birth_date: None,
            death_date: None,
        };
        assert!(invalid.validate().is_err());
    }
}
