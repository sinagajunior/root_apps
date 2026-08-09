-- Add spouse relationships that were missing
-- Add Sarah Brown (John's wife)
INSERT INTO persons (id, user_id, full_name, birth_date, death_date, created_at, updated_at)
VALUES ('650e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440001', 'Sarah Brown', '1982-03-15', NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Add John and Sarah's marriage
INSERT INTO relationships (id, person_a_id, person_b_id, relationship_type, status, created_at, updated_at)
VALUES
    ('750e8400-e29b-41d4-a716-446655440099', '650e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440027', 'spouse', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440098', '650e8400-e29b-41d4-a716-446655440027', '650e8400-e29b-41d4-a716-446655440020', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440097', '650e8400-e29b-41d4-a716-446655440027', '650e8400-e29b-41d4-a716-446655440021', 'parent', 'validated', NOW(), NOW())
ON CONFLICT DO NOTHING;
