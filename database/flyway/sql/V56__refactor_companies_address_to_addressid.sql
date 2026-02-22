-- Refactor Companies table to use AddressID foreign key instead of Address text field
-- This follows the pattern established in SPVs table (V47) for normalized address management

DO $$
BEGIN
    -- Add AddressID column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'addressid'
    ) THEN
        -- Add the foreign key column
        ALTER TABLE Companies
        ADD COLUMN AddressID UUID REFERENCES Address(ID) ON DELETE SET NULL;
        
        -- Create index for the foreign key
        CREATE INDEX IF NOT EXISTS idx_companies_addressid ON Companies(AddressID);
        
        -- Add comment
        COMMENT ON COLUMN Companies.AddressID IS 'Foreign key reference to Address table';
        
        RAISE NOTICE 'Added AddressID column to Companies table';
    ELSE
        RAISE NOTICE 'AddressID column already exists in Companies table';
    END IF;
    
    -- Mark the old Address column as deprecated (keep for backward compatibility)
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'address'
    ) THEN
        COMMENT ON COLUMN Companies.Address IS 'DEPRECATED: Use AddressID foreign key instead. This field is kept for backward compatibility and will be removed in a future version.';
        
        RAISE NOTICE 'Marked Address column as deprecated in Companies table';
    END IF;
END $$;

-- Update CompanyChangeHistory to track AddressID changes
DO $$
BEGIN
    -- Add OldAddressID column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companychangehistory' 
        AND column_name = 'oldaddressid'
    ) THEN
        ALTER TABLE CompanyChangeHistory
        ADD COLUMN OldAddressID UUID;
        
        COMMENT ON COLUMN CompanyChangeHistory.OldAddressID IS 'Previous AddressID value (references Address table)';
        
        RAISE NOTICE 'Added OldAddressID column to CompanyChangeHistory table';
    END IF;
    
    -- Add NewAddressID column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companychangehistory' 
        AND column_name = 'newaddressid'
    ) THEN
        ALTER TABLE CompanyChangeHistory
        ADD COLUMN NewAddressID UUID;
        
        COMMENT ON COLUMN CompanyChangeHistory.NewAddressID IS 'New AddressID value (references Address table)';
        
        RAISE NOTICE 'Added NewAddressID column to CompanyChangeHistory table';
    END IF;
    
    -- Mark old address text columns as deprecated
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companychangehistory' 
        AND column_name = 'oldaddress'
    ) THEN
        COMMENT ON COLUMN CompanyChangeHistory.OldAddress IS 'DEPRECATED: Use OldAddressID instead. Kept for historical data.';
        COMMENT ON COLUMN CompanyChangeHistory.NewAddress IS 'DEPRECATED: Use NewAddressID instead. Kept for historical data.';
        
        RAISE NOTICE 'Marked OldAddress and NewAddress columns as deprecated in CompanyChangeHistory table';
    END IF;
END $$;
