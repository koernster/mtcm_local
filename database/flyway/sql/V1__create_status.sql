-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Status table only if it doesn't exist
CREATE TABLE IF NOT EXISTS Status (
    ID INT PRIMARY KEY,
    Status VARCHAR(20) NOT NULL,
    Description VARCHAR(255) NOT NULL
);

-- Insert predefined status values only if table is empty (cannot be updated externally)
INSERT INTO Status (ID, Status, Description) 
SELECT * FROM (VALUES
    (1, 'BASIC_PROD_INFO', 'Basic Product Information'),
    (2, 'FIN_STR_DTIL', 'Financial and Structural Details'),
    (3, 'KEY_DT_SCHDL', 'Key Dates and Schedules'),
    (4, 'PARTIES_INVL', 'Parties Involved'),
    (5, 'DOC_ARCH', 'Document and Archive')
) AS new_values(ID, Status, Description)
WHERE NOT EXISTS (SELECT 1 FROM Status);

-- Note: CaseStatus junction table moved to V10.1 (after Cases table is created)

-- Add security policy to prevent external updates to Status table (PostgreSQL RLS)
DO $$ 
BEGIN
    -- Enable RLS only if not already enabled
    IF NOT EXISTS (
        SELECT 1 FROM pg_class 
        WHERE relname = 'status' AND relrowsecurity = true
    ) THEN
        ALTER TABLE Status ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Create policy only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'status' AND policyname = 'status_read_only'
    ) THEN
        CREATE POLICY status_read_only ON Status
            FOR ALL
            TO PUBLIC
            USING (true)
            WITH CHECK (false);
    END IF;
END $$;