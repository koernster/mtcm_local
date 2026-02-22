-- Migration: Create casesubscriptiondata table
-- Description: Table to store case subscription data including distribution and sales fee information

CREATE TABLE IF NOT EXISTS casesubscriptiondata (
    ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    CaseID UUID NOT NULL,
    DistributionPaidByInvs BOOLEAN NOT NULL DEFAULT FALSE,
    SalesFeePaidByInves BOOLEAN NOT NULL DEFAULT FALSE,
    SalesNotPaidIssueDate DECIMAL(18,2),
    SalesNotPaidMaturityDate DECIMAL(18,2),
    
    -- Foreign key constraint
    CONSTRAINT fk_casesubscriptiondata_caseid 
        FOREIGN KEY (CaseID) REFERENCES cases(ID)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    
    -- Unique constraint to ensure one-to-one relationship with cases
    CONSTRAINT uk_casesubscriptiondata_caseid UNIQUE (CaseID),
    
    -- Constraints for percentage values (0-100)
    CONSTRAINT chk_sales_issue_date_percentage 
        CHECK (SalesNotPaidIssueDate IS NULL OR (SalesNotPaidIssueDate >= 0 AND SalesNotPaidIssueDate <= 100)),
    
    CONSTRAINT chk_sales_maturity_date_percentage 
        CHECK (SalesNotPaidMaturityDate IS NULL OR (SalesNotPaidMaturityDate >= 0 AND SalesNotPaidMaturityDate <= 100))
);

-- Create index on CaseID for better query performance
CREATE INDEX IF NOT EXISTS idx_casesubscriptiondata_caseid ON casesubscriptiondata(CaseID);

-- Add comments to document the table and columns
COMMENT ON TABLE casesubscriptiondata IS 'Stores case subscription data including distribution and sales fee payment information';
COMMENT ON COLUMN casesubscriptiondata.ID IS 'Auto-generated primary key';
COMMENT ON COLUMN casesubscriptiondata.CaseID IS 'Reference to the cases table';
COMMENT ON COLUMN casesubscriptiondata.DistributionPaidByInvs IS 'Whether distribution is paid by investor';
COMMENT ON COLUMN casesubscriptiondata.SalesFeePaidByInves IS 'Whether sales fee is paid by investor';
COMMENT ON COLUMN casesubscriptiondata.SalesNotPaidIssueDate IS 'Percentage value for sales not paid at issue date (if SalesFeePaidByInves is false)';
COMMENT ON COLUMN casesubscriptiondata.SalesNotPaidMaturityDate IS 'Percentage value for sales not paid at maturity date (if SalesFeePaidByInves is false)';
