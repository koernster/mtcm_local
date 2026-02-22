-- Add broker and trustee fields to cases table if they don't exist
DO $$
BEGIN
    -- Add broker column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'broker'
    ) THEN
        ALTER TABLE cases ADD COLUMN broker VARCHAR(255);
    END IF;
    
    -- Add trustee column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'trustee'
    ) THEN
        ALTER TABLE cases ADD COLUMN trustee VARCHAR(255);
    END IF;
    
    -- Add coponpaymentdate column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'coponpaymentdate'
    ) THEN
        ALTER TABLE cases ADD COLUMN coponpaymentdate DATE;
    END IF;
END $$;

-- Add indexes for better query performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_cases_broker ON cases(broker);
CREATE INDEX IF NOT EXISTS idx_cases_trustee ON cases(trustee);

-- Add comments for documentation
DO $$
BEGIN
    -- Add comment for broker column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'broker'
    ) THEN
        EXECUTE 'COMMENT ON COLUMN cases.broker IS ''Broker associated with the case''';
    END IF;
    
    -- Add comment for trustee column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'trustee'
    ) THEN
        EXECUTE 'COMMENT ON COLUMN cases.trustee IS ''Trustee associated with the case''';
    END IF;
    
    -- Add comment for coponpaymentdate column if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'cases' AND column_name = 'coponpaymentdate'
    ) THEN
        EXECUTE 'COMMENT ON COLUMN cases.coponpaymentdate IS ''Coupon payment date for the case''';
    END IF;
END $$;

