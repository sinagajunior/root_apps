-- Create validation_request_status enum
DO $$ BEGIN
    CREATE TYPE validation_request_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION WHEN DUPLICATE_OBJECT THEN NULL;
END $$;

-- Create validation_requests table
CREATE TABLE IF NOT EXISTS validation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_id UUID NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
    requested_to_person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    status validation_request_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint: only one pending validation per relationship per person
    UNIQUE(relationship_id, requested_to_person_id)
);

CREATE INDEX IF NOT EXISTS idx_validation_requests_relationship_id ON validation_requests(relationship_id);
CREATE INDEX IF NOT EXISTS idx_validation_requests_person_id ON validation_requests(requested_to_person_id);
CREATE INDEX IF NOT EXISTS idx_validation_requests_status ON validation_requests(status);
