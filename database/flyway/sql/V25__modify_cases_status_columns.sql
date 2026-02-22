-- Modify Cases table to remove existing Status column and add ProductSetupStatusID column
-- Remove: Status column (if exists)
-- Keep: CompartmentStatusID (already exists from previous migrations)
-- Add: ProductSetupStatusID (references ProductSetupStatus records)

DO $$ 
BEGIN
    -- Drop existing Status column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'cases' AND column_name = 'status') THEN
        
        -- Drop the foreign key constraint first
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name LIKE '%status%' 
                   AND table_name = 'cases') THEN
            ALTER TABLE Cases DROP CONSTRAINT IF EXISTS cases_status_fkey;
        END IF;
        
        -- Drop the column
        ALTER TABLE Cases DROP COLUMN Status;
    END IF;

    -- Add CompartmentStatusID column (references Status records with StatusType = 1)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cases' AND column_name = 'compartmentstatusid') THEN
        ALTER TABLE Cases ADD COLUMN CompartmentStatusID INT;
        
        -- Add foreign key constraint with check for StatusType = 1
        ALTER TABLE Cases ADD CONSTRAINT fk_cases_compartment_status 
            FOREIGN KEY (CompartmentStatusID) REFERENCES Status(ID) ON DELETE RESTRICT;
        
        -- Add comment for documentation
        COMMENT ON COLUMN Cases.CompartmentStatusID IS 'References Status records with StatusType = 1 (CompartmentStatus)';
    END IF;

    -- Add ProductSetupStatusID column (references Status records with StatusType = 0)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cases' AND column_name = 'productsetupstatusid') THEN
        ALTER TABLE Cases ADD COLUMN ProductSetupStatusID INT;
        
        -- Add foreign key constraint
        ALTER TABLE Cases ADD CONSTRAINT fk_cases_product_setup_status 
            FOREIGN KEY (ProductSetupStatusID) REFERENCES Status(ID) ON DELETE RESTRICT;
        
        -- Add comment for documentation
        COMMENT ON COLUMN Cases.ProductSetupStatusID IS 'References Status records with StatusType = 0 (ProductSetupStatus)';
    END IF;

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cases_compartment_status ON Cases(CompartmentStatusID);
CREATE INDEX IF NOT EXISTS idx_cases_product_setup_status ON Cases(ProductSetupStatusID);

-- Add check constraints to ensure proper StatusType references (optional but recommended)
-- Note: These are informational constraints - the actual validation happens at application level
DO $$ 
BEGIN
    -- Add constraint for CompartmentStatusID to ensure it references CompartmentStatus records
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_compartment_status_type' 
        AND table_name = 'cases'
    ) THEN
        -- This constraint will be enforced at application level since PostgreSQL 
        -- doesn't support subqueries in CHECK constraints for foreign key references
        COMMENT ON COLUMN Cases.CompartmentStatusID IS 'References Status records with StatusType = 1 (CompartmentStatus) - validation enforced at application level';
    END IF;

    -- Add constraint for ProductSetupStatusID to ensure it references ProductSetupStatus records
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_product_setup_status_type' 
        AND table_name = 'cases'
    ) THEN
        COMMENT ON COLUMN Cases.ProductSetupStatusID IS 'References Status records with StatusType = 0 (ProductSetupStatus) - validation enforced at application level';
    END IF;
END $$;
