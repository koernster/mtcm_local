-- V69: Add missing columns to paymentdetails table
-- Required by frontend getCaseById query: bankname, address, beneficiary, bicintermediary

ALTER TABLE paymentdetails
ADD COLUMN IF NOT EXISTS bankname VARCHAR(255),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS beneficiary VARCHAR(255),
ADD COLUMN IF NOT EXISTS bicintermediary VARCHAR(50);

COMMENT ON COLUMN paymentdetails.bankname IS 'Name of the bank';
COMMENT ON COLUMN paymentdetails.address IS 'Bank address';
COMMENT ON COLUMN paymentdetails.beneficiary IS 'Beneficiary name';
COMMENT ON COLUMN paymentdetails.bicintermediary IS 'BIC/SWIFT of intermediary bank';
