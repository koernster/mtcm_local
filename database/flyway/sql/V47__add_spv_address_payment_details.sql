-- Create Address table (generic table for address and contact details)
CREATE TABLE IF NOT EXISTS Address (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    AddressLine1 VARCHAR(255),
    AddressLine2 VARCHAR(255),
    City VARCHAR(100),
    State_or_Province VARCHAR(100),
    Country VARCHAR(100),
    PostalCode VARCHAR(20),
    Phone VARCHAR(50),
    Email VARCHAR(255),
    Website VARCHAR(500)
);

-- Create PaymentDetails table
CREATE TABLE IF NOT EXISTS PaymentDetails (
    ID UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    AccountName VARCHAR(255),
    BeneficiaryBank VARCHAR(255),
    SWIFT VARCHAR(11),
    IBAN VARCHAR(34),
    CorrespondentBank VARCHAR(255),
    Correspondent_SWIFT VARCHAR(11),
    Correspondent_ABA VARCHAR(20)
);

-- Add AddressID foreign key to SPVs table if it doesn't exist
DO $$ 
BEGIN
    -- Add AddressID column to SPVs table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'spvs' AND column_name = 'addressid') THEN
        ALTER TABLE SPVs ADD COLUMN AddressID UUID REFERENCES Address(ID) ON DELETE SET NULL;
    END IF;
END $$;

-- Add PaymentDetailID foreign key to SPVs table if it doesn't exist
DO $$ 
BEGIN
    -- Add PaymentDetailID column to SPVs table if not exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'spvs' AND column_name = 'paymentdetailid') THEN
        ALTER TABLE SPVs ADD COLUMN PaymentDetailID UUID REFERENCES PaymentDetails(ID) ON DELETE SET NULL;
    END IF;
END $$;

-- Remove SPVWebsite column from SPVs table if it exists
DO $$ 
BEGIN
    -- Drop SPVWebsite column from SPVs table if exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'spvs' AND column_name = 'spvwebsite') THEN
        ALTER TABLE SPVs DROP COLUMN SPVWebsite;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_spvs_addressid ON SPVs(AddressID);
CREATE INDEX IF NOT EXISTS idx_spvs_paymentdetailid ON SPVs(PaymentDetailID);

-- Add comments for documentation
COMMENT ON TABLE Address IS 'Generic table for address and contact details that can be used with multiple entities';
COMMENT ON TABLE PaymentDetails IS 'Payment and banking details for entities';
COMMENT ON COLUMN SPVs.AddressID IS 'Foreign key reference to Address table';
COMMENT ON COLUMN SPVs.PaymentDetailID IS 'Foreign key reference to PaymentDetails table';