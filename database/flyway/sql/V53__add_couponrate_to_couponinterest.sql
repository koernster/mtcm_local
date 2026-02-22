-- Migration V53: Add couponrate field to CouponInterest table
-- Task: Add new field named 'couponrate' similar to interestrate field into couponinterest table

DO $$
BEGIN
    -- Check if CouponInterest table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'couponinterest' AND table_schema = 'public') THEN
        
        -- Add CouponRate field if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'couponinterest' 
                      AND column_name = 'couponrate' 
                      AND table_schema = 'public') THEN
            
            -- Add the couponrate column with the same data type and constraints as interestrate
            ALTER TABLE CouponInterest ADD COLUMN CouponRate DECIMAL(18,6);
            
            -- Add check constraint to ensure CouponRate is positive (similar to InterestRate)
            ALTER TABLE CouponInterest ADD CONSTRAINT chk_coupon_rate_positive CHECK (CouponRate >= 0);
            
            -- Add comment to document the new column
            COMMENT ON COLUMN CouponInterest.CouponRate IS 'Coupon rate value with precision of 6 decimal places (nullable)';
            
            RAISE NOTICE 'Added CouponRate column to CouponInterest table with DECIMAL(18,6) data type and positive value constraint';
            
        ELSE
            RAISE NOTICE 'CouponRate column already exists in CouponInterest table - skipping addition';
        END IF;
        
        RAISE NOTICE 'Migration V53 completed successfully - Added couponrate field to CouponInterest table';
        
    ELSE
        RAISE EXCEPTION 'CouponInterest table does not exist. Please ensure previous migrations have been applied.';
    END IF;
    
END $$;