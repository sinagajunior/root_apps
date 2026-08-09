-- Create relationship type enum
DO $$ BEGIN
    CREATE TYPE relationship_type AS ENUM ('parent', 'child', 'spouse', 'sibling');
EXCEPTION WHEN DUPLICATE_OBJECT THEN NULL;
END $$;

-- Create relationship status enum
DO $$ BEGIN
    CREATE TYPE relationship_status AS ENUM ('pending', 'validated', 'rejected');
EXCEPTION WHEN DUPLICATE_OBJECT THEN NULL;
END $$;

-- Create relationships table
CREATE TABLE IF NOT EXISTS relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_a_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    person_b_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    relationship_type relationship_type NOT NULL,
    status relationship_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraint: no self-relationships
    CONSTRAINT no_self_relationship CHECK (person_a_id <> person_b_id),

    -- Unique constraint with canonical ordering (smaller UUID is always person_a_id)
    UNIQUE(person_a_id, person_b_id, relationship_type)
);

CREATE INDEX IF NOT EXISTS idx_relationships_person_a ON relationships(person_a_id);
CREATE INDEX IF NOT EXISTS idx_relationships_person_b ON relationships(person_b_id);
CREATE INDEX IF NOT EXISTS idx_relationships_status ON relationships(status);
