-- Seed data for testing (only runs in development)
-- Insert test users
INSERT INTO users (id, auth_provider, provider_id, email, name, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'google', '123456789', 'john@example.com', 'John Doe', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440002', 'google', '987654321', 'jane@example.com', 'Jane Smith', NOW(), NOW()),
    ('550e8400-e29b-41d4-a716-446655440003', 'google', '555555555', 'bob@example.com', 'Bob Johnson', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert test persons with complete information
INSERT INTO persons (id, user_id, full_name, birth_date, death_date, created_at, updated_at)
VALUES
    -- John's family tree (Generation 1 - Grandparents)
    ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Charles Brown', '1935-03-10', '2015-12-05', NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Martha Brown', '1937-05-20', '2018-08-15', NOW(), NOW()),

    -- John's family tree (Generation 2 - Parents)
    ('650e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Edward Brown Sr.', '1955-02-14', NULL, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Victoria Brown', '1958-09-22', NULL, NOW(), NOW()),

    -- John's family tree (Generation 3 - Self and Siblings)
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'John Doe', '1980-01-15', NULL, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Alice Doe', '1982-06-20', NULL, NOW(), NOW()),

    -- John's family tree (Generation 4 - Children)
    ('650e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440001', 'Michael Brown', '2005-07-10', NULL, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440001', 'Sophie Brown', '2008-04-18', NULL, NOW(), NOW()),

    -- Jane's family tree (Generation 1 - Grandparents)
    ('650e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440002', 'Robert Smith Sr.', '1930-01-05', '2010-11-22', NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440002', 'Catherine Wilson', '1932-08-15', '2012-09-30', NOW(), NOW()),

    -- Jane's family tree (Generation 2)
    ('650e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440002', 'Richard Smith', '1955-03-12', NULL, NOW(), NOW()),

    -- Jane's family tree (Generation 3)
    ('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Jane Smith', '1982-07-22', NULL, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'David Smith', '1980-11-11', NULL, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440002', 'Elizabeth Smith', '1985-03-08', NULL, NOW(), NOW()),

    -- Jane's family tree (Generation 4)
    ('650e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440002', 'Emma Smith', '2010-02-14', NULL, NOW(), NOW()),

    -- Bob's family tree (Generation 1)
    ('650e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440003', 'Thomas Johnson Sr.', '1940-07-20', '2018-06-10', NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440003', 'Patricia Miller', '1942-05-15', NULL, NOW(), NOW()),

    -- Bob's family tree (Generation 2)
    ('650e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440003', 'Bob Johnson', '1965-04-12', NULL, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440003', 'Sarah Johnson', '1968-11-30', NULL, NOW(), NOW()),

    -- Bob's family tree (Generation 3)
    ('650e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440003', 'James Johnson', '1990-08-05', NULL, NOW(), NOW()),
    ('650e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440003', 'Claire Johnson', '1995-12-20', NULL, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert comprehensive relationships
INSERT INTO relationships (id, person_a_id, person_b_id, relationship_type, status, created_at, updated_at)
VALUES
    -- John's grandparents to parents
    ('750e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440012', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440012', 'parent', 'validated', NOW(), NOW()),

    -- John's grandparents to parents (Charles to Victoria)
    ('750e8400-e29b-41d4-a716-446655440027', '650e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440013', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440028', '650e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440013', 'parent', 'validated', NOW(), NOW()),

    -- John's parents to John
    ('750e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440001', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440001', 'parent', 'validated', NOW(), NOW()),

    -- John's parents to Alice
    ('750e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440002', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440002', 'parent', 'validated', NOW(), NOW()),

    -- John and Alice as siblings
    ('750e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', 'sibling', 'validated', NOW(), NOW()),

    -- John as parent to children (Sarah's relationships added in migration 20240101000008)
    ('750e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440020', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440009', '650e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440021', 'parent', 'validated', NOW(), NOW()),

    -- Jane's family relationships
    ('750e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440022', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440022', 'parent', 'validated', NOW(), NOW()),

    -- Jane and siblings
    ('750e8400-e29b-41d4-a716-446655440012', '650e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440004', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440005', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440014', '650e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440016', 'parent', 'validated', NOW(), NOW()),

    -- Jane and David marriage
    ('750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440005', 'spouse', 'validated', NOW(), NOW()),

    -- Jane's children
    ('750e8400-e29b-41d4-a716-446655440016', '650e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440023', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440023', 'parent', 'validated', NOW(), NOW()),

    -- Jane and Elizabeth as siblings
    ('750e8400-e29b-41d4-a716-446655440018', '650e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440016', 'sibling', 'validated', NOW(), NOW()),

    -- Bob's family
    ('750e8400-e29b-41d4-a716-446655440019', '650e8400-e29b-41d4-a716-446655440018', '650e8400-e29b-41d4-a716-446655440017', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440020', '650e8400-e29b-41d4-a716-446655440024', '650e8400-e29b-41d4-a716-446655440017', 'parent', 'validated', NOW(), NOW()),

    -- Bob's marriage
    ('750e8400-e29b-41d4-a716-446655440021', '650e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440019', 'spouse', 'validated', NOW(), NOW()),

    -- Bob's children
    ('750e8400-e29b-41d4-a716-446655440022', '650e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440025', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440023', '650e8400-e29b-41d4-a716-446655440019', '650e8400-e29b-41d4-a716-446655440025', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440024', '650e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440026', 'parent', 'validated', NOW(), NOW()),
    ('750e8400-e29b-41d4-a716-446655440025', '650e8400-e29b-41d4-a716-446655440019', '650e8400-e29b-41d4-a716-446655440026', 'parent', 'validated', NOW(), NOW()),

    -- Bob's siblings
    ('750e8400-e29b-41d4-a716-446655440026', '650e8400-e29b-41d4-a716-446655440017', '650e8400-e29b-41d4-a716-446655440019', 'sibling', 'validated', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert test validation requests
INSERT INTO validation_requests (id, relationship_id, requested_to_person_id, status, created_at, updated_at)
VALUES
    ('850e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440015', '650e8400-e29b-41d4-a716-446655440005', 'pending', NOW(), NOW()),
    ('850e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440021', '650e8400-e29b-41d4-a716-446655440019', 'pending', NOW(), NOW())
ON CONFLICT DO NOTHING;
