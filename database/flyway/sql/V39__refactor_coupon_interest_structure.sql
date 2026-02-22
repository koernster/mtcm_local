-- Migration V39: Refactor CouponInterest table structure
-- 1. Remove CouponType foreign key relation from CouponInterest -> Type
-- 2. Remove column CouponInterest -> Type
-- 3. Remove table CouponType
-- 4. Create new column in CouponInterest -> Type with UUID datatype referencing CoponTypes
-- 5. Update CouponInterest -> ID from SERIAL to UUID
-- 6. Change EventDate from TIMESTAMP NOT NULL to DATE and allow nulls

-- Step 1: Drop foreign key constraint and index for Type column
ALTER TABLE CouponInterest DROP CONSTRAINT IF EXISTS fk_coupon_interest_type;
DROP INDEX IF EXISTS idx_coupon_interest_type;

-- Step 2: Remove the Type column from CouponInterest
ALTER TABLE CouponInterest DROP COLUMN IF EXISTS Type;

-- Step 3: Drop the CouponType table (this will also remove its constraints and data)
DROP TABLE IF EXISTS CouponType;

-- Step 4: Add a new ID column as UUID and migrate existing data
-- First, add a new UUID column
ALTER TABLE CouponInterest ADD COLUMN new_id UUID DEFAULT uuid_generate_v4();

-- Update all existing records to have UUID values
UPDATE CouponInterest SET new_id = uuid_generate_v4() WHERE new_id IS NULL;

-- Make the new UUID column NOT NULL
ALTER TABLE CouponInterest ALTER COLUMN new_id SET NOT NULL;

-- Drop the old ID column and rename the new one
ALTER TABLE CouponInterest DROP COLUMN ID;
ALTER TABLE CouponInterest RENAME COLUMN new_id TO ID;

-- Add primary key constraint to the new UUID ID column
ALTER TABLE CouponInterest ADD CONSTRAINT pk_coupon_interest PRIMARY KEY (ID);

-- Step 5: Add new Type column as UUID referencing CoponTypes
ALTER TABLE CouponInterest ADD COLUMN Type UUID;

-- Add foreign key constraint to reference CoponTypes table
ALTER TABLE CouponInterest ADD CONSTRAINT fk_coupon_interest_copon_type 
    FOREIGN KEY (Type) 
    REFERENCES CoponTypes(ID) 
    ON DELETE SET NULL;

-- Create index for the new Type column for better query performance
CREATE INDEX IF NOT EXISTS idx_coupon_interest_copon_type ON CouponInterest(Type);

-- Step 6: Modify EventDate column from TIMESTAMP NOT NULL to DATE and allow nulls (if applicable)
-- Only modify if the column exists and is currently TIMESTAMP
DO $$ 
BEGIN 
    -- Check if EventDate column exists and is TIMESTAMP type
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'couponinterest' 
        AND column_name = 'eventdate' 
        AND data_type IN ('timestamp without time zone', 'timestamp with time zone')
    ) THEN
        -- Change data type from TIMESTAMP to DATE
        ALTER TABLE CouponInterest ALTER COLUMN EventDate TYPE DATE;
        
        -- Remove NOT NULL constraint if it exists
        ALTER TABLE CouponInterest ALTER COLUMN EventDate DROP NOT NULL;
        
        RAISE NOTICE 'EventDate column successfully modified from TIMESTAMP to DATE with nulls allowed';
    ELSE
        RAISE NOTICE 'EventDate column is not TIMESTAMP or does not exist - skipping modification';
    END IF;
END $$;

-- Update comments to reflect the new structure
COMMENT ON COLUMN CouponInterest.ID IS 'Primary key UUID for coupon interest record';
COMMENT ON COLUMN CouponInterest.Type IS 'Foreign key reference to CoponTypes table';
COMMENT ON COLUMN CouponInterest.EventDate IS 'Date of the coupon event (nullable DATE field)';

-- Add comment about the migration
COMMENT ON TABLE CouponInterest IS 'Main table for storing coupon interest information - migrated in V39 to use UUID IDs and reference CoponTypes';
