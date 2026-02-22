-- Create Basket table for asset management
-- This table stores assets associated with cases with flexible value types

DO $$ 
BEGIN
    -- Ensure UUID extension is available
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Verify that FieldTypes table exists (should be renamed from FeeTypes in V36)
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'fieldtypes' AND table_schema = 'public') THEN
        RAISE EXCEPTION 'FieldTypes table does not exist. Please run V36 migration first.';
    END IF;
    
    -- Create Case_AssetBasket table for asset management
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'case_assetbasket' AND table_schema = 'public') THEN
        CREATE TABLE Case_AssetBasket (
            ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            CaseID UUID NOT NULL REFERENCES Cases(ID) ON DELETE CASCADE,
            AssetName VARCHAR(255) NOT NULL,
            AssetValue DECIMAL(15,4),
            ValueType INT REFERENCES FieldTypes(ID) ON DELETE RESTRICT,
            
            -- Audit fields
            CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            -- Ensure asset names are unique per case
            CONSTRAINT unique_case_asset UNIQUE (CaseID, AssetName)
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_case_assetbasket_case_id ON Case_AssetBasket(CaseID);
        CREATE INDEX idx_case_assetbasket_asset_name ON Case_AssetBasket(AssetName);
        CREATE INDEX idx_case_assetbasket_value_type ON Case_AssetBasket(ValueType);
        CREATE INDEX idx_case_assetbasket_case_asset ON Case_AssetBasket(CaseID, AssetName);
        
        -- Create trigger for updating UpdatedAt timestamp
        CREATE OR REPLACE FUNCTION update_case_assetbasket_updated_at()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.UpdatedAt = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
        
        CREATE TRIGGER trigger_case_assetbasket_updated_at
            BEFORE UPDATE ON Case_AssetBasket
            FOR EACH ROW
            EXECUTE FUNCTION update_case_assetbasket_updated_at();
            
        RAISE NOTICE 'Created Case_AssetBasket table with indexes and triggers';
    ELSE
        RAISE NOTICE 'Case_AssetBasket table already exists';
    END IF;
    
END $$;
