-- Clean and rebuild family data with 3+ generations (Generation 0: Grandparents, Gen 1: Parents, Gen 2: Siblings, Gen 3: Kids)

-- First delete existing data while preserving foreign key integrity
DELETE FROM validation_requests;
DELETE FROM relationships;
DELETE FROM persons;

-- Reinsert the users
INSERT INTO users (id, auth_provider, provider_id, email, name, created_at, updated_at)
VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'google', '123456789', 'john@example.com', 'John Doe', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert clean 3+ generation family tree (all related to one main family line)
INSERT INTO persons (id, user_id, full_name, birth_date, death_date, gender, married, created_at, updated_at)
VALUES
    -- GENERATION 0: Grandparents
    ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'William Smith', '1940-03-15', NULL, 'Male', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Eleanor Smith', '1942-07-22', NULL, 'Female', true, NOW(), NOW()),

    -- GENERATION 1: Parents (William & Eleanor's children)
    ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Robert Smith', '1965-05-10', NULL, 'Male', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Patricia Johnson', '1967-11-18', NULL, 'Female', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Margaret Davis', '1970-02-25', NULL, 'Female', true, NOW(), NOW()),

    -- GENERATION 2: Main person and siblings (Robert & Patricia's children)
    ('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', 'John Smith', '1990-08-12', NULL, 'Male', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', 'Sarah Smith', '1992-12-20', NULL, 'Female', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', 'Michael Smith', '1995-04-05', NULL, 'Male', false, NOW(), NOW()),

    -- GENERATION 2: Spouses
    ('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', 'Emily Brown', '1991-06-14', NULL, 'Female', true, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', 'James Wilson', '1990-09-08', NULL, 'Male', true, NOW(), NOW()),

    -- GENERATION 3: Children (grandchildren of main couple)
    ('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Lucas Smith', '2012-03-20', NULL, 'Male', false, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', 'Olivia Smith', '2015-07-11', NULL, 'Female', false, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440001', 'Emma Wilson', '2014-01-29', NULL, 'Female', false, NOW(), NOW()),
    ('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440001', 'Noah Wilson', '2018-05-15', NULL, 'Male', false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert comprehensive relationships
INSERT INTO relationships (id, person_a_id, person_b_id, relationship_type, status, created_at, updated_at)
VALUES
    -- GENERATION 0-1: Grandparents to Parents
    -- William & Eleanor to Robert
    ('760e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440003', 'parent', 'validated', NOW(), NOW()),
    ('760e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440003', 'parent', 'validated', NOW(), NOW()),

    -- William & Eleanor to Margaret
    ('760e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440005', 'parent', 'validated', NOW(), NOW()),
    ('760e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005', 'parent', 'validated', NOW(), NOW()),

    -- William & Eleanor (Grandparents' marriage)
    ('760e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', 'spouse', 'validated', NOW(), NOW()),

    -- GENERATION 1: Parents' marriage
    -- Robert & Patricia (spouse)
    ('760e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004', 'spouse', 'validated', NOW(), NOW()),

    -- GENERATION 1-2: Parents to Children
    -- Robert & Patricia to John
    ('760e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440006', 'parent', 'validated', NOW(), NOW()),
    ('760e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440006', 'parent', 'validated', NOW(), NOW()),

    -- Robert & Patricia to Sarah
    ('760e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007', 'parent', 'validated', NOW(), NOW()),
    ('760e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440007', 'parent', 'validated', NOW(), NOW()),

    -- Robert & Patricia to Michael
    ('760e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440008', 'parent', 'validated', NOW(), NOW()),
    ('760e8400-e29b-41d4-a716-446655440012', '660e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440008', 'parent', 'validated', NOW(), NOW()),

    -- GENERATION 2: Siblings relationships
    -- John & Sarah
    ('760e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440007', 'sibling', 'validated', NOW(), NOW()),

    -- John & Michael
    ('760e8400-e29b-41d4-a716-446655440014', '660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440008', 'sibling', 'validated', NOW(), NOW()),

    -- Sarah & Michael
    ('760e8400-e29b-41d4-a716-446655440015', '660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440008', 'sibling', 'validated', NOW(), NOW()),

    -- GENERATION 2: Spouses
    -- John & Emily (spouse)
    ('760e8400-e29b-41d4-a716-446655440016', '660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440009', 'spouse', 'validated', NOW(), NOW()),

    -- Sarah & James (spouse)
    ('760e8400-e29b-41d4-a716-446655440017', '660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440010', 'spouse', 'validated', NOW(), NOW()),

    -- GENERATION 2-3: John & Emily's children (Lucas & Olivia)
    -- John to Lucas
    ('760e8400-e29b-41d4-a716-446655440018', '660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440011', 'parent', 'validated', NOW(), NOW()),
    -- Emily to Lucas
    ('760e8400-e29b-41d4-a716-446655440019', '660e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440011', 'parent', 'validated', NOW(), NOW()),

    -- John to Olivia
    ('760e8400-e29b-41d4-a716-446655440020', '660e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440012', 'parent', 'validated', NOW(), NOW()),
    -- Emily to Olivia
    ('760e8400-e29b-41d4-a716-446655440021', '660e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440012', 'parent', 'validated', NOW(), NOW()),

    -- GENERATION 2-3: Sarah & James' children (Emma & Noah)
    -- Sarah to Emma
    ('760e8400-e29b-41d4-a716-446655440022', '660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440013', 'parent', 'validated', NOW(), NOW()),
    -- James to Emma
    ('760e8400-e29b-41d4-a716-446655440023', '660e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440013', 'parent', 'validated', NOW(), NOW()),

    -- Sarah to Noah
    ('760e8400-e29b-41d4-a716-446655440024', '660e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440014', 'parent', 'validated', NOW(), NOW()),
    -- James to Noah
    ('760e8400-e29b-41d4-a716-446655440025', '660e8400-e29b-41d4-a716-446655440010', '660e8400-e29b-41d4-a716-446655440014', 'parent', 'validated', NOW(), NOW()),

    -- GENERATION 3: Cousins (siblings between cousin generations)
    -- Lucas & Olivia
    ('760e8400-e29b-41d4-a716-446655440026', '660e8400-e29b-41d4-a716-446655440011', '660e8400-e29b-41d4-a716-446655440012', 'sibling', 'validated', NOW(), NOW()),

    -- Emma & Noah
    ('760e8400-e29b-41d4-a716-446655440027', '660e8400-e29b-41d4-a716-446655440013', '660e8400-e29b-41d4-a716-446655440014', 'sibling', 'validated', NOW(), NOW())
ON CONFLICT DO NOTHING;
