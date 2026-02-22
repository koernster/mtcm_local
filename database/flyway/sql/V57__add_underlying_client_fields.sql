-- Migration: Add underlying client support
-- Adds isunderlyingclient field to Companies table
-- Adds underlyingcompanyid field to Cases table

DO $$
BEGIN
    -- Add isunderlyingclient column to Companies table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'isunderlyingclient'
    ) THEN
        ALTER TABLE Companies
        ADD COLUMN IsUnderlyingClient BOOLEAN DEFAULT FALSE;
        
        RAISE NOTICE 'Added IsUnderlyingClient column to Companies table';
    ELSE
        RAISE NOTICE 'IsUnderlyingClient column already exists in Companies table';
    END IF;
END $$;

-- Add comment to the column
COMMENT ON COLUMN Companies.IsUnderlyingClient IS 'Indicates if company is an underlying client';

DO $$
BEGIN
    -- Add underlyingcompanyid column to Cases table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'cases' 
        AND column_name = 'underlyingcompanyid'
    ) THEN
        ALTER TABLE Cases
        ADD COLUMN UnderlyingCompanyID UUID REFERENCES Companies(ID) ON DELETE SET NULL;
        
        RAISE NOTICE 'Added UnderlyingCompanyID column to Cases table';
    ELSE
        RAISE NOTICE 'UnderlyingCompanyID column already exists in Cases table';
    END IF;
END $$;

-- Add comment to the column
COMMENT ON COLUMN Cases.UnderlyingCompanyID IS 'Reference to underlying client company';

-- Create index for query performance
CREATE INDEX IF NOT EXISTS idx_cases_underlyingcompanyid ON Cases(UnderlyingCompanyID);
