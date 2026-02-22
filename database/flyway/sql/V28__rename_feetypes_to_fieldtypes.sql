-- Rename FeeTypes table to FieldTypes for broader usage
-- This allows the table to be used for both fees and asset values

DO $$ 
BEGIN
    -- Check if FeeTypes table exists and FieldTypes doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'feetypes' 
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'fieldtypes' 
        AND table_schema = 'public'
    ) THEN
        -- Rename FeeTypes table to FieldTypes
        ALTER TABLE FeeTypes RENAME TO FieldTypes;
        RAISE NOTICE 'Renamed FeeTypes table to FieldTypes';
        
        -- Update the description to reflect broader usage
        UPDATE FieldTypes 
        SET Description = 'Value calculated as a percentage' 
        WHERE ID = 1 AND Description = 'Fee calculated as a percentage';
        
        UPDATE FieldTypes 
        SET Description = 'Value specified as a fixed amount' 
        WHERE ID = 2 AND Description = 'Fee specified as a fixed amount';
        
        RAISE NOTICE 'Updated FieldTypes descriptions for broader usage';
    ELSE
        RAISE NOTICE 'FeeTypes table does not exist or has already been renamed';
    END IF;
    
    -- Update foreign key references in CaseFees table
    -- Note: PostgreSQL automatically updates constraint names when table is renamed
    -- but we should verify the constraints still work
    
    -- Verify that all foreign key constraints are still intact
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE table_name = 'casefees' 
               AND constraint_type = 'FOREIGN KEY'
               AND constraint_name LIKE '%feetypes%') THEN
        RAISE NOTICE 'Foreign key constraints in CaseFees table are intact after rename';
    END IF;
    
    -- Update the view created in V34 to use the new table name
    -- View has been removed
END $$;
