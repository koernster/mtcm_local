-- Ensure Cases table relationships are properly established
-- This migration ensures that all foreign key relationships work correctly
-- regardless of the order in which migrations were run

DO $$ 
BEGIN
    -- Fix any foreign key references that might be pointing to non-existent tables
    
    -- Update CaseStatus table to reference Cases instead of Setup if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'casestatus') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases') THEN
        
        -- Drop old constraint if it exists and references Setup
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_name = 'casestatus' AND ccu.table_name = 'setup'
        ) THEN
            ALTER TABLE CaseStatus DROP CONSTRAINT IF EXISTS fk_case_status_case;
            ALTER TABLE CaseStatus ADD CONSTRAINT fk_case_status_case 
            FOREIGN KEY (CaseID) REFERENCES Cases(ID) ON DELETE CASCADE;
        END IF;
        
    END IF;
    
    -- Update CompanyChangeHistory table references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companychangehistory') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases') THEN
        
        -- Drop old constraint if it references Setup
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_name = 'companychangehistory' AND ccu.table_name = 'setup'
        ) THEN
            ALTER TABLE CompanyChangeHistory DROP CONSTRAINT IF EXISTS companychangehistory_caseid_fkey;
            ALTER TABLE CompanyChangeHistory ADD CONSTRAINT fk_company_change_history_case 
            FOREIGN KEY (CaseID) REFERENCES Cases(ID) ON DELETE CASCADE;
        END IF;
        
    END IF;
    
    -- Update ProcessStatus table references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'processstatus') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases') THEN
        
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_name = 'processstatus' AND ccu.table_name = 'setup'
        ) THEN
            ALTER TABLE ProcessStatus DROP CONSTRAINT IF EXISTS processstatus_caseid_fkey;
            ALTER TABLE ProcessStatus ADD CONSTRAINT fk_process_status_case 
            FOREIGN KEY (CaseID) REFERENCES Cases(ID) ON DELETE CASCADE;
        END IF;
        
    END IF;
    
    -- Update DocumentAndArchive table references
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documentandarchive') 
       AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases') THEN
        
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
            WHERE tc.table_name = 'documentandarchive' AND ccu.table_name = 'setup'
        ) THEN
            ALTER TABLE DocumentAndArchive DROP CONSTRAINT IF EXISTS documentandarchive_caseid_fkey;
            ALTER TABLE DocumentAndArchive ADD CONSTRAINT fk_document_archive_case 
            FOREIGN KEY (CaseID) REFERENCES Cases(ID) ON DELETE CASCADE;
        END IF;
        
    END IF;
    
END $$;
