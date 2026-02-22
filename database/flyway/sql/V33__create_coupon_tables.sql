-- Create lookup table for CouponStatus
CREATE TABLE IF NOT EXISTS CouponStatus (
    ID INT PRIMARY KEY,
    Status VARCHAR(50) NOT NULL,
    CONSTRAINT chk_coupon_status_id CHECK (ID IN (1, 2))
);

-- Insert default values for CouponStatus if they don't exist
INSERT INTO CouponStatus (ID, Status) 
SELECT 1, 'Current' WHERE NOT EXISTS (SELECT 1 FROM CouponStatus WHERE ID = 1);
INSERT INTO CouponStatus (ID, Status) 
SELECT 2, 'Historical' WHERE NOT EXISTS (SELECT 1 FROM CouponStatus WHERE ID = 2);

-- Create lookup table for CouponType
CREATE TABLE IF NOT EXISTS CouponType (
    ID INT PRIMARY KEY,
    Type VARCHAR(50) NOT NULL,
    CONSTRAINT chk_coupon_type_id CHECK (ID IN (1, 2))
);

-- Insert default values for CouponType if they don't exist
INSERT INTO CouponType (ID, Type) 
SELECT 1, 'Fixed' WHERE NOT EXISTS (SELECT 1 FROM CouponType WHERE ID = 1);
INSERT INTO CouponType (ID, Type) 
SELECT 2, 'Floating' WHERE NOT EXISTS (SELECT 1 FROM CouponType WHERE ID = 2);

-- Create main table for CouponInterest
CREATE TABLE IF NOT EXISTS CouponInterest (
    ID SERIAL PRIMARY KEY,
    ISINID UUID NOT NULL,
    EventDate TIMESTAMP NOT NULL,
    InterestRate DECIMAL(18,6) NOT NULL,
    Status INT NOT NULL,
    Type INT NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_coupon_interest_isin 
        FOREIGN KEY (ISINID) 
        REFERENCES CaseISINs(ID) 
        ON DELETE CASCADE,
    CONSTRAINT fk_coupon_interest_status 
        FOREIGN KEY (Status) 
        REFERENCES CouponStatus(ID),
    CONSTRAINT fk_coupon_interest_type 
        FOREIGN KEY (Type) 
        REFERENCES CouponType(ID),
        
    -- Create indices for better query performance
    CONSTRAINT chk_interest_rate_positive CHECK (InterestRate >= 0)
);

-- Create indices for foreign keys
CREATE INDEX idx_coupon_interest_isin ON CouponInterest(ISINID);
CREATE INDEX idx_coupon_interest_status ON CouponInterest(Status);
CREATE INDEX idx_coupon_interest_type ON CouponInterest(Type);

-- Add comments for documentation
COMMENT ON TABLE CouponStatus IS 'Lookup table for coupon status values';
COMMENT ON TABLE CouponType IS 'Lookup table for coupon types';
COMMENT ON TABLE CouponInterest IS 'Main table for storing coupon interest information';

COMMENT ON COLUMN CouponInterest.ISINID IS 'Foreign key reference to CaseISINs table';
COMMENT ON COLUMN CouponInterest.EventDate IS 'Date and time of the coupon event';
COMMENT ON COLUMN CouponInterest.InterestRate IS 'Interest rate value with precision of 6 decimal places';
COMMENT ON COLUMN CouponInterest.Status IS 'Foreign key reference to CouponStatus table (1: Current, 2: Historical)';
COMMENT ON COLUMN CouponInterest.Type IS 'Foreign key reference to CouponType table (1: Fixed, 2: Floating)';
