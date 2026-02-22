-- Add InterestRate field to CaseISINs table
DO $$ 
BEGIN
    -- Add InterestRate column to CaseISINs table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'caseisins' AND column_name = 'interestrate') THEN
        ALTER TABLE CaseISINs ADD COLUMN InterestRate DECIMAL(5,4);
        
        -- Add comment for documentation
        COMMENT ON COLUMN CaseISINs.InterestRate IS 'Interest rate as decimal percentage (e.g., 0.0525 for 5.25%)';
    END IF;
END $$;
