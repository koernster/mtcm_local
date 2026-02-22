-- Fix Cases to CaseISINs relationship for Hasura compatibility
-- This migration ensures proper foreign key naming and relationship structure

DO $$ 
BEGIN
    -- Ensure the CaseISINs table exists and has proper relationship to Cases
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'caseisins' AND table_schema = 'public') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases' AND table_schema = 'public') THEN
        
        -- Drop existing foreign key constraint if it exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            WHERE tc.table_name = 'caseisins' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND tc.constraint_name LIKE '%caseid%'
        ) THEN
            -- Get the actual constraint name and drop it
            DECLARE
                constraint_name TEXT;
            BEGIN
                SELECT tc.constraint_name INTO constraint_name
                FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                WHERE tc.table_name = 'caseisins' 
                AND tc.constraint_type = 'FOREIGN KEY'
                AND ccu.column_name = 'caseid';
                
                IF constraint_name IS NOT NULL THEN
                    EXECUTE format('ALTER TABLE CaseISINs DROP CONSTRAINT %I', constraint_name);
                END IF;
            END;
        END IF;
        
        -- Add properly named foreign key constraint for Hasura
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            WHERE tc.table_name = 'caseisins' 
            AND tc.constraint_name = 'fk_caseisins_case'
        ) THEN
            ALTER TABLE CaseISINs ADD CONSTRAINT fk_caseisins_case 
            FOREIGN KEY (CaseID) REFERENCES Cases(ID) ON DELETE CASCADE;
        END IF;
        
        -- Ensure proper index exists for the foreign key
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'caseisins' 
            AND indexname = 'idx_caseisins_caseid'
        ) THEN
            CREATE INDEX idx_caseisins_caseid ON CaseISINs(CaseID);
        END IF;
        
        -- Add comment to the foreign key column for better documentation
        COMMENT ON COLUMN CaseISINs.CaseID IS 'Foreign key reference to Cases table';
        
    END IF;
    
    -- Ensure proper capitalization consistency for Hasura
    -- Check if we need to rename the table to match expected naming convention
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'caseisins' AND table_schema = 'public') THEN
        -- The table name is already lowercase, which is fine for Hasura
        -- Just ensure the relationship is properly detectable
        
        -- Update table comment for clarity
        COMMENT ON TABLE CaseISINs IS 'ISIN numbers associated with Cases (max 3 per case)';
        
        -- Ensure all column names are properly documented
        COMMENT ON COLUMN CaseISINs.ID IS 'Primary key for CaseISINs table';
        COMMENT ON COLUMN CaseISINs.ISINNumber IS 'International Securities Identification Number';
        COMMENT ON COLUMN CaseISINs.Valoren IS 'Swiss securities identification number';
        COMMENT ON COLUMN CaseISINs.IssueSize IS 'Size of the security issue';
        COMMENT ON COLUMN CaseISINs.IssuePrice IS 'Price at which the security was issued';
        COMMENT ON COLUMN CaseISINs.CurrencyID IS 'Foreign key reference to Currencies table';
        COMMENT ON COLUMN CaseISINs.CreatedAt IS 'Timestamp when the record was created';
        
    END IF;
    
END $$;
