-- Fix numeric field precision for InterestRate and IssuePrice in CaseISINs table
-- InterestRate: Allow 0-100 percentage values
-- IssuePrice: Allow currency format with higher precision

DO $$ 
BEGIN
    -- Fix InterestRate column to allow 0-100 percentage range
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'caseisins' AND column_name = 'interestrate') THEN
        
        -- Change to DECIMAL(6,2) to allow values like 0.00 to 100.00
        ALTER TABLE CaseISINs ALTER COLUMN InterestRate TYPE DECIMAL(6,2);
        
        -- Update comment for clarity
        COMMENT ON COLUMN CaseISINs.InterestRate IS 'Interest rate as percentage value (e.g., 5.25 for 5.25%, range 0.00-100.00)';
    END IF;

    -- Fix IssuePrice column for proper currency format
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'caseisins' AND column_name = 'issueprice') THEN
        
        -- Change to DECIMAL(18,6) for currency format with high precision
        ALTER TABLE CaseISINs ALTER COLUMN IssuePrice TYPE DECIMAL(18,6);
        
        -- Add comment for documentation
        COMMENT ON COLUMN CaseISINs.IssuePrice IS 'Issue price in currency format with 6 decimal precision (e.g., 1000000.123456)';
    END IF;

END $$;
