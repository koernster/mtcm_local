-- Add cost type fields to CaseCosts table with foreign key references to FieldTypes

DO $$
BEGIN
    -- Check if CaseCosts table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'casecosts' AND table_schema = 'public') THEN
        
        -- Add PayingAgentCostType field if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'casecosts' 
                      AND column_name = 'payingagentcosttype' 
                      AND table_schema = 'public') THEN
            ALTER TABLE CaseCosts ADD COLUMN PayingAgentCostType INTEGER REFERENCES FieldTypes(ID) ON DELETE RESTRICT;
            RAISE NOTICE 'Added PayingAgentCostType column to CaseCosts table';
        END IF;
        
        -- Add AuditCostType field if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'casecosts' 
                      AND column_name = 'auditcosttype' 
                      AND table_schema = 'public') THEN
            ALTER TABLE CaseCosts ADD COLUMN AuditCostType INTEGER REFERENCES FieldTypes(ID) ON DELETE RESTRICT;
            RAISE NOTICE 'Added AuditCostType column to CaseCosts table';
        END IF;
        
        -- Add LegalCostType field if it doesn't exist (note: corrected spelling from 'leaglecosttype'
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'casecosts' 
                      AND column_name = 'legalcosttype' 
                      AND table_schema = 'public') THEN
            ALTER TABLE CaseCosts ADD COLUMN LegalCostType INTEGER REFERENCES FieldTypes(ID) ON DELETE RESTRICT;
            RAISE NOTICE 'Added LegalCostType column to CaseCosts table';
        END IF;
        
        -- Add OperationalCostType field if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'casecosts' 
                      AND column_name = 'operationalcosttype' 
                      AND table_schema = 'public') THEN
            ALTER TABLE CaseCosts ADD COLUMN OperationalCostType INTEGER REFERENCES FieldTypes(ID) ON DELETE RESTRICT;
            RAISE NOTICE 'Added OperationalCostType column to CaseCosts table';
        END IF;
        
        -- Add RunningCostType field if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'casecosts' 
                      AND column_name = 'runningcosttype' 
                      AND table_schema = 'public') THEN
            ALTER TABLE CaseCosts ADD COLUMN RunningCostType INTEGER REFERENCES FieldTypes(ID) ON DELETE RESTRICT;
            RAISE NOTICE 'Added RunningCostType column to CaseCosts table';
        END IF;
        
        RAISE NOTICE 'Migration V52 completed successfully - Added cost type fields to CaseCosts table';
        
    ELSE
        RAISE EXCEPTION 'CaseCosts table does not exist. Please ensure previous migrations have been applied.';
    END IF;
    
END $$;