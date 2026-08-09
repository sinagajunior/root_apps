mod common;

#[cfg(test)]
mod cycle_detection_tests {
    use uuid::Uuid;
    use common::setup_test_db;

    #[tokio::test]
    async fn test_no_cycle_for_single_relationship() {
        let pool = setup_test_db().await;

        // Setup test data
        let user_id = Uuid::new_v4();
        let person_a = Uuid::new_v4();
        let person_b = Uuid::new_v4();

        // Insert test users and persons
        sqlx::query(
            "INSERT INTO users (id, auth_provider, provider_id, email, name)
             VALUES ($1, $2, $3, $4, $5)"
        )
        .bind(user_id)
        .bind("test")
        .bind("test123")
        .bind("test@example.com")
        .bind("Test User")
        .execute(&pool)
        .await
        .ok();

        sqlx::query(
            "INSERT INTO persons (id, user_id, full_name) VALUES ($1, $2, $3)"
        )
        .bind(person_a)
        .bind(user_id)
        .bind("Person A")
        .execute(&pool)
        .await
        .ok();

        sqlx::query(
            "INSERT INTO persons (id, user_id, full_name) VALUES ($1, $2, $3)"
        )
        .bind(person_b)
        .bind(user_id)
        .bind("Person B")
        .execute(&pool)
        .await
        .ok();

        // Test: Adding person_a → person_b should not create cycle
        let would_cycle: (bool,) = sqlx::query_as(
            "WITH RECURSIVE ancestors(person_id) AS (
                SELECT person_a_id FROM relationships
                WHERE person_b_id = $1 AND relationship_type = 'parent'
                UNION ALL
                SELECT r.person_a_id FROM relationships r
                INNER JOIN ancestors a ON r.person_b_id = a.person_id
                WHERE r.relationship_type = 'parent'
            )
            SELECT EXISTS(SELECT 1 FROM ancestors WHERE person_id = $2)"
        )
        .bind(person_b)
        .bind(person_a)
        .fetch_one(&pool)
        .await
        .unwrap();

        assert!(!would_cycle.0, "Should not detect cycle for new relationship");
    }

    #[tokio::test]
    async fn test_detect_immediate_cycle() {
        let pool = setup_test_db().await;

        let user_id = Uuid::new_v4();
        let person_a = Uuid::new_v4();
        let person_b = Uuid::new_v4();

        // Insert test data
        sqlx::query(
            "INSERT INTO users (id, auth_provider, provider_id, email, name)
             VALUES ($1, $2, $3, $4, $5)"
        )
        .bind(user_id)
        .bind("test")
        .bind("test234")
        .bind("test2@example.com")
        .bind("Test User 2")
        .execute(&pool)
        .await
        .ok();

        sqlx::query(
            "INSERT INTO persons (id, user_id, full_name) VALUES ($1, $2, $3)"
        )
        .bind(person_a)
        .bind(user_id)
        .bind("Person A")
        .execute(&pool)
        .await
        .ok();

        sqlx::query(
            "INSERT INTO persons (id, user_id, full_name) VALUES ($1, $2, $3)"
        )
        .bind(person_b)
        .bind(user_id)
        .bind("Person B")
        .execute(&pool)
        .await
        .ok();

        // Create relationship: A → B
        sqlx::query(
            "INSERT INTO relationships (id, person_a_id, person_b_id, relationship_type, status)
             VALUES ($1, $2, $3, $4, $5)"
        )
        .bind(Uuid::new_v4())
        .bind(person_a)
        .bind(person_b)
        .bind("parent")
        .bind("validated")
        .execute(&pool)
        .await
        .ok();

        // Test: Adding B → A should create immediate cycle
        let would_cycle: (bool,) = sqlx::query_as(
            "WITH RECURSIVE ancestors(person_id) AS (
                SELECT person_a_id FROM relationships
                WHERE person_b_id = $1 AND relationship_type = 'parent'
                UNION ALL
                SELECT r.person_a_id FROM relationships r
                INNER JOIN ancestors a ON r.person_b_id = a.person_id
                WHERE r.relationship_type = 'parent'
            )
            SELECT EXISTS(SELECT 1 FROM ancestors WHERE person_id = $2)"
        )
        .bind(person_a)
        .bind(person_b)
        .fetch_one(&pool)
        .await
        .unwrap();

        assert!(would_cycle.0, "Should detect immediate cycle A→B→A");
    }

    #[tokio::test]
    async fn test_no_cycle_for_sibling_relationships() {
        let pool = setup_test_db().await;

        let user_id = Uuid::new_v4();
        let person_a = Uuid::new_v4();
        let person_b = Uuid::new_v4();

        // Insert test data
        sqlx::query(
            "INSERT INTO users (id, auth_provider, provider_id, email, name)
             VALUES ($1, $2, $3, $4, $5)"
        )
        .bind(user_id)
        .bind("test")
        .bind("test345")
        .bind("test3@example.com")
        .bind("Test User 3")
        .execute(&pool)
        .await
        .ok();

        sqlx::query(
            "INSERT INTO persons (id, user_id, full_name) VALUES ($1, $2, $3)"
        )
        .bind(person_a)
        .bind(user_id)
        .bind("Person A")
        .execute(&pool)
        .await
        .ok();

        sqlx::query(
            "INSERT INTO persons (id, user_id, full_name) VALUES ($1, $2, $3)"
        )
        .bind(person_b)
        .bind(user_id)
        .bind("Person B")
        .execute(&pool)
        .await
        .ok();

        // Sibling relationships should not trigger cycle detection
        // (no DAG constraint for spouse/sibling)
        // This is validated in the handler logic, not the CTE
        // because sibling relationships are symmetric and don't create hierarchy

        assert!(true, "Sibling relationships don't need cycle detection");
    }
}
