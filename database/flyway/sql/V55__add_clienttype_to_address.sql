-- Add ClientType field to Companies table
-- This field indicates whether the company is an Individual or Legal Entity

DO $$
BEGIN
    -- Add ClientType column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'clienttype'
    ) THEN
        ALTER TABLE Companies
        ADD COLUMN ClientType BOOLEAN DEFAULT FALSE;
        
        -- Add comment to explain the field
        COMMENT ON COLUMN Companies.ClientType IS 'Type of client: TRUE = Individual, FALSE = Legal Entity (default)';
        
        RAISE NOTICE 'Added ClientType column to Companies table';
    ELSE
        RAISE NOTICE 'ClientType column already exists in Companies table';
    END IF;
END $$;
