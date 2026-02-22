-- Remove InterestRate column from CaseISINs
ALTER TABLE CaseISINs DROP COLUMN IF EXISTS InterestRate;
