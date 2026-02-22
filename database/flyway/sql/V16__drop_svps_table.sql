-- Drop SVPs table and related foreign key constraints
DO $$ 
BEGIN
    -- Drop SVPID column from Cases table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'cases' AND column_name = 'svpid') THEN
        ALTER TABLE Cases DROP COLUMN SVPID;
    END IF;
    
    -- Drop SVPs table if it exists
    IF EXISTS (SELECT 1 FROM information_schema.tables 
               WHERE table_name = 'svps' AND table_schema = 'public') THEN
        DROP TABLE SVPs CASCADE;
    END IF;
END $$;
