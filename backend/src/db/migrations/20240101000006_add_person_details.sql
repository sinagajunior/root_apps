-- Add more details to persons table
ALTER TABLE persons ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
ALTER TABLE persons ADD COLUMN IF NOT EXISTS married BOOLEAN DEFAULT false;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS avatar_url TEXT;
