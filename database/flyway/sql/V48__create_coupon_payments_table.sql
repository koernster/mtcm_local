-- Create CouponPayments table for tracking coupon payment details
CREATE TABLE IF NOT EXISTS CouponPayments (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ISINID UUID NOT NULL REFERENCES CaseIsins(ID) ON DELETE CASCADE,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    Days INT NOT NULL,
    InterestRate NUMERIC(10,6) NOT NULL,
    AccruedAmount NUMERIC(15,2) NOT NULL,
    PaidInterest NUMERIC(15,2) NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_couponpayments_isinid ON CouponPayments(ISINID);
CREATE INDEX IF NOT EXISTS idx_couponpayments_startdate ON CouponPayments(StartDate);
CREATE INDEX IF NOT EXISTS idx_couponpayments_enddate ON CouponPayments(EndDate);

-- Add check constraints for data validation
DO $$
BEGIN
    -- Add date validation constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_couponpayments_dates' 
        AND table_name = 'couponpayments'
    ) THEN
        ALTER TABLE CouponPayments ADD CONSTRAINT chk_couponpayments_dates 
            CHECK (EndDate >= StartDate);
    END IF;
    
    -- Add days validation constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_couponpayments_days' 
        AND table_name = 'couponpayments'
    ) THEN
        ALTER TABLE CouponPayments ADD CONSTRAINT chk_couponpayments_days 
            CHECK (Days >= 0);
    END IF;
    
    -- Add interest rate validation constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_couponpayments_interest_rate' 
        AND table_name = 'couponpayments'
    ) THEN
        ALTER TABLE CouponPayments ADD CONSTRAINT chk_couponpayments_interest_rate 
            CHECK (InterestRate >= 0);
    END IF;
    
    -- Add accrued amount validation constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_couponpayments_accrued_amount' 
        AND table_name = 'couponpayments'
    ) THEN
        ALTER TABLE CouponPayments ADD CONSTRAINT chk_couponpayments_accrued_amount 
            CHECK (AccruedAmount >= 0);
    END IF;
    
    -- Add paid interest validation constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_couponpayments_paid_interest' 
        AND table_name = 'couponpayments'
    ) THEN
        ALTER TABLE CouponPayments ADD CONSTRAINT chk_couponpayments_paid_interest 
            CHECK (PaidInterest >= 0);
    END IF;
END $$;

-- Create trigger function to update UpdatedAt timestamp
DO $$ 
BEGIN
    -- Drop function if it exists to avoid conflicts
    DROP FUNCTION IF EXISTS update_couponpayments_updated_at() CASCADE;
    
    -- Create the function
    CREATE FUNCTION update_couponpayments_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
        NEW.UpdatedAt = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
END $$;

-- Create trigger function to set CreatedAt timestamp on insert
DO $$ 
BEGIN
    -- Drop function if it exists to avoid conflicts
    DROP FUNCTION IF EXISTS set_couponpayments_created_at() CASCADE;
    
    -- Create the function
    CREATE FUNCTION set_couponpayments_created_at()
    RETURNS TRIGGER AS $func$
    BEGIN
        NEW.CreatedAt = CURRENT_TIMESTAMP;
        NEW.UpdatedAt = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
END $$;

-- Create trigger to automatically set CreatedAt and UpdatedAt on record creation
DO $$
BEGIN
    -- Drop trigger if it exists
    DROP TRIGGER IF EXISTS trigger_set_couponpayments_created_at ON CouponPayments;
    
    -- Create the trigger
    CREATE TRIGGER trigger_set_couponpayments_created_at
        BEFORE INSERT ON CouponPayments
        FOR EACH ROW
        EXECUTE FUNCTION set_couponpayments_created_at();
END $$;

-- Create trigger to automatically update UpdatedAt on record modification
DO $$
BEGIN
    -- Drop trigger if it exists
    DROP TRIGGER IF EXISTS trigger_update_couponpayments_updated_at ON CouponPayments;
    
    -- Create the trigger
    CREATE TRIGGER trigger_update_couponpayments_updated_at
        BEFORE UPDATE ON CouponPayments
        FOR EACH ROW
        EXECUTE FUNCTION update_couponpayments_updated_at();
END $$;

-- Add comments for documentation
COMMENT ON TABLE CouponPayments IS 'Table for tracking coupon payment details for each ISIN';
COMMENT ON COLUMN CouponPayments.ISINID IS 'Foreign key reference to CaseIsins table - one ISIN can have many coupon payments';
COMMENT ON COLUMN CouponPayments.StartDate IS 'Start date of the coupon period';
COMMENT ON COLUMN CouponPayments.EndDate IS 'End date of the coupon period';
COMMENT ON COLUMN CouponPayments.Days IS 'Number of days in the coupon period';
COMMENT ON COLUMN CouponPayments.InterestRate IS 'Interest rate applied for this coupon period (as decimal, e.g., 0.05 for 5%)';
COMMENT ON COLUMN CouponPayments.AccruedAmount IS 'Total accrued amount for this coupon period';
COMMENT ON COLUMN CouponPayments.PaidInterest IS 'Amount of interest actually paid for this coupon period';
COMMENT ON COLUMN CouponPayments.CreatedAt IS 'Timestamp when the record was created';
COMMENT ON COLUMN CouponPayments.UpdatedAt IS 'Timestamp when the record was last updated (automatically maintained by trigger)';