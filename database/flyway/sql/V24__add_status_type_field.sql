-- Add StatusType field to Status table and insert new compartment status records
-- StatusType: 0 = ProductSetupStatus, 1 = CompartmentStatus

DO $$ 
BEGIN
    -- Add StatusType column to Status table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'status' AND column_name = 'statustype') THEN
        ALTER TABLE Status ADD COLUMN StatusType INT NOT NULL DEFAULT 0;
        
        -- Add comment for documentation
        COMMENT ON COLUMN Status.StatusType IS 'Status type: 0 = ProductSetupStatus, 1 = CompartmentStatus';
    END IF;
END $$;

-- Update existing records to have StatusType = 0 (ProductSetupStatus)
UPDATE Status 
SET StatusType = 0 
WHERE ID IN (1, 2, 3, 4, 5, 6);

-- Insert new compartment status records (StatusType = 1)
INSERT INTO Status (ID, Status, Description, StatusType) 
SELECT * FROM (VALUES
    (6, 'Fees_ND_COST', 'Fees and Costs', 0),
    -- Existing compartment status records
    (7, 'PRD_SETUP', 'Product Setup', 1),
    (8, 'SUBSCRIPTION', 'Subscription', 1),
    (9, 'ISSUED', 'Issued', 1)
) AS new_values(ID, Status, Description, StatusType)
WHERE NOT EXISTS (SELECT 1 FROM Status WHERE ID IN (7, 8, 9));

-- Add check constraint to ensure StatusType is either 0 or 1
DO $$ 
BEGIN
    -- Add constraint only if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_status_type' 
        AND table_name = 'status'
    ) THEN
        ALTER TABLE Status ADD CONSTRAINT chk_status_type 
            CHECK (StatusType IN (0, 1));
    END IF;
END $$;

-- Create index on StatusType for better performance
CREATE INDEX IF NOT EXISTS idx_status_type ON Status(StatusType);
